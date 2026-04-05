import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "서비스",
  description:
    "마이티블레싱이 직접 운영하며 다듬은 교회 행사 운영 플랫폼과 예배 자막 준비 도구를 소개합니다.",
  path: "/services",
  keywords: ["교회 행사 플랫폼", "예배 자막", "행사 운영 서비스", "교회 운영 도구"],
});

const services = [
  {
    name: "포도나무",
    englishName: "GrapeTree",
    href: "https://grapetree.kr/",
    eyebrow: "교회 행사 운영 플랫폼",
    summary:
      "교회와 단체 행사의 신청, 입금 확인, 참가자 관리, QR 체크인을 한 곳에서 운영할 수 있도록 만든 서비스입니다.",
    description:
      "복잡한 행사 운영 흐름을 한 화면 안에서 정리하고, 신청부터 현장 체크인까지 끊기지 않도록 설계했습니다.",
    previewType: "grapetree",
    accent: "from-[#a9bcff] via-[#d1ddff] to-white",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(169,188,255,0.24),transparent_55%),linear-gradient(180deg,#101217_0%,#171a22_100%)]",
    tags: ["행사 신청", "입금 확인", "참가자 관리", "QR 체크인"],
  },
  {
    name: "TwoLine",
    englishName: "TwoLineLyrics",
    href: "https://twoline.kr/",
    eyebrow: "예배곡 탐색과 두 줄 자막 준비",
    summary:
      "제목, 아티스트, 코러스 첫 줄, verse 첫 줄 중심으로 예배곡을 찾고 자막 미리보기와 export까지 빠르게 이어지는 서비스입니다.",
    description:
      "예배 자막 준비 흐름을 더 빠르게 만들기 위해 검색, 미리보기, TXT·PNG·ProPresenter XML export를 한 번에 연결했습니다.",
    previewType: "twoline",
    accent: "from-[#7da6ff] via-[#c6d7ff] to-white",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(125,166,255,0.26),transparent_52%),linear-gradient(180deg,#0d1118_0%,#151a23_100%)]",
    tags: ["곡 검색", "두 줄 자막", "미리보기", "XML Export"],
  },
];

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

