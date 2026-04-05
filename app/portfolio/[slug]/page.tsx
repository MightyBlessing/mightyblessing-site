import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolioBySlug, getPortfolioSlugs, getRelatedPortfolios } from "@/lib/content";
import { CTAButton } from "@/components/CTAButton";
import { Tag } from "@/components/Tag";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PortfolioMediaTile } from "@/components/portfolio/PortfolioMediaTile";
import { HOME_HERO_POSTER_STORAGE_KEY, resolveContentMediaUrl } from "@/lib/content-media";
import { portfolioFallbackImageUrl } from "@/lib/portfolio-media";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

export async function generateStaticParams() {
  const slugs = getPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) {
    return buildPageMetadata({
      title: "포트폴리오",
      description: "마이티블레싱 프로젝트 포트폴리오입니다.",
      path: "/portfolio",
    });
  }

  const image =
    item.frontmatter.heroMedia?.poster ||
    item.frontmatter.thumbnail ||
    (item.frontmatter.gallery?.[0]?.type === "image" ? item.frontmatter.gallery[0].url : item.frontmatter.gallery?.[0]?.poster) ||
    resolveContentMediaUrl({
      storageKey: HOME_HERO_POSTER_STORAGE_KEY,
      fallbackUrl: "/media/portfolio/home-hero-worship-poster.jpg",
    }) ||
    "/media/portfolio/home-hero-worship-poster.jpg";

  return buildPageMetadata({
    title: item.frontmatter.title,
    description: item.frontmatter.summary,
    path: `/portfolio/${slug}`,
    images: [image],
    keywords: [...(item.frontmatter.roles || []), ...(item.frontmatter.categories || []), ...(item.frontmatter.search_terms || [])],
    type: "article",
  });
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) notFound();

  const { frontmatter, content } = item;
  const heroMedia = frontmatter.heroMedia || {
    type: "image" as const,
    url: frontmatter.thumbnail || portfolioFallbackImageUrl,
    alt: frontmatter.title,
  };
  const gallery = frontmatter.gallery || [];
  const roleScope = frontmatter.our_role || frontmatter.scope;
  const narrativeBlocks = [
    frontmatter.goals ? { label: "목표", value: frontmatter.goals } : null,
    roleScope ? { label: "역할", value: roleScope } : null,
    frontmatter.process ? { label: "운영 방식", value: frontmatter.process } : null,
  ].filter((block): block is { label: string; value: string } => block !== null);
  const factItems = [
    { label: "진행 시기", value: formatDate(frontmatter.date) },
    frontmatter.location ? { label: "장소", value: frontmatter.location } : null,
    frontmatter.partner ? { label: "협업 파트너", value: frontmatter.partner } : null,
    frontmatter.categories?.length ? { label: "프로젝트 형태", value: frontmatter.categories.join(" / ") } : null,
    frontmatter.roles?.length ? { label: "주요 역할", value: frontmatter.roles.join(" / ") } : null,
    ...(frontmatter.metrics || []).map((metric) => ({ label: metric.label, value: metric.value })),
  ].filter((item): item is { label: string; value: string } => Boolean(item?.value));
  const relatedItems = getRelatedPortfolios(slug, 2);
  const galleryLayouts = [
    "xl:col-span-8",
    "xl:col-span-4",
    "xl:col-span-4",
    "xl:col-span-8",
  ];
  const galleryMediaLayouts = [
    "aspect-[16/10] h-full w-full object-cover",
    "aspect-[4/3] h-full w-full object-cover xl:aspect-[4/5]",
    "aspect-[4/3] h-full w-full object-cover xl:aspect-[4/5]",
    "aspect-[16/10] h-full w-full object-cover",
  ];

  return (
    <>
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-wide py-6 sm:py-8 lg:py-10">
          <Link
            href="/portfolio#portfolio-archive"
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-neutral-950"
          >
            포트폴리오
          </Link>

          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] xl:items-end">
            <PortfolioMediaTile
              item={heroMedia}
              priority
              className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100"
              mediaClassName="aspect-[16/10] min-h-[240px] w-full object-cover sm:min-h-[320px] md:min-h-[420px] xl:aspect-[16/11] xl:min-h-[460px]"
              captionClassName="hidden"
            />

            <div className="space-y-6 xl:pb-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
                  {formatDate(frontmatter.date)}
                </p>
                <h1 className="mt-3 max-w-[12ch] text-[1.7rem] leading-[1.05] font-semibold tracking-[-0.055em] text-neutral-950 sm:text-[2.35rem] xl:max-w-[10ch] xl:text-[3rem]">
                  {frontmatter.title}
                </h1>
                {frontmatter.summary && (
                  <p className="mt-4 max-w-[440px] text-[1rem] leading-[1.85] text-neutral-600 break-keep">
                    {frontmatter.summary}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(frontmatter.roles || []).map((item) => (
                  <Tag key={`${slug}-${item}`} label={item} />
                ))}
                {(frontmatter.categories || []).map((item) => (
                  <Tag key={`${slug}-${item}`} label={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {factItems.length > 0 && (
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="container-wide py-6">
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {factItems.map((item) => (
                <div key={`${item.label}-${item.value}`} className="rounded-[1.3rem] border border-neutral-200 bg-white p-4">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">{item.label}</dt>
                  <dd className="mt-2 text-[0.96rem] leading-[1.7] text-neutral-800 break-keep">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <article className="container-wide py-14 sm:py-16">
        {gallery.length > 0 && (
          <section>
            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">장면 기록</p>
              <h2 className="mt-2 text-[1.65rem] leading-[1.1] font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[2.2rem]">
                프로젝트를 기억하게 하는 순간들
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
              {gallery.map((media, index) => (
                <PortfolioMediaTile
                  key={`${media.url}-${index}`}
                  item={media}
                  className={`overflow-hidden rounded-[1.7rem] border border-neutral-200 bg-neutral-100 ${
                    galleryLayouts[index] ?? "xl:col-span-6"
                  }`}
                  mediaClassName={galleryMediaLayouts[index] ?? "aspect-[4/3] h-full w-full object-cover xl:aspect-[4/5]"}
                  captionClassName="px-1 pt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500"
                />
              ))}
            </div>
          </section>
        )}

        {narrativeBlocks.length > 0 && (
          <section className="mt-14">
            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">프로젝트 노트</p>
              <h2 className="mt-2 text-[1.65rem] leading-[1.1] font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[2.2rem]">
                핵심만 짧게 정리한 운영 개요
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {narrativeBlocks.map((block) => (
                <section key={block.label} className="rounded-[1.6rem] border border-neutral-200 bg-white p-6">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">{block.label}</h3>
                  <div className="mt-4 whitespace-pre-wrap text-[0.95rem] leading-[1.8] text-neutral-700 break-keep">
                    {block.value}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}

        {content.trim() && (
          <section className="mt-14 border-t border-neutral-200 pt-10">
            <div className="max-w-3xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">상세 설명</p>
              <div className="mt-5">
                <MarkdownContent
                  content={content}
                  className="prose-p:text-neutral-700 prose-li:text-neutral-700 prose-headings:text-neutral-950"
                />
              </div>
            </div>
          </section>
        )}

        <section className="mt-14 border-t border-neutral-200 pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">이어보기</p>
              <h2 className="mt-2 text-[1.65rem] leading-[1.1] font-semibold tracking-[-0.045em] text-neutral-950 sm:text-[2.2rem]">
                함께 보면 좋은 프로젝트
              </h2>
            </div>
            <CTAButton href="/inquiry" label="이 프로젝트 문의하기" className="shadow-none" />
          </div>

          {relatedItems.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedItems.map((related) => {
                const relatedMedia = related.frontmatter.heroMedia || {
                  type: "image" as const,
                  url: related.frontmatter.thumbnail || portfolioFallbackImageUrl,
                  alt: related.frontmatter.title,
                };

                return (
                  <Link key={related.slug} href={`/portfolio/${related.slug}`} className="group block">
                    <article className="overflow-hidden rounded-[1.7rem] border border-neutral-200 bg-white">
                      <PortfolioMediaTile
                        item={relatedMedia}
                        className="overflow-hidden"
                        mediaClassName="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        captionClassName="hidden"
                      />
                      <div className="p-5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                          {formatDate(related.frontmatter.date)}
                        </p>
                        <h3 className="mt-2 text-[1.18rem] leading-[1.18] font-semibold tracking-[-0.035em] text-neutral-950">
                          {related.frontmatter.title}
                        </h3>
                        {related.frontmatter.summary && (
                          <p className="mt-3 text-[0.94rem] leading-[1.75] text-neutral-600 break-keep">
                            {related.frontmatter.summary}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/portfolio#portfolio-archive"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              포트폴리오 목록으로
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
