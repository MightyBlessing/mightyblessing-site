const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const matter = require('gray-matter');
const { listAdminPortfolios, portfolioDocumentToPayload, saveAdminPortfolio } = require('../lib/admin/portfolio-admin.ts');
const { markdownImageSources } = require('../lib/markdown-media.ts');
const { normalizePortfolioFrontmatter, searchPortfolios } = require('../lib/content.ts');
const { toProjectLink, homeProjectTitle } = require('../lib/project-presentation.ts');

function compile(relative) {
  const filename = path.join(__dirname, '..', relative);
  return ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
  }).outputText;
}
const editorCode = compile('components/admin/PortfolioEditor.tsx');
const routeCode = compile('app/api/admin/portfolio/route.ts');
const source = fs.readFileSync(path.join(__dirname, '../content/portfolio/campus-worship-2026.md'), 'utf8');

async function fixture() {
  const image = await require('sharp')({ create: { width: 2, height: 2, channels: 3, background: '#7500ff' } }).webp().toBuffer();
  const files = new Map([['content/portfolio/campus-worship-2026.md', Buffer.from(source).toString('base64')]]);
  const uploads = [], commits = [];
  const services = {
    repository: {
      async listFiles() { return [...files.keys()]; },
      async readFile(file) { return files.get(file) || null; },
      async commitChanges(changes) {
        commits.push(changes);
        for (const file of changes.upserts) files.set(file.path, file.contentBase64);
        for (const file of changes.deletes) files.delete(file);
      },
    },
    async upload(key) { uploads.push(key); return { storageKey: key, publicUrl: 'https://example.invalid/' + key }; },
    async remove() {},
  };
  const route = {};
  vm.runInNewContext(routeCode, {
    exports: route, File, Buffer, Response,
    require: name => {
      if (name === '@/lib/admin/portfolio-admin') return { saveAdminPortfolio: (payload, media, action) => saveAdminPortfolio(payload, media, action, services) };
      if (name === '@/lib/admin/session') return { getAdminSession: async () => ({ email: 'test@example.invalid' }) };
      return require(name);
    },
  });
  return {
    files, uploads, commits, image,
    payload: portfolioDocumentToPayload((await listAdminPortfolios(services.repository))[0]),
    request: (url, options) => route.POST(new Request('https://local.invalid' + url, options)),
  };
}

// Run real editor handlers and the real multipart route/save implementation.
// Hooks, storage, navigation and uploads are isolated; no network or disk save.
function editor(initialValue, fetchMock) {
  const slots = [], navigation = [], requests = [];
  let cursor = 0, tree;
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect() {}, useMemo: fn => fn(), useId: () => 'test-editor',
  };
  const exports = {};
  vm.runInNewContext(editorCode, {
    exports, FormData,
    fetch: (url, options) => { requests.push(options.body); return fetchMock(url, options); },
    require: name => name === 'react' ? hooks : name === 'next/navigation' ? {
      useRouter: () => ({ push: url => navigation.push(url), refresh() {} }),
    } : require(name),
  });
  function nodes(node = tree) {
    if (node === null || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => nodes(child));
    return [node, ...nodes(node.props?.children ?? null)];
  }
  function text(node) {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node !== 'object') return String(node);
    if (Array.isArray(node)) return node.map(text).join('');
    return text(node.props?.children);
  }
  function render() {
    cursor = 0;
    tree = exports.PortfolioEditor({ mode: 'edit', initialValue, relatedCaseOptions: [], roleSuggestions: [], categorySuggestions: [] });
  }
  render();
  return {
    render, nodes, navigation, requests,
    get tree() { return tree; },
    field(value) { return nodes().find(node => ['input', 'textarea'].includes(node.type) && node.props.value === value); },
    fileInputs() { return nodes().filter(node => node.type === 'input' && node.props.type === 'file'); },
    save() { return nodes().find(node => node.type === 'button' && text(node).includes('초안 저장')).props.onClick(); },
  };
}

test('replacement save refreshes editor Markdown/media and clears uploads before a second save', async () => {
  const state = await fixture();
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const ui = editor(state.payload, async (url, options) => { await pending; return state.request(url, options); });
  const uploadInput = ui.fileInputs()[1];
  uploadInput.props.onChange({ target: { files: [new File([state.image], 'replacement.webp', { type: 'image/webp' })] } });
  ui.render();
  const firstSave = ui.save();
  await ui.save(); // Same handler frame, before React has re-rendered.
  ui.render();
  assert.equal(ui.requests.length, 1);
  assert.equal(ui.tree.type, 'fieldset');
  assert.equal(ui.tree.props.disabled, true, 'all editable controls are natively disabled until the committed payload is applied');
  release(); await firstSave; ui.render();
  assert.equal(ui.tree.props.disabled, false);
  assert.equal(state.uploads.length, 1);
  const saved = matter(Buffer.from(state.files.values().next().value, 'base64').toString());
  const body = ui.nodes().find(node => node.type === 'textarea' && String(node.props.value).includes('##'));
  assert.equal(body.props.value, saved.content.trim());
  assert.equal(markdownImageSources(body.props.value)[0].includes('/versions/'), true);
  assert.notEqual(ui.fileInputs()[1].key, uploadInput.key, 'native selected file is cleared by remounting just the upload control');
  await ui.save(); ui.render();
  assert.equal(state.uploads.length, 1, 'the cleared file queue cannot upload the old selection a second time');
  assert.equal(state.commits.length, 2);
  const secondPayload = JSON.parse(ui.requests[1].get('payload'));
  assert.equal(secondPayload.content, saved.content.trim());
  assert.ok(secondPayload.gallery[0].existingStorageKey.includes('/versions/'));
  assert.equal(secondPayload.internalEvidence, undefined);
  assert.equal(secondPayload.storedFrontmatter, undefined);
});

