import { heroTiming } from "./hero-typography-motion";

type PlaybackOptions = {
  count: number;
  load: (index: number) => Promise<boolean>;
  show: (index: number) => void;
  onPlaying: (playing: boolean) => void;
  type: {
    pause: () => void; resume: () => void; finish: () => void; accent: () => void;
    transition: (next: number, cue: () => void) => boolean;
  };
  now?: () => number;
};

/** A photo commits on the type's contact cue, only after its image has decoded.
 * Pause preserves both clocks; cancellation invalidates pending decodes and cues. */
export function createHeroPlayback({ count, load, show, onPlaying, type, now = () => performance.now() }: PlaybackOptions) {
  let index = 0;
  let playing = false;
  let disposed = false;
  let epoch = 0;
  let phase: "hold" | "loading" | "manual" | "transition" = "hold";
  let remaining: number = heroTiming.hold;
  let due = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let action: (() => void) | undefined = () => { void advance(1, false); };
  let pendingCue: (() => void) | undefined;
  const clear = () => { clearTimeout(timer); timer = undefined; };
  const prime = () => { if (count > 1) void load((index + 1) % count).catch(() => false); };
  const schedule = () => {
    clear();
    if (!playing || disposed || count < 2 || !action) return;
    due = now() + remaining;
    timer = setTimeout(() => { timer = undefined; const next = action; action = undefined; next?.(); }, remaining);
  };
  const hold = () => {
    phase = "hold";
    remaining = heroTiming.hold;
    action = () => { void advance(1, false); };
    schedule();
  };
  const pause = () => {
    if (disposed) return;
    if (timer !== undefined) remaining = Math.max(0, due - now());
    clear();
    if (phase === "loading") {
      epoch++;
      phase = "hold";
      remaining = 100;
      action = () => { void advance(1, false); };
    }
    playing = false;
    type.pause();
    onPlaying(false);
  };
  const advance = async (direction: number, manual: boolean) => {
    if (disposed || count < 2) return;
    const request = ++epoch;
    phase = manual ? "manual" : "loading";
    action = undefined;
    clear();
    for (let offset = 1; offset < count; offset++) {
      const next = (index + direction * offset + count * offset) % count;
      let loaded = false;
      try { loaded = await load(next); } catch { /* Retain the last valid scene. */ }
      if (disposed || request !== epoch || (!manual && !playing)) return;
      if (!loaded) continue;
      let committed = false;
      const commit = () => {
        if (disposed || request !== epoch || committed) return;
        if (!manual && !playing) { pendingCue = commit; return; }
        committed = true;
        pendingCue = undefined;
        index = next;
        show(index);
        hold();
        prime();
      };
      if (manual) commit();
      else {
        phase = "transition";
        // Start from a stable pose if a hover performance was still finishing.
        type.finish();
        if (!type.transition(next, commit)) {
          // Static-font / missing-WAAPI fallback keeps the same four-second edit.
          remaining = heroTiming.cue;
          action = commit;
          schedule();
        }
      }
      return;
    }
    pause();
  };
  const stop = () => {
    pause(); epoch++; type.finish(); pendingCue = undefined;
    hold();
  };
  return {
    pause, stop,
    resume: () => {
      if (playing || disposed) return;
      playing = true;
      type.resume();
      onPlaying(true);
      if (pendingCue) pendingCue();
      else schedule();
      prime();
    },
    step: (direction: -1 | 1) => { stop(); return advance(direction, true); },
    accent: () => { if (playing && phase === "hold" && due - now() > 1800) type.accent(); },
    dispose: () => { disposed = true; epoch++; clear(); pendingCue = undefined; type.finish(); },
  };
}
