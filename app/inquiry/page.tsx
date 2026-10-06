import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { CompanyPage } from "@/components/redesign/CompanyPage";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPortfolios } from "@/lib/content";

export const metadata: Metadata = buildPageMetadata({ title: "프로젝트 문의", description: "공연과 행사의 기획·제작·운영이 필요하다면 마이티블레싱에 프로젝트 문의를 남겨 주세요.", path: "/inquiry", keywords: ["프로젝트 문의", "행사 기획", "현장 운영"] });

export default async function InquiryPage({ searchParams }: { searchParams: Promise<{ project?: string | string[] }> }) {
  const params = await searchParams;
  const slug = Array.isArray(params.project) ? params.project[0] : params.project;
  const project = slug ? getAllPortfolios().find(entry => entry.slug === slug) : undefined;
  const reference = project ? { title: project.frontmatter.title, path: `/portfolio/${project.slug}` } : undefined;
  return <CompanyPage label="START A PROJECT" title={<>어떤 현장을<br />준비하고 있나요?</>} intro="만들고 싶은 행사와 필요한 도움을 알려주세요. 일정이나 장소가 정해지지 않아도 괜찮습니다.">
    <div className="inquiry-layout"><div><InquiryForm key={project?.slug || "general"} reference={reference} /><p className="inquiry-privacy">입력한 이메일과 문의 내용은 상담과 회신에 사용합니다.<br /><Link href="/privacy">개인정보처리방침</Link></p></div><aside className="inquiry-aside"><h2>이메일로 문의하기</h2><a href="mailto:contact@mightyblessing.com">contact@mightyblessing.com ↗</a><p>자료나 제안서가 있다면 이메일로 함께 보내주세요.</p><Link href="/capabilities" className="company-text-link">하는 일 살펴보기 →</Link></aside></div>
  </CompanyPage>;
}
