const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const matter = require('gray-matter');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require.extensions['.css'] = () => {};
require.extensions['.tsx'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const { ProjectDetail } = require('../components/redesign/ProjectDetail.tsx');
const { listAdminPortfolios, portfolioDocumentToPayload, saveAdminPortfolio } = require('../lib/admin/portfolio-admin.ts');
const { normalizePortfolioFrontmatter } = require('../lib/content.ts');
const { markdownImageSources, updateMarkdownImages, isDevelopmentMediaUrl } = require('../lib/markdown-media.ts');
const { projectDisplayDate, toProjectLink } = require('../lib/project-presentation.ts');

const original = fs.readFileSync(path.join(__dirname, '../content/portfolio/campus-worship-2026.md'), 'utf8');
const originalParsed = matter(original);
const filename = 'content/portfolio/campus-worship-2026.md';
const registration = '/api/design-system-media/registration.webp';
const noUploads = () => ({ galleryFiles: {}, galleryPosterFiles: {} });
const replacementFile = { name: 'replacement.webp', contentBase64: 'dGVzdA==' };
function fixture(source = original) {
  const files = new Map([[filename, Buffer.from(source).toString('base64')]]);
  const commits = [], uploads = [], removals = [];
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
    async remove(keys) { removals.push(...keys); },
  };
  return { files, commits, uploads, removals, services };
}
async function payloadFor(state) { return portfolioDocumentToPayload((await listAdminPortfolios(state.services.repository))[0]); }
function saved(state) { return matter(Buffer.from(state.files.get(filename), 'base64').toString()); }
function render(data, content) { return renderToStaticMarkup(React.createElement(ProjectDetail, { project: normalizePortfolioFrontmatter(data), content })); }
function images(html) { return [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1]); }

test('small web images reserve their actual ratio and cannot stretch to the full gallery width', () => {
  const data = { ...originalParsed.data, heroMedia: undefined, gallery: [{ type: 'image', url: '/api/preview-media/w008-500.webp', caption: '실황 캡처' }] };
  const html = render(data, '');
  assert.match(html, /class="detail-gallery" style="max-width:500px"/);
  assert.match(html, /width="500" height="263"/);
  assert.match(html, /w008-500.webp 500w/);
  assert.equal(images(html).length, 1);
});

test('real CAMPUS save preserves unchanged story, gallery metadata and review facts', async () => {
  const state = fixture(), payload = await payloadFor(state);
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  const result = saved(state);
  assert.equal(result.content.trim(), originalParsed.content.trim());
  for (const key of ['gallery', 'heroMedia', 'status', 'homeOrder', 'railOrder', 'excludedRoles', 'credits']) assert.deepEqual(result.data[key], originalParsed.data[key], key);
  assert.equal(images(render(result.data, result.content)).length, 3);
  assert.deepEqual(state.uploads, []);
});

test('deleting a gallery photo removes only its real inline image from the saved story and SSR', async () => {
  const state = fixture(), payload = await payloadFor(state);
  const before = payload.content;
  payload.gallery = payload.gallery.filter(item => item.existingUrl !== registration);
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  const result = saved(state);
  assert.equal(result.content.trim(), before.replace(/!\[[^\]]*\]\(\/api\/design-system-media\/registration\.webp\)/, '').trim());
  assert.equal(markdownImageSources(result.content).includes(registration), false);
  const rendered = images(render(result.data, result.content));
  assert.equal(rendered.length, 2);
  assert.equal(rendered.includes(registration), false);
  assert.deepEqual(state.removals, [], 'original deployment assets remain available for rollback');
});

test('replacement after gallery reordering updates the same story position without a duplicate', async () => {
  const state = fixture(), payload = await payloadFor(state);
  const target = payload.gallery.find(item => item.existingUrl === registration);
  payload.gallery.reverse();
  await saveAdminPortfolio(payload, { ...noUploads(), galleryFiles: { [target.id]: replacementFile } }, 'update', state.services);
  const result = saved(state), project = normalizePortfolioFrontmatter(result.data);
  const replacement = project.gallery.find(item => item.storageKey);
  assert.ok(replacement);
  const storySources = markdownImageSources(result.content);
  assert.equal(storySources[0], replacement.url);
  assert.equal(storySources.includes(registration), false);
  const html = render(result.data, result.content);
  assert.deepEqual(images(html), [project.heroMedia.url, replacement.url, project.gallery[0].url]);
  assert.ok(html.includes(target.caption));
  assert.deepEqual(state.removals, []);
});

