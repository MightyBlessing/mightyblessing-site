import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogSlugs } from "@/lib/content";
import { CTAButton } from "@/components/CTAButton";
import { Tag } from "@/components/Tag";
import { MarkdownContent } from "@/components/MarkdownContent";

type Props = { params: Promise<{ slug: string }> };
const blogUrl = "https://mbplatform-eight.vercel.app/";

export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = getBlogBySlug(slug);
  if (!item) return { title: "Blog" };
  return {
    title: `${item.frontmatter.title} | Mighty Blessing`,
    description: item.frontmatter.summary,
    openGraph: {
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getBlogBySlug(slug);
  if (!item) notFound();
  const { frontmatter, content } = item;

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header>
          <div className="flex flex-wrap gap-2">
            <Tag label={frontmatter.category} />
            {(frontmatter.tags || []).map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {frontmatter.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {new Date(frontmatter.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>
        <div className="mt-8">
          <MarkdownContent content={content} />
        </div>
        <div className="mt-14 flex flex-wrap gap-4 border-t border-gray-200 pt-10 dark:border-gray-800">
          <CTAButton href="/inquiry" label="협업/운영 문의" />
          <a
            href={blogUrl}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            블로그로 이동
          </a>
        </div>
      </article>
    </>
  );
}
