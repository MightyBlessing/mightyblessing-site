"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const blogUrl = "https://mbplatform-eight.vercel.app/";

const nav = [
  { label: "전체", href: "/" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "문의", href: "/inquiry" },
  { label: "블로그", href: blogUrl, external: true },
];

export function Header() {
  const pathname = usePathname();

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
          <Link
            href="/portfolio#portfolio-search"
            className="text-neutral-400 transition-colors hover:text-white"
            aria-label="포트폴리오 검색 이동"
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
          </Link>
        </div>
      </header>
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
