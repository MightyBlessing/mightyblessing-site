const test = require('node:test');
const assert = require('node:assert/strict');
const timeline = require('../lib/home-film.json');
const { canReviewFilm, getHomeFilm, filmCutAt, filmByteRange, filmFileAllowed } = require('../lib/home-film.ts');

const projects = [...new Set(timeline.cuts.map(cut => cut.projectSlug))].map(slug => ({ slug, fullTitle: slug, roles: ['확인된 역할'], excludedRoles: ['음향'], credits: [{ name: '제작사', role: '크레딧' }] }));

test('all background cuts use real video and cover the continuous loop', () => {
  assert.ok(timeline.cuts.length > 0);
  assert.ok(timeline.cuts.every(cut => cut.kind === "video"));
  assert.equal(timeline.cuts[0].start, 0);
  assert.equal(timeline.cuts.at(-1).end, timeline.duration);
  timeline.cuts.forEach((cut, i) => {
    assert.ok(cut.end > cut.start);
    if (i) assert.equal(cut.start, timeline.cuts[i - 1].end);
    assert.equal(cut.start * timeline.fps % 1, 0);
    assert.equal(cut.end * timeline.fps % 1, 0);
  });
});

test('decoded video timestamps map both sides of every cut and loop to the matching project', () => {
  for (const cut of timeline.cuts) {
    assert.equal(filmCutAt(timeline.cuts, cut.start).id, cut.id);
    assert.equal(filmCutAt(timeline.cuts, cut.end - .001).id, cut.id);
  }
  assert.equal(filmCutAt(timeline.cuts, timeline.duration).id, 'live');
  assert.equal(filmCutAt(timeline.cuts, timeline.duration + 3).id, 'live');
  assert.equal(filmCutAt(timeline.cuts, NaN).id, 'live');
  assert.equal(filmCutAt([], 4), undefined);
});

test('a baked film requires all projects in the visible collection, including production', () => {
  assert.equal(canReviewFilm(projects), true);
  assert.equal(canReviewFilm(projects.slice(1)), false);
  assert.equal(canReviewFilm([]), false);
  assert.equal(canReviewFilm(projects), true);
  assert.match(getHomeFilm(projects).desktop, /^\/media\/home-film\/desktop.mp4/);
  assert.equal(getHomeFilm([]), undefined);
});

test('film presentation copies real scope and credits, with no source paths or invented records', () => {
  const film = getHomeFilm(projects);
  assert.equal(film.duration, timeline.duration);
  for (const cut of film.cuts) {
    assert.deepEqual(cut.project.excludedRoles, ['음향']);
    assert.deepEqual(cut.project.credits, projects[0].credits);
    assert.equal(cut.project.fullTitle, cut.projectSlug);
  }
  assert.equal(JSON.stringify(film).includes('input/'), false);
});

test('only four named review derivatives are allowed, never arbitrary source or filesystem paths', () => {
  for (const name of ['desktop.mp4', 'mobile.mp4', 'poster-desktop.webp', 'poster-mobile.webp']) assert.equal(filmFileAllowed(name), true);
  for (const name of ['../desktop.mp4', 'HV01.mp4', 'input.mp4', '/desktop.mp4', 'integrity.json', 'desktop-0.mp4', 'DESKTOP.mp4']) assert.equal(filmFileAllowed(name), false);
});

test('byte ranges support metadata probes, open ranges, clipped ends and suffix requests', () => {
  assert.equal(filmByteRange(null, 1000), undefined);
  assert.deepEqual(filmByteRange('bytes=0-1', 1000), { start: 0, end: 1 });
  assert.deepEqual(filmByteRange('bytes=900-', 1000), { start: 900, end: 999 });
  assert.deepEqual(filmByteRange('bytes=900-2000', 1000), { start: 900, end: 999 });
  assert.deepEqual(filmByteRange('bytes=-100', 1000), { start: 900, end: 999 });
  assert.deepEqual(filmByteRange('bytes=-2000', 1000), { start: 0, end: 999 });
  for (const range of ['bytes=1000-', 'bytes=-0', 'bytes=5-4', 'bytes=-', 'bytes=0-1,5-6', 'bytes=NaN-3', 'bytes=99999999999999999-']) assert.equal(filmByteRange(range, 1000), false, range);
});
