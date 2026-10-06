const test = require('node:test');
const assert = require('node:assert/strict');
const { createFilmPlayback } = require('../lib/film-playback.ts');
function setup() {
  const events = new Map(); let source = 'desktop'; let resets = 0;
  const media = { src: '', currentTime: 0, readyState: 0, paused: true, plays: 0, loads: 0,
    getAttribute() { return this.src || null; },
    load() { this.loads++; this.paused = true; this.currentTime = 0; this.readyState = 0; },
    play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    addEventListener(n,f) { events.set(n,f); }, removeEventListener(n) { events.delete(n); },
  };
  const player = createFilmPlayback(media, { source: () => source, duration: 6.5, reset: () => resets++ });
  return { media, player, events, source: s => { source = s; }, loaded: () => { media.readyState = 4; events.get('loadedmetadata')?.(); }, resets: () => resets };
}
test('ordinary resizing preserves active playback without reloads or resets', () => {
  const s=setup(); s.player.start(true); s.loaded(); s.media.currentTime=3;
  s.player.resize(); assert.equal(s.media.paused,false); assert.equal(s.media.currentTime,3); assert.equal(s.media.loads,1); assert.equal(s.resets(),1);
});
test('responsive source replacement restores media time and playback intent', () => {
  const s=setup(); s.player.start(true); s.loaded(); s.media.currentTime=4.25;
  s.source('mobile'); s.player.resize(); assert.equal(s.media.src,'mobile'); s.loaded();
  assert.equal(s.media.currentTime,4.25); assert.equal(s.media.paused,false);
  s.player.pause(); s.media.currentTime=5; s.source('desktop'); s.player.resize(); s.loaded();
  assert.equal(s.media.currentTime,5); assert.equal(s.media.paused,true);
});
test('automatic hiding resumes on return while manual pause remains paused', () => {
  const s=setup(); s.player.start(true); s.loaded(); s.player.setVisible(false); assert.equal(s.media.paused,true);
  s.player.setVisible(true); assert.equal(s.media.paused,false);
  s.player.pause(); s.player.setVisible(false); s.player.setVisible(true); assert.equal(s.media.paused,true);
  s.player.toggle(); assert.equal(s.media.paused,false);
});
test('reduced motion does not fetch until explicit playback and disposal prevents late restarts', () => {
  const s=setup(); s.player.start(false); s.player.resize(); assert.equal(s.media.loads,0);
  s.player.toggle(); assert.equal(s.media.loads,1); s.loaded(); assert.equal(s.media.paused,false);
  s.player.dispose(); s.player.setVisible(true); s.loaded(); assert.equal(s.media.paused,true); assert.equal(s.events.size,0);
});
test('aborted old play promises do not cancel a newer user intent', async () => {
  const s=setup(); let reject; s.media.play=function(){ this.paused=false; return new Promise((_,r)=>{reject=r;});};
  s.player.start(true); s.loaded(); const oldReject=reject;
  s.player.setVisible(false); s.player.setVisible(true); oldReject(new Error('aborted')); await Promise.resolve();
  assert.equal(s.player.shouldPlay(),true);
  reject(new Error('blocked')); await Promise.resolve(); assert.equal(s.player.shouldPlay(),false);
});
