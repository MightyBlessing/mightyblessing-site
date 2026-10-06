import type { Metadata } from "next";
import Link from "next/link";
import { getAllPortfolios } from "@/lib/content";
import { groupProjectsByYear, homeProjectTitle, projectArchiveDate, selectIndexProjects, toProjectLink } from "@/lib/project-presentation";
import { buildPageMetadata } from "@/lib/seo";
import { searchProjects } from "@/lib/project-search";

type Props = { searchParams: Promise<{ q?: string | string[]; category?: string | string[]; year?: string | string[]; page?: string | string[] }> };
const param = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value || "").trim();

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return buildPageMetadata({
    title: "공연·행사 제작과 운영 사례",
    description: "공연·투어, 예배·집회에서 마이티블레싱이 맡은 기획·연출과 현장 운영을 살펴보세요. 프로젝트별 수행 범위와 제작 과정을 소개합니다.",
    path: "/portfolio",
    keywords: ["공연 프로젝트", "행사 운영 사례", "프로젝트 포트폴리오"],
    // Internal search/filter variants should not become duplicate search results.
    noIndex: Boolean(param(params.q) || param(params.category) || param(params.year) || param(params.page)),
  });
}

export default async function Portfolio({ searchParams }: Props) {
  const params = await searchParams;
  const query = param(params.q);
  const category = param(params.category);
  const year = param(params.year);
  const all = getAllPortfolios();
  const index = selectIndexProjects(all);
  const categories = [...new Set(index.flatMap(({ frontmatter }) => frontmatter.categories))].sort();
  const years = [...new Set(index.map(entry => toProjectLink(entry).year))].sort().reverse();
  const matches = searchProjects(index, { query, category, year });
  const filtered = Boolean(query || category || year);
  const groups = groupProjectsByYear(matches.map((project) => ({ ...project, year: toProjectLink(project).year })));

  return <div className="site-archive">
    <div className="archive-content">
      <header className="archive-heading"><span className="section-label">PROJECT ARCHIVE</span><h1>함께한 프로젝트<span>{index.length}</span></h1><p>공연과 행사, 그 현장에서 마이티블레싱이 맡은 일을 소개합니다.</p></header>
      <section id="portfolio-archive" aria-label="전체 프로젝트 목록">
        <form key={JSON.stringify([query, category, year])} action="/portfolio#portfolio-archive" className="archive-search" role="search">
          <label className="archive-query"><span className="sr-only">프로젝트 검색</span><input name="q" type="search" defaultValue={query} placeholder="프로젝트명, 장소, 업무 검색" /></label>
          <label><span className="sr-only">행사 유형</span><select name="category" defaultValue={category}><option value="">전체 유형</option>{category && !categories.includes(category) && <option value={category}>{category}</option>}{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">행사 연도</span><select name="year" defaultValue={year}><option value="">전체 연도</option>{year && !years.includes(year) && <option value={year}>{year}</option>}{years.map(item => <option key={item} value={item}>{item}년</option>)}</select></label>
          <button type="submit">검색 ↗</button>
        </form>
        <div className="archive-result"><p>{filtered ? `검색 결과 ${matches.length}건` : `전체 ${index.length}개 프로젝트`}</p>{filtered && <Link href="/portfolio#portfolio-archive">검색 초기화 ×</Link>}</div>
        {groups.map((group) => <section className="archive-year" key={group.year} aria-labelledby={`year-${group.year}`}><h2 id={`year-${group.year}`}>{group.year}<span>{group.projects.length}</span></h2><div>{group.projects.map(({ slug, frontmatter: project }) => <Link className="archive-row" href={`/portfolio/${slug}`} key={slug}>
          <span className="archive-date">{projectArchiveDate(project)}</span><div><h3>{homeProjectTitle(toProjectLink({ slug, frontmatter: project }))}</h3>{project.location && <p>{project.location}</p>}</div><span className="archive-scope">{project.roles.slice(0, 2).join(" · ")}</span><span className="archive-arrow" aria-hidden="true">↗</span>
        </Link>)}</div></section>)}
        {!matches.length && <p className="archive-empty">검색 결과가 없습니다. 다른 프로젝트명이나 업무로 검색해 주세요.</p>}
      </section>
      <div className="archive-contact"><p>다음 현장을 함께 준비해 볼까요?</p><Link href="/inquiry" className="text-link">프로젝트 문의 ↗</Link></div>
    </div>
  </div>;
}
