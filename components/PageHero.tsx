import { ReactNode } from "react";

type Props = { title: string; subtitle?: string; children?: ReactNode };

export function PageHero({ title, subtitle, children }: Props) {
  return (
    <section className="border-b border-gray-200 bg-gray-50/80 py-16 dark:border-gray-800 dark:bg-gray-900/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
