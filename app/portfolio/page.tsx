import Link from "next/link";
import type { PortfolioEntry, PortfolioFrontmatter } from "@/lib/content";
import { filterPortfolios, getFeaturedPortfolios, getPortfolioCategories } from "@/lib/content";
import { Tag } from "@/components/Tag";
import { PortfolioMediaTile } from "@/components/portfolio/PortfolioMediaTile";
import { portfolioHeroMedia, portfolioMoodFrames } from "@/lib/portfolio-media";

const ARCHIVE_PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[]; page?: string | string[] }>;
};

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function resolveParam(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value || "").trim();
}

function resolvePage(value?: string | string[]) {
  const parsed = Number(resolveParam(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function buildPortfolioHref({
  query,
  category,
  page = 1,
}: {
  query?: string;
  category?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set("q", query.trim());
  }

  if (category?.trim()) {
    params.set("category", category.trim());
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();
  return serialized ? `/portfolio?${serialized}#portfolio-archive` : "/portfolio#portfolio-archive";
}

function getPrimaryMedia(frontmatter: PortfolioFrontmatter) {
  return (
    frontmatter.heroMedia || {
      type: "image" as const,
      url: frontmatter.thumbnail || "/media/portfolio/ambient-stage.jpg",
      alt: frontmatter.title,
    }
  );
}

function FeaturedCard({
  item,
  large = false,
}: {
  item: PortfolioEntry;
  large?: boolean;
}) {
  const media = getPrimaryMedia(item.frontmatter);

  return (
    <Link href={`/portfolio/${item.slug}`} className="group block">
      <article
        className={`relative h-full overflow-hidden rounded-[2rem] bg-neutral-100 ${
          large ? "lg:min-h-[39rem]" : "lg:min-h-[18.7rem]"
        }`}
      >
        <PortfolioMediaTile
          item={media}
          className="relative h-full"
          mediaClassName={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${
            large
              ? "aspect-[4/5] sm:aspect-[16/10] lg:h-full lg:aspect-auto"
              : "aspect-[16/10] lg:h-full lg:aspect-auto"
          }`}
          captionClassName="hidden"
          overlay={
            <>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.04)_0%,rgba(10,10,12,0.38)_48%,rgba(10,10,12,0.84)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
                  {formatDate(item.frontmatter.date)}
                </p>
                <h3
                  className={`mt-3 max-w-[12ch] font-semibold tracking-[-0.05em] text-white ${
                    large ? "text-[1.7rem] leading-[1.02] sm:text-[2.45rem]" : "text-[1.28rem] leading-[1.08]"
                  }`}
                >
                  {item.frontmatter.title}
                </h3>
                {item.frontmatter.summary && (
                  <p className="mt-3 max-w-[420px] text-[0.92rem] leading-[1.75] text-white/78 break-keep">
                    {item.frontmatter.summary}
                  </p>
                )}
              </div>
            </>
          }
        />
      </article>
    </Link>
  );
}

function ArchiveCard({ item }: { item: PortfolioEntry }) {
  const media = getPrimaryMedia(item.frontmatter);

  return (
    <Link href={`/portfolio/${item.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-neutral-200 bg-white">
        <PortfolioMediaTile
          item={media}
          className="overflow-hidden"
          mediaClassName="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          captionClassName="hidden"
        />
        <div className="flex min-h-[13.5rem] flex-1 flex-col p-5">
          <div className="flex min-h-[3rem] flex-wrap content-start gap-2">
            {[...(item.frontmatter.roles || []), ...(item.frontmatter.categories || [])].slice(0, 3).map((tag) => (
              <Tag key={`${item.slug}-${tag}`} label={tag} />
            ))}
          </div>
          <div className="mt-4 flex flex-1 flex-col">
            <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              {formatDate(item.frontmatter.date)}
            </p>
            <h3
              className="mt-2 min-h-[3.1rem] text-[1.12rem] leading-[1.2] font-semibold tracking-[-0.035em] text-neutral-950"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.frontmatter.title}
            </h3>
            {item.frontmatter.summary && (
              <p
                className="mt-3 min-h-[5rem] text-[0.94rem] leading-[1.75] text-neutral-600 break-keep"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.frontmatter.summary}
              </p>
            )}
            {!item.frontmatter.summary && <div className="mt-3 min-h-[5rem]" aria-hidden="true" />}
            <div className="mt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition-colors group-hover:text-neutral-950">
                프로젝트 보기
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function PortfolioPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = resolveParam(params.q);
  const category = resolveParam(params.category);
  const requestedPage = resolvePage(params.page);
  const hasFilters = Boolean(query || category);

  const allItems = filterPortfolios();
  const filteredItems = filterPortfolios({ query, category });
  const categories = getPortfolioCategories();
  const featuredItems = !hasFilters ? getFeaturedPortfolios(3) : [];

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ARCHIVE_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * ARCHIVE_PAGE_SIZE;
  const pagedItems = filteredItems.slice(startIndex, startIndex + ARCHIVE_PAGE_SIZE);
  const visibleRangeStart = filteredItems.length === 0 ? 0 : startIndex + 1;
  const visibleRangeEnd = filteredItems.length === 0 ? 0 : startIndex + pagedItems.length;
  const archiveSummary = hasFilters
    ? `검색 결과 ${filteredItems.length}개`
    : `전체 프로젝트 ${allItems.length}개`;

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="container-wide grid gap-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-end lg:py-10">
          <PortfolioMediaTile
            item={portfolioHeroMedia}
            priority
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black"
            mediaClassName="aspect-[16/10] h-full w-full object-cover object-center opacity-58 blur-[2px]"
            captionClassName="hidden"
            overlay={
              <>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.08)_0%,rgba(8,8,10,0.36)_44%,rgba(8,8,10,0.88)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-white/58 uppercase">포트폴리오</p>
                  <h1 className="mt-3 max-w-[8ch] text-[2.2rem] leading-[0.96] font-semibold tracking-[-0.055em] text-white sm:text-[3.25rem]">
                    현장을
                    <br />
                    장면으로 남깁니다
                  </h1>
                </div>
              </>
            }
          />

          <div className="space-y-6 lg:pb-4">
            <p className="max-w-[420px] text-[0.98rem] leading-[1.85] text-white/78 break-keep">
              무대와 군중, 공간의 결이 먼저 읽히도록 정리한 포트폴리오입니다. 설명은 줄이고, 대표 장면과 필요한 정보만 남겼습니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-medium tracking-[0.16em] text-white/45 uppercase">대표 작업</p>
                <p className="mt-2 text-[1rem] font-medium text-white">{getFeaturedPortfolios(3).length}개</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-medium tracking-[0.16em] text-white/45 uppercase">전체 아카이브</p>
                <p className="mt-2 text-[1rem] font-medium text-white">{allItems.length}개</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-12 sm:py-14 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {portfolioMoodFrames.map((frame, index) => (
            <PortfolioMediaTile
              key={`${frame.url}-${index}`}
              item={frame}
              className="overflow-hidden rounded-[1.6rem] border border-neutral-200 bg-neutral-100"
              mediaClassName="aspect-[4/5] h-full w-full object-cover"
              captionClassName="mt-3 px-1 text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase"
            />
          ))}
        </div>
      </section>

      {!hasFilters && featuredItems.length > 0 && (
        <section className="container-wide pb-10 sm:pb-12">
          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">대표 작업</p>
            <h2 className="text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.05em] text-neutral-950 sm:text-[2.4rem]">
              먼저 보여주고 싶은 프로젝트
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            {featuredItems[0] && <FeaturedCard item={featuredItems[0]} large />}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              {featuredItems.slice(1).map((item) => (
                <FeaturedCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="portfolio-archive" className="container-wide pb-20 sm:pb-24">
        <div className="border-t border-neutral-200 pt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">전체 아카이브</p>
              <h2 className="mt-2 text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.05em] text-neutral-950 sm:text-[2.35rem]">
                제목과 태그로 찾는 프로젝트
              </h2>
            </div>
            <p className="text-[0.94rem] leading-[1.7] text-neutral-600">
              {archiveSummary}
              {filteredItems.length > 0 && ` · ${visibleRangeStart}-${visibleRangeEnd}`}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <form action="/portfolio#portfolio-archive" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {category && <input type="hidden" name="category" value={category} />}
              <label htmlFor="portfolio-search" className="sr-only">
                포트폴리오 검색
              </label>
              <input
                id="portfolio-search"
                name="q"
                defaultValue={query}
                placeholder="제목, 역할, 태그, 행사명 검색"
                autoComplete="off"
                className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-[0.95rem] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-[0.92rem] font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                검색
              </button>
              {hasFilters && (
                <Link
                  href="/portfolio#portfolio-archive"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-3 text-[0.92rem] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  초기화
                </Link>
              )}
            </form>
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
            <Link
              href={buildPortfolioHref({ query })}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-[0.92rem] font-medium transition-colors ${
                !category
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              전체
            </Link>
            {categories.map((item) => (
              <Link
                key={item}
                href={buildPortfolioHref({ query, category: item })}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[0.92rem] font-medium whitespace-nowrap transition-colors ${
                  category === item
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {pagedItems.length === 0 ? (
          <div className="mt-10 rounded-[1.8rem] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
            <p className="text-[0.98rem] leading-[1.85] text-neutral-600 break-keep">
              찾으시는 프로젝트가 아직 없습니다. 다른 제목이나 태그로 다시 검색해 보세요.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedItems.map((item) => (
              <ArchiveCard key={item.slug} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-200 pt-6">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Link
                key={page}
                href={buildPortfolioHref({ query, category, page })}
                className={`inline-flex size-10 items-center justify-center rounded-full text-[0.92rem] font-medium transition-colors ${
                  page === currentPage
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
