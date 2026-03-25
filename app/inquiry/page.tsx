import { PageHero } from "@/components/PageHero";

export default function InquiryPage() {
  return (
    <>
      <PageHero
        eyebrow="Project Inquiry"
        title="프로젝트 문의"
        subtitle="행사·예배·집회 기획·운영 문의를 남겨 주시면 빠르게 연락드리겠습니다."
      />
      <section className="container-wide py-12 sm:py-16">
        <div className="max-w-[720px] rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <p className="text-[1rem] leading-[1.75] text-neutral-500 break-keep">
            문의 폼은 아직 준비 중입니다. 지금은 아래 비활성 버튼으로 상태만 안내하고, 실제 문의는 이메일로 받고 있어요.
          </p>
          <div className="mt-8">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-neutral-200 px-6 py-3 font-semibold text-neutral-500"
            >
              문의 폼 준비 중
            </button>
          </div>
          <p className="mt-6 text-[14px] leading-[1.7] text-neutral-500 break-keep">
            폼이 준비되기 전에는 이메일로 문의해 주세요:{" "}
            <a href="mailto:team.mablous@gmail.com" className="font-medium text-violet-700 hover:underline">
            team.mablous@gmail.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
