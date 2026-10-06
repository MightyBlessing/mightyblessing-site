const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { createRateLimit, limitedBody, sameOrigin } = require('../lib/request-guard.ts');
const { contentRevision, checkExpectedFiles } = require('../lib/admin/revision.ts');
const { getAdminRepository } = require('../lib/admin/repository.ts');
const { validateUpload } = require('../lib/admin/upload-validation.ts');
const { listAdminPortfolios, portfolioDocumentToPayload, saveAdminPortfolio } = require('../lib/admin/portfolio-admin.ts');
const encode = text => Buffer.from(text).toString('base64');
const noUploads = { galleryFiles: {}, galleryPosterFiles: {} };

function withEnv(values, run) {
  const old = { ...process.env };
  for (const key of ['NODE_ENV', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH']) delete process.env[key];
  Object.assign(process.env, values);
  return Promise.resolve().then(run).finally(() => { for (const k of Object.keys(process.env)) if (!(k in old)) delete process.env[k]; Object.assign(process.env, old); });
}

test('rate limit blocks excess attempts and opens exactly at expiry', () => {
  const limit = createRateLimit();
  assert.equal(limit('login', 2, 10000, 0), 0);
  assert.equal(limit('login', 2, 10000, 100), 0);
  assert.equal(limit('login', 2, 10000, 1000), 9);
  assert.equal(limit('inquiry', 2, 10000, 1000), 0);
  assert.equal(limit('login', 2, 10000, 10000), 0);
});

test('actual streamed body size is capped even without content-length', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(20)); }, cancel() { cancelled = true; } });
  await assert.rejects(limitedBody(new Request('https://example.invalid', { method: 'POST', body: stream, duplex: 'half' }), 30), { status: 413 });
  assert.equal(cancelled, true);
  assert.throws(() => sameOrigin(new Request('https://example.invalid', { headers: { origin: 'https://other.invalid' } })), { status: 403 });
  assert.doesNotThrow(() => sameOrigin(new Request('https://example.invalid', { headers: { origin: 'https://example.invalid' } })));
});

test('uploads reject disguised, damaged and oversized files and accept decoded images', async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#7500ff' } }).png().toBuffer();
  const accepted = await validateUpload(new File([png], 'photo.png'), 'image');
  assert.deepEqual(Buffer.from(accepted.contentBase64, 'base64'), png);
  for (const [bytes, name, type] of [[png, 'photo.jpg', 'image'], ['<svg/>', 'photo.png', 'image'], ['not video', 'clip.mp4', 'video'], [png, 'photo.svg', 'image']]) {
    await assert.rejects(validateUpload(new File([bytes], name), type), { status: 415 });
  }
  await assert.rejects(validateUpload(new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'large.png'), 'image'), { status: 413 });
});

test('a stale editor cannot upload or replace the other editor save; returned revision permits resave', async () => {
  const raw = await fs.readFile(path.join(__dirname, '../content/portfolio/campus-worship-2026.md'), 'utf8');
  const files = new Map([['content/portfolio/campus-worship-2026.md', encode(raw)]]);
  let writes = 0, uploads = 0;
  const repository = {
    async listFiles() { return [...files.keys()]; }, async readFile(file) { return files.get(file) || null; },
    async commitChanges(changes) {
      await checkExpectedFiles(changes.expectedFiles, file => this.readFile(file));
      writes++;
      for (const f of changes.upserts) files.set(f.path, f.contentBase64);
      for (const f of changes.deletes) files.delete(f);
      return { commitSha: 'a'.repeat(40) };
    },
  };
  const services = { repository, upload: async () => { uploads++; }, remove: async () => {} };
  const original = portfolioDocumentToPayload((await listAdminPortfolios(repository))[0]);
  const first = await saveAdminPortfolio({ ...original, title: 'First edit' }, noUploads, 'update', services);
  assert.equal(first.commitSha, 'a'.repeat(40));
  assert.equal(first.publication, 'deployment-required');
  await assert.rejects(saveAdminPortfolio({ ...original, title: 'Stale edit' }, { ...noUploads, heroFile: { name: 'x.png', contentBase64: '' } }, 'update', services), { status: 409 });
  await assert.rejects(saveAdminPortfolio({ ...first.payload, revision: undefined }, noUploads, 'update', services), { status: 428 });
  assert.equal(uploads, 0);
  assert.equal(writes, 1);
  await saveAdminPortfolio(first.payload, noUploads, 'update', services);
  assert.equal(writes, 2);
});

