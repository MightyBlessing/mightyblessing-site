import Link from "next/link";
import { CTAButton } from "./CTAButton";

const nav = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Products", href: "/products" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white sm:text-xl">
          Mighty Blessing
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition hover:text-brand-primary dark:text-gray-300 dark:hover:text-brand-secondary"
            >
              {item.label}
            </Link>
          ))}
          <CTAButton href="/inquiry" label="Project Inquiry" />
        </nav>
      </div>
    </header>
  );
}
