import Link from "next/link";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";
import { listAdminPortfolios } from "@/lib/admin/portfolio-admin";
import type { PortfolioEditorPayload } from "@/lib/admin/portfolio-admin";
import { requireAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const DEFAULT_ROLES = ["기획", "운영", "프로그램", "기술", "행정", "현장", "무대"];
const DEFAULT_CATEGORIES = ["컨퍼런스", "예배·집회", "투어·라이브"];

function createInitialValue(): PortfolioEditorPayload {
  return {
    title: "",
    slug: "",
    date: new Date().toISOString().slice(0, 10),
    summary: "",
    location: "",
    partner: "",
    featured: false,
    featured_order: undefined,
    status: "draft",
    roles: [],
    categories: [],
    search_terms: [],
    goals: "",
    our_role: "",
    process: "",
    metrics: [],
    related_cases: [],
    content: "",
    heroMedia: {
      type: "image",
      alt: "",
    },
    gallery: [],
  };
}

export default async function NewPortfolioPage() {
  await requireAdminSession();
  const items = await listAdminPortfolios();

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
          mode="create"
          initialValue={createInitialValue()}
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

