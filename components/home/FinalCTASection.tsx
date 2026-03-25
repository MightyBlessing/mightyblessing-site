import { CTAButton } from "../CTAButton";

export function FinalCTASection() {
  return (
    <section className="border-t border-neutral-200 bg-white py-16 sm:py-20">
      <div className="container-wide">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">프로젝트 문의</p>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[720px]">
            <h2 className="text-[1.8rem] leading-[1.22] font-semibold tracking-[-0.045em] text-neutral-950 break-keep sm:text-[2.6rem]">
              프로젝트 상담 / 협업 제안
            </h2>
            <p className="mt-4 text-[1.02rem] leading-[1.8] text-neutral-600 break-keep">
              행사·예배·집회 기획과 운영이 필요하시면 범위와 일정만 먼저 알려 주세요.
            </p>
          </div>
          <CTAButton href="/inquiry" label="문의하기" size="lg" className="self-start shadow-none" />
        </div>
      </div>
    </section>
  );
}
