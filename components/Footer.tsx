"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/design-system") return null;
  return (
    <footer className={`site-footer ${pathname === "/" ? "home-footer" : ""}`}>
      <span>© {new Date().getFullYear()} MIGHTY BLESSING</span>
      <div><Link href="/privacy">개인정보처리방침</Link><Link href="/terms">이용약관</Link></div>
    </footer>
  );
}
