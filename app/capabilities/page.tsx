/* eslint-disable @next/next/no-img-element -- Existing project media and responsive review derivatives. */
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { capabilities, capabilityQuestions } from "@/lib/company-content";
import { JsonLd } from "@/components/JsonLd";
import { buildCapabilitiesJsonLd } from "@/lib/structured-data";
import { getAllPortfolios } from "@/lib/content";
import { imageSrcSet } from "@/lib/project-presentation";
import { getProjectProducts } from "@/lib/product-projects";
import { CompanyPage, ProjectContact } from "@/components/redesign/CompanyPage";

export const metadata = buildPageMetadata({ title: "공연·행사 기획과 현장 운영", path: "/capabilities", description: "공연·행사와 예배·집회의 프로그램 기획, 무대 연출, 제작 관리, 리허설과 관객 운영을 함께합니다. 전체 제작부터 필요한 업무의 협업까지 수행 범위를 살펴보세요." });

export default function CapabilitiesPage() {
  const projects = new Map(getAllPortfolios().map(project => [project.slug, project.frontmatter]));

  return <CompanyPage label="WHAT WE DO" title={<>공연·행사 기획부터<br />현장 운영까지.</>} intro="마이티블레싱은 프로그램과 무대 연출, 제작 준비, 현장 운영을 맡습니다. 공연과 문화 행사, 예배·집회를 함께 준비하거나 필요한 업무부터 협업할 수 있습니다.">
    <JsonLd data={buildCapabilitiesJsonLd()} />
    <nav className="company-section-nav" aria-label="수행 영역">
      {capabilities.map((item, index) => <Link href={`#${item.id}`} key={item.id}><span>0{index + 1}</span>{item.title}<span aria-hidden="true">↓</span></Link>)}
    </nav>
    <div className="capability-chapters">{capabilities.map((item, index) => {
      const cases = item.caseSlugs.flatMap(slug => {
        const project = projects.get(slug);
        return project ? [{ slug, project }] : [];
      });

      return <section className="capability-chapter" id={item.id} key={item.id} aria-labelledby={`${item.id}-title`}>
        <header className="capability-chapter-heading"><span className="capability-number">0{index + 1}</span><h2 id={`${item.id}-title`}>{item.title}</h2></header>
        <div className="capability-chapter-body">
          <h3 className="capability-situation">{item.situation}</h3>
          <p className="capability-scope">{item.scope}</p>
          <div className="capability-deliverables"><h4>함께 준비하는 일</h4><ul>{item.deliverables.map(deliverable => <li key={deliverable}>{deliverable}</li>)}</ul></div>
          {cases.length > 0 && <div className="capability-cases"><h4>함께한 프로젝트</h4>{cases.map(({ slug, project }) => {
            const media = project.heroMedia?.poster || project.heroMedia?.url || project.thumbnail;
            const scope = item.id === "digital"
              ? getProjectProducts(slug).map(relation => `${relation.product.name} · ${relation.usage}`).join(" / ")
              : project.roles.filter(role => item.caseRoles.includes(role)).join(" · ");
            return <Link className="capability-case" href={`/portfolio/${slug}`} key={slug}>
              {media && <img src={media} srcSet={imageSrcSet(media)} sizes="96px" width={96} height={72} alt="" loading="lazy" />}
              <div><span className="capability-case-title">{project.title}</span><p>{scope || project.roles.join(" · ")}</p></div>
              <span className="capability-case-arrow" aria-hidden="true">↗</span>
            </Link>;
          })}</div>}
          {item.id === "digital" && <Link href="/products" className="company-text-link">포도나무와 LIVE TEXT 살펴보기 <span aria-hidden="true">↗</span></Link>}
        </div>
      </section>;
    })}</div>
    <section className="company-note"><h2>어디서부터 시작할지<br />고민이라면</h2><div><p>만들고 싶은 행사와 지금까지 준비한 내용을 들려주세요. 필요한 업무와 진행 순서를 함께 정리하겠습니다.</p><Link href="/about" className="company-text-link">함께 일하는 방식 보기 <span aria-hidden="true">→</span></Link></div></section>
    <section className="company-note company-faq" aria-labelledby="capability-questions-title" id="questions">
      <h2 id="capability-questions-title">행사를 준비할 때<br />궁금한 점</h2>
      <div>{capabilityQuestions.map(item => <section key={item.question}>
        <h3>{item.question}</h3><p>{item.answer}</p>
        <Link href={item.href} className="company-text-link">{item.linkLabel} <span aria-hidden="true">→</span></Link>
      </section>)}</div>
    </section>
    <ProjectContact />
  </CompanyPage>;
}
