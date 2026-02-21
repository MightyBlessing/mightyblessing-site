import Link from "next/link";
import Image from "next/image";
import { CTAButton } from "./CTAButton";

const nav = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Products", href: "/products" },
];

export function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-gray-200 bg-[#F8F9FB]/90 backdrop-blur-md dark:border-gray-800 dark:bg-[#0F0F12]/90">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#6A00FF] focus:ring-offset-2 rounded">
          <span className="sr-only">Mighty Blessing 홈</span>
          <Image
            src="/images/logo.png"
            alt="Mighty Blessing"
            width={180}
            height={48}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#111111] transition-colors hover:text-[#6A00FF] dark:text-[#EEEEEE] dark:hover:text-[#6A00FF]"
            >
              {item.label}
            </Link>
          ))}
          <CTAButton href="/inquiry" label="Project Inquiry" />
        </div>
        <div className="flex items-center md:hidden">
          <button type="button" className="p-2 text-[#111111] hover:text-[#6A00FF] dark:text-[#EEEEEE] dark:hover:text-[#6A00FF]" aria-label="메뉴 열기">
            <span className="material-icons-outlined text-3xl">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
