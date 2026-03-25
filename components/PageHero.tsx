import { ReactNode } from "react";

type Props = { title: string; subtitle?: string; children?: ReactNode; eyebrow?: string };

export function PageHero({ title, subtitle, children, eyebrow }: Props) {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="container-wide py-16 sm:py-20">
        {eyebrow && (
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-[920px] text-[2.05rem] leading-[1.16] font-semibold tracking-[-0.045em] text-neutral-950 break-keep sm:text-[3.2rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-[760px] text-[1.02rem] leading-[1.8] text-neutral-600 break-keep sm:text-[1.12rem]">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
