import Link from "next/link";
import { getAllPortfolios, searchPortfolios } from "@/lib/content";
import { Tag } from "@/components/Tag";
import { PortfolioMediaTile } from "@/components/portfolio/PortfolioMediaTile";
import { portfolioHeroMedia, portfolioMoodFrames } from "@/lib/portfolio-media";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function resolveQuery(value?: string | string[]) {
  return (Array.isArray(value) ? value[0] : value || "").trim();
}

const moodLayouts = [
  {
    wrapper: "sm:col-span-2 lg:col-span-7 lg:-translate-y-4",
    media: "aspect-[16/10] h-full w-full object-cover",
  },
  {
    wrapper: "lg:col-span-5 lg:translate-y-10",
    media: "aspect-[4/5] h-full w-full object-cover",
  },
  {
    wrapper: "lg:col-span-5",
    media: "aspect-[4/3] h-full w-full object-cover",
  },
  {
    wrapper: "sm:col-span-2 lg:col-span-7 lg:-translate-y-8",
    media: "aspect-[16/10] h-full w-full object-cover",
  },
] as const;

export default async function PortfolioPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = resolveQuery(params.q);
  const hasQuery = query.length > 0;
  const items = hasQuery ? searchPortfolios(query) : getAllPortfolios();
  const resultLabel = hasQuery
    ? `"${query}"에 대한 결과 ${items.length}개`
    : `전체 프로젝트 ${items.length}개를 보고 있습니다.`;

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="container-wide py-6 sm:py-8 lg:py-10">
          <p className="mb-4 text-[11px] font-medium tracking-[0.22em] text-white/48 uppercase">Portfolio</p>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
            <PortfolioMediaTile
              item={portfolioHeroMedia}
              priority
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_30px_80px_-40px_rgba(0,0,0,0.75)]"
              mediaClassName="aspect-[16/11] h-full w-full object-cover object-center opacity-55 blur-[3px] saturate-[0.85] scale-[1.04]"
              captionClassName="hidden"
              overlay={
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.08)_0%,rgba(8,8,10,0.38)_42%,rgba(8,8,10,0.86)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                    <p className="text-[10px] font-medium tracking-[0.22em] text-white/45 uppercase">Media-led draft</p>
                    <h1 className="mt-3 max-w-[8ch] text-[2.15rem] leading-[0.96] font-semibold tracking-[-0.05em] text-white sm:text-[3.15rem]">
                      예배 현장을 장면으로 남깁니다
                    </h1>
                    <p className="mt-4 max-w-[420px] text-[0.88rem] leading-[1.8] text-white/70 break-keep">
                      첫 화면은 영상으로 분위기를 열고, 이후에는 무대와 군중, 공간의 결을 이미지로 이어가는 1차 초안입니다.
                    </p>
                  </div>
                </>
              }
            />

            <div className="space-y-5 lg:pb-4">
              <p className="max-w-[420px] text-[0.88rem] leading-[1.9] text-white/68 break-keep">
                레퍼런스처럼 텍스트보다 화면의 밀도와 호흡이 먼저 읽히도록 구성했습니다. 설명은 줄이고, 이미지와 여백으로
                인상을 남기는 방향입니다.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                  <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Opening</p>
                  <p className="mt-2 text-[0.88rem] leading-[1.6] text-white/78">영상 한 컷으로 공기감부터 전달</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                  <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Archive</p>
                  <p className="mt-2 text-[0.88rem] leading-[1.6] text-white/78">케이스별 이미지 시퀀스로 기억 정리</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-14 sm:py-16 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {portfolioMoodFrames.map((frame, index) => (
            <PortfolioMediaTile
              key={`${frame.url}-${index}`}
              item={frame}
              className={`overflow-hidden rounded-[1.8rem] bg-neutral-100 transition-transform duration-500 ${moodLayouts[index]?.wrapper ?? ""}`}
              mediaClassName={moodLayouts[index]?.media ?? "aspect-[4/5] h-full w-full object-cover"}
            />
          ))}
        </div>
      </section>

      <section className="container-wide pb-20 sm:pb-24">
        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-neutral-400 uppercase">Selected Works</p>
            <h2 className="mt-2 text-[1.5rem] leading-[1.08] font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[2.1rem]">
              영상 중심 포트폴리오
            </h2>
          </div>
          <p className="max-w-[470px] text-[0.88rem] leading-[1.9] text-neutral-500 break-keep">
            각 케이스는 대표 장면과 두세 장의 시퀀스로만 먼저 보여줍니다. 자세한 설명은 뒤로 빼고, 시선이 먼저 머무는 구성으로
            정리했습니다.
          </p>
        </div>

        <section className="mt-8 rounded-[1.6rem] border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <form action="/portfolio" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label htmlFor="portfolio-search" className="sr-only">
                포트폴리오 검색
              </label>
              <input
                id="portfolio-search"
                name="q"
                defaultValue={query}
                placeholder="제목, 태그, 행사명으로 검색"
                autoComplete="off"
                className="w-full rounded-full border border-neutral-200 bg-white px-4 py-3 text-[0.9rem] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-[0.82rem] font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              검색
            </button>
            {hasQuery && (
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-[0.82rem] font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                초기화
              </Link>
            )}
          </form>
          <p className="mt-3 text-[0.82rem] leading-[1.7] text-neutral-500 break-keep">
            {hasQuery
              ? resultLabel
              : "제목, 역할, 카테고리, 보조 검색어로 원하는 work를 빠르게 찾을 수 있습니다."}
          </p>
        </section>

        <div className="mt-10 space-y-16 sm:space-y-20">
          {hasQuery && items.length === 0 && (
            <div className="rounded-[1.8rem] border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
              <p className="text-[0.95rem] leading-[1.8] text-neutral-500 break-keep">
                "{query}"와 일치하는 포트폴리오가 아직 없습니다. 제목, 태그, 행사명 변형으로 다시 검색해보세요.
              </p>
            </div>
          )}

          {items.map(({ slug, frontmatter }, index) => {
            const gallery = frontmatter.gallery || [];
            const previewItems = gallery.slice(0, 2);
            const featured = frontmatter.heroMedia || {
              type: "image" as const,
              url: frontmatter.thumbnail || "/media/portfolio/ambient-stage.jpg",
              alt: frontmatter.title,
            };
            const summary = frontmatter.summary?.trim();

            return (
              <Link key={slug} href={`/portfolio/${slug}`} className="group block">
                <article className="grid gap-6 lg:grid-cols-12 lg:items-end">
                  <div className={index % 2 === 0 ? "lg:col-span-7" : "lg:order-2 lg:col-span-7"}>
                    <PortfolioMediaTile
                      item={featured}
                      className="overflow-hidden rounded-[2rem] bg-neutral-100"
                      mediaClassName="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:aspect-[16/10]"
                      captionClassName="hidden"
                    />
                  </div>

                  <div className={index % 2 === 0 ? "lg:col-span-5 lg:pl-4" : "lg:col-span-5 lg:pr-4"}>
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        {[...(frontmatter.roles || []), ...(frontmatter.categories || [])].slice(0, 4).map((tag) => (
                          <Tag key={`${slug}-${tag}`} label={tag} />
                        ))}
                      </div>

                      <div>
                        <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                          {formatDate(frontmatter.date)}
                        </p>
                        <h3 className="mt-3 max-w-[12ch] text-[1.58rem] leading-[1.02] font-semibold tracking-[-0.05em] text-neutral-950 transition-colors group-hover:text-neutral-700 sm:text-[2.2rem]">
                          {frontmatter.title}
                        </h3>
                        {summary && (
                          <p className="mt-4 max-w-[420px] text-[0.88rem] leading-[1.85] text-neutral-500 break-keep">
                            {summary}
                          </p>
                        )}
                      </div>

                      {previewItems.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {previewItems.map((media, previewIndex) => (
                            <PortfolioMediaTile
                              key={`${slug}-preview-${previewIndex}`}
                              item={media}
                              className="overflow-hidden rounded-[1.3rem] bg-neutral-100"
                              mediaClassName="aspect-[4/5] h-full w-full object-cover"
                              captionClassName="hidden"
                            />
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] font-medium tracking-[0.22em] text-neutral-400 uppercase transition-colors group-hover:text-neutral-900">
                        View case
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
