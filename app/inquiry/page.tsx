import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "프로젝트 문의",
  description: "예배·집회·행사 기획과 운영이 필요하다면 마이티블레싱에 프로젝트 문의를 남겨 주세요.",
  path: "/inquiry",
  keywords: ["프로젝트 문의", "예배 문의", "집회 운영 문의", "행사 기획 문의"],
});

type Product = {
  name: string;
  tagline: string;
  href?: string;
  logo?: string;
  mark?: ReactNode;
  upcoming?: boolean;
};

const products: Product[] = [
  {
    name: "두줄자막",
    tagline: "예배 자막을 더 빠르게",
    href: "https://twoline.kr",
    logo: "/products/twoline.png",
  },
  {
    name: "포도나무",
    tagline: "교회 행사 운영 플랫폼",
    href: "https://grapetree.kr",
    logo: "/products/grapetree.png",
  },
  {
    name: "라이브텍스트",
    tagline: "관객의 현장 메시지를 무대로 실시간 송출",
    href: "https://livetext.mightyblessing.com/",
    mark: (
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff6b6b]"
        />
        <span className="text-[0.66rem] font-bold tracking-[0.14em] text-white">
          LIVE TEXT
        </span>
      </span>
    ),
  },
];

export default function InquiryPage() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide relative py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-[1120px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-[2rem] leading-[1.2] font-semibold tracking-[-0.04em] text-white break-keep sm:text-[2.6rem]">
              프로젝트 문의
            </h1>
            <p className="mt-5 text-[1rem] leading-[1.75] text-white/70 break-keep sm:text-[1.05rem]">
              예배·집회·행사 기획과 운영을 함께합니다. 행사명, 일정, 필요한 범위를 자유롭게 적어주세요. 평일 기준 24시간 내 회신드립니다.
            </p>

            <div className="mt-10">
              <InquiryForm />
            </div>
          </div>

          <div>
            <h2 className="text-[2rem] leading-[1.2] font-semibold tracking-[-0.04em] text-white break-keep sm:text-[2.6rem]">
              프로덕트
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.75] text-white/70 break-keep sm:text-[1.05rem]">
              마이티블레싱이 만든 서비스입니다.
            </p>

            <ul className="mt-10 flex flex-col gap-3">
              {products.map((product) => {
                const tile = (
                  <div className="flex h-12 w-20 flex-shrink-0 items-center justify-center">
                    {product.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.logo}
                        alt={`${product.name} 로고`}
                        className="h-full w-full object-contain"
                      />
                    ) : product.mark ? (
                      product.mark
                    ) : (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-9 w-9 text-[#6A00FF]"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M13 8H7" />
                        <path d="M17 12H7" />
                      </svg>
                    )}
                  </div>
                );

                const info = (
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.05rem] font-semibold text-white">{product.name}</p>
                    <p className="mt-1 text-[0.9rem] leading-[1.5] text-white/60 break-keep">
                      {product.tagline}
                    </p>
                  </div>
                );

                if (product.upcoming) {
                  return (
                    <li key={product.name}>
                      <div className="flex items-center gap-4 rounded-2xl border border-[#a9bcff]/45 bg-[#a9bcff]/[0.14] p-4">
                        {tile}
                        {info}
                        <span className="flex-shrink-0 rounded-full border border-[#a9bcff]/55 bg-[#a9bcff]/[0.20] px-2.5 py-1 text-[0.72rem] font-medium tracking-[0.05em] text-[#d7e0ff]">
                          예정
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={product.name}>
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-[#a9bcff]/45 bg-[#a9bcff]/[0.14] p-4 transition-colors hover:border-[#a9bcff]/65 hover:bg-[#a9bcff]/[0.20]"
                    >
                      {tile}
                      {info}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 flex-shrink-0 text-white/40 transition-colors group-hover:text-white/80"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
