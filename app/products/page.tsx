import { PageHero } from "@/components/PageHero";
import { CTAButton } from "@/components/CTAButton";

const tiers = [
  {
    name: "Basic",
    desc: "운영 지원 / 현장 오퍼 중심",
    points: ["현장 오퍼레이션", "접수·안내 지원", "당일 스태프 코디네이션"],
  },
  {
    name: "Standard",
    desc: "기획 + 운영 + 운영매뉴얼·체크리스트",
    points: ["Basic 포함", "전체 기획·일정 관리", "운영 매뉴얼·체크리스트 제작", "스탭 교육·배치"],
  },
  {
    name: "Extended",
    desc: "기획 + 운영 + 콘텐츠·미디어 + 파트너 코디네이션",
    points: ["Standard 포함", "콘텐츠·미디어 기획·제작", "파트너 코디네이션", "디지털 도구 연동"],
  },
];

const faqs = [
  { q: "견적은 어떻게 받나요?", a: "프로젝트 규모·기간·범위를 알려주시면 맞춤 견적을 안내해 드립니다. 문의 폼에서 간단히 적어 주세요." },
  { q: "진행 기간은 얼마나 걸리나요?", a: "행사 규모와 준비 상황에 따라 다릅니다. 최소 2주 전부터 협의를 권장합니다." },
  { q: "협업 방식은 어떻게 되나요?", a: "온라인 미팅과 문서 공유로 진행하며, 필요 시 현장 미팅도 가능합니다." },
  { q: "준비해 주셔야 할 것은 있나요?", a: "행사 목적·일정·예산 범위·담당자 연락처를 미리 정리해 주시면 빠르게 시작할 수 있습니다." },
];

const projectLinks = [
  { label: "뉴스레터 - 마이티박스", href: "https://maily.so/mightybox" },
  { label: "마이티 스튜디오", href: "https://hy-space.notion.site/27b69af7c7c240d3805f2b52394f089a" },
  { label: "당신을 마블의 여정에 (함께할 멤버)", href: "https://hy-space.notion.site/2ef75aa8d3e34472835330f774e61887" },
];

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Products"
        subtitle="예배·집회 기획·운영 패키지와 서비스를 소개합니다. 문의를 통해 맞춤 견적을 안내해 드립니다."
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Overview</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            우리는 찬양팀이 아니라, 예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀입니다.
            대형 프로젝트 운영 경험과 실무형 시스템·체크리스트를 바탕으로 맞춤 패키지를 제공합니다.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Packages (3-tier)</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">가격은 문의 시 견적해 드립니다.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="text-brand-primary dark:text-brand-secondary">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What&apos;s Included</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            패키지별로 기획 회의, 일정·체크리스트 정리, 현장 오퍼레이션, 사후 회고·자료 정리가 포함됩니다.
            Extended에서는 콘텐츠 기획·제작, 파트너사 코디네이션, 디지털 도구 연동이 추가됩니다.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h2>
          <ul className="mt-6 space-y-6">
            {faqs.map((f) => (
              <li key={f.q}>
                <h3 className="font-medium text-gray-900 dark:text-white">{f.q}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects &amp; Services</h2>
          <ul className="mt-4 space-y-2">
            {projectLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline dark:text-brand-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 flex flex-wrap gap-4 border-t border-gray-200 pt-10 dark:border-gray-800">
          <CTAButton href="/inquiry" label="문의하기" />
        </section>
      </div>
    </>
  );
}
