import { PageHero } from "@/components/PageHero";

export default function InquiryPage() {
  return (
    <>
      <PageHero
        eyebrow="프로젝트 문의"
        title="프로젝트 문의"
        subtitle="예배·집회·행사 기획과 운영이 필요하시면 이메일로 먼저 알려 주세요. 범위와 일정이 정리되지 않아도 괜찮습니다."
      />
      <section className="container-wide py-12 sm:py-16">
        <div className="max-w-[860px] rounded-[2rem] border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">문의 안내</p>
              <h2 className="mt-3 text-[1.5rem] leading-[1.18] font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[2rem]">
                아래 내용을 함께 보내주시면 더 빠르게 답변드릴 수 있습니다.
              </h2>
              <ul className="mt-6 space-y-3 text-[0.98rem] leading-[1.8] text-neutral-700 break-keep">
                <li>행사 또는 예배의 이름과 대략적인 성격</li>
                <li>희망 일정, 장소, 예상 규모</li>
                <li>기획, 운영, 무대·기술, 디지털 제작 중 필요한 범위</li>
              </ul>
            </div>

            <div className="rounded-[1.6rem] border border-neutral-200 bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">답변 기준</p>
              <p className="mt-3 text-[0.98rem] leading-[1.8] text-neutral-700 break-keep">
                평일 기준 24시간 내 1차 회신을 드리고 있습니다.
              </p>
              <a
                href="mailto:team.mablous@gmail.com"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                이메일로 문의하기
              </a>
              <p className="mt-4 text-[0.9rem] leading-[1.7] text-neutral-600 break-keep">team.mablous@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
