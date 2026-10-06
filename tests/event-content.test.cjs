const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllPortfolios, getPortfolioBySlug, searchPortfolios } = require('../lib/content.ts');
const { toProjectLink, homeProjectTitle, selectIndexProjects, projectArchiveDate } = require('../lib/project-presentation.ts');
const { markdownImageSources } = require('../lib/markdown-media.ts');

function local(callback) {
  const previous = process.env.NODE_ENV;
  try { process.env.NODE_ENV = 'development'; callback(); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
}

test('enriched event records retain introductions and scope without requiring padded stories', () => local(() => {
  const index = selectIndexProjects(getAllPortfolios({ includeUnpublished: true }));
  assert.equal(index.length, 35);
  for (const entry of index) {
    const detail = getPortfolioBySlug(entry.slug, { includeUnpublished: true });
    assert.ok(['published', 'archived'].includes(detail.frontmatter.status), entry.slug);
    assert.ok(detail.frontmatter.shortTitle, entry.slug);
    assert.ok(detail.frontmatter.summary.trim(), entry.slug);
    assert.ok(detail.frontmatter.our_role.trim(), entry.slug);
    assert.ok(detail.frontmatter.search_terms.length, entry.slug);
    assert.doesNotMatch(detail.content, /app\.notion\.com|input\/|prod-files-secure|연락처|계약 조건|체크인율|7,000명.*QR 체크인 완료/);
    assert.equal(toProjectLink(entry).title, detail.frontmatter.shortTitle);
  }
}));

test('old abbreviations and expanded names resolve to the same event without URL migration', () => local(() => {
  for (const [slug, queries] of [
    ['cbs-iksan-2024', ['CBS 익산', 'CBS투어-익산', '한밤의 프레이즈']],
    ['gyeongnam-worship-2024', ['경남기총', '8·15 특별성회']],
    ['campus-worship-2026', ['WELOVE CAMPUS WORSHIP', 'Retouched V', '캠퍼스워십']],
    ['welove-recording-2021', ['WELOVE 녹음', 'Your Kingdom, Our Home']],
    ['sos-2024', ['SOS 24', '2024 SOS', 'Save Our Spirit 2024']],
    ['sos-2025', ['SOS 25', 'Save Our Spirit 2025']],
    ['fia-welove-2026', ['F.I.A x WELOVE', 'F.I.A × WELOVE', '피아 위러브']],
    ['ram-worship-recording-2023', ['램워 녹음집회', '램넌트워십 1집 녹음 집회']],
    ['wist-2023', ['WIST', '홀라이프워십 오픈 예배', 'WIST 정기예배', '홀라이프워십 정기예배']],
    ['digital-bible-conference-2020', ['디말사', '디지털 말씀 사경회']],
  ]) for (const query of queries) {
    const stored = getPortfolioBySlug(slug, { includeUnpublished: true });
    if (stored.frontmatter.status === 'archived') {
      assert.ok(stored.frontmatter.search_terms.includes(query), query);
      assert.ok(!searchPortfolios(query).some(p => p.slug === slug), query);
    } else assert.ok(searchPortfolios(query).some(p => p.slug === slug), query);
  }
  assert.equal(searchPortfolios('확실히없는행사99999').length, 0);
}));

test('event dates and city variants are not replaced with release or full festival dates', () => local(() => {
  const read = slug => getPortfolioBySlug(slug).frontmatter;
  assert.equal(read('campus-worship-2026').date, '2026-07-25');
  assert.equal(read('welove-recording-2021').date, '2021-10-03');
  assert.equal(read('welove-reconciliation-2026').date, '2026-05-23');
  assert.equal(read('anointing-worship-camp-2025').date, '2025-08-12');
  assert.equal(read('love-and-revival-2025').displayDate, '2025.12.26–27');
  assert.equal(read('sos-2024').displayDate, '2024.09.29');
  for (const [city, day] of [['busan','03'],['jeonju','10'],['yongin','17']]) {
    const project = read(`welove-tour-${city}-2022`);
    assert.equal(project.date, `2022-12-${day}`);
    assert.match(project.title, /2022 — /);
  }
}));

test('user-confirmed dates and names supersede earlier conflicting notes', () => local(() => {
  const read = slug => getPortfolioBySlug(slug, { includeUnpublished: true }).frontmatter;
  const daniel = read('young-daniel-prayer-2025');
  assert.equal(daniel.date, '2025-04-25');
  assert.equal(daniel.displayDate, '2025.04.25–27');
  assert.equal(projectArchiveDate(daniel), '04.25–27');
  assert.equal(projectArchiveDate(read('digital-bible-conference-2020')), '11.02–04');
  assert.equal(read('christian-student-conference-2021').date, '2021-02-20');
  assert.equal(read('tommy-walker-2024').date, '2024-02-17');
  assert.equal(read('get-back-up-again-2022').date, '2022-08-13');
  assert.match(read('get-back-up-again-2022').title, /GET BACK UP AGAIN/);
  for (const year of [2024, 2025]) {
    const sos = read(`sos-${year}`);
    assert.match(sos.title, /SOS.*Save Our Spirit/);
    assert.ok(sos.credits.some(c => c.name === '연예인연합예배' && c.role === '주최'));
  }
  assert.equal(read('ram-worship-recording-2023').shortTitle, '램넌트워십 1집 녹음 집회');
  const wist = read('wist-2023');
  assert.equal(wist.shortTitle, 'WIST 정기예배');
  assert.match(wist.summary, /매월/);
  assert.doesNotMatch(wist.title + wist.summary, /오픈 예배/);
  // A recurring series does not establish MB's participation in every month.
  assert.equal(wist.date, '2023-06-01');
  assert.equal(wist.displayDate, '2023.06.01');
  assert.equal(wist.status, 'archived');
}));

test('confirmed event ranges do not turn an original participation date into a project duration', () => local(() => {
  const africa = getPortfolioBySlug('africa-messi-2024', { includeUnpublished: true }).frontmatter;
  assert.equal(africa.date, '2024-02-22');
  assert.equal(africa.displayDate, '2024.02.22');
  assert.equal(africa.location, '남아프리카공화국 스와트담(Swartdam)');
  assert.deepEqual(africa.roles, ['축구장 조성']);
  assert.equal(africa.metrics.length, 0);
}));

test('partial work, creator credits and actual photos survive richer storytelling', () => local(() => {
  const fia = getPortfolioBySlug('fia-welove-2026', { includeUnpublished: true });
  assert.deepEqual(fia.frontmatter.roles, ['입장 운영', '관객 안내', 'QR 체크인']);
  assert.equal(fia.frontmatter.status, 'archived');
  assert.equal(fia.frontmatter.heroMedia.url, '/api/preview-media/p037-1920.webp');
  assert.doesNotMatch(fia.content, /총괄|무대 연출|음향|LIVE TEXT|카메라/);
  const anointing = getPortfolioBySlug('anointing-worship-camp-2025');
  assert.doesNotMatch(anointing.content, /LIVE TEXT|영상 제작|총괄/);
  const multitracks = getPortfolioBySlug('multitracks-korea-launch-2024');
  assert.ok(multitracks.frontmatter.credits.some(c => /MultiTracks/.test(c.name) && /키비주얼/.test(c.role)));
  const campus = getPortfolioBySlug('campus-worship-2026');
  assert.deepEqual(markdownImageSources(campus.content), ['/media/products/registration.webp', '/media/events/p050-1920.webp']);
  assert.equal(homeProjectTitle(toProjectLink({slug: 'campus-worship-2026', frontmatter: campus.frontmatter})), 'CAMPUS WORSHIP');
}));
