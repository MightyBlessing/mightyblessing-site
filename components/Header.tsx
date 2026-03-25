"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const blogUrl = "https://mbplatform-eight.vercel.app/";

const nav = [
  { label: "전체", href: "/" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "문의", href: "/inquiry" },
  { label: "블로그", href: blogUrl, external: true },
];

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const isActive = (href: string, external?: boolean) => {
    if (external) {
      return pathname.startsWith("/blog");
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-14 bg-neutral-950 text-white">
        <div className="container-wide flex h-full items-center justify-between">
          <Link href="/" className="text-[15px] uppercase tracking-[0.15em]">
            MightyBlessing
          </Link>
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`transition-colors ${isSearchOpen ? "text-white" : "text-neutral-400 hover:text-white"}`}
            aria-label="포트폴리오 검색 열기"
            aria-expanded={isSearchOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </header>
      {isSearchOpen && (
        <div className="fixed inset-x-0 top-14 z-[45] border-b border-white/10 bg-neutral-950/96 text-white backdrop-blur">
          <div className="container-wide py-4">
            <form action="/portfolio" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="global-portfolio-search" className="sr-only">
                포트폴리오 검색
              </label>
              <input
                ref={inputRef}
                id="global-portfolio-search"
                name="q"
                placeholder="포트폴리오 제목, 태그, 행사명 검색"
                autoComplete="off"
                className="w-full flex-1 rounded-full border border-white/12 bg-white/6 px-4 py-3 text-[0.9rem] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/35"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-[0.82rem] font-semibold text-neutral-950 transition-colors hover:bg-neutral-100"
              >
                검색
              </button>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-[0.82rem] font-medium text-white/72 transition-colors hover:bg-white/6 hover:text-white"
              >
                전체 보기
              </Link>
            </form>
            <p className="mt-2 text-[0.78rem] leading-[1.7] text-white/45 break-keep">
              헤더 검색으로 포트폴리오 제목과 태그를 찾고, 결과 카드에서 바로 상세 페이지로 이동할 수 있습니다.
            </p>
          </div>
        </div>
      )}
      <div className="sticky top-14 z-40 border-b border-neutral-200 bg-white">
        <nav aria-label="사이트 탐색" className="container-wide no-scrollbar flex items-center gap-7 overflow-x-auto">
          {nav.map((item) => {
            const active = isActive(item.href, item.external);
            const className = active
              ? "relative py-3.5 text-sm whitespace-nowrap transition-colors text-neutral-900"
              : "relative py-3.5 text-sm whitespace-nowrap transition-colors text-neutral-400 hover:text-neutral-700";

            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                className={className}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-900" />}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={className}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-900" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
