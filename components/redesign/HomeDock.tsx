"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNavigation } from "@/lib/site-navigation";

export function HomeDock() {
  const preview = usePathname() === "/design-system";
  return <div className="home-dock-position"><nav className="home-dock" aria-label="홈 사이트 탐색">
    {siteNavigation(preview).map(({ href, label }) => <Link key={href} href={href} className={href === "/inquiry" ? "home-dock-contact" : undefined}>{label}{href === "/inquiry" && <span aria-hidden="true">↗</span>}</Link>)}
  </nav></div>;
}
