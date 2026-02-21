import { CTAButton } from "../CTAButton";

export function FinalCTASection() {
  return (
    <section className="border-t border-gray-200 py-16 dark:border-gray-800 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          프로젝트 상담 / 협업 제안
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
          행사·예배·집회 기획·운영이 필요하시면 편하게 문의해 주세요.
        </p>
        <div className="mt-8">
          <CTAButton href="/inquiry" label="문의하기" size="md" />
        </div>
      </div>
    </section>
  );
}