test('gallery order and direct text edits do not rewrite existing Markdown formatting', async () => {
  const state = fixture(), payload = await payloadFor(state);
  payload.gallery.reverse();
  payload.content += '\n\n직접 편집한 **문장**과  공백.';
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  assert.equal(saved(state).content.trim(), payload.content);
  assert.deepEqual(saved(state).data.gallery.map(item => item.url), payload.gallery.map(item => item.existingUrl));
});

test('changed reference images keep shared link definitions and fenced examples untouched', () => {
  const source = '앞 **문장**\n\n![현장][Photo]\n\n[원본 링크][Photo]\n\n```md\n![예시](/old.webp)\n```\n\n[Photo]: /old.webp "원본 제목"\n';
  const replaced = updateMarkdownImages(source, new Map([['/old.webp', '/new photo.webp']]));
  assert.deepEqual(markdownImageSources(replaced), ['/new photo.webp']);
  assert.ok(replaced.startsWith('앞 **문장**\n\n'));
  assert.ok(replaced.endsWith('[Photo]: /old.webp "원본 제목"\n'));
  assert.ok(replaced.includes('[원본 링크][Photo]'));
  assert.ok(replaced.includes('```md\n![예시](/old.webp)\n```'));
  const html = render({ ...originalParsed.data, heroMedia: undefined, gallery: [] }, replaced);
  assert.match(html, /href="\/old.webp" title="원본 제목"/);
  assert.match(html, /src="\/new%20photo.webp"/);
  assert.match(html, /alt="현장"/);
  const deleted = updateMarkdownImages(source, new Map([['/old.webp', null]]));
  assert.deepEqual(markdownImageSources(deleted), []);
  assert.equal(deleted, source.replace('![현장][Photo]', ''));
});

test('CommonMark reference, inline, escaped, code and first-definition rules match real SSR', () => {
  const photo = { type: 'image', url: '/photo one.webp', caption: '현장 캡션', alt: '갤러리 설명' };
  const project = { ...originalParsed.data, heroMedia: undefined, gallery: [photo] };
  const cases = [
    ['![사진](</photo one.webp> "제목")', 1],
    ['![사진][REF]\n\n[ref]: </photo one.webp> "제목"', 1],
    ['![사진][]\n\n[사진]: </photo one.webp>', 1],
    ['![사진]\n\n[사진]: </photo one.webp>', 1],
    ['![사진][ref]\n\n[ref]: </photo one.webp>\n[ref]: /ignored.webp', 1],
    ['```md\n![사진](</photo one.webp>)\n```', 1],
    ['`![사진](</photo one.webp>)`', 1],
    ['\\![사진](</photo one.webp>)', 1],
    ['[unused]: </photo one.webp>', 1],
  ];
  for (const [content, count] of cases) {
    const html = render(project, content);
    assert.equal(images(html).length, count, content);
    assert.equal((html.match(/<figcaption\b/g) || []).length, 1, content);
    assert.ok(html.includes('갤러리 설명'), content);
  }
});

test('reference image gallery replacement also preserves the normal link using its definition', async () => {
  const state = fixture(), payload = await payloadFor(state);
  payload.content = `## 등록\n\n![등록][photo]\n\n[관련 자료][photo]\n\n[photo]: ${registration} "사진 제목"`;
  const id = payload.gallery.find(item => item.existingUrl === registration).id;
  await saveAdminPortfolio(payload, { ...noUploads(), galleryFiles: { [id]: replacementFile } }, 'update', state.services);
  const result = saved(state), sources = markdownImageSources(result.content);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].includes('/versions/'), true);
  const html = render(result.data, result.content);
  assert.equal(images(html).length, 3);
  assert.ok(html.includes(`href="${registration}" title="사진 제목"`));
});

