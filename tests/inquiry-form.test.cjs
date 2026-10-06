const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Render the real client component's server HTML: this is the form available
// before hydration and when JavaScript never loads.
const filename = path.join(__dirname, '../components/inquiry/InquiryForm.tsx');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
  fileName: filename,
}).outputText;
const componentModule = new Module(filename, module);
componentModule.filename = filename;
componentModule.paths = Module._nodeModulePaths(path.dirname(filename));
componentModule._compile(compiled, filename);

test('the unhydrated inquiry form cannot send contact details through a GET URL', () => {
  const html = renderToStaticMarkup(React.createElement(componentModule.exports.InquiryForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.ok(form, 'the inquiry form is rendered on the server');
  assert.match(form, /\bmethod="post"/i, 'native submission must keep contact details out of URL parameters');
  assert.match(form, /\baction="\/api\/inquiry"/);
  assert.match(html, /<button\b(?=[^>]*\btype="submit")(?=[^>]*\bdisabled="")[^>]*>/, 'JSON submission waits for hydration');
  assert.match(html, /<input\b(?=[^>]*\bname="email")(?=[^>]*\breadonly="")[^>]*>/i, 'typing waits until React can retain the email');
  assert.match(html, /<textarea\b(?=[^>]*\bname="message")(?=[^>]*\breadonly="")[^>]*>/i, 'typing waits until React can retain the message');
  assert.match(html, /<noscript>[\s\S]*href="mailto:contact@mightyblessing\.com"[\s\S]*<\/noscript>/, 'a usable contact path remains without JavaScript');
});

const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

// Drive the real component's event handlers with isolated hook state. No request
// leaves this test: fetch, mail provider responses, and timers are controlled.
function form(fetchMock, { hydrated = true, reference } = {}) {
  const slots = [];
  const cleanups = [];
  let cursor = 0, tree, focused, requests = 0, lastRequest;
  let mounted = true, updatesAfterUnmount = 0;
  const hooks = {
    useId: () => 'test-inquiry',
    useSyncExternalStore: (_subscribe, getSnapshot) => hydrated ? getSnapshot() : false,
    useRef: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useState: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => {
        if (!mounted) updatesAfterUnmount++;
        slots[index] = typeof next === 'function' ? next(slots[index]) : next;
      }];
    },
    useEffect: effect => {
      const index = cursor++;
      if (!(index in slots)) {
        slots[index] = true;
        cleanups.push(effect());
      }
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: name => name === 'react' ? hooks : require(name),
    AbortController, setTimeout, clearTimeout,
    fetch: (url, options) => {
      requests++;
      lastRequest = { url, options };
      return fetchMock(url, options);
    },
  });
  function nodes(node) {
    if (arguments.length === 0) node = tree;
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(nodes);
    return [node, ...nodes(node.props?.children)];
  }
  function text(node) {
    if (arguments.length === 0) node = tree;
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node !== 'object') return String(node);
    if (Array.isArray(node)) return node.map(text).join('');
    return text(node.props?.children);
  }
  function render() {
    cursor = 0;
    tree = exports.InquiryForm({ reference });
    for (const node of nodes()) if (node.props?.ref) {
      node.props.ref.current = {
        validity: { typeMismatch: node.props.type === 'email' && Boolean(node.props.value) && !String(node.props.value).includes('@') },
        focus: () => { focused = node.props.name; },
      };
    }
  }
  const field = name => nodes().find(node => node.props?.name === name);
  const button = () => nodes().find(node => node.type === 'button' && node.props.type === 'submit');
  function fill(name, value) { field(name).props.onChange({ target: { value } }); render(); }
  render();
  return {
    render, field, button, nodes, text, fill,
    valid() { fill('email', 'review@example.invalid'); fill('message', '문의 내용 & 한글'); },
    submit() { return tree.props.onSubmit({ preventDefault() {} }); },
    unmount() { mounted = false; cleanups.forEach(cleanup => cleanup?.()); },
    get requests() { return requests; },
    get lastRequest() { return lastRequest; },
    get focused() { return focused; },
    get updatesAfterUnmount() { return updatesAfterUnmount; },
  };
}

const apiFilename = path.join(__dirname, '../app/api/inquiry/route.ts');
const apiCompiled = ts.transpileModule(fs.readFileSync(apiFilename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: apiFilename,
}).outputText;
function api(env = {}, provider = async () => { throw new Error('Unexpected provider call'); }) {
  const exports = {};
  vm.runInNewContext(apiCompiled, { exports, process: { env }, fetch: provider, Response, require, AbortSignal });
  return (_url, options) => exports.POST(new Request('https://local.invalid/api/inquiry', options));
}

