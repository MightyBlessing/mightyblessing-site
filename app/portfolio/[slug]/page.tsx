import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolioBySlug, getPortfolioSlugs } from "@/lib/content";
import { CTAButton } from "@/components/CTAButton";
import { Tag } from "@/components/Tag";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PortfolioMediaTile } from "@/components/portfolio/PortfolioMediaTile";

type Props = { params: Promise<{ slug: string }> };

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

export async function generateStaticParams() {
  const slugs = getPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) return { title: "Portfolio" };
  return {
    title: `${item.frontmatter.title} | Mighty Blessing`,
    description: item.frontmatter.summary,
    openGraph: {
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) notFound();
  const { frontmatter, content } = item;
  const roleScope = frontmatter.our_role || frontmatter.scope;
  const gallery = frontmatter.gallery || [];
  const heroMedia = frontmatter.heroMedia || {
    type: "image" as const,
    url: frontmatter.thumbnail || "/media/portfolio/ambient-stage.jpg",
    alt: frontmatter.title,
  };
  const gallerySequence = gallery;
  const detailBlocks = [
    frontmatter.goals ? { label: "Goals", value: frontmatter.goals } : null,
    roleScope ? { label: "Role / Scope", value: roleScope } : null,
    frontmatter.process ? { label: "Process", value: frontmatter.process } : null,
  ].filter((block): block is { label: string; value: string } => block !== null);
  const infoItems = [
    frontmatter.location ? { label: "Location", value: frontmatter.location } : null,
    frontmatter.partner ? { label: "Partner", value: frontmatter.partner } : null,
    frontmatter.categories?.length ? { label: "Format", value: frontmatter.categories.join(" / ") } : null,
  ].filter((block): block is { label: string; value: string } => block !== null);
  const galleryLayouts = [
    "sm:col-span-2 lg:col-span-7",
    "lg:col-span-5 lg:translate-y-10",
    "lg:col-span-5",
    "sm:col-span-2 lg:col-span-7 lg:-translate-y-8",
  ];
  const galleryMediaLayouts = [
    "aspect-[16/10] h-full w-full object-cover",
    "aspect-[4/5] h-full w-full object-cover",
    "aspect-[4/3] h-full w-full object-cover",
    "aspect-[16/10] h-full w-full object-cover",
  ];

  return (
    <>
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-wide py-6 sm:py-8 lg:py-10">
          <p className="mb-4 text-[11px] font-medium tracking-[0.22em] text-neutral-400 uppercase">Portfolio</p>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-end">
            <PortfolioMediaTile
              item={heroMedia}
              priority
              className="overflow-hidden rounded-[2rem] bg-neutral-100"
              mediaClassName="min-h-[420px] w-full object-cover sm:min-h-[520px]"
              captionClassName="hidden"
            />

            <div className="space-y-6 lg:pb-4">
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">{formatDate(frontmatter.date)}</p>
                <h1 className="mt-3 max-w-[10ch] text-[1.95rem] leading-[0.98] font-semibold tracking-[-0.05em] text-neutral-950 sm:text-[3.05rem]">
                  {frontmatter.title}
                </h1>
                {frontmatter.summary && (
                  <p className="mt-4 max-w-[420px] text-[0.9rem] leading-[1.85] text-neutral-500 break-keep">
                    {frontmatter.summary}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(frontmatter.roles || []).map((r) => (
                  <Tag key={r} label={r} />
                ))}
                {(frontmatter.categories || []).map((c) => (
                  <Tag key={c} label={c} />
                ))}
              </div>

              {infoItems.length > 0 && (
                <dl className="grid gap-4 border-t border-neutral-200 pt-6 sm:grid-cols-2">
                  {infoItems.map((entry) => (
                    <div key={entry.label}>
                      <dt className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">{entry.label}</dt>
                      <dd className="mt-2 text-[0.9rem] leading-[1.75] text-neutral-700 break-keep">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      </section>

      <article className="container-wide py-14 sm:py-16">
        {gallerySequence.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {gallerySequence.map((media, index) => (
              <PortfolioMediaTile
                key={`${media.url}-${index}`}
                item={media}
                className={`overflow-hidden rounded-[1.8rem] bg-neutral-100 transition-transform duration-500 ${galleryLayouts[index] ?? "sm:col-span-1 lg:col-span-6"}`}
                mediaClassName={galleryMediaLayouts[index] ?? "aspect-[4/5] h-full w-full object-cover"}
              />
            ))}
          </section>
        )}

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)]">
          <div className="space-y-10">
            {detailBlocks.map((block) => (
              <section key={block.label} className="border-t border-neutral-200 pt-8">
                <h2 className="text-[10px] font-medium tracking-[0.22em] text-neutral-400 uppercase">{block.label}</h2>
                <div className="mt-4 whitespace-pre-wrap text-[0.92rem] leading-[1.85] text-neutral-600 break-keep">
                  {block.value}
                </div>
              </section>
            ))}

            {content.trim() && (
              <section className="border-t border-neutral-200 pt-8">
                <h2 className="text-[10px] font-medium tracking-[0.22em] text-neutral-400 uppercase">Overview</h2>
                <div className="mt-5">
                  <MarkdownContent content={content} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            {frontmatter.metrics && frontmatter.metrics.length > 0 && (
              <section className="rounded-[1.6rem] border border-neutral-200 bg-neutral-50 p-6">
                <h2 className="text-[10px] font-medium tracking-[0.22em] text-neutral-400 uppercase">Output & Impact</h2>
                <ul className="mt-4 space-y-4">
                  {frontmatter.metrics.map((m) => (
                    <li key={m.label}>
                      <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">{m.label}</p>
                      <p className="mt-1 text-[0.92rem] leading-[1.75] text-neutral-700">{m.value}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap gap-4 border-t border-neutral-200 pt-6">
              <CTAButton href="/inquiry" label="이 프로젝트 문의하기" className="shadow-none" />
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                목록으로
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
