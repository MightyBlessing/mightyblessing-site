const test = require('node:test');
const assert = require('node:assert/strict');
const { createHeroMotion } = require('../lib/hero-motion.ts');
const { railPreviewReducer: reduce } = require('../lib/rail-preview.ts');

function setup() {
  const created = [];
  const modes = [];
  const element = (name) => ({ animate(keyframes, options) {
    const a = { name, keyframes, options, playState: 'running', pending: false, onfinish: null,
      cancel() { this.playState = 'idle'; }, pause() { this.playState = 'paused'; },
      play() { this.playState = 'running'; this.replays = (this.replays || 0) + 1; },
      finish() { this.playState = 'finished'; this.onfinish?.(); },
    };
    created.push(a); return a;
  } });
  const player = createHeroMotion(element('canvas'), ['live', 'event', 'production'].map(element), mode => modes.push(mode));
  return { player, created, modes, mode: () => modes.at(-1) };
}

test('late photo keeps completed type visible; readiness starts exactly one fade', () => {
  const f = setup(); f.player.play(); f.created[0].finish();
  assert.equal(f.mode(), 'waiting'); assert.equal(f.created.length, 3);
  f.player.setPhoto('ready');
  assert.equal(f.created.length, 4); assert.equal(f.mode(), 'playing');
  f.player.setPhoto('ready'); assert.equal(f.created.length, 4);
  f.created[3].finish(); assert.equal(f.mode(), 'still');
  assert.ok(f.created.every(a => a.playState === 'idle'));
});

test('hidden tab / viewport pauses and never resumes on return or image load', () => {
  const f = setup(); f.player.play(); f.player.setVisible(false);
  assert.equal(f.mode(), 'paused');
  f.player.setPhoto('ready'); f.player.setVisible(true);
  assert.equal(f.mode(), 'paused');
  f.player.resume(); assert.equal(f.mode(), 'playing');
});

test('paused image wait needs explicit resume even after image becomes ready', () => {
  const f = setup(); f.player.play(); f.created[0].finish(); f.player.pause();
  f.player.setPhoto('ready'); assert.equal(f.mode(), 'paused'); assert.equal(f.created.length, 3);
  f.player.resume(); assert.equal(f.created.length, 4);
});

test('completed words do not replay when the remaining hold is resumed', () => {
  const f = setup(); f.player.play(); f.created[1].finish(); f.created[2].finish();
  f.player.pause(); f.player.resume();
  assert.equal(f.created[0].replays, 1);
  assert.equal(f.created[1].replays, undefined); assert.equal(f.created[2].replays, undefined);
});

test('reduced motion or saveData cancels every effect and prevents manual replay', () => {
  const f = setup(); f.player.play(); f.player.setAllowed(false); f.player.play();
  assert.equal(f.mode(), 'still'); assert.equal(f.created.length, 3);
  assert.ok(f.created.every(a => a.playState === 'idle' && a.onfinish === null));
  f.player.setAllowed(true); assert.equal(f.mode(), 'still');
});

test('replay and cleanup discard prior callbacks and animation instances', () => {
  const f = setup(); f.player.play(); const prior = [...f.created]; f.player.play();
  assert.ok(prior.every(a => a.playState === 'idle' && a.onfinish === null));
  assert.equal(f.created.filter(a => a.playState === 'running').length, 3);
  f.player.dispose(); assert.ok(f.created.every(a => a.playState === 'idle'));
});

test('photo failure cancels a running fade and cannot be replayed into a blank photo', () => {
  const f = setup(); f.player.setPhoto('ready'); f.player.play(); f.created[0].finish();
  f.player.setPhoto('error'); f.player.play();
  assert.equal(f.mode(), 'still'); assert.equal(f.created.length, 4);
  assert.ok(f.created.every(a => a.playState === 'idle'));
});

test('rail A to B to C holds matching caption/image and ignores late A/B', () => {
  let state = { requested: 'a', shown: 'a', ready: ['a'], failed: [] };
  state = reduce(state, { type: 'select', slug: 'b' });
  assert.equal(state.shown, 'a');
  state = reduce(state, { type: 'select', slug: 'c' });
  state = reduce(state, { type: 'loaded', slug: 'c' });
  state = reduce(state, { type: 'loaded', slug: 'b' });
  state = reduce(state, { type: 'loaded', slug: 'a' });
  assert.equal(state.shown, 'c'); assert.equal(state.requested, 'c');
});

test('failed rail selection clears the previous image; late errors cannot clear a newer image', () => {
  let state = { requested: 'b', shown: 'a', ready: ['a', 'c'], failed: [] };
  state = reduce(state, { type: 'error', slug: 'b' }); assert.equal(state.shown, undefined);
  state = reduce(state, { type: 'select', slug: 'c' });
  state = reduce(state, { type: 'error', slug: 'b' }); assert.equal(state.shown, 'c');
});
