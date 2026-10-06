const test=require('node:test');
const assert=require('node:assert/strict');
const {createHeroPlayback}=require('../lib/hero-playback.ts');
const {heroTiming}=require('../lib/hero-typography-motion.ts');
const {getHomeHeroSlides}=require('../lib/home-hero-slides.ts');
const {getAllPortfolios}=require('../lib/content.ts');
const {toSystemProject}=require('../lib/design-system.ts');
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
function setup(t,options={}) {
 t.mock.timers.enable({apis:['setTimeout','Date']});
 const shown=[],states=[],typeEvents=[];
 const playback=createHeroPlayback({count:30,load:()=>Promise.resolve(true),show:i=>shown.push(i),onPlaying:p=>states.push(p),now:()=>Date.now(),...options,type:{pause:()=>typeEvents.push('pause'),resume:()=>typeEvents.push('resume'),finish:()=>typeEvents.push('finish'),accent:()=>typeEvents.push('accent'),transition:()=>false,...options.type}});
 t.after(()=>playback.dispose()); return {playback,shown,states,typeEvents};
}
async function cycle(t){t.mock.timers.tick(heroTiming.hold);await flush();t.mock.timers.tick(heroTiming.cue);await flush();}
test('all 30 photographs wrap after 120 seconds, including the static-type fallback',async t=>{
 const f=setup(t);f.playback.resume();for(let i=0;i<30;i++)await cycle(t);
 assert.deepEqual(f.shown,[...Array.from({length:29},(_,i)=>i+1),0]);
});
test('a decoded photo waits for the glyph contact cue, then commits only once',async t=>{
 let cue;const f=setup(t,{type:{transition:(next,fn)=>{assert.equal(next,1);cue=fn;return true;}}});
 f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();assert.deepEqual(f.shown,[]);
 cue();cue();assert.deepEqual(f.shown,[1]);
});
test('pause preserves remaining hold time and pauses glyphs together',async t=>{
 const f=setup(t);f.playback.resume();t.mock.timers.tick(1400);f.playback.pause();t.mock.timers.tick(10000);await flush();assert.equal(f.shown.length,0);
 f.playback.resume();t.mock.timers.tick(heroTiming.hold-1400);await flush();t.mock.timers.tick(heroTiming.cue-1);await flush();assert.equal(f.shown.length,0);t.mock.timers.tick(1);await flush();assert.deepEqual(f.shown,[1]);assert.ok(f.typeEvents.includes('pause'));
});
test('a cue resolving at the same paint as pause waits until explicit resume',async t=>{
 let cue;const f=setup(t,{type:{transition:(_,fn)=>{cue=fn;return true;}}});f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();
 f.playback.pause();cue();assert.deepEqual(f.shown,[]);f.playback.resume();assert.deepEqual(f.shown,[1]);
});
test('decode finishing after pause or disposal never changes the visible project',async t=>{
 let complete;const f=setup(t,{load:()=>new Promise(r=>complete=r)});f.playback.resume();t.mock.timers.tick(heroTiming.hold);f.playback.pause();complete(true);await flush();assert.deepEqual(f.shown,[]);
 f.playback.resume();t.mock.timers.tick(100);f.playback.dispose();complete(true);await flush();assert.deepEqual(f.shown,[]);
});
test('manual browsing invalidates an outstanding animated cut',async t=>{
 let cue;const f=setup(t,{type:{transition:(_,fn)=>{cue=fn;return true;}}});f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();
 await f.playback.step(-1);cue();assert.deepEqual(f.shown,[29]);assert.equal(f.states.at(-1),false);
});
test('resize/reduced-motion stop cancels the cue and can later start a fresh hold',async t=>{
 let cue;const f=setup(t,{type:{transition:(_,fn)=>{cue=fn;return true;}}});f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();f.playback.stop();cue();assert.deepEqual(f.shown,[]);
 f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();cue();assert.deepEqual(f.shown,[1]);
});
test('failed photos are skipped and their metadata never reaches the contact cue',async t=>{
 const targets=[];const f=setup(t,{count:4,load:i=>Promise.resolve(i===2),type:{transition:(i,cue)=>{targets.push(i);cue();return true;}}});f.playback.resume();t.mock.timers.tick(heroTiming.hold);await flush();assert.deepEqual(f.shown,[2]);assert.deepEqual(targets,[2]);
 await cycle(t);assert.deepEqual(f.shown,[2]);assert.equal(f.states.at(-1),false);
});
test('hover accents are suppressed near a cut and during a transition',async t=>{
 const f=setup(t);f.playback.resume();f.playback.accent();assert.equal(f.typeEvents.filter(x=>x==='accent').length,1);
 t.mock.timers.tick(1800);f.playback.accent();t.mock.timers.tick(heroTiming.hold-1800);await flush();f.playback.accent();assert.equal(f.typeEvents.filter(x=>x==='accent').length,1);
});
test('resuming during a manual decode leaves exactly one photo clock',async t=>{
 let pending;const decoded=new Promise(r=>pending=r);const f=setup(t,{load:i=>i===1?decoded:Promise.resolve(true)});
 const step=f.playback.step(1);f.playback.resume();pending(true);await step;await flush();
 await cycle(t);assert.deepEqual(f.shown,[1,2]);await cycle(t);assert.deepEqual(f.shown,[1,2,3]);
});
test('30 curated sources bind to actual filtered project titles, roles and exclusions',()=>{
 const previous=process.env.NODE_ENV;try{process.env.NODE_ENV='development';const projects=getAllPortfolios().map(toSystemProject);const slides=getHomeHeroSlides(projects,undefined,true);
 assert.equal(slides.length,30);assert.equal(new Set(slides.map(s=>s.id)).size,30);assert.equal(new Set(slides.map(s=>s.project.slug)).size,9);
 for(const slide of slides){const p=projects.find(p=>p.slug===slide.project.slug);assert.deepEqual(slide.project.roles,p.roles);assert.equal(slide.project.fullTitle,p.fullTitle);assert.deepEqual(slide.project.excludedRoles,p.excludedRoles);assert.ok(!JSON.stringify(slide).includes('input/'));}
 assert.deepEqual(getHomeHeroSlides([],undefined,true),[]);
 process.env.NODE_ENV='production';const publicProjects=getAllPortfolios().map(toSystemProject);const publicSlides=getHomeHeroSlides(publicProjects,publicProjects[0],false);assert.ok(publicSlides.every(s=>!s.image.startsWith('/api/preview-media/')));assert.ok(publicSlides.length<=1);
 }finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;}
});
