/* eslint-disable @next/next/no-img-element -- Existing project photos and supplied product screenshots. */
import Link from "next/link";
import { featuredProducts as products } from "@/lib/company-content";
import { getAllPortfolios } from "@/lib/content";
import { toSystemProject, type SystemProject } from "@/lib/design-system";
import { homeProjectTitle, imageSrcSet, selectHomeProjects } from "@/lib/project-presentation";
import { getProductProjects } from "@/lib/product-projects";
import { HomeFilmHero } from "./HomeFilmHero";
import { homeHeroCopy } from "@/lib/home-hero-copy";
import { getHomeHeroSlides } from "@/lib/home-hero-slides";
import { getHomeFilm } from "@/lib/home-film";
import "./production-home.css";
import "./home-film.css";
import "./home-update.css";
import "./home-editorial.css";
import "./home-tone.css";
import "./film-typography.css";

function ProjectImage({ project, lead = false }: { project: SystemProject; lead?: boolean }) {
  return <Link className="editorial-project-image" href={`/portfolio/${project.slug}`} aria-label={`${project.fullTitle} 프로젝트 보기`}><img src={project.image} srcSet={imageSrcSet(project.image)} sizes={lead ? "(min-width:1200px) calc(100vw - 448px), (min-width:1024px) calc(100vw - 348px), calc(100vw - 56px)" : "(min-width:1200px) calc((100vw - 480px) * .58), (min-width:1024px) calc((100vw - 380px) * .58), (min-width:768px) 55vw, calc(100vw - 56px)"} alt={project.alt} width="1920" height="1280" loading="lazy" /></Link>;
}

function ProjectCopy({ project }: { project: SystemProject }) {
  return <div className="editorial-project-copy">
    <div><p className="editorial-meta">{project.category}<span aria-hidden="true"> / </span>{project.date}</p><h3><Link href={`/portfolio/${project.slug}`}>{homeProjectTitle(project)}</Link></h3></div>
    <div className="editorial-project-description">{project.summary && <p>{project.summary}</p>}{project.roles.length > 0 && <p className="editorial-project-scope"><span>수행 범위</span>{project.roles.join(" · ")}</p>}<Link className="editorial-link" href={`/portfolio/${project.slug}`}>프로젝트 보기 <span aria-hidden="true">↗</span></Link></div>
  </div>;
}

