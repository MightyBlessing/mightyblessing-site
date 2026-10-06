"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createTypePlayer, type TypePerformance, type TypePlayer } from "@/lib/hero-typography-motion";

export type HeroTypographyHandle = {
  play: (performance: TypePerformance, onCue?: () => void) => boolean;
  pause: () => void; resume: () => void; finish: () => void;
};

export const HeroTypography = forwardRef<HeroTypographyHandle, { lines: readonly string[]; onWordHover?: (word: TypePerformance) => void }>(function HeroTypography({ lines, onWordHover }, ref) {
  const title = useRef<HTMLHeadingElement>(null);
  const player = useRef<TypePlayer | null>(null);
  useEffect(() => {
    if (!title.current) return;
    player.current = createTypePlayer(title.current);
    return () => { player.current?.finish(); player.current = null; };
  }, []);
  useImperativeHandle(ref, () => ({
    play: (performance, onCue) => player.current?.perform(performance, onCue) ?? false,
    pause: () => player.current?.pause(), resume: () => player.current?.resume(), finish: () => player.current?.finish(),
  }), []);
  return <h1 ref={title} id="home-title" className="brand-type-title" lang="en" aria-label={lines.join(" ")}>
    {lines.map((word, wordIndex) => <span key={word} className={`brand-type-line${wordIndex === lines.length - 1 ? " brand-type-foundation" : ""}`} aria-hidden="true">{wordIndex > 0 && " "}<span className="brand-type-words" data-word={word} onPointerEnter={(event) => { if (event.pointerType === "mouse") onWordHover?.(word as TypePerformance); }}>
      {[...word].map((letter, index) => <span className="type-glyph" key={`${letter}-${index}`} data-letter={letter}>
        {letter === "i" && word === "production" ? <><span className="type-stem">{letter}</span><span className="type-dot" data-letter={letter} /></> : letter}
      </span>)}
    </span></span>)}
    <span className="type-beat" aria-hidden="true" />
  </h1>;
});
