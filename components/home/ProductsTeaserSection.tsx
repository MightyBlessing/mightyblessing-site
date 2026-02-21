import Link from "next/link";
import { CTAButton } from "../CTAButton";

const tiers = [
  { name: "Basic", desc: "운영 지원 / 현장 오퍼 중심" },
  { name: "Standard", desc: "기획 + 운영 + 운영매뉴얼·체크리스트" },
  { name: "Extended", desc: "기획 + 운영 + 콘텐츠·미디어 + 파트너 코디네이션" },
];

export function ProductsTeaserSection() {
  return (
    <section className="relative bg-[#F8F9FB] py-24 dark:bg-[#0F0F12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-black text-[#111111] dark:text-white md:text-4xl">
            Products
          </h2>
          <p className="text-[#666666] dark:text-[#AAAAAA]">맞춤 패키지로 문의해 주세요.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="flex h-full flex-col justify-between rounded-2xl border-2 border-transparent bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#6A00FF] dark:bg-[#1E1E24]"
            >
              <div>
                <h3 className="mb-4 text-xl font-bold text-[#111111] dark:text-white">{t.name}</h3>
                <p className="text-sm text-[#666666] dark:text-[#AAAAAA]">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="rounded-full bg-[#6A00FF] px-8 py-3 font-bold text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            자세히 보기
          </Link>
          <CTAButton href="/inquiry" label="문의하기" size="md" />
        </div>
      </div>
    </section>
  );
}
