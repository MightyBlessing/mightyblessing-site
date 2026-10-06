import { motion } from "./motion";

export type TypePerformance = "intro" | "live" | "event" | "production";
export type TypePlayer = ReturnType<typeof createTypePlayer>;
export const heroTiming = { photo: 4000, hold: 3350, cue: 650, decodeTimeout: 8000, ready: motion.heroAssetReady } as const;

/** Original glyphs only. One word initiates, its neighbours receive, then all settle.
 * The invisible cue animation shares native pause/resume with every glyph. */
export function createTypePlayer(title: HTMLElement) {
  let animations: Animation[] = [];
  let running = false;
  let paused = false;
  let serial = 0;
  const finish = () => {
    serial++;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    running = false;
    paused = false;
    title.dataset.motion = "static";
  };
  const perform = (performance: TypePerformance, onCue?: () => void) => {
    if (running || paused || typeof title.animate !== "function") return false;
    const run = ++serial;
    let cueSent = false;
    const cue = () => { if (serial === run && !cueSent) { cueSent = true; onCue?.(); } };
    const glyphs = (word: string) => [...title.querySelectorAll<HTMLElement>(`[data-word="${word}"] .type-glyph`)];
    const word = (name: string) => title.querySelector<HTMLElement>(`[data-word="${name}"]`);
    const size = parseFloat(getComputedStyle(title).fontSize);
    const animate = (element: HTMLElement | undefined | null, frames: Keyframe[], duration: number, delay = 0) => {
      if (!element) return;
      const animation = element.animate(frames, { duration, delay, easing: "linear", fill: "backwards" });
      animations.push(animation);
      return animation;
    };
    const receive = (element: HTMLElement | undefined | null, delay: number, x = 0, y = size * .045) => animate(element, [
      { transform: "translate(0,0)", offset: 0, easing: "ease-out" },
      { transform: `translate(${x}px,${y}px)`, offset: .27, easing: "cubic-bezier(.2,.8,.3,1)" },
      { transform: `translate(${-x * .15}px,${-y * .2}px)`, offset: .7 },
      { transform: "translate(0,0)", offset: 1 },
    ], 420, delay);
    // Contact is at 650ms; the smaller return bounce happens over the new photo.
    const hop = (element: HTMLElement | undefined | null, height: number, tilt = 0, delay = 0) => animate(element, [
      { transform: "translate(0,0) rotate(0deg)", offset: 0, easing: "ease-in-out" },
      { transform: `translate(0,${size * .025}px) rotate(${-tilt * .4}deg)`, offset: .15, easing: "cubic-bezier(.1,.7,.3,1)" },
      { transform: `translate(0,${-height}px) rotate(${tilt}deg)`, offset: .4, easing: "cubic-bezier(.6,0,.95,.6)" },
      { transform: "translate(0,0) rotate(0deg)", offset: .65, easing: "ease-out" },
      { transform: `translate(0,${-height * .18}px) rotate(${-tilt * .15}deg)`, offset: .79, easing: "ease-in" },
      { transform: "translate(0,0) rotate(0deg)", offset: 1 },
    ], 1000, delay);
    try {
      running = true;
      title.dataset.motion = performance;
      if (performance === "intro") {
        const e = glyphs("live")[3];
        animate(e, [
          { transform: `translate(${size * .4}px,${-size * .32}px) rotate(16deg)`, offset: 0, easing: "cubic-bezier(.5,0,.9,.6)" },
          { transform: "translate(0,0) rotate(-5deg)", offset: .52, easing: "ease-out" },
          { transform: `translate(0,${-size * .1}px) rotate(3deg)`, offset: .74, easing: "ease-in" },
          { transform: "translate(0,0) rotate(0deg)" },
        ], 900);
        receive(glyphs("live")[2], 460, -size * .04);
        receive(word("event"), 500, size * .07);
        glyphs("production").forEach((glyph, i) => receive(glyph, 810 + i * 40, 0, size * .055));
        hop(title.querySelector<HTMLElement>('[data-word="production"] .type-dot'), size * .17, 0, 760);
      } else if (performance === "live") {
        hop(glyphs("live")[3], size * .24, 9);
        receive(glyphs("live")[2], heroTiming.cue, -size * .045);
        receive(word("event"), heroTiming.cue + 50, size * .065);
        receive(word("production"), heroTiming.cue + 100);
      } else if (performance === "event") {
        glyphs("event").forEach((glyph, i) => {
          // All five land together at the cut, with different arcs like a shared cheer.
          hop(glyph, size * (i % 2 ? .16 : .23), i % 2 ? -5 : 5);
        });
        receive(word("live"), heroTiming.cue, -size * .035);
        receive(word("production"), heroTiming.cue + 60);
      } else {
        glyphs("production").forEach((glyph, i) => receive(glyph, i * 32, 0, -size * .065));
        hop(title.querySelector<HTMLElement>('[data-word="production"] .type-dot'), size * .23);
        receive(word("live"), heroTiming.cue, 0, size * .035);
        receive(word("event"), heroTiming.cue + 45, 0, size * .035);
      }
      if (onCue) {
        const clock = animate(title.querySelector<HTMLElement>('.type-beat'), [{ opacity: 1 }, { opacity: 1 }], heroTiming.cue);
        if (!clock) throw new Error("Missing type cue clock");
        clock.finished.then(cue).catch(() => { /* finish() invalidates cancelled cues */ });
      }
      Promise.all(animations.map((animation) => animation.finished)).then(() => {
        if (serial === run) { cue(); finish(); }
      }).catch(() => { if (serial === run) { cue(); finish(); } });
      return true;
    } catch { finish(); return false; }
  };
  return {
    perform, finish,
    pause: () => { paused = true; animations.forEach((animation) => animation.pause()); if (running) title.dataset.motion = "paused"; },
    resume: () => { paused = false; animations.forEach((animation) => animation.play()); if (running) title.dataset.motion = "playing"; },
    busy: () => running,
  };
}
