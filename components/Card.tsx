import Link from "next/link";
import { ReactNode } from "react";
import { Tag } from "./Tag";

type CardProps = {
  title: string;
  summary?: string;
  href?: string;
  tags?: string[];
  date?: string;
  thumbnail?: string;
  children?: ReactNode;
};

const cardClassName =
  "group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-primary/30 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-secondary/30";

export function Card({ title, summary, href, tags, date, thumbnail, children }: CardProps) {
  const content = (
    <>
      {thumbnail && (
        <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tags?.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>
      {date && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
        </p>
      )}
      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-secondary">
        {title}
      </h3>
      {summary && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{summary}</p>}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }
  return <div className={cardClassName}>{content}</div>;
}
