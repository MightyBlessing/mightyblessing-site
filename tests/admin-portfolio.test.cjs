const { test } = require('node:test');
const assert = require('node:assert/strict');
const matter = require('gray-matter');
const { listAdminPortfolios, portfolioDocumentToPayload, saveAdminPortfolio } = require('../lib/admin/portfolio-admin.ts');
const { normalizePortfolioFrontmatter, getAllPortfolios, getPortfolioBySlug } = require('../lib/content.ts');
const { selectHomeProjects, selectRailProjects } = require('../lib/project-presentation.ts');

function fixture({ failUpload = 0, failCommit = false } = {}) {
  const source = {
    title: 'Original', shortTitle: 'List name', slug: 'original', date: '2026-07-25', status: 'published', summary: 'Original summary',
    schemaVersion: 2, homeOrder: 1, railOrder: 2, excludedRoles: ['음향'],
    credits: [{ name: 'MultiTracks 본사', role: '키비주얼', approval: { checked: true } }],
    internalEvidence: { sourcePath: 'input/private.jpg', note: 'Do not send to public clients' },
    roles: ['행사 운영'], categories: ['공연'],
    heroMedia: { type: 'image', storageKey: 'portfolio/original/hero.jpg', alt: 'old', caption: 'Keep this caption', width: 1920, focalPoint: { x: .7, y: .4 }, clearance: 'pending' },
    gallery: [{ type: 'image', storageKey: 'portfolio/original/detail.jpg', alt: 'detail', credit: 'Original photographer' }],
  };
  const files = new Map([['content/portfolio/original.md', Buffer.from(matter.stringify('Body', source)).toString('base64')]]);
  const uploads = [], removals = [], commits = [];
  const repository = {
    async listFiles() { return [...files.keys()]; },
    async readFile(file) { return files.get(file) || null; },
    async commitChanges(changes) {
      commits.push(changes);
      // Simulate a remote write completing before the response is lost.
      for (const file of changes.upserts) files.set(file.path, file.contentBase64);
      for (const file of changes.deletes) files.delete(file);
      if (failCommit) throw new Error('Commit response lost');
    },
  };
  const services = {
    repository,
    async upload(key) { uploads.push(key); if (uploads.length === failUpload) throw new Error('Upload failed'); return { storageKey: key, publicUrl: 'https://example.test/' + key }; },
    async remove(keys) { removals.push(...keys); },
  };
  return { source, files, uploads, removals, commits, services };
}
const noUploads = () => ({ galleryFiles: {}, galleryPosterFiles: {} });
const file = { name: 'new.jpg', contentBase64: 'aW1hZ2U=' };
async function payloadFor(state) { return portfolioDocumentToPayload((await listAdminPortfolios(state.services.repository))[0]); }
function saved(state) { return matter(Buffer.from(state.files.get('content/portfolio/original.md'), 'base64').toString()).data; }

test('editing a title retains v2 fields and nested metadata without exposing private evidence', async () => {
  const state = fixture();
  const payload = await payloadFor(state);
  payload.title = 'Changed';
  assert.equal(payload.internalEvidence, undefined);
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  const data = saved(state);
  assert.equal(data.title, 'Changed');
  assert.equal(data.shortTitle, 'List name');
  for (const field of ['homeOrder', 'railOrder', 'excludedRoles', 'credits', 'internalEvidence']) assert.deepEqual(data[field], state.source[field]);
  assert.deepEqual(data.heroMedia, state.source.heroMedia);
  assert.deepEqual(data.gallery, state.source.gallery);
  const publicData = normalizePortfolioFrontmatter(data);
  assert.equal(publicData.internalEvidence, undefined);
  assert.equal(publicData.heroMedia.clearance, undefined);
  assert.equal(publicData.credits[0].approval, undefined);
});

test('older requests preserve a missing shortTitle while malformed values are rejected', async () => {
  const state = fixture();
  const payload = await payloadFor(state);
  delete payload.shortTitle;
  payload.title = 'Changed by older editor';
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  assert.equal(saved(state).shortTitle, 'List name');
  for (const invalid of [null, 42, {}, []]) {
    const next = await payloadFor(state);next.shortTitle=invalid;
    await assert.rejects(saveAdminPortfolio(next, noUploads(), 'update', state.services), /목록용 제목/);
  }
  assert.equal(state.commits.length, 1);
});

