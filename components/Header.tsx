"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const blogUrl = "https://mbplatform-eight.vercel.app/";

const nav = [
  { label: "홈", href: "/" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "서비스", href: "/services" },
  { label: "문의", href: "/inquiry" },
  { label: "블로그", href: blogUrl, external: true },
];

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string, external?: boolean) => {
    if (external) {
      return false;
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
        <Link href="/" className="shrink-0 text-[15px] font-semibold uppercase tracking-[0.15em] text-white">
          MightyBlessing
        </Link>
        <nav
          aria-label="사이트 탐색"
          className="no-scrollbar flex max-w-[72vw] items-center gap-5 overflow-x-auto text-[15px] font-medium sm:max-w-none sm:gap-8"
        >
          {nav.map((item) => {
            const active = isActive(item.href, item.external);
            const className = active
              ? "whitespace-nowrap text-white"
              : "whitespace-nowrap text-neutral-400 transition-colors hover:text-white";

            return item.external ? (
              <a key={item.href} href={item.href} className={className}>
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={className} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
