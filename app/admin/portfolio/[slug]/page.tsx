import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";
import {
  listAdminPortfolios,
  getAdminPortfolio,
  portfolioDocumentToPayload,
} from "@/lib/admin/portfolio-admin";
import { requireAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const DEFAULT_ROLES = ["기획", "운영", "프로그램", "기술", "행정", "현장", "무대"];
const DEFAULT_CATEGORIES = ["컨퍼런스", "예배·집회", "투어·라이브"];

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditPortfolioPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const [items, current] = await Promise.all([listAdminPortfolios(), getAdminPortfolio(slug)]);

  if (!current) {
    notFound();
  }

  const roleSuggestions = [...new Set([...DEFAULT_ROLES, ...items.flatMap((item) => item.frontmatter.roles || [])])];
  const categorySuggestions = [
    ...new Set([...DEFAULT_CATEGORIES, ...items.flatMap((item) => item.frontmatter.categories || [])]),
  ];

  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-3">
          <Link
            href="/admin"
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46 transition-colors hover:text-white"
          >
            Admin
          </Link>
        </div>

        <PortfolioEditor
          mode="edit"
          initialValue={portfolioDocumentToPayload(current)}
          relatedCaseOptions={items.map((item) => ({
            slug: item.slug,
            title: item.frontmatter.title,
            status: item.frontmatter.status || "published",
          }))}
          roleSuggestions={roleSuggestions}
          categorySuggestions={categorySuggestions}
        />
      </div>
    </section>
  );
}
