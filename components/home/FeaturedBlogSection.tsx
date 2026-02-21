import { getAllBlogs } from "@/lib/content";
import { Card } from "../Card";
import Link from "next/link";

export function FeaturedBlogSection() {
  const all = getAllBlogs();
  const featured = all.slice(0, 3);
  if (featured.length === 0) return null;
  return (
    <section className="bg-white py-24 dark:bg-[#1E1E24]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-3xl font-black text-[#111111] dark:text-white md:text-4xl">Featured Blog</h2>
          <Link href="/blog" className="text-sm font-bold text-[#6A00FF] hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ slug, frontmatter }) => (
            <Card
              key={slug}
              title={frontmatter.title}
              summary={frontmatter.summary}
              href={`/blog/${slug}`}
              tags={[frontmatter.category, ...(frontmatter.tags || [])].slice(0, 3)}
              date={frontmatter.date}
              thumbnail={frontmatter.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