test('video poster replacement and removal update story image references', async () => {
  const poster = '/old-poster.webp';
  const data = { ...originalParsed.data, gallery: [{ type: 'video', url: '/movie.mp4', poster, alt: '영상', caption: '영상 캡션' }] };
  const state = fixture(matter.stringify(`![영상](${poster})`, data));
  const payload = await payloadFor(state);
  await saveAdminPortfolio(payload, { ...noUploads(), galleryPosterFiles: { [payload.gallery[0].id]: replacementFile } }, 'update', state.services);
  let result = saved(state), project = normalizePortfolioFrontmatter(result.data);
  assert.deepEqual(markdownImageSources(result.content), [project.gallery[0].poster]);
  assert.equal(images(render(result.data, result.content)).filter(url => url === project.gallery[0].poster).length, 1);
  const removePayload = await payloadFor(state); removePayload.gallery = [];
  await saveAdminPortfolio(removePayload, noUploads(), 'update', state.services);
  result = saved(state);
  assert.deepEqual(markdownImageSources(result.content), []);
});

test('all review endpoints are recognized in relative, absolute, encoded and poster URLs', () => {
  for (const prefix of ['preview-media', 'design-system-media', 'preview-film']) {
    for (const source of [`/api/${prefix}/image.webp?x=1`, `https://example.invalid/api/${prefix}/image.webp`, `//example.invalid/api/${prefix}/image.webp`, `/api/%${prefix.charCodeAt(0).toString(16)}${prefix.slice(1)}/image.webp`]) assert.equal(isDevelopmentMediaUrl(source), true, source);
  }
  for (const source of ['/media/approved.webp', 'https://cdn.example.invalid/photos/a.webp', '/media/api/preview-media/a.webp', '/api/preview-media-other/a.webp']) assert.equal(isDevelopmentMediaUrl(source), false, source);
});

test('publish rejects each review media endpoint in hero, gallery, poster and actual body images before committing', async () => {
  for (const prefix of ['preview-media', 'design-system-media', 'preview-film']) {
    for (const target of ['hero', 'gallery', 'heroPoster', 'galleryPoster', 'body', 'bodyReference']) {
      const state = fixture(), payload = await payloadFor(state);
      payload.heroMedia = { type: 'image', alt: '공개', existingUrl: '/media/approved/hero.webp' };
      payload.gallery = [{ id: 'new-photo', type: 'image', alt: '공개', existingUrl: '/media/approved/photo.webp' }];
      payload.content = '승인된 본문';
      const url = `/api/${prefix}/review.webp`;
      if (target === 'hero') payload.heroMedia.existingUrl = url;
      if (target === 'gallery') payload.gallery[0].existingUrl = url;
      if (target === 'heroPoster') Object.assign(payload.heroMedia, { type: 'video', existingPoster: url });
      if (target === 'galleryPoster') Object.assign(payload.gallery[0], { type: 'video', existingPoster: url });
      if (target === 'body') payload.content += `\n\n![검토](${url})`;
      if (target === 'bodyReference') payload.content += `\n\n![검토][photo]\n\n[photo]: ${url}`;
      await assert.rejects(saveAdminPortfolio(payload, noUploads(), 'publish', state.services), /로컬 검토용 미디어는 공개할 수 없습니다/, `${prefix}: ${target}`);
      assert.equal(state.commits.length, 0);
    }
  }
});

test('development media remains editable as draft, while approved uploads replace the story before publish validation', async () => {
  const state = fixture(), payload = await payloadFor(state);
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  assert.equal(saved(state).data.status, 'draft');
  const next = await payloadFor(state);
  await saveAdminPortfolio(next, {
    ...noUploads(), heroFile: replacementFile,
    galleryFiles: Object.fromEntries(next.gallery.map(item => [item.id, replacementFile])),
  }, 'publish', state.services);
  const result = saved(state);
  assert.equal(result.data.status, 'published');
  assert.ok(markdownImageSources(result.content).every(source => !isDevelopmentMediaUrl(source)));
  assert.equal(images(render(result.data, result.content)).length, 3);
  assert.deepEqual(state.removals, []);
});

test('unused review definitions and literal code examples do not block approved public images', async () => {
  const state = fixture(), payload = await payloadFor(state);
  payload.heroMedia = { type: 'image', alt: '공개', existingUrl: '/media/approved/hero.webp' };
  payload.gallery = [];
  payload.content = '![공개](/media/approved/photo.webp)\n\n```md\n![예시](/api/preview-media/example.webp)\n```\n\n[unused]: /api/design-system-media/example.webp';
  await saveAdminPortfolio(payload, noUploads(), 'publish', state.services);
  assert.equal(saved(state).data.status, 'published');
  assert.equal(state.commits.length, 1);
  assert.equal(saved(state).content.trim(), payload.content);
});

