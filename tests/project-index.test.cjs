const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllPortfolios, getPortfolioBySlug } = require('../lib/content.ts');
const { selectIndexProjects, selectRailProjects, selectHomeProjects, selectFeaturedRailProjects, groupProjectsByYear, homeProjectTitle } = require('../lib/project-presentation.ts');
const { railPreviewReducer } = require('../lib/rail-preview.ts');
const mapping = require('../docs/redesign/sources/project-sheet-mapping.json');

function withEnvironment(value, callback) {
  const previous = process.env.NODE_ENV;
  try { process.env.NODE_ENV = value; callback(); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
}

test('all 35 supplied events are retained while 30 ready records appear in the local index', () => withEnvironment('development', () => {
  const index = selectIndexProjects(getAllPortfolios());
  const stored = selectIndexProjects(getAllPortfolios({ includeUnpublished: true }));
  assert.equal(index.length, 30);
  assert.deepEqual(new Set(stored.map(p => p.slug)), new Set(mapping.events.map(p => p.slug)));
  assert.deepEqual(mapping.events.map(p => p.sheetRow), Array.from({length:35}, (_, i) => i + 3));
  for (const entry of index) {
    const detail = getPortfolioBySlug(entry.slug);
    assert.ok(detail, entry.slug);
    assert.ok(detail.frontmatter.roles.length, entry.slug);
    assert.ok(detail.frontmatter.our_role, entry.slug);
    assert.equal(detail.frontmatter.status, 'draft');
    assert.equal(detail.frontmatter.sourceRow, undefined);
  }
  const rail = selectRailProjects(index);
  const groups = groupProjectsByYear(rail);
  assert.deepEqual(groups.map(g => [g.year, g.projects.length]), [['2026',2],['2025',5],['2024',9],['2023',3],['2022',5],['2021',4],['2020',2]]);
  assert.equal(rail[0].date, '2026.07.25');
  assert.equal(rail.at(-1).slug, 'kouny-online-worship-2020');
  assert.deepEqual(selectHomeProjects(index).map(p => p.slug), ['campus-worship-2026','multitracks-korea-launch-2024','sos-2024','love-and-revival-2025']);
}));

test('confirmed corrections and partial scope survive the sheet import', () => withEnvironment('development', () => {
  const campus = getPortfolioBySlug('campus-worship-2026').frontmatter;
  assert.equal(campus.date, '2026-07-25');
  assert.deepEqual(campus.excludedRoles, ['음향']);
  const fia = getPortfolioBySlug('fia-welove-2026', { includeUnpublished: true }).frontmatter;
  assert.deepEqual(fia.roles, ['입장 운영','관객 안내','QR 체크인']);
  assert.equal(fia.heroMedia.url, '/api/preview-media/p037-1920.webp');
  assert.equal(fia.status, 'archived');
  assert.equal(fia.thumbnail, fia.heroMedia.url);
  assert.ok(getPortfolioBySlug('love-and-revival-2025').frontmatter.metrics.some(m => m.value.includes('5,000')));
  assert.deepEqual(getPortfolioBySlug('welove-reconciliation-2026').frontmatter.excludedRoles, ['음향']);
}));

test('production retains the existing public index and excludes review records', () => withEnvironment('production', () => {
  const rail = selectRailProjects(getAllPortfolios());
  assert.deepEqual(new Set(rail.map(p => p.slug)), new Set(['welove-case','the-sent-case','regional-worship-case']));
  for (const {slug} of mapping.events) assert.equal(getPortfolioBySlug(slug), null);
}));

test('a text-only selection clears the old image and cannot be replaced by its late load', () => {
  const state = { requested: 'photo', shown: 'photo', ready: ['photo'], failed: [] };
  const selected = railPreviewReducer(state, {type:'select', slug:'text', hasImage:false});
  assert.equal(selected.shown, undefined);
  assert.equal(selected.requested, 'text');
  assert.equal(railPreviewReducer(selected, {type:'loaded', slug:'photo'}).shown, undefined);
});


test('home curation omits held work without replacing it or changing the remaining order', () => withEnvironment('development', () => {
  const all = getAllPortfolios();
  const selected = selectFeaturedRailProjects(all);
  assert.deepEqual(selected.map(p => p.slug), ['campus-worship-2026','multitracks-korea-launch-2024','sos-2024','love-and-revival-2025','welove-reconciliation-2026']);
  assert.equal(selectRailProjects(all).length, 30);
  assert.deepEqual(selected.filter(p => !p.image).map(p => p.slug), []);
  assert.equal(selected.find(p => p.slug === 'welove-reconciliation-2026').image, '/api/preview-media/p043-1920.webp');
  assert.equal(selectRailProjects(all).find(p => p.slug === 'welove-reconciliation-2026').image, '/api/preview-media/p043-1920.webp');
  assert.ok(selectHomeProjects(all).every(p => p.frontmatter.heroMedia));
}));

test('home titles remove only one matching trailing year and preserve unrelated numbers', () => {
  const cases = [
    ['CAMPUS WORSHIP 2026', '2026', 'CAMPUS WORSHIP'],
    ['SOS 24', '2024', 'SOS'],
    ['2024 SOS', '2024', '2024 SOS'],
    ['Stage 24', '2025', 'Stage 24'],
    ['Stage 2024', '2025', 'Stage 2024'],
    ['Stage 124', '2024', 'Stage 124'],
    ['Stage 24 2024', '2024', 'Stage 24'],
    ['Stage 2024 24', '2024', 'Stage 2024'],
    ['2024', '2024', '2024'],
    ['Stage 24', '', 'Stage 24'],
    ['F.I.A x WELOVE', '2026', 'F.I.A x WELOVE'],
  ];
  for (const [title, year, expected] of cases) assert.equal(homeProjectTitle({title, year}), expected, title);
});

test('review photo enrichment never adds records, replaces existing media, or reaches production', () => {
  let entry;
  withEnvironment('development', () => {
    const stored = getAllPortfolios().find(p => p.slug === 'welove-reconciliation-2026');
    // Exercise the old empty-media fallback independently of real photo additions.
    entry = {...stored, frontmatter: {...stored.frontmatter, heroMedia: undefined, thumbnail: undefined, gallery: []}};
  });
  const before = JSON.stringify(entry);
  withEnvironment('development', () => {
    assert.deepEqual(selectFeaturedRailProjects([]), []);
    assert.equal(selectFeaturedRailProjects([entry]).length, 1);
    assert.equal(selectFeaturedRailProjects([entry])[0].image, '/api/preview-media/p043-1920.webp');
    const existing = {...entry, frontmatter: {...entry.frontmatter, thumbnail: '/approved.webp'}};
    assert.equal(selectFeaturedRailProjects([existing])[0].image, '/approved.webp');
    const assigned = require('../lib/home-hero-photos.json').find(p => p.id === 'P043');
    assert.equal(assigned.projectSlug, entry.slug);
  });
  withEnvironment('production', () => {
    assert.equal(selectFeaturedRailProjects([entry])[0].image, '');
    assert.deepEqual(selectFeaturedRailProjects([]), []);
  });
  assert.equal(JSON.stringify(entry), before);
});

test('production home never pads public work with review drafts or duplicate records', () => withEnvironment('production', () => {
  const all = getAllPortfolios();
  const selected = selectFeaturedRailProjects(all);
  const cards = selectHomeProjects(all);
  assert.equal(selected.length, 3);
  assert.equal(cards.length, 3);
  assert.equal(new Set(selected.map(p => p.slug)).size, 3);
  assert.ok(selected.every(p => !p.image.startsWith('/api/preview-media/')));
  assert.ok(cards.every(p => p.frontmatter.status === 'published'));
}));
