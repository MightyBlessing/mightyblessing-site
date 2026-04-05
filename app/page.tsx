import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { WhatWeDoSection } from "@/components/home/WhatWeDoSection";
import { ProofStripSection } from "@/components/home/ProofStripSection";
import { InstagramCarouselSection } from "@/components/home/InstagramCarouselSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  keywords: ["예배 기획", "집회 운영", "예배 운영 팀", "교회 행사 기획"],
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <ProofStripSection />
      <InstagramCarouselSection />
      <FinalCTASection />
    </>
  );
}
