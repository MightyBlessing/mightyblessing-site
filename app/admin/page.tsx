import Link from "next/link";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { listAdminPortfolios } from "@/lib/admin/portfolio-admin";
import { requireAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const items = await listAdminPortfolios();
  const categories = [...new Set(items.flatMap((item) => item.frontmatter.categories || []))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Portfolio Admin</p>
            <h1 className="mt-3 text-[2rem] leading-[1.02] font-semibold tracking-[-0.055em] text-white sm:text-[3rem]">
              포트폴리오 관리자
            </h1>
            <p className="mt-3 text-[0.98rem] leading-[1.8] text-white/62">
              초안 저장, 발행, 보관, 복제와 미디어 교체까지 여기서 관리합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/portfolio"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.9rem] font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              공개 포트폴리오 보기
            </Link>
            <LogoutButton />
          </div>
        </div>

        <DashboardClient items={items} categories={categories} />
      </div>
    </section>
  );
}

