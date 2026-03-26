"use client";

import { useEffect, useRef } from "react";

const instagramSamples = [
  {
    account: "Elevation Worship",
    handle: "@elevationworship",
    url: "https://www.instagram.com/elevationworship/",
    image: "/media/portfolio/stage-lights.jpg",
    label: "Tour Moment",
    text: "NEW SONG. Sure Been Good. Listen now, and hold onto the moment that keeps echoing after the lights go down.",
  },
  {
    account: "Hillsong Worship",
    handle: "@hillsongworship",
    url: "https://www.instagram.com/hillsongworship/",
    image: "/media/portfolio/home-hero-worship-poster.jpg",
    label: "Live Worship",
    text: "Great I AM. Pre-save now. A quiet line, a rising room, and a chorus that feels larger than the frame.",
  },
  {
    account: "Bethel Music",
    handle: "@bethelmusic",
    url: "https://www.instagram.com/bethelmusic/",
    image: "/media/portfolio/worship-room.jpg",
    label: "Backstage",
    text: "Worship School in view. The details behind the stage still carry the same atmosphere as the room itself.",
  },
  {
    account: "Elevation Worship",
    handle: "@elevationworship",
    url: "https://www.instagram.com/elevationworship/",
    image: "/media/portfolio/audience-lights.jpg",
    label: "Crowd Energy",
    text: "So So Good, out now. Light, crowd, and response moving together like a single pulse across the room.",
  },
  {
    account: "Hillsong Worship",
    handle: "@hillsongworship",
    url: "https://www.instagram.com/hillsongworship/",
    image: "/media/portfolio/atmosphere-detail.jpg",
    label: "Visual Detail",
    text: "Listen to our worship playlist below. The atmosphere is built as much by tone and texture as by the song itself.",
  },
];

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 transition-transform ${direction === "left" ? "rotate-180" : ""}`}
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export function InstagramCarouselSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const getStepSize = () => {
    if (!trackRef.current) return 0;

    const firstCard = trackRef.current.querySelector<HTMLElement>("[data-carousel-card]");
    if (!firstCard) return 0;

    const styles = window.getComputedStyle(trackRef.current);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    return firstCard.offsetWidth + gap;
  };

  const scrollByCard = (direction: "left" | "right") => {
    if (!trackRef.current) return;

    const amount = getStepSize();
    if (!amount) return;

    const maxScrollLeft = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    const nextLeft = trackRef.current.scrollLeft + (direction === "left" ? -amount : amount);

    trackRef.current.scrollTo({
      left: direction === "right" && nextLeft >= maxScrollLeft - 4 ? 0 : Math.max(0, nextLeft),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const intervalId = window.setInterval(() => {
      const amount = getStepSize();
      if (!amount) return;

      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const nextLeft = track.scrollLeft + amount;

      track.scrollTo({
        left: nextLeft >= maxScrollLeft - 4 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="border-t border-neutral-800 bg-neutral-950 py-16 text-white sm:py-20">
      <div className="container-wide">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[760px]">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/48">Instagram Mood</p>
            <h2 className="text-[1.8rem] leading-[1.08] font-semibold tracking-[-0.05em] text-white break-keep sm:text-[2.55rem]">
              현장 기록
            </h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="이전 카드"
              onClick={() => scrollByCard("left")}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/16 text-white/72 transition-colors hover:border-white/32 hover:text-white"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="다음 카드"
              onClick={() => scrollByCard("right")}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.1]"
            >
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div ref={trackRef} className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {instagramSamples.map((post) => (
            <a
              key={`${post.account}-${post.label}`}
              href={post.url}
              target="_blank"
              rel="noreferrer"
              data-carousel-card
              className="group min-w-[84%] snap-start sm:min-w-[48%] lg:min-w-[31%]"
            >
              <article className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04]">
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={`${post.account} 피드 무드를 참고한 캐러셀 샘플`}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,14,0.05)_0%,rgba(12,12,14,0.18)_45%,rgba(12,12,14,0.8)_100%)]" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <span className="inline-flex items-center rounded-full border border-white/16 bg-black/22 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                      {post.label}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/16 bg-black/22 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/72 backdrop-blur-sm">
                      Instagram
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/68">{post.handle}</p>
                    <h3 className="mt-2 text-[1.35rem] leading-[1.08] font-semibold tracking-[-0.04em] text-white">
                      {post.account}
                    </h3>
                  </div>
                </div>
                <div className="border-t border-white/10 px-5 py-4">
                  <p
                    className="text-[0.94rem] leading-[1.72] text-white/70 break-keep"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.text}
                  </p>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