test('rejected publication cleans newly uploaded files without committing or deleting existing assets', async () => {
  const state = fixture(), payload = await payloadFor(state);
  await assert.rejects(saveAdminPortfolio(payload, { ...noUploads(), heroFile: replacementFile }, 'publish', state.services), /로컬 검토용 미디어는 공개할 수 없습니다/);
  assert.deepEqual(state.removals, state.uploads);
  assert.equal(state.uploads.length, 1);
  assert.equal(state.commits.length, 0);
  assert.deepEqual(saved(state).data.gallery, originalParsed.data.gallery);
});

test('date presentation honors confirmed precision in both details and shared project links', () => {
  for (const slug of ['love-and-revival-2025', 'campus-worship-2026']) {
    const source = matter(fs.readFileSync(path.join(__dirname, `../content/portfolio/${slug}.md`), 'utf8'));
    const project = normalizePortfolioFrontmatter(source.data);
    const expected = slug === 'love-and-revival-2025' ? '2025.12.26–27' : '2026.07.25';
    assert.equal(projectDisplayDate(project), expected);
    assert.equal(toProjectLink({ slug, frontmatter: project }).date, expected);
    const heading = render(project, source.content).match(/<p class="section-label">(.*?)<\/p>/)[1];
    assert.equal(heading, [expected, ...project.categories].join(' / '));
  }
  assert.equal(projectDisplayDate({ date: '2026-07-25', displayDate: '' }), '2026.07.25');
});

test('archive dates do not invent days for month-only events or dated collections', () => {
  const { projectArchiveDate } = require('../lib/project-presentation.ts');
  for (const [slug, year, date] of [
    ['love-and-revival-2025', '2025', '12.26–27'],
    ['campus-worship-2026', '2026', '07.25'],
    ['welove-case', '2022', ''],
    ['the-sent-case', '2023', ''],
    ['regional-worship-case', '2020', '2020–2022'],
  ]) {
    const source = matter(fs.readFileSync(path.join(__dirname, `../content/portfolio/${slug}.md`), 'utf8'));
    const project = normalizePortfolioFrontmatter(source.data);
    assert.equal(projectArchiveDate(project), date, slug);
    assert.equal(toProjectLink({ slug, frontmatter: project }).year, year, slug);
  }
  assert.equal(projectArchiveDate({ date: '2025-12-26', displayDate: '2025.12' }), '12월');
});

test('supporting portraits stay small, roles precede the hero and inquiry retains the case', () => {
  const raw = matter(fs.readFileSync(path.join(__dirname, '../content/portfolio/gyeongnam-worship-2024.md'), 'utf8'));
  const html = render(raw.data, raw.content);
  assert.match(html, /class="detail-gallery" style="max-width:420px"/);
  assert.doesNotMatch(html, /class="detail-hero"/);
  assert.match(html, /\/inquiry\?project=gyeongnam-worship-2024/);
  const campus = render(originalParsed.data, originalParsed.content);
  assert.ok(campus.indexOf('마이티블레싱 수행 범위') < campus.indexOf('class="detail-hero"'));
  assert.deepEqual(images(campus), [originalParsed.data.heroMedia.url, registration, '/api/preview-media/p050-1920.webp']);
});

test('inquiry context resolves only visible projects and never echoes an arbitrary query', async () => {
  const InquiryPage = require('../app/inquiry/page.tsx').default;
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'development';
    const page = async project => renderToStaticMarkup(await InquiryPage({ searchParams: Promise.resolve({ project }) }));
    assert.match(await page('campus-worship-2026'), /class="inquiry-reference"/);
    for (const value of ['fia-welove-2026', 'missing-case', '<script>arbitrary-query</script>']) {
      const html = await page(value);
      assert.doesNotMatch(html, /class="inquiry-reference"|arbitrary-query/);
    }
    process.env.NODE_ENV = 'production';
    assert.doesNotMatch(await page('campus-worship-2026'), /class="inquiry-reference"/);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
