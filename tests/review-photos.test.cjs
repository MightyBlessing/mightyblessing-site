const test = require('node:test');
const assert = require('node:assert/strict');
const { getReviewPhoto, isReviewPhotoFile } = require('../lib/review-photos.ts');
const { imageSrcSet } = require('../lib/project-presentation.ts');
const { GET } = require('../app/api/preview-media/[file]/route.ts');
const { getPortfolioBySlug, getAllPortfolios } = require('../lib/content.ts');

test('web review photos allow only registered sizes and use real pixel widths', () => {
  assert.equal(isReviewPhotoFile('w008-500.webp'), true);
  assert.equal(getReviewPhoto('/api/preview-media/w008-500.webp').height, 263);
  assert.equal(imageSrcSet('/api/preview-media/w008-500.webp'), '/api/preview-media/w008-480.webp 480w, /api/preview-media/w008-500.webp 500w');
  for (const file of ['w008-1920.webp', 'w999-500.webp', '../w008-500.webp', '%2e%2e%2fw008-500.webp', 'w008-500.webp?file=secret', 'w008-500.jpg']) assert.equal(isReviewPhotoFile(file), false, file);
  assert.equal(getReviewPhoto('https://other.invalid/api/preview-media/w008-500.webp'), undefined);
  assert.match(imageSrcSet('/api/preview-media/p043-1920.webp'), /1920w$/);
  assert.equal(imageSrcSet('/media/approved.jpg'), undefined);
});

test('review route refuses web and existing photos outside development', async () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    for (const file of ['w008-500.webp', 'p043-1920.webp', 'r3123-1920.webp', 'r3249-1280.webp']) {
      const response = await GET(new Request(`http://localhost/api/preview-media/${file}`), { params: Promise.resolve({ file }) });
      assert.equal(response.status, 404);
    }
    process.env.NODE_ENV = 'development';
    for (const file of ['w008-1920.webp', 'w999-500.webp', '../originals/digital-bible-2020.jpg']) {
      const response = await GET(new Request('http://localhost/api/preview-media/missing'), { params: Promise.resolve({ file }) });
      assert.equal(response.status, 404);
    }
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});

test('photo additions preserve held records and distinguish a video capture from photographs', () => {
  const read = slug => getPortfolioBySlug(slug, { includeUnpublished: true });
  const digital = read('digital-bible-conference-2020');
  assert.match(digital.frontmatter.gallery[0].caption, /실황 캡처.*제이어스/);
  assert.match(digital.content, /https:\/\/www.christiandaily.co.kr\/news\/96528/);
  const africa = read('africa-messi-2024');
  assert.equal(africa.frontmatter.status, 'archived');
  assert.equal(africa.frontmatter.gallery.length, 3);
  assert.ok(africa.frontmatter.gallery.every(p => p.caption.includes('마이티블레싱 제공 / 국민일보 게재')));
  const young = read('young-daniel-prayer-2025');
  assert.equal(young.frontmatter.status, 'archived');
  assert.equal(young.frontmatter.heroMedia, undefined);
  assert.match(young.content, /4ddEAObPZw4/);
  assert.equal(getAllPortfolios({ includeUnpublished: true }).filter(p => p.frontmatter.status === 'archived').length, 5);
});

