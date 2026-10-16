import Link from "next/link";
import type { ReactNode } from "react";
import "./company-pages.css";

export function CompanyPage({ label, title, intro, children }: { label: string; title: ReactNode; intro: string; children: ReactNode }) {
  return <article className="company-page">
    <header className="company-heading"><p className="section-label">{label}</p><h1>{title}</h1><p className="company-intro">{intro}</p></header>
    {children}
  </article>;
}

export function ProjectContact({ prompt = "일정과 필요한 업무를 알려주세요." }: { prompt?: string }) {
  return <section className="company-contact"><p>{prompt}</p><Link href="/inquiry">프로젝트 문의 <span aria-hidden="true">↗</span></Link></section>;
}
