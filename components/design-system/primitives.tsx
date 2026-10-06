/* eslint-disable @next/next/no-img-element -- Reviewed responsive media and supplied SVG mark. */
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { imageSrcSet } from "@/lib/project-presentation";
import type { SystemProject } from "@/lib/design-system";
import "./system.css";

export function Arrow({ direction = "up" }: { direction?: "up" | "right" }) {
  return <svg className="mb-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={direction === "up" ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"} /></svg>;
}

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return <img className={`mb-logo${inverse ? " mb-logo-inverse" : ""}`} src="/brand/mighty-blessing.svg" width="128" height="39" alt="Mighty Blessing" />;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-eyebrow">{children}</p>;
}

export function SectionHeading({ number, title, description }: { number: string; title: string; description?: string }) {
  return <header className="mb-section-heading"><span className="mb-caption">{number}</span><div><h2 className="mb-section-title">{title}</h2>{description && <p className="mb-body mb-muted">{description}</p>}</div></header>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "text"; busy?: boolean; arrow?: boolean };
export function Button({ variant = "primary", busy = false, arrow = true, children, className = "", disabled, ...props }: ButtonProps) {
  return <button type="button" {...props} disabled={disabled || busy} aria-busy={busy || undefined} className={`mb-button mb-button-${variant} ${className}`}>{children}{arrow && <Arrow />}</button>;
}

export function ActionLink({ href, children, variant = "text" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text" }) {
  return <Link href={href} prefetch={false} className={`mb-button mb-button-${variant}`}>{children}<Arrow /></Link>;
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string; hint?: string };
export function Field({ id, label, error, hint, required, ...props }: FieldProps) {
  const description = error || hint;
  return <div className={`mb-field${error ? " mb-field-error" : ""}`}><label htmlFor={id}>{label}<span>{required ? "필수" : "선택"}</span></label><input {...props} id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={description ? `${id}-description` : undefined} />{description && <p id={`${id}-description`} className="mb-field-description">{error && <span aria-hidden="true">! </span>}{description}</p>}</div>;
}

export function StatusMessage({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: ReactNode }) {
  return <div className={`mb-status mb-status-${tone}`} role={tone === "error" ? "alert" : "status"}><span className="mb-status-mark" aria-hidden="true">{tone === "success" ? "✓" : tone === "error" ? "!" : "i"}</span><p>{children}</p></div>;
}

export function RoleLine({ project }: { project: SystemProject }) {
  return <p className="mb-caption mb-role">{project.roles.join(" · ")}</p>;
}

export function ProjectCaption({ project }: { project: SystemProject }) {
  return <figcaption className="mb-project-caption"><div><p className="mb-caption mb-muted">{project.category} <span aria-hidden="true">/</span> {project.year}</p><Link href={`/portfolio/${project.slug}`} prefetch={false}><h3 className="mb-project-title">{project.title}<Arrow /></h3></Link><RoleLine project={project} /></div><span className="mb-caption mb-muted">{project.location}</span></figcaption>;
}

export function ProjectFigure({ project, wide = false, priority = false }: { project: SystemProject; wide?: boolean; priority?: boolean }) {
  return <figure className={`mb-project-figure${wide ? " mb-project-wide" : ""}`}><Link href={`/portfolio/${project.slug}`} prefetch={false} className="mb-image-link" aria-label={`${project.title} 상세 보기`}><img src={project.image} srcSet={imageSrcSet(project.image)} sizes="(max-width: 700px) 100vw, 912px" alt={project.alt} width="1368" height="912" loading={priority ? "eager" : "lazy"} /></Link><ProjectCaption project={project} /></figure>;
}

export function ProjectRow({ project }: { project: SystemProject }) {
  return <Link href={`/portfolio/${project.slug}`} prefetch={false} className="mb-project-row"><time className="mb-caption mb-muted" dateTime={project.date.replaceAll(".", "-")}>{project.date}</time><div><h3>{project.title}</h3><RoleLine project={project} /></div><span className="mb-caption mb-muted">{project.location}</span><Arrow /></Link>;
}

export function ProjectFacts({ project }: { project: SystemProject }) {
  const facts = [{ term: "일자", value: project.date }, { term: "장소", value: project.location }, { term: "수행 범위", value: project.roles.join(" · ") }, ...project.credits.map((credit) => ({ term: credit.role, value: credit.name }))];
  return <dl className="mb-facts">{facts.filter((fact) => fact.value).map((fact) => <div key={fact.term}><dt>{fact.term}</dt><dd>{fact.value}</dd></div>)}</dl>;
}

export function ServiceRow({ number, title, summary, items }: { number: string; title: string; summary: string; items: string }) {
  return <article className="mb-service-row"><span className="mb-eyebrow">{number}</span><h3 className="mb-project-title">{title}</h3><div><p className="mb-body">{summary}</p><p className="mb-caption mb-muted">{items}</p></div></article>;
}

export function ContactBlock({ title = "구상 중인 행사부터\n함께 이야기합니다." }: { title?: string }) {
  return <section className="mb-contact"><Eyebrow>START A PROJECT</Eyebrow><h2 className="mb-page-title">{title}</h2><div className="mb-contact-actions"><ActionLink href="/inquiry">프로젝트 문의</ActionLink><a className="mb-caption" href="mailto:contact@mightyblessing.com">contact@mightyblessing.com</a></div></section>;
}