test('hydration and field validation block requests and focus the first error', async () => {
  const fetchMock = () => { throw new Error('Must not send'); };
  const unhydrated = form(fetchMock, { hydrated: false });
  assert.equal(unhydrated.field('email').props.readOnly, true);
  assert.equal(unhydrated.field('message').props.readOnly, true);
  unhydrated.valid();
  await unhydrated.submit();
  assert.equal(unhydrated.requests, 0);

  const ui = form(fetchMock);
  assert.equal(ui.field('email').props.readOnly, false);
  assert.equal(ui.field('message').props.readOnly, false);
  await ui.submit(); ui.render();
  assert.equal(ui.requests, 0);
  assert.equal(ui.focused, 'email');
  assert.equal(ui.field('email').props['aria-invalid'], true);
  ui.fill('email', 'valid@example.invalid');
  await ui.submit(); ui.render();
  assert.equal(ui.focused, 'message');
});

test('actual API mailto response keeps the draft and requires explicit sending', async () => {
  const ui = form(api());
  ui.valid(); await ui.submit(); ui.render();
  assert.equal(ui.field('email').props.value, 'review@example.invalid');
  assert.equal(ui.field('message').props.value, '문의 내용 & 한글');
  assert.match(ui.text(), /메일 앱에서 보내기를 눌러/);
  assert.match(ui.text(), /아직 문의가 접수되지 않았습니다/);
  assert.doesNotMatch(ui.text(), /접수되었습니다/);
  const preparedLinks = () => ui.nodes().filter(node => node.type === 'a' && node.props.href.includes('?subject='));
  assert.match(decodeURIComponent(preparedLinks()[0].props.href), /문의 내용 & 한글/);
  ui.fill('message', '수정한 문의');
  assert.equal(preparedLinks().length, 0, 'editing invalidates the old prepared email');
});

test('actual API provider acceptance clears input only after a confirmed email result', async () => {
  let providerCalls = 0;
  const ui = form(api({ RESEND_API_KEY: 'isolated-fake-key', INQUIRY_FROM_EMAIL: 'sender@example.invalid' }, async () => {
    providerCalls++;
    return Response.json({ id: 'mock-id' });
  }));
  ui.valid(); await ui.submit(); ui.render();
  assert.equal(providerCalls, 1);
  assert.equal(ui.field('email').props.value, '');
  assert.equal(ui.field('message').props.value, '');
  assert.match(ui.text(), /접수되었습니다/);
});

test('same-turn repeated submissions send only once while the request is pending', async () => {
  let resolveRequest;
  const ui = form(() => new Promise(resolve => { resolveRequest = resolve; }));
  ui.valid();
  const first = ui.submit();
  await ui.submit(); ui.render(); await ui.submit();
  assert.equal(ui.requests, 1);
  assert.equal(ui.field('message').props.readOnly, true);
  assert.equal(ui.button().props.disabled, true);
  resolveRequest(Response.json({ ok: true, delivery: 'email' }));
  await first; ui.render();
  assert.equal(ui.button().props.disabled, false);
});

test('a stalled request recovers in 20 seconds and a late result cannot affect the next submission', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const responses = [];
  const ui = form(() => new Promise(resolve => responses.push(resolve)));
  ui.valid();
  const first = ui.submit();
  const firstSignal = ui.lastRequest.options.signal;
  t.mock.timers.tick(19_999); await flush(); ui.render();
  assert.equal(ui.button().props.disabled, true);
  t.mock.timers.tick(1); await first; ui.render();
  assert.equal(firstSignal.aborted, true);
  assert.equal(ui.field('message').props.value, '문의 내용 & 한글');
  assert.equal(ui.field('message').props.readOnly, false);
  assert.equal(ui.button().props.disabled, false);
  assert.match(ui.text(), /응답이 지연되어/);
  assert.match(ui.text(), /이미 전달되었을 수/);
  assert.match(ui.text(), /접수 여부를 확인/);

  ui.fill('message', '수정한 새 문의');
  const second = ui.submit();
  responses[0](Response.json({ ok: true, delivery: 'email' }));
  await flush(); ui.render();
  assert.equal(ui.field('message').props.value, '수정한 새 문의');
  assert.equal(ui.button().props.disabled, true, 'the expired request cannot release a newer request lock');
  assert.doesNotMatch(ui.text(), /접수되었습니다/);
  responses[1](Response.json({ ok: true, delivery: 'email' }));
  await second; ui.render();
  assert.equal(ui.field('message').props.value, '');
  assert.equal(ui.button().props.disabled, false);
});

test('timeout also bounds a response body that never finishes reading', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const ui = form(async () => ({ ok: true, json: () => new Promise(() => {}) }));
  ui.valid();
  const pending = ui.submit();
  await flush();
  t.mock.timers.tick(20_000); await pending; ui.render();
  assert.equal(ui.lastRequest.options.signal.aborted, true);
  assert.equal(ui.button().props.disabled, false);
  assert.equal(ui.field('message').props.value, '문의 내용 & 한글');
  assert.match(ui.text(), /응답이 지연되어/);
});