test('local development serializes compare-and-write across repository instances', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mb-cas-'));
  const cwd = process.cwd();
  try {
    process.chdir(tmp); await fs.mkdir('content'); await fs.writeFile('content/case.md', 'old');
    await withEnv({ NODE_ENV: 'development' }, async () => {
      const revision = contentRevision(encode('old'));
      const save = (repo, text) => repo.commitChanges({ message: 'test', expectedFiles: { 'content/case.md': revision }, upserts: [{ path: 'content/case.md', contentBase64: encode(text) }], deletes: [] });
      const results = await Promise.allSettled([save(getAdminRepository(), 'one'), save(getAdminRepository(), 'two')]);
      assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
      assert.equal(results.find(x => x.status === 'rejected').reason.status, 409);
      assert.equal(await fs.readFile('content/case.md', 'utf8'), 'one');
    });
  } finally { process.chdir(cwd); await fs.rm(tmp, { recursive: true }); }
});

test('GitHub compares at the fixed parent, blocks stale content and rejects a concurrent ref advance', async () => {
  const originalFetch = global.fetch;
  let calls = [], content = 'old', race = false;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', body: options.body && JSON.parse(options.body) });
    if (url.includes('/git/ref/heads/')) return Response.json({ object: { sha: 'parent' } });
    if (url.endsWith('/git/commits/parent')) return Response.json({ tree: { sha: 'tree' } });
    if (url.includes('/contents/')) { assert.ok(url.endsWith('?ref=parent')); return Response.json({ encoding: 'base64', content: encode(content) }); }
    if (url.includes('/git/refs/heads/')) return Response.json({}, { status: race ? 422 : 200 });
    return Response.json({ sha: options.method === 'POST' && url.endsWith('/git/commits') ? 'saved' : 'blob' });
  };
  try {
    await withEnv({ NODE_ENV: 'production', GITHUB_TOKEN: 'test', GITHUB_OWNER: 'owner', GITHUB_REPO: 'repo' }, async () => {
      const changes = { message: 'test', expectedFiles: { 'content/case.md': contentRevision(encode('old')) }, upserts: [{ path: 'content/case.md', contentBase64: encode('new') }], deletes: [] };
      assert.equal((await getAdminRepository().commitChanges(changes)).commitSha, 'saved');
      assert.equal(calls.find(x => x.method === 'PATCH').body.force, false);
      content = 'changed'; calls = [];
      await assert.rejects(getAdminRepository().commitChanges(changes), { status: 409 });
      assert.ok(calls.every(x => x.method === 'GET'));
      content = 'old'; race = true;
      await assert.rejects(getAdminRepository().commitChanges(changes), { status: 409 });
    });
  } finally { global.fetch = originalFetch; }
});

test('origin guard permits configured proxy origin and development loopback aliases only', async () => {
  await withEnv({ NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: '' }, async () => {
    assert.doesNotThrow(() => sameOrigin(new Request('http://localhost:3017/api/admin/login', { headers: { origin: 'http://127.0.0.1:3017' } })));
    assert.throws(() => sameOrigin(new Request('http://localhost:3017/api/admin/login', { headers: { origin: 'http://127.0.0.1:4000' } })), { status: 403 });
  });
  await withEnv({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://example.invalid' }, async () => {
    assert.doesNotThrow(() => sameOrigin(new Request('http://internal:3000/api/admin/login', { headers: { origin: 'https://example.invalid' } })));
    assert.throws(() => sameOrigin(new Request('http://internal:3000/api/admin/login', { headers: { origin: 'https://attacker.invalid', 'x-forwarded-host': 'attacker.invalid' } })), { status: 403 });
  });
});

test('login and inquiry routes enforce quotas before any external provider call', async () => {
  const login = require('../app/api/admin/login/route.ts').POST;
  const inquiry = require('../app/api/inquiry/route.ts').POST;
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('No external request permitted'); };
  try {
    await withEnv({ NODE_ENV: 'production', ADMIN_ID: 'operator', ADMIN_PASSWORD: 'local-test-password', ADMIN_SESSION_SECRET: 'local-test-signing-secret', RESEND_API_KEY: '', INQUIRY_FROM_EMAIL: '' }, async () => {
      for (let i = 0; i < 30; i++) assert.equal((await login(new Request('https://example.invalid/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'operator', password: 'wrong' }) }))).status, 401);
      const blocked = await login(new Request('https://example.invalid/api/admin/login', { method: 'POST', body: '{}' }));
      assert.equal(blocked.status, 429); assert.ok(Number(blocked.headers.get('retry-after')) > 0);
      for (let i = 0; i < 20; i++) {
        const response = await inquiry(new Request('https://example.invalid/api/inquiry', { method: 'POST', body: JSON.stringify({ email: 'review@example.invalid', message: 'test only' }) }));
        assert.equal(response.status, 200); assert.equal((await response.json()).delivery, 'mailto');
      }
      assert.equal((await inquiry(new Request('https://example.invalid/api/inquiry', { method: 'POST', body: '{}' }))).status, 429);
    });
  } finally { global.fetch = originalFetch; }
});
