import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolioBySlug, getPortfolioSlugs } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { CTAButton } from "@/components/CTAButton";
import { Tag } from "@/components/Tag";
import { MarkdownContent } from "@/components/MarkdownContent";

type Props = { params: Promise<{ slug: string }> };

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

  return (
    <>
      <PageHero
        title={frontmatter.title}
        subtitle={
          frontmatter.date
            ? new Date(frontmatter.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
            : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {(frontmatter.roles || []).map((r) => (
            <Tag key={r} label={r} />
          ))}
          {(frontmatter.categories || []).map((c) => (
            <Tag key={c} label={c} />
          ))}
        </div>
      </PageHero>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {frontmatter.summary && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{frontmatter.summary}</p>
        )}

        <div className="mt-10 space-y-10">
          {frontmatter.goals && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goals</h2>
              <div className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {frontmatter.goals}
              </div>
            </section>
          )}

          {roleScope && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Role / Scope</h2>
              <div className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {roleScope}
              </div>
            </section>
          )}

          {frontmatter.process && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Process</h2>
              <div className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {frontmatter.process}
              </div>
            </section>
          )}

          {frontmatter.metrics && frontmatter.metrics.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Output & Impact</h2>
              <ul className="mt-2 space-y-1">
                {frontmatter.metrics.map((m) => (
                  <li key={m.label} className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{m.label}:</span> {m.value}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.trim() && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
              <div className="mt-2">
                <MarkdownContent content={content} />
              </div>
            </section>
          )}
        </div>

        <div className="mt-14 flex flex-wrap gap-4 border-t border-gray-200 pt-10 dark:border-gray-800">
          <CTAButton href="/inquiry" label="이 프로젝트 문의하기" />
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            목록으로
          </Link>
        </div>
      </article>
    </>
  );
}
