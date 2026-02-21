import { getAllPortfolios } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Card } from "@/components/Card";

export default function PortfolioPage() {
  const items = getAllPortfolios();
  return (
    <>
      <PageHero
        title="Portfolio"
        subtitle="예배·집회·컨퍼런스 운영 사례를 소개합니다."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ slug, frontmatter }) => (
            <Card
              key={slug}
              title={frontmatter.title}
              summary={frontmatter.summary}
              href={`/portfolio/${slug}`}
              tags={[...(frontmatter.roles || []), ...(frontmatter.categories || [])].slice(0, 4)}
              date={frontmatter.date}
              thumbnail={frontmatter.thumbnail}
            />
          ))}
        </div>
      </section>
    </>
  );
}
