const items = [
  {
    number: "01",
    title: "예배·집회 기획·진행",
    desc: "온/오프라인 행사 기획과 진행, 수련회, 캠프, 컨퍼런스, 집회를 함께 만듭니다. 컨셉 회의부터 스탭 모집·운영까지 전체 기획 및 진행.",
  },
  {
    number: "02",
    title: "무대·접수·프로그램",
    desc: "무대 연출, 소품 제작·배치, 접수·숙소 관리, 레크레이션·코스게임·온라인 방탈출·토크 콘서트 등 프로그램 진행.",
  },
  {
    number: "03",
    title: "프로그래밍·서비스",
    desc: "온라인 방탈출, 수련회 등록 페이지, 예배 접수·관리 페이지, 웹사이트 제작 등 행사를 돕는 서비스를 만듭니다.",
  },
  {
    number: "04",
    title: "데이터·콘텐츠·뉴스레터",
    desc: "데이터 분석, CCM 분석, 마이티박스 뉴스레터 등 하나님을 흘려보내는 콘텐츠를 제작합니다.",
  },
  {
    number: "05",
    title: "조명·음향·중계",
    desc: "예배에 필요한 조명, 음향, 중계 등을 함께 준비합니다.",
  },
];

export function WhatWeDoSection() {
  return (
    <section className="border-t border-neutral-200 bg-white py-16 sm:py-20">
      <div className="container-wide">
        <div className="mb-10 max-w-[720px]">
          <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-neutral-400">
            What We Do
          </p>
          <h2 className="text-[1.5rem] leading-[1.35] font-bold tracking-tight text-neutral-900 break-keep sm:text-[2.2rem]">
            예배와 집회가 잘 열리도록 기획하고 운영합니다.
          </h2>
          <p className="mt-4 text-[1rem] leading-[1.7] text-neutral-500 break-keep">
            현장 오퍼레이션, 프로그램, 디지털 도구 제작까지 실제 진행이 끊기지 않도록 함께 설계합니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.title}
              className="group rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-colors hover:border-violet-200 hover:bg-white"
            >
              <div className="mb-5 flex items-center">
                <span className="text-[12px] font-medium tracking-[0.15em] text-violet-600">
                  {item.number}
                </span>
                <span className="ml-4 h-px flex-1 bg-neutral-200 transition-colors group-hover:bg-violet-100" />
              </div>
              <h3 className="mb-3 text-[1.05rem] font-bold tracking-tight text-neutral-900">
                {item.title}
              </h3>
              <p className="text-[14px] leading-[1.75] text-neutral-500 break-keep">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
