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
  "group block h-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-6 transition-colors duration-200 hover:border-violet-200 hover:bg-neutral-50";

export function Card({ title, summary, href, tags, date, thumbnail, children }: CardProps) {
  const content = (
    <>
      {thumbnail && (
        <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-neutral-100">
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
        <p className="mb-2 text-[12px] tracking-tight text-neutral-400">
          {new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
        </p>
      )}
      <h3 className="mb-3 text-[1.05rem] leading-[1.5] font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-violet-600 break-keep">
        {title}
      </h3>
      {summary && <p className="line-clamp-2 text-[14px] leading-[1.7] text-neutral-500 break-keep">{summary}</p>}
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
