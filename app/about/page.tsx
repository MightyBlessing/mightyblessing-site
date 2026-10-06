/* eslint-disable @next/next/no-img-element -- Existing local review derivative. */
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { workingPrinciples } from "@/lib/company-content";
import { getAllPortfolios } from "@/lib/content";
import { CompanyPage, ProjectContact } from "@/components/redesign/CompanyPage";

export const metadata = buildPageMetadata({ title: "공연·행사 프로덕션 소개", path: "/about", description: "마이티블레싱은 예배와 문화 현장에서 쌓은 경험으로 공연·행사를 기획·제작·운영합니다. 연출·PD·영상 제작팀과 전문 파트너가 함께 일하는 방식을 소개합니다." });

export default function AboutPage() {
  const workingProject = getAllPortfolios().find(project => project.slug === "sos-2024");

  return <CompanyPage label="ABOUT MIGHTY BLESSING" title={<>기획하는 사람이<br />현장까지 함께합니다.</>} intro="마이티블레싱은 공연과 행사를 기획하고 제작·운영하는 팀입니다. 프로그램과 무대를 구상하는 일부터 리허설과 현장 진행까지 함께합니다.">
    {workingProject && <figure className="company-field company-field--working"><img src="/media/products/production.webp" width={1440} height={960} alt={`${workingProject.frontmatter.title}의 화면과 현장 진행을 운영하는 제작석`} loading="eager" /><figcaption><span>{workingProject.frontmatter.title} · 영상·자막 송출과 현장 연출</span><Link href={`/portfolio/${workingProject.slug}`}>프로젝트 보기 <span aria-hidden="true">↗</span></Link></figcaption></figure>}
    <section className="company-note company-background"><div><p className="section-label">OUR BACKGROUND</p><h2>사람과 메시지가<br />만나는 자리에서</h2></div><div><p>우리의 출발점은 예배와 문화 현장입니다. 사람들이 함께 노래하고 이야기를 나누는 자리에서, 무대와 관객을 함께 살피며 경험을 쌓았습니다.</p><p>그 경험으로 공연과 행사를 만들고, 현장에서 필요한 디지털 도구를 개발합니다.</p><Link href="/portfolio" className="company-text-link">프로젝트 살펴보기 <span aria-hidden="true">→</span></Link></div></section>
    <section className="company-note"><div><p className="section-label">PRODUCTION PARTNERS</p><h2>현장에 맞는<br />팀을 구성합니다.</h2></div><div><p>연출·PD·영상 제작팀을 중심으로, 행사에 필요한 전문 파트너와 함께합니다.</p><p>음향·조명·LED·무대 등 각 분야의 담당자와 제작 일정, 리허설, 현장 진행을 조율합니다.</p><Link href="/capabilities" className="company-text-link">하는 일 살펴보기 <span aria-hidden="true">→</span></Link></div></section>
    <section className="company-principles" aria-labelledby="company-principles-title"><div className="company-section-heading"><div><p className="section-label">HOW WE WORK</p><h2 id="company-principles-title">함께 일하는 기준</h2></div></div><ol>{workingPrinciples.map((principle, index) => <li key={principle.title}><span>0{index + 1}</span><h3>{principle.title}</h3><p>{principle.detail}</p></li>)}</ol></section>
    <ProjectContact />
  </CompanyPage>;
}
