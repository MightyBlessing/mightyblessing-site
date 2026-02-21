import { HeroSection } from "@/components/home/HeroSection";
import { WhatWeDoSection } from "@/components/home/WhatWeDoSection";
import { FeaturedPortfolioSection } from "@/components/home/FeaturedPortfolioSection";
import { ProofStripSection } from "@/components/home/ProofStripSection";
import { FeaturedBlogSection } from "@/components/home/FeaturedBlogSection";
import { ProductsTeaserSection } from "@/components/home/ProductsTeaserSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <FeaturedPortfolioSection />
      <ProofStripSection />
      <FeaturedBlogSection />
      <ProductsTeaserSection />
      <FinalCTASection />
    </>
  );
}
