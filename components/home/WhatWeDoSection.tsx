const items = [
  {
    title: "예배·집회 기획·진행",
    desc: "온/오프라인 행사 기획과 진행, 수련회, 캠프, 컨퍼런스, 집회를 함께 만듭니다. 컨셉 회의부터 스탭 모집·운영까지 전체 기획 및 진행.",
  },
  {
    title: "무대·접수·프로그램",
    desc: "무대 연출, 소품 제작·배치, 접수·숙소 관리, 레크레이션·코스게임·온라인 방탈출·토크 콘서트 등 프로그램 진행.",
  },
  {
    title: "조명·음향·중계",
    desc: "예배에 필요한 조명, 음향, 중계 등을 함께 준비합니다.",
  },
  {
    title: "프로그래밍·서비스",
    desc: "온라인 방탈출, 수련회 등록 페이지, 예배 접수·관리 페이지, 웹사이트 제작 등 행사를 돕는 서비스를 만듭니다.",
  },
  {
    title: "데이터·콘텐츠·뉴스레터",
    desc: "데이터 분석, CCM 분석, 마이티박스 뉴스레터 등 하나님을 흘려보내는 콘텐츠를 제작합니다.",
  },
];

export function WhatWeDoSection() {
  return (
    <section className="py-16 dark:bg-gray-950/30 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">What We Do</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          예배와 집회가 잘 열리도록 기획·운영·현장 오퍼레이션을 담당합니다.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