function GrapeTreePreview() {
  return (
    <div className="mt-8 flex min-h-[21rem] overflow-hidden rounded-[1.45rem] border border-white/10 bg-black/20 p-5 sm:min-h-[22rem] sm:p-6">
      <div className="flex h-full w-full flex-col rounded-[1.2rem] border border-[#d7def2] bg-[linear-gradient(180deg,#eef4ff_0%,#dde7fa_100%)] p-4 shadow-[0_18px_36px_rgba(18,28,52,0.14)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#ff8f88]" />
            <span className="size-2.5 rounded-full bg-[#ffd66e]" />
            <span className="size-2.5 rounded-full bg-[#7bd48b]" />
          </div>
          <p className="text-[0.76rem] font-medium tracking-[0.08em] text-[#62708f]">grapetree.kr</p>
        </div>

        <div className="mt-4 rounded-[1rem] bg-[radial-gradient(circle_at_top_left,rgba(167,189,255,0.32),transparent_36%),linear-gradient(135deg,#202c46_0%,#121826_100%)] px-4 py-4 text-white">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/52">Church Events</p>
          <h3 className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em]">
            다양한 행사 정보를 보고
            <br />
            바로 신청하는 홈 화면
          </h3>
          <div className="mt-4 rounded-[0.95rem] border border-white/10 bg-white/10 px-3 py-2.5 text-[0.8rem] text-white/60">
            교회, 단체명 또는 행사 이름으로 찾아보세요
          </div>
        </div>

        <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-[#d8e1f4] bg-white p-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8090b3]">Featured Event</p>
            <h4 className="mt-2 text-[0.96rem] font-semibold tracking-[-0.03em] text-[#1d2743]">
              2026 Spring Worship Camp
            </h4>
            <p className="mt-2 text-[0.8rem] leading-[1.6] text-[#5b6788]">
              대표 행사 카드와 핵심 정보가 첫 화면에서 바로 보이도록 구성했습니다.
            </p>
          </div>

          <div className="rounded-[1rem] border border-[#d8e1f4] bg-white p-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8090b3]">Quick Flow</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["행사 탐색", "상세 확인", "간편 신청"].map((item, index) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-[#eef3ff] px-3 py-1.5 text-[0.74rem] font-medium text-[#4460a7]"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[0.68rem] font-semibold text-[#4460a7]">
                    {index + 1}
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoLinePreview() {
  return (
    <div className="mt-8 flex min-h-[21rem] overflow-hidden rounded-[1.45rem] border border-white/10 bg-black/20 p-5 sm:min-h-[22rem] sm:p-6">
      <div className="flex h-full w-full flex-col rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.08] text-[0.8rem] font-semibold text-white">
            2L
          </span>
          <div>
            <p className="text-[0.88rem] font-semibold text-white">TwoLine Search</p>
            <p className="text-[0.77rem] text-white/55">곡 제목, 아티스트, 가사 첫 줄 중심 검색</p>
          </div>
        </div>
        <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.9rem] text-white/48">
          곡 제목, 가수명, 단체명 또는 가사를 입력하세요
        </div>
        <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Preview</p>
            <p className="mt-2 text-[0.88rem] leading-[1.6] text-white/70">
              두 줄 자막 미리보기와 export 흐름을 한 번에 연결합니다.
            </p>
          </div>
          <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Export</p>
            <p className="mt-2 text-[0.88rem] leading-[1.6] text-white/70">
              TXT, PNG, ProPresenter XML까지 바로 이어지는 구조입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[14%] w-[24%] bg-white/[0.02]" />
        <div className="absolute inset-y-0 left-[42%] hidden w-[22%] bg-white/[0.015] lg:block" />
        <div className="absolute inset-y-0 right-0 w-[20%] bg-white/[0.018]" />
        <div className="absolute inset-y-0 left-[14%] w-px bg-white/6" />
        <div className="absolute inset-y-0 left-[42%] hidden w-px bg-white/6 lg:block" />
        <div className="absolute inset-y-0 right-[20%] w-px bg-white/6" />
      </div>

      <div className="container-wide relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end lg:gap-14">
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">서비스</p>
            <h1 className="max-w-[10ch] text-[2.4rem] leading-[0.94] font-semibold tracking-[-0.06em] text-white sm:text-[3.7rem] lg:text-[5rem]">
              예배를 돕는
              <br />
              도구를
              <br />
              만듭니다
            </h1>
          </div>

          <div className="max-w-[42rem] lg:justify-self-end">
            <p className="text-[1rem] leading-[1.86] text-white/70 break-keep sm:text-[1.08rem]">
              현장 운영에서 실제로 반복되는 문제를 줄이기 위해 웹서비스도 함께 만들고 있습니다. 행사 운영,
              참가자 관리, 예배곡 탐색과 자막 준비처럼 팀이 자주 마주하는 흐름을 서비스로 정리했습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.84rem] font-medium text-white/76">
                운영 도구
              </span>
              <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.84rem] font-medium text-white/76">
                예배 워크플로우
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {services.map((service, index) => (
            <a
              key={service.name}
              href={service.href}
              target="_blank"
              rel="noreferrer"
              className="group block h-full"
            >
              <article
                className={`flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 ${service.panelClassName}`}
              >
                <div className="relative overflow-hidden border-b border-white/10 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-h-[6.8rem] sm:min-h-[7.5rem]">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                        {service.eyebrow}
                      </p>
                      <h2 className="mt-4 text-[1.9rem] leading-[1.02] font-semibold tracking-[-0.055em] text-white sm:text-[2.4rem]">
                        {service.name}
                      </h2>
                      <p className={`mt-2 text-[0.88rem] font-medium ${index === 0 ? "text-[#c6d5ff]" : "text-[#bfd2ff]"}`}>
                        {service.englishName}
                      </p>
                    </div>
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/72 transition-colors group-hover:bg-white/[0.1] group-hover:text-white">
                      <ExternalIcon />
                    </span>
                  </div>

                  {service.previewType === "grapetree" ? <GrapeTreePreview /> : <TwoLinePreview />}
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p
                    className="min-h-[5.9rem] text-[1.02rem] leading-[1.82] text-white/80 break-keep sm:min-h-[6.3rem] sm:text-[1.06rem]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {service.summary}
                  </p>
                  <p
                    className="mt-4 min-h-[5.3rem] text-[0.95rem] leading-[1.8] text-white/60 break-keep sm:min-h-[5.6rem]"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {service.description}
                  </p>

                  <div className="mt-6 min-h-[4.75rem] content-start flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={`${service.name}-${tag}`}
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.8rem] font-medium text-white/72"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">바로 이동</p>
                      <p className="mt-2 text-[0.96rem] leading-[1.7] text-white/76 break-all">{service.href}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full bg-gradient-to-r px-4 py-2 text-[0.86rem] font-semibold text-[#132042] transition-transform group-hover:translate-x-1 ${service.accent}`}
                    >
                      서비스 열기
                    </span>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
