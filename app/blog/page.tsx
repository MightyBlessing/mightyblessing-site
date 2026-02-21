import { getAllBlogs } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Card } from "@/components/Card";

export default function BlogPage() {
  const items = getAllBlogs();
  return (
    <>
      <PageHero title="Blog" subtitle="운영 인사이트와 케이스 회고를 나눕니다." />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ slug, frontmatter }) => (
            <Card
              key={slug}
              title={frontmatter.title}
              summary={frontmatter.summary}
              href={`/blog/${slug}`}
              tags={[frontmatter.category, ...(frontmatter.tags || [])].slice(0, 4)}
              date={frontmatter.date}
              thumbnail={frontmatter.thumbnail}
            />
          ))}
        </div>
      </section>
    </>
  );
}
