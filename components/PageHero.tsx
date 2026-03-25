import { ReactNode } from "react";

type Props = { title: string; subtitle?: string; children?: ReactNode; eyebrow?: string };

export function PageHero({ title, subtitle, children, eyebrow }: Props) {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="container-wide py-14 sm:py-20">
        {eyebrow && (
          <p className="mb-5 text-[12px] uppercase tracking-[0.15em] text-neutral-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-[920px] text-[1.9rem] leading-[1.2] font-bold tracking-tight text-neutral-900 break-keep sm:text-[3rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-[720px] text-[1rem] leading-[1.75] text-neutral-500 break-keep sm:text-[1.1rem]">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
