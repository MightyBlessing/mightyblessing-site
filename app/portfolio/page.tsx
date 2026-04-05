import type { Metadata } from "next";
import Link from "next/link";
import type { PortfolioEntry, PortfolioFrontmatter } from "@/lib/content";
import { filterPortfolios, getFeaturedPortfolios, getPortfolioCategories } from "@/lib/content";
import { Tag } from "@/components/Tag";
import { PortfolioMediaTile } from "@/components/portfolio/PortfolioMediaTile";
import { portfolioFallbackImageUrl, portfolioHeroMedia } from "@/lib/portfolio-media";
import { buildPageMetadata } from "@/lib/seo";

const ARCHIVE_PAGE_SIZE = 12;

export const metadata: Metadata = buildPageMetadata({
  title: "포트폴리오",
  description: "마이티블레싱이 기획하고 운영한 예배, 집회, 행사 프로젝트 포트폴리오를 확인해 보세요.",
  path: "/portfolio",
  keywords: ["예배 포트폴리오", "집회 포트폴리오", "행사 운영 사례", "프로젝트 사례"],
});

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
      url: frontmatter.thumbnail || portfolioFallbackImageUrl,
      alt: frontmatter.title,
    }
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16 21 21" />
    </svg>
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
        className={`relative overflow-hidden rounded-[2rem] bg-neutral-100 ${
          large
            ? "aspect-[16/10] md:h-[22rem] md:aspect-auto xl:h-[39rem]"
            : "aspect-[16/10] md:h-[22rem] md:aspect-auto xl:h-[18.7rem]"
        }`}
      >
        <PortfolioMediaTile
          item={media}
          className="relative h-full"
          mediaClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          captionClassName="hidden"
          overlay={
            <>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.04)_0%,rgba(10,10,12,0.38)_48%,rgba(10,10,12,0.84)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
                  {formatDate(item.frontmatter.date)}
                </p>
                <h3
                  className={`mt-3 font-semibold tracking-[-0.05em] text-white break-keep text-balance ${
                    large
                      ? "max-w-[10ch] text-[1.5rem] leading-[1.04] sm:text-[1.85rem] xl:max-w-[8.6ch] xl:text-[2.45rem]"
                      : "max-w-[16ch] text-[1.18rem] leading-[1.16] sm:text-[1.3rem] xl:text-[1.42rem]"
                  }`}
                >
                  {item.frontmatter.title}
                </h3>
                {item.frontmatter.summary && (
                  <p
                    className="mt-3 max-w-[420px] text-[0.88rem] leading-[1.7] text-white/78 break-keep sm:text-[0.92rem]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: large ? 3 : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
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
          mediaClassName="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] md:aspect-[3/2] lg:aspect-[4/5]"
          captionClassName="hidden"
        />
        <div className="flex min-h-[11.5rem] flex-1 flex-col p-4 sm:min-h-[12.5rem] sm:p-5 lg:min-h-[13.5rem]">
          <div className="flex min-h-[2.4rem] flex-wrap content-start gap-2 sm:min-h-[3rem]">
            {[...(item.frontmatter.roles || []), ...(item.frontmatter.categories || [])].slice(0, 3).map((tag) => (
              <Tag key={`${item.slug}-${tag}`} label={tag} />
            ))}
          </div>
          <div className="mt-4 flex flex-1 flex-col">
            <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              {formatDate(item.frontmatter.date)}
            </p>
            <h3
              className="mt-2 min-h-[2.7rem] text-[1.06rem] leading-[1.2] font-semibold tracking-[-0.035em] text-neutral-950 sm:min-h-[3.1rem] sm:text-[1.12rem]"
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
                className="mt-3 min-h-[4.2rem] text-[0.92rem] leading-[1.72] text-neutral-600 break-keep sm:min-h-[5rem] sm:text-[0.94rem]"
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
  const heroChips = categories.slice(0, 4);
  const heroPreviewImage =
    featuredItems[0]?.frontmatter.heroMedia?.poster ||
    featuredItems[0]?.frontmatter.thumbnail ||
    portfolioFallbackImageUrl;

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
      <section className="border-b border-neutral-900 bg-neutral-950 text-white">
        <div className="container-wide py-8 sm:py-10 lg:py-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col justify-between gap-8 md:min-h-[24rem] md:py-2 lg:min-h-[34rem]">
              <div>
                <h1 className="text-[2.45rem] leading-[0.94] font-semibold tracking-[-0.065em] text-white sm:text-[3.4rem] md:text-[3.7rem] lg:text-[5.35rem]">
                  현장을
                  <br />
                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: "1px rgba(188, 201, 255, 0.9)" }}
                  >
                    장면으로
                  </span>
                  <br />
                  남깁니다
                </h1>
                <p className="mt-6 max-w-[34rem] text-[1rem] leading-[1.8] text-white/72 break-keep sm:text-[1.04rem]">
                  예배와 집회, 컨퍼런스의 순간을 기획과 운영, 기술의 언어로 기록합니다. 먼저 남겨야 할 장면과
                  흐름이 보이도록 정리했습니다.
                </p>
              </div>

              {heroChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {heroChips.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-[0.82rem] font-medium text-white/76"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative md:pl-4 lg:pl-10">
              <div className="absolute inset-y-8 right-0 hidden w-[74%] rounded-[2.3rem] bg-[linear-gradient(180deg,rgba(125,146,255,0.18)_0%,rgba(125,146,255,0.02)_100%)] blur-2xl lg:block" />
              <PortfolioMediaTile
                item={portfolioHeroMedia}
                priority
                className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_32px_90px_rgba(0,0,0,0.35)]"
                mediaClassName="aspect-[16/10] w-full object-cover object-center opacity-72 md:aspect-[4/3] lg:aspect-[16/11]"
                captionClassName="hidden"
                overlay={
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.06)_0%,rgba(8,8,10,0.22)_42%,rgba(8,8,10,0.64)_100%)]" />
                    <div className="absolute inset-x-0 top-0 p-5 sm:p-6">
                      <p className="inline-flex items-center rounded-full border border-white/14 bg-black/28 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white/76 uppercase backdrop-blur-sm">
                        Mighty Blessing Archive
                      </p>
                    </div>
                  </>
                }
              />

              <div className="relative z-20 -mt-14 hidden max-w-[13rem] overflow-hidden rounded-[1.4rem] border border-white/10 bg-neutral-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:-ml-8 lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPreviewImage}
                  alt="대표 장면 미리보기"
                  className="aspect-[4/5] w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-neutral-900 bg-neutral-950 py-5 text-white">
        <div className="whitespace-nowrap text-[2.65rem] leading-none font-semibold tracking-[-0.05em] text-transparent opacity-92 sm:text-[4.3rem] lg:text-[5.8rem]">
          <div
            className="min-w-max"
            aria-hidden="true"
            style={{ WebkitTextStroke: "1px rgba(188, 201, 255, 0.38)" }}
          >
            MIGHTY BLESSING / PORTFOLIO / MIGHTY BLESSING / PORTFOLIO
          </div>
        </div>
      </section>

      {!hasFilters && featuredItems.length > 0 && (
        <section className="container-wide py-10 sm:py-12">
          <div className="border-t border-neutral-200 pt-10">
            <h2 className="text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.05em] text-neutral-950 sm:text-[2.4rem]">
              대표 프로젝트
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            {featuredItems.map((item, index) => (
              <div key={item.slug} className={index === 0 ? "xl:row-span-2" : ""}>
                <FeaturedCard item={item} large={index === 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="portfolio-archive" className="container-wide pb-20 sm:pb-24">
        <div className="border-t border-neutral-200 pt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.05em] text-neutral-950 sm:text-[2.35rem]">
                프로젝트 찾기
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
                aria-label="검색"
                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-3 text-white transition-colors hover:bg-neutral-800"
              >
                <SearchIcon className="size-[1.05rem]" />
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
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
