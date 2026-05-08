import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "프로젝트 문의",
  description: "예배·집회·행사 기획과 운영이 필요하다면 마이티블레싱에 프로젝트 문의를 남겨 주세요.",
  path: "/inquiry",
  keywords: ["프로젝트 문의", "예배 문의", "집회 운영 문의", "행사 기획 문의"],
});

export default function InquiryPage() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide relative py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[560px]">
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
      </div>
    </section>
  );
}
