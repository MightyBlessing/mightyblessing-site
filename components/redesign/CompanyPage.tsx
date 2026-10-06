import Link from "next/link";
import type { ReactNode } from "react";
import "./company-pages.css";

export function CompanyPage({ label, title, intro, children }: { label: string; title: ReactNode; intro: string; children: ReactNode }) {
  return <article className="company-page">
    <header className="company-heading"><p className="section-label">{label}</p><h1>{title}</h1><p className="company-intro">{intro}</p></header>
    {children}
  </article>;
}

export function ProjectContact() {
  return <section className="company-contact"><p>함께 준비할 현장이 있나요?</p><Link href="/inquiry">프로젝트 문의 <span aria-hidden="true">↗</span></Link></section>;
}
