const test = require('node:test');
const assert = require('node:assert/strict');
const { filmTypeFrameAt, createFilmTypePlayer } = require('../lib/film-typography.ts');
const { duration } = require('../lib/home-film.json');
test('typography has identical loop endpoints and a sustained readable arrangement', () => {
  assert.deepEqual(filmTypeFrameAt(0), filmTypeFrameAt(duration));
  assert.ok(Math.abs(filmTypeFrameAt(duration - .001).gather - filmTypeFrameAt(0).gather) < .001);
  assert.equal(filmTypeFrameAt(2).gather, 0);
  assert.equal(filmTypeFrameAt(4.5).gather, 0);
  assert.deepEqual(filmTypeFrameAt(1), filmTypeFrameAt(duration + 1));
});
test('seeks and invalid timestamps produce bounded, deterministic frames', () => {
  const frame = filmTypeFrameAt(.75); filmTypeFrameAt(5);
  assert.deepEqual(filmTypeFrameAt(.75), frame);
  for (const t of [NaN, Infinity, -1, ...Array.from({ length: 157 }, (_, i) => i / 24)]) {
    const { gather } = filmTypeFrameAt(t); assert.ok(Number.isFinite(gather) && gather >= 0 && gather <= 1);
  }
});
test('reset reveals static text and resume restores the paused typography frame', () => {
  const style = {}; const root = { dataset: {}, style: { setProperty: (k,v) => { style[k] = v; } } };
  const player = createFilmTypePlayer(root); player.sync(.75); const paused = { ...style };
  player.reset(); assert.equal(root.dataset.typeActive, undefined);
  player.sync(.75); assert.equal(root.dataset.typeActive, 'true'); assert.deepEqual(style, paused);
});
