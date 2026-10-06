import timeline from "./home-film.json";
const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
/** The complete business name stays readable; the loop begins and ends in the same arrangement. */
export function filmTypeFrameAt(time: number) {
  const t = Number.isFinite(time) && time >= 0 ? time % timeline.duration : 0;
  const gather = 1 - ease(t / 1.6) + ease((t - (timeline.duration - 1.1)) / 1.1);
  return { gather };
}
export function createFilmTypePlayer(root: HTMLElement) {
  return {
    sync(time: number) {
      root.dataset.typeActive = "true";
      root.style.setProperty("--type-gather", filmTypeFrameAt(time).gather.toFixed(4));
    },
    reset() { delete root.dataset.typeActive; },
  };
}
