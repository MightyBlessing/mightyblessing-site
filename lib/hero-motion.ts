import { motion } from "./motion";

export type HeroMode = "still" | "playing" | "paused" | "waiting";
export type PhotoState = "loading" | "ready" | "error";

// One lifecycle for the word sequence, late images, and interrupted fades.
export function createHeroMotion(overlay: HTMLElement, words: HTMLElement[], onMode: (mode: HeroMode) => void) {
  let mode: HeroMode = "still";
  let phase: "intro" | "waiting" | "fade" | null = null;
  let animations: Animation[] = [];
  let photo: PhotoState = "loading";
  let allowed = true;
  let visible = true;

  function update(next: HeroMode) { mode = next; onMode(next); }
  function cancelAnimations() {
    for (const animation of animations) { animation.onfinish = null; animation.cancel(); }
    animations = [];
  }
  function stop() { cancelAnimations(); phase = null; update("still"); }
  function fade() {
    cancelAnimations();
    phase = "fade";
    const animation = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: motion.fade, easing: "linear", fill: "both" });
    animations = [animation];
    animation.onfinish = stop;
    update("playing");
  }
  function pause() {
    if (mode !== "playing" && mode !== "waiting") return;
    animations.filter((animation) => animation.playState === "running" || animation.pending).forEach((animation) => animation.pause());
    update("paused");
  }
  function play() {
    if (!allowed || photo === "error") return;
    cancelAnimations();
    phase = "intro";
    const clock = overlay.animate([{ opacity: 1 }, { opacity: 1 }], { duration: motion.hold, fill: "both" });
    animations = [clock, ...words.slice(1).map((word, index) => word.animate(
      [{ opacity: 0, transform: `translateY(${motion.travel}px)` }, { opacity: 1, transform: "translateY(0)" }],
      { delay: motion.stagger * (index + 1), duration: motion.word, easing: motion.ease, fill: "both" },
    ))];
    clock.onfinish = () => {
      phase = "waiting";
      if (mode === "paused") return;
      if (photo === "ready" && visible) fade();
      else update("waiting");
    };
    update("playing");
    if (!visible) pause();
  }
  function resume() {
    if (mode !== "paused" || !allowed || !visible) return;
    if (phase === "waiting") {
      if (photo === "ready") fade();
      else update("waiting");
    } else {
      animations.filter((animation) => animation.playState === "paused").forEach((animation) => animation.play());
      update("playing");
    }
  }
  return {
    play, pause, resume,
    setPhoto(next: PhotoState) {
      photo = next;
      if (next === "error") stop();
      else if (next === "ready" && mode === "waiting" && allowed && visible) fade();
    },
    setAllowed(next: boolean) { allowed = next; if (!next) stop(); },
    setVisible(next: boolean) { visible = next; if (!next) pause(); },
    dispose() { cancelAnimations(); },
  };
}
