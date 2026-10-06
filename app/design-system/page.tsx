import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPortfolios } from "@/lib/content";
import { selectHomeProjects, selectIndexProjects, selectRailProjects } from "@/lib/project-presentation";
import { toSystemProject } from "@/lib/design-system";
import { DesignSystem } from "@/components/design-system/DesignSystem";
import { Header } from "@/components/Header";
import { ProductionHome } from "@/components/redesign/ProductionHome";
import { SiteFrame } from "@/components/redesign/SiteFrame";

export const metadata: Metadata = { title: "Mighty Blessing — Design System 0.2", robots: { index: false, follow: false } };
export default async function DesignSystemPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const projects = selectIndexProjects(getAllPortfolios());
  if ((await searchParams).view === "home") return <>
    <Header preview projects={selectRailProjects(projects)} />
    <SiteFrame preview projects={selectRailProjects(projects)}><ProductionHome /></SiteFrame>
    <aside className="home-review-return" aria-label="개발용 검토 도구"><Link href="/design-system" prefetch={false}>← 디자인 시스템 가이드</Link><span>로컬 시안 · 프로젝트 공개 상태와 사진 공개 범위는 검토 중</span></aside>
  </>;
  return <DesignSystem projects={projects.map(toSystemProject)} featured={selectHomeProjects(projects).map(toSystemProject)} />;
}
