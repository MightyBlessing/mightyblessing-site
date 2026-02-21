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
  "group block rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-[#1E1E24] cursor-pointer";

export function Card({ title, summary, href, tags, date, thumbnail, children }: CardProps) {
  const content = (
    <>
      {thumbnail && (
        <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {tags?.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>
      {date && (
        <p className="mb-2 text-xs text-[#666666] dark:text-[#AAAAAA]">
          {new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
        </p>
      )}
      <h3 className="mb-3 text-lg font-bold text-[#111111] dark:text-white transition-colors group-hover:text-[#6A00FF]">
        {title}
      </h3>
      {summary && <p className="line-clamp-2 text-sm text-[#666666] dark:text-[#AAAAAA]">{summary}</p>}
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
