type Media = Pick<HTMLVideoElement, "src" | "currentTime" | "readyState" | "paused" | "getAttribute" | "load" | "play" | "pause" | "addEventListener" | "removeEventListener">;

/** User intent survives automatic suspension and responsive source replacement. */
export function createFilmPlayback(media: Media, options: { source: () => string; duration: number; reset: () => void }) {
  let ready = false, desired = false, visible = true, disposed = false, loading = false;
  let resumeTime = 0, generation = 0;
  const refresh = () => {
    if (disposed || !ready) return false;
    const source = options.source();
    if (media.getAttribute("src") === source) return false;
    if (!loading) resumeTime = media.currentTime;
    generation++; loading = true; options.reset();
    media.src = source; media.load();
    return true;
  };
  const run = () => {
    if (!ready || disposed) return;
    if (!desired || !visible) { generation++; media.pause(); return; }
    if (refresh() || loading || !media.paused) return;
    const ticket = ++generation;
    void media.play().catch(() => { if (!disposed && generation === ticket) desired = false; });
  };
  const loaded = () => {
    if (disposed) return;
    if (loading) { media.currentTime = Math.max(0, resumeTime) % options.duration; loading = false; }
    run();
  };
  media.addEventListener("loadedmetadata", loaded);
  return {
    start(autoplay: boolean) { ready = true; desired = autoplay; run(); },
    toggle() { desired = !desired; run(); },
    pause() { desired = false; run(); },
    setVisible(value: boolean) { visible = value; run(); },
    resize() { if (media.getAttribute("src")) refresh(); },
    shouldPlay() { return ready && desired && visible && !disposed; },
    dispose() { disposed = true; generation++; media.removeEventListener("loadedmetadata", loaded); media.pause(); },
  };
}
