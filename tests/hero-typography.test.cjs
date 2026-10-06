const test = require('node:test');
const assert = require('node:assert/strict');
const { createTypePlayer } = require('../lib/hero-typography-motion.ts');
const flush = () => new Promise(resolve => setImmediate(resolve));
function fixture(failAt = -1) {
  const animations = [];
  const glyph = () => ({ animate(frames, options) {
    if (animations.length === failAt) throw Error('animation failed');
    let complete;
    const a = {frames,options,finished:new Promise(r=>complete=r),complete:()=>complete(),cancelled:false,paused:false,cancel(){this.cancelled=true;complete();},pause(){this.paused=true;},play(){this.paused=false;}};
    animations.push(a); return a;
  }});
  const words = Object.fromEntries(['live','event','production'].map(w=>[w,Array.from(w,glyph)]));
  const dot = glyph();
  const title = {dataset:{},animate(){},querySelectorAll(selector){return words[selector.match(/data-word="([^"]+)/)[1]];},querySelector(){return dot;}};
  global.getComputedStyle = () => ({fontSize:'120px'});
  return {title,animations,player:createTypePlayer(title)};
}
test('intro has a clear sequence under two seconds, using only reversible glyph transforms', async () => {
  const f=fixture(); assert.equal(f.player.perform('intro'),true);
  assert.ok(f.animations.length > 10);
  assert.equal(Math.max(...f.animations.map(a=>a.options.delay+a.options.duration)),1760);
  assert.ok(f.animations.every(a=>a.frames.every(frame=>frame.opacity===undefined)));
  assert.equal(f.player.perform('event'),false);
  f.animations.forEach(a=>a.complete()); await flush();
  assert.equal(f.title.dataset.motion,'static'); assert.ok(f.animations.every(a=>a.cancelled));
});
test('pause freezes all active glyphs; resume continues without recreating the intro', () => {
  const f=fixture();f.player.perform('intro'); const count=f.animations.length;
  f.player.pause();assert.ok(f.animations.every(a=>a.paused));assert.equal(f.player.perform('live'),false);
  f.player.resume();assert.ok(f.animations.every(a=>!a.paused));assert.equal(f.animations.length,count);f.player.finish();
});
test('cancellation and stale completions cannot terminate the next performance', async () => {
  const f=fixture();f.player.perform('intro');f.player.finish();f.player.perform('live');await flush();
  assert.equal(f.title.dataset.motion,'live');assert.equal(f.player.busy(),true);f.player.finish();
});
test('partial animation creation failure restores all already animated glyphs', () => {
  const f=fixture(2);assert.equal(f.player.perform('intro'),false);assert.ok(f.animations.every(a=>a.cancelled));assert.equal(f.player.busy(),false);
});
test('absent animation support leaves the complete static text untouched', () => {
  const f=fixture();delete f.title.animate;assert.equal(f.player.perform('intro'),false);assert.equal(f.animations.length,0);
});

test('the photo cue shares the paused animation clock and fires once', async () => {
 const f=fixture();let cuts=0;f.player.perform('event',()=>cuts++);
 const clock=f.animations.find(a=>a.frames[0].opacity===1);assert.equal(clock.options.duration,650);
 f.player.pause();assert.equal(clock.paused,true);assert.equal(cuts,0);f.player.resume();clock.complete();await flush();assert.equal(cuts,1);
 f.animations.forEach(a=>a.complete());await flush();assert.equal(cuts,1);
});
test('cancelling a transition invalidates its pending photo cue', async () => {
 const f=fixture();let cuts=0;f.player.perform('production',()=>cuts++);f.player.finish();await flush();assert.equal(cuts,0);
});
