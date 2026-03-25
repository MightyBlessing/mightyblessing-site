"use client";

import { useState } from "react";
import Link from "next/link";
import { CTAButton } from "../CTAButton";

export function HeroSection() {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <header className="relative overflow-hidden border-b border-neutral-200 bg-neutral-950 text-white">
      <img
        src="/media/portfolio/home-hero-worship-poster.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        aria-hidden="true"
      />
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        poster="/media/portfolio/home-hero-worship-poster.jpg"
        preload="metadata"
        aria-hidden="true"
        onLoadedData={() => setIsVideoReady(true)}
      >
        <source src="/media/portfolio/home-hero-worship.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[44%] border-r border-white/8 bg-black/14 sm:w-[34%]" />
      <div className="pointer-events-none absolute inset-y-0 left-[34%] w-[24%] border-x border-white/7 bg-white/[0.03] max-sm:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] border-l border-white/8 bg-black/18 max-lg:hidden" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,8,0.3)_0%,rgba(6,6,8,0.48)_38%,rgba(6,6,8,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.2),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(75,132,255,0.16),transparent_28%)]" />

      <div className="container-wide relative flex min-h-[640px] flex-col justify-center py-24 sm:min-h-[720px] sm:py-28 lg:min-h-[760px] lg:py-32">
        <div className="max-w-[760px]">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">MightyBlessing</p>
          <h1 className="max-w-[9.5ch] text-[2.45rem] leading-[0.98] font-semibold tracking-[-0.06em] text-white break-keep sm:text-[4.55rem]">
            이제껏 없던
            <br />
            <span className="relative inline-block whitespace-nowrap [text-shadow:0_0_22px_rgba(184,192,255,0.16)]">
              예배를 만듭니다
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.18em] rounded-[3px] bg-[linear-gradient(90deg,rgba(200,208,255,0.9)_0%,rgba(143,118,255,0.92)_100%)] opacity-90 sm:h-[0.2em]"
              />
            </span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[1.04rem] leading-[1.9] text-white/88 break-keep sm:text-[1.14rem]">
            예배와 집회가 잘 열리도록 기획하고 운영합니다.
            <br />
            현장 오퍼레이션부터 디지털 제작까지 실제 진행이 끊기지 않게 함께 설계합니다.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTAButton href="/inquiry" label="프로젝트 문의하기" size="lg" showArrow className="shadow-none" />
            <Link href="/portfolio" className="text-[15px] font-medium text-white/82 transition-colors hover:text-white">
              대표 프로젝트 보기
            </Link>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center sm:bottom-8">
        <div className="flex flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-white/58">
          <span>Scroll</span>
          <span className="relative block h-10 w-px bg-white/12">
            <span className="scroll-cue-pulse absolute inset-x-0 top-0 h-4 bg-white/70" />
          </span>
        </div>
      </div>
    </header>
  );
}