test('unmount aborts outstanding work without updating state after its late response', async () => {
  let resolveRequest;
  const ui = form(() => new Promise(resolve => { resolveRequest = resolve; }));
  ui.valid();
  const pending = ui.submit();
  ui.unmount();
  await pending;
  assert.equal(ui.lastRequest.options.signal.aborted, true);
  resolveRequest(Response.json({ ok: true, delivery: 'email' }));
  await flush();
  assert.equal(ui.updatesAfterUnmount, 0);
});

test('HTML, provider, network, and invalid success responses preserve input without exposing internal errors', async t => {
  const failures = [
    ['HTML 504', async () => new Response('<html>Gateway Timeout</html>', { status: 504 })],
    ['HTML 502', async () => new Response('<html>Bad Gateway</html>', { status: 502 })],
    ['provider 502', api({ RESEND_API_KEY: 'isolated-fake-key', INQUIRY_FROM_EMAIL: 'sender@example.invalid' }, async () => new Response('Provider private error details', { status: 503 }))],
    ['network failure', async () => { throw new TypeError('Failed to fetch'); }],
    ['invalid JSON 200', async () => new Response('<html>Unexpected proxy body</html>')],
    ['empty body 200', async () => new Response(null)],
    ['unrecognized JSON 200', async () => Response.json({ ok: true })],
    ['malformed JSON shape', async () => Response.json(null)],
    ['unconfirmed mailto', async () => Response.json({ delivery: 'mailto' })],
  ];
  for (const [name, response] of failures) await t.test(name, async () => {
    const ui = form(response);
    ui.valid(); await ui.submit(); ui.render();
    const alert = ui.nodes().find(node => node.props?.role === 'alert');
    assert.ok(alert);
    assert.match(ui.text(alert), /전송 결과를 확인하지 못했습니다/);
    assert.match(ui.text(alert), /이미 전달되었을 수/);
    assert.doesNotMatch(ui.text(alert), /JSON|Unexpected|Failed to fetch|Gateway|Provider private/);
    assert.doesNotMatch(ui.text(), /접수되었습니다/);
    assert.equal(ui.field('message').props.value, '문의 내용 & 한글');
    assert.equal(ui.field('message').props.readOnly, false);
    assert.equal(ui.button().props.disabled, false);
  });
});

test('server-side validation failure gives a field correction message and retains the draft', async () => {
  const ui = form(async () => Response.json({ error: 'Internal validation details' }, { status: 400 }));
  ui.valid(); await ui.submit(); ui.render();
  assert.match(ui.text(), /이메일 형식과 문의 내용을 확인/);
  assert.doesNotMatch(ui.text(), /Internal validation details|접수되었습니다/);
  assert.equal(ui.field('message').props.value, '문의 내용 & 한글');
  assert.equal(ui.button().props.disabled, false);
});

test('case context preserves empty-message validation and accompanies the mail draft without changing the input', async () => {
  const reference = { title: 'CAMPUS WORSHIP', path: '/portfolio/campus-worship-2026' };
  const ui = form(api(), { reference });
  ui.fill('email', 'review@example.invalid');
  await ui.submit(); ui.render();
  assert.equal(ui.requests, 0, 'a case reference alone is not an inquiry message');
  assert.equal(ui.focused, 'message');
  ui.fill('message', '비슷한 공연을 준비합니다.');
  await ui.submit(); ui.render();
  const payload = JSON.parse(ui.lastRequest.options.body);
  assert.match(payload.message, /비슷한 공연을 준비합니다\.[\s\S]*참고 프로젝트: CAMPUS WORSHIP[\s\S]*\/portfolio\/campus-worship-2026/);
  assert.equal(ui.field('message').props.value, '비슷한 공연을 준비합니다.');
  const draft = ui.nodes().find(node => node.type === 'a' && node.props.href.startsWith('mailto:') && node.props.href.includes('?subject='));
  assert.match(decodeURIComponent(draft.props.href), /참고 프로젝트: CAMPUS WORSHIP/);
  const remove = ui.nodes().find(node => node.type === 'button' && node.props.type === 'button');
  remove.props.onClick(); ui.render();
  assert.equal(ui.nodes().some(node => node.type === 'a' && node.props.href.startsWith('mailto:') && node.props.href.includes('?subject=')), false, 'remove stale draft when context changes');
  assert.equal(ui.field('message').props.value, '비슷한 공연을 준비합니다.');
  await ui.submit(); ui.render();
  assert.equal(JSON.parse(ui.lastRequest.options.body).message, '비슷한 공연을 준비합니다.');
});
