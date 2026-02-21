import Link from "next/link";
import { CTAButton } from "../CTAButton";

const tiers = [
  { name: "Basic", desc: "운영 지원 / 현장 오퍼 중심" },
  { name: "Standard", desc: "기획 + 운영 + 운영매뉴얼·체크리스트" },
  { name: "Extended", desc: "기획 + 운영 + 콘텐츠/미디어 + 파트너 코디네이션" },
];

export function ProductsTeaserSection() {
  return (
    <section className="border-t border-gray-200 py-16 dark:border-gray-800 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Products</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">맞춤 패키지로 문의해 주세요.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.name}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CTAButton href="/products" label="자세히 보기" />
          <CTAButton href="/inquiry" label="문의하기" />
        </div>
      </div>
    </section>
  );
}
