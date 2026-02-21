import { CTAButton } from "../CTAButton";

export function FinalCTASection() {
  return (
    <section className="bg-white py-24 dark:bg-[#1E1E24]">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-3xl font-black text-[#111111] dark:text-white md:text-4xl">
          프로젝트 상담 / 협업 제안
        </h2>
        <p className="mb-10 text-lg text-[#666666] dark:text-[#AAAAAA]">
          행사·예배·집회 기획·운영이 필요하시면 편하게 문의해 주세요.
        </p>
        <CTAButton
          href="/inquiry"
          label="문의하기"
          className="shadow-xl shadow-[#6A00FF]/30 hover:scale-105"
          size="lg"
        />
      </div>
    </section>
  );
}