test('replacing media uses unique paths and retains all previous deployment assets', async () => {
  const state = fixture();
  const payload = await payloadFor(state);
  await saveAdminPortfolio(payload, { ...noUploads(), heroFile: file }, 'update', state.services);
  const firstKey = saved(state).heroMedia.storageKey;
  await saveAdminPortfolio(await payloadFor(state), { ...noUploads(), heroFile: file }, 'update', state.services);
  assert.notEqual(saved(state).heroMedia.storageKey, firstKey);
  assert.match(firstKey, /^portfolio\/original\/versions\/[\w-]+\/hero\.jpg$/);
  assert.deepEqual(state.removals, []);
  assert.equal(saved(state).heroMedia.focalPoint, undefined, 'old image-specific metadata must not be attributed to a replacement');
});

test('partial upload failure cleans only completed new uploads and never old files', async () => {
  const state = fixture({ failUpload: 2 });
  const payload = await payloadFor(state);
  await assert.rejects(saveAdminPortfolio(payload, { heroFile: file, galleryFiles: { [payload.gallery[0].id]: file }, galleryPosterFiles: {} }, 'update', state.services), /Upload failed/);
  assert.equal(state.commits.length, 0);
  assert.deepEqual(state.removals, [state.uploads[0]]);
  assert.equal(saved(state).heroMedia.storageKey, 'portfolio/original/hero.jpg');
});

test('uncertain commit outcome keeps new media that the committed content may reference', async () => {
  const state = fixture({ failCommit: true });
  await assert.rejects(saveAdminPortfolio(await payloadFor(state), { ...noUploads(), heroFile: file }, 'publish', state.services), /저장 결과를 확인하지 못했습니다/);
  assert.equal(saved(state).heroMedia.storageKey, state.uploads[0]);
  assert.deepEqual(state.removals, []);
});

test('featured conflict updates retain the other record’s extension metadata', async () => {
  const state = fixture();
  state.files.set('content/portfolio/other.md', Buffer.from(matter.stringify('Other body', { ...state.source, title: 'Other', slug: 'other', featured: true, featured_order: 1 })).toString('base64'));
  const payload = await payloadFor(state); payload.featured = true; payload.featured_order = 1;
  await saveAdminPortfolio(payload, noUploads(), 'update', state.services);
  const other = matter(Buffer.from(state.files.get('content/portfolio/other.md'), 'base64').toString()).data;
  assert.equal(other.featured, false);
  assert.deepEqual(other.credits, state.source.credits);
  assert.deepEqual(other.internalEvidence, state.source.internalEvidence);
});

test('a missing edit target cannot silently become a new project', async () => {
  const state = fixture(); const payload = await payloadFor(state); payload.previousSlug = 'missing';
  await assert.rejects(saveAdminPortfolio(payload, noUploads(), 'update', state.services), /찾을 수 없습니다/);
  assert.equal(state.commits.length, 0); assert.equal(state.uploads.length, 0);
});

test('public reading excludes review drafts in production and blocks path traversal', () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.equal(getPortfolioBySlug('campus-worship-2026'), null);
    assert.equal(getPortfolioBySlug('../../README'), null);
    for (const slug of ['welove-case', 'the-sent-case', 'regional-worship-case']) assert.ok(getPortfolioBySlug(slug));
    process.env.NODE_ENV = 'development';
    const all = getAllPortfolios();
    assert.deepEqual(selectHomeProjects(all).map(p => p.slug), ['campus-worship-2026', 'multitracks-korea-launch-2024', 'sos-2024', 'love-and-revival-2025']);
    assert.equal(selectRailProjects(all).length, 30);
    assert.ok(getPortfolioBySlug('campus-worship-2026'));
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});

test('local preview media cannot be switched to published by the admin editor', async () => {
  const state = fixture(); const payload = await payloadFor(state);
  payload.heroMedia.existingStorageKey = undefined;
  payload.heroMedia.existingUrl = '/api/preview-media/p047-1920.webp';
  await assert.rejects(saveAdminPortfolio(payload, noUploads(), 'publish', state.services), /로컬 검토용 미디어는 공개할 수 없습니다/);
  assert.equal(state.commits.length, 0);
  assert.equal(saved(state).heroMedia.storageKey, 'portfolio/original/hero.jpg');
});
