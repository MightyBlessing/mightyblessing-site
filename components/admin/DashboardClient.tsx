"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPortfolioDocument } from "@/lib/admin/portfolio-admin";
import type { PortfolioStatus } from "@/lib/content";

type Props = {
  items: AdminPortfolioDocument[];
  categories: string[];
};

function statusLabel(status: PortfolioStatus) {
  switch (status) {
    case "draft":
      return "초안";
    case "archived":
      return "보관";
    default:
      return "발행";
  }
}

function statusClassName(status: PortfolioStatus) {
  switch (status) {
    case "draft":
      return "border-[#a9bcff]/20 bg-[#a9bcff]/10 text-[#d7e0ff]";
    case "archived":
      return "border-white/10 bg-white/[0.04] text-white/56";
    default:
      return "border-[#9ce2b0]/18 bg-[#9ce2b0]/10 text-[#baf0c7]";
  }
}

export function DashboardClient({ items, categories }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PortfolioStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [pendingSlug, setPendingSlug] = useState("");
  const [error, setError] = useState("");

  const filteredItems = items.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (status !== "all" && (item.frontmatter.status || "published") !== status) {
      return false;
    }

    if (category !== "all" && !(item.frontmatter.categories || []).includes(category)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      item.frontmatter.title,
      item.slug,
      ...(item.frontmatter.roles || []),
      ...(item.frontmatter.categories || []),
      ...(item.frontmatter.search_terms || []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const counts = {
    all: items.length,
    draft: 0,
    published: 0,
    archived: 0,
  };

  for (const item of items) {
    const itemStatus = item.frontmatter.status || "published";
    counts[itemStatus] += 1;
  }

  async function handleAction(action: "duplicate" | "setStatus", slug: string, nextStatus?: PortfolioStatus) {
    setPendingSlug(slug);
    setError("");

    try {
      const response = await fetch("/api/admin/portfolio/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          action === "duplicate"
            ? { action, slug }
            : {
                action,
                slug,
                status: nextStatus,
              },
        ),
      });

      const data = (await response.json()) as { error?: string; slug?: string };
      if (!response.ok) {
        throw new Error(data.error || "처리 중 오류가 발생했습니다.");
      }

      if (action === "duplicate" && data.slug) {
        router.push(`/admin/portfolio/${data.slug}`);
        return;
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setPendingSlug("");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["전체", counts.all],
          ["초안", counts.draft],
          ["발행", counts.published],
          ["보관", counts.archived],
        ].map(([label, count]) => (
          <div key={label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">{label}</p>
            <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">{count}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_180px_180px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, slug, 태그로 검색"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[0.95rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PortfolioStatus | "all")}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[0.95rem] text-white outline-none focus:border-[#a9bcff]"
            >
              <option value="all">모든 상태</option>
              <option value="draft">초안</option>
              <option value="published">발행</option>
              <option value="archived">보관</option>
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[0.95rem] text-white outline-none focus:border-[#a9bcff]"
            >
              <option value="all">모든 카테고리</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/admin/portfolio/new"
            className="inline-flex items-center justify-center rounded-full bg-[#a9bcff] px-5 py-3 text-[0.94rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff]"
          >
            새 포트폴리오 작성
          </Link>
        </div>

        {error && <p className="mt-4 text-[0.92rem] text-[#ffb1b1]">{error}</p>}

        <div className="mt-6 grid gap-4">
          {filteredItems.map((item) => {
            const itemStatus = item.frontmatter.status || "published";
            return (
              <article
                key={item.slug}
                className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4 sm:p-5"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                  <div className="flex gap-4">
                    <div className="hidden h-[92px] w-[124px] overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/5 sm:block">
                      {item.frontmatter.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.frontmatter.thumbnail}
                          alt={item.frontmatter.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[0.82rem] text-white/35">No Media</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.76rem] font-medium ${statusClassName(itemStatus)}`}
                        >
                          {statusLabel(itemStatus)}
                        </span>
                        {item.frontmatter.featured && (
                          <span className="inline-flex items-center rounded-full border border-[#ffd98b]/15 bg-[#ffd98b]/10 px-3 py-1 text-[0.76rem] font-medium text-[#ffe1a4]">
                            대표 {item.frontmatter.featured_order ? `#${item.frontmatter.featured_order}` : ""}
                          </span>
                        )}
                        <span className="text-[0.78rem] text-white/38">{item.slug}</span>
                      </div>
                      <h2 className="mt-3 text-[1.25rem] leading-[1.16] font-semibold tracking-[-0.04em] text-white">
                        {item.frontmatter.title}
                      </h2>
                      <p className="mt-2 text-[0.92rem] leading-[1.7] text-white/62 break-keep">
                        {item.frontmatter.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[...(item.frontmatter.roles || []), ...(item.frontmatter.categories || [])].slice(0, 6).map((tag) => (
                          <span
                            key={`${item.slug}-${tag}`}
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.76rem] font-medium text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:w-[280px]">
                    <Link
                      href={`/admin/portfolio/${item.slug}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.85rem] font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAction("duplicate", item.slug)}
                      disabled={pendingSlug === item.slug}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.85rem] font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                    >
                      복제
                    </button>
                    {itemStatus !== "published" && (
                      <button
                        type="button"
                        onClick={() => handleAction("setStatus", item.slug, "published")}
                        disabled={pendingSlug === item.slug}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#9ce2b0]/15 bg-[#9ce2b0]/10 px-4 py-2 text-[0.85rem] font-medium text-[#c1f1cb] transition-colors hover:bg-[#9ce2b0]/16 disabled:opacity-60"
                      >
                        발행
                      </button>
                    )}
                    {itemStatus !== "draft" && (
                      <button
                        type="button"
                        onClick={() => handleAction("setStatus", item.slug, "draft")}
                        disabled={pendingSlug === item.slug}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#a9bcff]/20 bg-[#a9bcff]/10 px-4 py-2 text-[0.85rem] font-medium text-[#d7e0ff] transition-colors hover:bg-[#a9bcff]/16 disabled:opacity-60"
                      >
                        초안
                      </button>
                    )}
                    {itemStatus !== "archived" && (
                      <button
                        type="button"
                        onClick={() => handleAction("setStatus", item.slug, "archived")}
                        disabled={pendingSlug === item.slug}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.85rem] font-medium text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                      >
                        보관
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 px-5 py-10 text-center text-[0.95rem] text-white/48">
              조건에 맞는 포트폴리오가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
