import { CTAButton } from "../CTAButton";

export function FinalCTASection() {
  return (
    <section className="border-t border-neutral-200 bg-white py-16 sm:py-20">
      <div className="container-wide">
        <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-neutral-400">
          Project Inquiry
        </p>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[720px]">
            <h2 className="text-[1.6rem] leading-[1.3] font-bold tracking-tight text-neutral-900 break-keep sm:text-[2.4rem]">
              프로젝트 상담 / 협업 제안
            </h2>
            <p className="mt-4 text-[1rem] leading-[1.75] text-neutral-500 break-keep">
              행사·예배·집회 기획·운영이 필요하시면 편하게 문의해 주세요.
            </p>
          </div>
          <CTAButton href="/inquiry" label="문의하기" size="lg" className="self-start shadow-none" />
        </div>
      </div>
    </section>
  );
}
