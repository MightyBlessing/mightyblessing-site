/* eslint-disable @next/next/no-img-element -- Supplied review screenshots, never fabricated product UI. */
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getFeaturedProducts, getProductContent } from "@/lib/product-content";
import { getAllPortfolios } from "@/lib/content";
import { getProductProjects } from "@/lib/product-projects";
import { CompanyPage, ProjectContact } from "@/components/redesign/CompanyPage";

export const metadata = buildPageMetadata({ title: "행사 등록·QR 체크인과 관객 참여 도구", path: "/products", description: "포도나무로 행사 신청과 QR 체크인을 관리하고, LIVE TEXT로 관객 메시지·사진·질문을 화면에 띄웁니다. 예배곡 검색과 자막 준비를 돕는 두줄자막도 소개합니다." });

export default function ProductsPage() {
  const portfolios = getAllPortfolios();
  const featuredProducts = getFeaturedProducts();
  const twoline = getProductContent("twoline");

  return <CompanyPage label="OUR PRODUCTS" title={<>현장에서 쓰는 도구를<br />직접 만듭니다.</>} intro="행사 신청과 입장, 관객 참여, 자막 준비를 돕습니다. 각 제품은 별도로 이용하거나 행사 운영과 함께 도입할 수 있습니다.">
    <nav className="company-section-nav product-section-nav" aria-label="제품 선택">{featuredProducts.map(product => <Link key={product.id} href={`#${product.id}`}>{product.name}<span aria-hidden="true">↓</span></Link>)}<Link href="#twoline">두줄자막<span aria-hidden="true">↓</span></Link></nav>
    <div className="product-directory">{featuredProducts.map(product => {
      const projects = getProductProjects(product.id, portfolios);
      return <section className="product-entry product-entry--connected" id={product.id} key={product.id} aria-labelledby={`${product.id}-title`}>
        <div className="product-overview"><div><p className="section-label">{product.label}</p><h2 id={`${product.id}-title`}>{product.name}</h2><p className="product-summary">{product.description}</p><p>{product.detail}</p><a href={product.href} target="_blank" rel="noopener noreferrer" className="company-text-link">{product.name} 바로가기 <span aria-hidden="true">↗</span><span className="sr-only"> (새 탭)</span></a></div>{product.screen && <figure className="product-screen"><img src={product.screen.src} alt={product.screen.alt} width={product.screen.width} height={product.screen.height} loading="lazy" /><figcaption>{product.screen.caption}</figcaption></figure>}</div>
        <ol className="product-use-stages" aria-label={`${product.name} 사용 흐름`}>{product.stages.map((stage, index) => <li key={stage.title}><span className="product-stage-number">0{index + 1}</span><h3>{stage.title}</h3><p>{stage.detail}</p></li>)}</ol>
        {product.id === "grapetree" && projects.some(relation => relation.projectSlug === "campus-worship-2026") && <figure className="product-operation-field"><img src="/media/products/registration.webp" width={1440} height={960} alt="CAMPUS WORSHIP의 구역별 현장 등록 부스" loading="lazy" /><figcaption><strong>온라인 등록을 현장 입장으로</strong><p>CAMPUS WORSHIP에서는 포도나무로 사전 등록과 현장 QR 체크인을 운영했습니다.</p><Link href="/portfolio/campus-worship-2026">등록 현장 사례 보기 ↗</Link></figcaption></figure>}
        {projects.length > 0 && <div className="product-projects"><h3>사용한 프로젝트</h3><div>{projects.map(relation => <Link href={`/portfolio/${relation.projectSlug}`} key={relation.projectSlug}><div><span className="product-project-name">{relation.project.title}</span><p>{relation.usage}</p></div><span aria-hidden="true">↗</span></Link>)}</div></div>}
      </section>;
    })}</div>
    <section className="product-entry product-entry--text product-entry--twoline" id="twoline" aria-labelledby="twoline-title"><div><p className="section-label">TWOLINE LYRICS</p><h2 id="twoline-title">두줄자막</h2>{twoline.screen && <figure className="twoline-screen"><a href="https://twoline.kr/how-it-works" target="_blank" rel="noopener noreferrer" aria-label="두줄자막 실제 데모 열기 (새 탭)"><img src={twoline.screen.src} width={twoline.screen.width} height={twoline.screen.height} alt={twoline.screen.alt} loading="lazy" /></a><figcaption>{twoline.screen.caption}</figcaption></figure>}</div><div><p className="product-summary">{twoline.description}</p><p>{twoline.detail}</p><a href="https://twoline.kr/" target="_blank" rel="noopener noreferrer" className="company-text-link">두줄자막 바로가기 <span aria-hidden="true">↗</span><span className="sr-only"> (새 탭)</span></a></div></section>
    <ProjectContact prompt="행사에 맞는 제품 도입을 문의하세요." />
  </CompanyPage>;
}
