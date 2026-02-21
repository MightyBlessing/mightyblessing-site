import { PageHero } from "@/components/PageHero";
import { CTAButton } from "@/components/CTAButton";

// MVP: 외부 폼 링크. 실제 Google Form/Typeform URL로 교체하세요.
const INQUIRY_FORM_URL = "https://docs.google.com/forms/d/e/your-form-id/viewform";

export default function InquiryPage() {
  return (
    <>
      <PageHero
        title="Project Inquiry"
        subtitle="행사·예배·집회 기획·운영 문의를 남겨 주시면 빠르게 연락드리겠습니다."
      />
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <p className="text-gray-600 dark:text-gray-400">
          아래 버튼을 누르면 문의 폼으로 이동합니다. 이름, 소속, 연락처, 프로젝트 유형, 내용을 적어 주세요.
        </p>
        <div className="mt-8">
          <a
            href={INQUIRY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:bg-brand-secondary"
          >
            문의 폼 열기
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          폼이 준비되기 전에는 이메일로 문의해 주세요:{" "}
          <a href="mailto:team.mablous@gmail.com" className="text-brand-primary hover:underline dark:text-brand-secondary">
            team.mablous@gmail.com
          </a>
        </p>
      </div>
    </>
  );
}
