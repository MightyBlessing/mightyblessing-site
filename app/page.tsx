import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ProductionHome } from "@/components/redesign/ProductionHome";

export const metadata: Metadata = buildPageMetadata({ path: "/", keywords: ["공연 기획", "행사 연출", "프로덕션", "현장 운영"] });
export default function Home() { return <ProductionHome />; }
