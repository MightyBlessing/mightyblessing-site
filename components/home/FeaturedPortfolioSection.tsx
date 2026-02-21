import { getAllPortfolios } from "@/lib/content";
import { Card } from "../Card";
import Link from "next/link";

export function FeaturedPortfolioSection() {
  const all = getAllPortfolios();
  const featured = all.slice(0, 3);
  if (featured.length === 0) return null;
  return (
    <section className="border-t border-gray-200 py-16 dark:border-gray-800 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Featured Portfolio</h2>
          <Link
            href="/portfolio"
            className="text-sm font-medium text-brand-primary hover:underline dark:text-brand-secondary"
          >
            전체 보기
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ slug, frontmatter }) => (
            <Card
              key={slug}
              title={frontmatter.title}
              summary={frontmatter.summary}
              href={`/portfolio/${slug}`}
              tags={frontmatter.roles?.slice(0, 3)}
              date={frontmatter.date}
              thumbnail={frontmatter.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
