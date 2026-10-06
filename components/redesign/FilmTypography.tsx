import { homeHeroCopy } from "@/lib/home-hero-copy";
export function FilmTypography() {
  return <h1 id="home-title" className="brand-type-title film-story-title" lang="en" aria-label={homeHeroCopy.headline.join(" ")}>
    <span className="film-type-fallback" aria-hidden="true"><span>live event</span><span>production</span></span>
    <span className="film-type-scenes" aria-hidden="true">
      <span className="film-type-signature"><span className="film-type-first"><span>live</span><span>event</span></span><span className="film-type-production">production</span></span>
    </span>
  </h1>;
}
