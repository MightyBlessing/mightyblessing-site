import { InquiryForm } from "@/components/inquiry/InquiryForm";

export default function InquiryPage() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[16%] w-[24%] bg-white/[0.022]" />
        <div className="absolute inset-y-0 left-[44%] hidden w-[22%] bg-white/[0.016] lg:block" />
        <div className="absolute inset-y-0 right-0 w-[18%] bg-white/[0.02]" />
        <div className="absolute inset-y-0 left-[16%] w-px bg-white/6" />
        <div className="absolute inset-y-0 left-[44%] hidden w-px bg-white/6 lg:block" />
        <div className="absolute inset-y-0 right-[18%] w-px bg-white/6" />
      </div>

      <div className="container-wide relative py-16 sm:py-20">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/48">프로젝트 문의</p>
        <h1 className="max-w-[920px] text-[2.05rem] leading-[1.16] font-semibold tracking-[-0.045em] text-white break-keep sm:text-[3.2rem]">
          프로젝트 문의
        </h1>
        <p className="mt-4 max-w-[760px] text-[1.02rem] leading-[1.8] text-white/68 break-keep sm:text-[1.12rem]">
          예배·집회·행사 기획과 운영이 필요하시면 이메일로 먼저 알려 주세요.
          <br className="hidden sm:block" />
          범위와 일정이 정리되지 않아도 괜찮습니다.
        </p>

        <section className="pt-12 sm:pt-16">
          <div className="border-t border-white/10 pt-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-start">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">문의 안내</p>
                <h2 className="mt-3 max-w-[580px] text-[1.5rem] leading-[1.18] font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">
                  아래 내용을 함께 보내주시면 더 빠르게 답변드릴 수 있습니다.
                </h2>

                <div className="mt-8 border-t border-white/10">
                  <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">행사 성격</p>
                    <p className="text-[0.98rem] leading-[1.8] text-white/74 break-keep">
                      행사 또는 예배의 이름과 대략적인 성격
                    </p>
                  </div>
                  <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">기본 정보</p>
                    <p className="text-[0.98rem] leading-[1.8] text-white/74 break-keep">
                      희망 일정, 장소, 예상 규모
                    </p>
                  </div>
                  <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">필요 범위</p>
                    <p className="text-[0.98rem] leading-[1.8] text-white/74 break-keep">
                      기획, 운영, 무대·기술, 디지털 제작 중 필요한 범위
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                <div className="border-b border-white/10 pb-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">답변 기준</p>
                  <p className="mt-3 text-[0.98rem] leading-[1.8] text-white/72 break-keep">
                    평일 기준 24시간 내 1차 회신을 드리고 있습니다.
                  </p>
                </div>

                <div className="border-b border-white/10 py-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">이메일</p>
                  <p className="mt-3 text-[1rem] leading-[1.7] text-white/82 break-keep">contact@mightyblessing.com</p>
                </div>

                <div className="pt-6">
                  <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">문의 폼</p>
                  <InquiryForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