test('slug change continues from the saved slug and a failed save retains edits and pending files', async () => {
  const state = await fixture();
  let fail = true;
  const ui = editor(state.payload, (url, options) => fail ? Promise.resolve(Response.json({ error: '업로드 실패' }, { status: 500 })) : state.request(url, options));
  ui.field(state.payload.slug).props.onChange({ target: { value: 'renamed-campus' } });
  ui.fileInputs()[1].props.onChange({ target: { files: [new File([state.image], 'replacement.webp', { type: 'image/webp' })] } });
  ui.render();
  await ui.save(); ui.render();
  assert.equal(ui.tree.props.disabled, false);
  assert.ok(ui.field('renamed-campus'));
  assert.equal(ui.navigation.length, 0);
  assert.equal(state.commits.length, 0);
  fail = false;
  await ui.save(); ui.render();
  assert.equal(state.uploads.length, 1, 'failed save leaves the selected file ready for a retry');
  assert.deepEqual(ui.navigation, ['/admin/portfolio/renamed-campus']);
  assert.equal(state.files.has('content/portfolio/renamed-campus.md'), true);
  assert.equal(state.files.has('content/portfolio/campus-worship-2026.md'), false);
  await ui.save();
  const next = JSON.parse(ui.requests.at(-1).get('payload'));
  assert.equal(next.previousSlug, 'renamed-campus');
  assert.equal(next.slug, 'renamed-campus');
  assert.equal(state.uploads.length, 1);
});

test('editor round-trips separate titles and an explicit clear restores the detail-title fallback', async () => {
  const state = await fixture();
  const ui = editor(state.payload, (url, options) => state.request(url, options));
  const field = label => ui.nodes().find(node => node.type === 'input' && node.props['aria-label'] === label);
  field('상세 제목').props.onChange({target:{value:'새로운 공식 행사명 2026'}});
  field('목록용 제목').props.onChange({target:{value:'  목록에서 찾는 이름 2026  '}});
  ui.render();
  const preview = ui.nodes().find(node => node.props?.['aria-label'] === '목록 제목 미리보기');
  assert.ok(preview.props.children.includes('목록에서 찾는 이름'));
  await ui.save(); ui.render();
  const read = () => normalizePortfolioFrontmatter(matter(Buffer.from(state.files.values().next().value, 'base64').toString()).data);
  const saved = read();
  assert.equal(saved.title, '새로운 공식 행사명 2026');
  assert.equal(saved.shortTitle, '목록에서 찾는 이름 2026');
  assert.equal(field('목록용 제목').props.value, saved.shortTitle);
  assert.equal(homeProjectTitle(toProjectLink({slug:saved.slug,frontmatter:saved})), '목록에서 찾는 이름');
  assert.equal(state.payload.title, 'WELOVE Retouched V — CAMPUS WORSHIP 2026');
  field('목록용 제목').props.onChange({target:{value:'   '}});ui.render();
  await ui.save();ui.render();
  assert.equal(read().shortTitle, undefined);
  assert.equal(field('목록용 제목').props.value, '');
  assert.equal(homeProjectTitle(toProjectLink({slug:saved.slug,frontmatter:read()})), '새로운 공식 행사명');
});

test('a list-only name remains searchable without duplicating it in aliases', () => {
  const originalRead = fs.readFileSync;
  const previousEnv = process.env.NODE_ENV;
  const fixture = matter(source);
  fixture.data.shortTitle = '목록전용검증이름';
  fs.readFileSync = function(file, ...args) {
    if (String(file) === path.resolve('content/portfolio/campus-worship-2026.md')) return matter.stringify(fixture.content, fixture.data);
    return originalRead.call(this, file, ...args);
  };
  try {
    process.env.NODE_ENV='development';
    assert.deepEqual(searchPortfolios('목록전용검증이름').map(p=>p.slug), ['campus-worship-2026']);
  } finally {
    fs.readFileSync=originalRead;
    if (previousEnv===undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV=previousEnv;
  }
});