test('confirmed local photos reach project cards and details without publishing held events', () => {
  const { toProjectLink } = require('../lib/project-presentation.ts');
  const confirmed = {
    'welove-reconciliation-2026': 'p043', 'fia-welove-2026': 'p037',
    'welove-lament-2025': 'p022', 'time-to-renew-2024': 'p016',
    'created-to-be-creative-2024': 'p014', 'the-sent-2024': 'r0847',
    'welove-hapsim-2024': 'p001', 'the-sent-2023': 'r0009',
    'run-to-the-light-2023': 'r3090',
    'get-back-up-again-2022': 'r3123', 'student-worship-2021': 'r3207',
    'welove-recording-2021': 'r3115', 'welove-iprye-2021': 'r3155',
    'christian-student-conference-2021': 'r3021', 'welove-tour-busan-2022': 'r3172',
    'welove-tour-jeonju-2022': 'r3058', 'welove-tour-yongin-2022': 'r3062',
    'kouny-online-worship-2020': 'r3228',
  };
  for (const [slug, id] of Object.entries(confirmed)) {
    const project = getPortfolioBySlug(slug, { includeUnpublished: true });
    const hero = project.frontmatter.heroMedia;
    assert.equal(hero.url, `/api/preview-media/${id}-1920.webp`);
    assert.equal(toProjectLink(project).image, hero.url);
    for (const media of [hero, ...project.frontmatter.gallery]) {
      assert.ok(getReviewPhoto(media.url), media.url);
      assert.ok(media.alt && media.caption, media.url);
    }
  }
  // An SOS image and a different year's Hapsim photo were mixed into source folders.
  assert.ok(!getPortfolioBySlug('the-sent-2023', { includeUnpublished: true }).frontmatter.gallery.some(p => p.url.includes('r0280')));
  assert.ok(!getPortfolioBySlug('welove-hapsim-2024', { includeUnpublished: true }).frontmatter.gallery.some(p => p.url.includes('p004')));
  assert.equal(getReviewPhoto('/api/preview-media/r3090-1920.webp').height, 1440);
  assert.equal(getReviewPhoto('/api/preview-media/r3089-1920.webp').height, 2560);
  const changwon = getPortfolioBySlug('gyeongnam-worship-2024', { includeUnpublished: true });
  assert.equal(changwon.frontmatter.date, '2024-08-11');
  assert.equal(changwon.frontmatter.heroMedia, undefined);
  assert.equal(toProjectLink(changwon).image, '');
  const { resolvePortfolioThumbnailUrl, resolvePortfolioCardMedia } = require('../lib/portfolio-display.ts');
  assert.equal(resolvePortfolioThumbnailUrl(changwon.frontmatter), undefined);
  assert.equal(resolvePortfolioCardMedia(changwon.frontmatter), undefined);
  assert.equal(changwon.frontmatter.gallery.length, 1);
  assert.match(changwon.frontmatter.gallery[0].caption, /설치.*2024\.08\.09/);
  // Legacy overview pages still use their gallery when no cover is selected.
  const legacy = { ...changwon.frontmatter, schemaVersion: undefined };
  assert.equal(resolvePortfolioThumbnailUrl(legacy), changwon.frontmatter.gallery[0].url);
  assert.equal(resolvePortfolioCardMedia(legacy).url, changwon.frontmatter.gallery[0].url);
  // Only the six user-selected connections are removed; source files remain.
  const removed = ['r3158', 'r3198', 'r3093', 'w007', 'p007', 'r3089'];
  const all = getAllPortfolios({ includeUnpublished: true });
  for (const { frontmatter } of all) {
    const media = [frontmatter.thumbnail, frontmatter.heroMedia?.url, ...frontmatter.gallery.map(p => p.url)].filter(Boolean);
    assert.ok(media.every(url => !removed.some(id => url.includes(`/${id}-`))), frontmatter.slug);
  }
  const anointing = getPortfolioBySlug('anointing-worship-camp-2025', { includeUnpublished: true });
  assert.equal(toProjectLink(anointing).image, '');
  assert.equal(anointing.frontmatter.gallery.length, 0);
  assert.doesNotMatch(anointing.content, /현장 사진 출처/);
  const busan = getPortfolioBySlug('welove-tour-busan-2022', { includeUnpublished: true });
  assert.equal(busan.frontmatter.gallery[0].url, '/api/preview-media/r3177-1920.webp');
  assert.match(busan.frontmatter.gallery[0].alt, /관객을 안내/);
  assert.match(busan.frontmatter.gallery[0].caption, /관객 안내/);
  assert.equal(getReviewPhoto('/api/preview-media/r3249-1920.webp').height, 2560);
  assert.equal(getAllPortfolios({ includeUnpublished: true }).filter(p => p.frontmatter.status === 'published').length, 3);
});