/** Shared by / and the development home preview; publication rules stay in content.ts. */
export function ProductionHome() {
  const all = getAllPortfolios();
  const [lead, second] = selectHomeProjects(all).slice(0, 2).map(toSystemProject);
  const heroEntry = all.find(({ slug }) => slug === homeHeroCopy.photo.projectSlug);
  const heroProject = heroEntry ? toSystemProject(heroEntry) : lead;
  const reviewMedia = process.env.NODE_ENV === "development";
  const film = getHomeFilm(all.map(toSystemProject));
  const slides = getHomeHeroSlides(all.map(toSystemProject), heroProject);
  // A failed film must return to the same project as its encoded opening poster.
  const poster = slides.find(slide => slide.id === film?.cuts[0]?.mediaId) ?? slides.find(slide => slide.project.slug === film?.cuts[0]?.projectSlug) ?? slides[0];
  return <div className="production-home">
    <div className="production-home-body" id="home-content">
      <HomeFilmHero poster={poster} film={film} />
      <div className="production-home-sections home-editorial">
        <section className="home-section editorial-work" id="work" aria-labelledby="home-work-title">
          <div className="editorial-section-heading"><div><p className="editorial-eyebrow">SELECTED WORK</p><h2 id="home-work-title">공연과 행사를 만듭니다.<br />기획부터 현장까지.</h2></div><Link href="/portfolio" className="editorial-link">전체 프로젝트 <span aria-hidden="true">→</span></Link></div>
          {lead && <article className="editorial-project editorial-project--lead"><ProjectImage project={lead} lead /><ProjectCopy project={lead} /></article>}
          {second && <article className="editorial-project editorial-project--second"><ProjectImage project={second} /><ProjectCopy project={second} /></article>}
        </section>

        <section className="home-section editorial-process" id="capabilities" aria-labelledby="home-capabilities-title">
          <div className="editorial-section-heading"><div><p className="editorial-eyebrow">HOW WE WORK</p><h2 id="home-capabilities-title">준비한 장면이<br />현실이 되는 과정.</h2></div><Link href="/capabilities" className="editorial-link">하는 일 자세히 <span aria-hidden="true">→</span></Link></div>
          <div className="editorial-about" id="about" data-home-location="about"><p>마이티블레싱은 공연과 행사를 기획·제작·운영하는 프로덕션입니다. 예배와 집회, 문화 현장에서 쌓은 경험을 바탕으로 전문 파트너와 제작을 조율하고 관객을 맞이할 준비를 합니다.</p><Link href="/about" className="editorial-link">마이티블레싱 소개 <span aria-hidden="true">→</span></Link></div>
          <div className={`editorial-process-body${reviewMedia ? "" : " editorial-process-body--text"}`}>
            {reviewMedia && <figure className="editorial-process-image"><img src="/api/design-system-media/production.webp" alt="SOS 공연 현장의 제작 데스크와 운영 화면" width="1600" height="1067" loading="lazy" /><figcaption>SOS · 현장 제작 데스크</figcaption></figure>}
            <ol className="editorial-steps">
              <li><span aria-hidden="true">01</span><div><h3>기획을 세우고</h3><p>행사의 목적과 관객을 이해하고, 프로그램과 진행 흐름을 설계합니다.</p></div></li>
              <li><span aria-hidden="true">02</span><div><h3>제작을 조율하고</h3><p>필요한 제작물과 기술 구성을 정리하고, 함께할 파트너와 준비합니다.</p></div></li>
              <li><span aria-hidden="true">03</span><div><h3>현장에서 실행합니다</h3><p>리허설부터 공연 진행과 관객 입장까지, 준비한 흐름을 현장에서 이어갑니다.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="home-section editorial-products" id="products" aria-labelledby="home-products-title">
          <div className="editorial-section-heading"><div><p className="editorial-eyebrow">BUILT FOR THE FIELD</p><h2 id="home-products-title">현장에서 필요한 도구도<br />직접 만듭니다.</h2></div><Link href="/products" className="editorial-link">전체 제품 <span aria-hidden="true">→</span></Link></div>
          <div className="editorial-tools">{products.map((product) => {
            const application = getProductProjects(product.id, all)[0];
            return <article key={product.id} className="editorial-tool">
              <div className="editorial-tool-heading"><div>{product.label !== product.name && <p className="editorial-eyebrow">{product.label}</p>}<h3>{product.name}</h3></div><div><p className="editorial-tool-description">{product.description}</p><Link href={`/products#${product.id}`} className="editorial-link">제품 알아보기 <span aria-hidden="true">→</span></Link></div></div>
              <div className={`editorial-tool-body${reviewMedia ? "" : " editorial-tool-body--text"}`}>
                <div className="editorial-tool-field">
                  {reviewMedia && <figure><img src={`/api/design-system-media/${product.field}.webp`} alt={product.fieldAlt} width="1200" height="800" loading="lazy" /><figcaption>{product.fieldCaption}</figcaption></figure>}
                  {application && <Link className="editorial-tool-case" href={`/portfolio/${application.projectSlug}`}><span className="editorial-meta">{product.id === "live-text" ? "또 다른 적용 사례" : "이 현장의 적용 사례"}</span><strong>{homeProjectTitle({ title: application.project.shortTitle || application.project.title, year: application.project.date.slice(0, 4) })} <span aria-hidden="true">↗</span></strong><span>{application.usage}</span></Link>}
                </div>
                {reviewMedia && <figure className="editorial-tool-screen"><Link href={`/products#${product.id}`} aria-label={`${product.name} 화면과 기능 보기`}><img src={`/api/design-system-media/${product.ui}.webp`} alt={product.uiAlt} width={product.width} height={product.height} loading="lazy" /></Link><figcaption>{product.uiCaption}</figcaption></figure>}
              </div>
            </article>;
          })}</div>
        </section>

        <section className="home-section editorial-inquiry" id="contact" aria-labelledby="home-inquiry-title"><p className="editorial-eyebrow">START A PROJECT</p><h2 id="home-inquiry-title">다음 현장을<br />함께 만들어볼까요?</h2><p>만들고 싶은 행사와 필요한 도움을 들려주세요.</p><div className="editorial-inquiry-actions"><Link className="editorial-inquiry-button" href="/inquiry">프로젝트 문의 <span aria-hidden="true">↗</span></Link><a href="mailto:contact@mightyblessing.com">contact@mightyblessing.com</a></div></section>
      </div>
    </div>
  </div>;
}
