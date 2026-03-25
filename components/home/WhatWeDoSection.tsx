const items = [
  {
    number: "01",
    title: "기획",
    desc: "행사와 예배의 컨셉, 일정, 동선, 운영 구조를 처음부터 함께 설계합니다.",
  },
  {
    number: "02",
    title: "현장 운영",
    desc: "스태프 배치, 접수와 안내, 프로그램 진행까지 현장에서 필요한 운영을 정리합니다.",
  },
  {
    number: "03",
    title: "무대·기술",
    desc: "무대 연출, 조명, 음향, 중계처럼 현장 분위기와 안정성을 좌우하는 기술 파트를 함께 맞춥니다.",
  },
  {
    number: "04",
    title: "디지털 제작",
    desc: "등록 페이지, 운영용 웹서비스, 필요한 디지털 도구를 만들어 현장과 온라인을 연결합니다.",
  },
];

export function WhatWeDoSection() {
  return (
    <section className="border-t border-neutral-800 bg-neutral-950 py-16 text-white sm:py-20">
      <div className="container-wide">
        <div className="max-w-[840px]">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/48">우리가 하는 일</p>
          <h2 className="text-[1.7rem] leading-[1.15] font-semibold tracking-[-0.045em] text-white break-keep sm:text-[2.7rem]">
            예배와 집회가
            <br className="hidden sm:block" />
            잘 열리도록 기획하고 운영합니다.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="group flex h-full flex-col rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-white/18 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex items-center">
                <span className="text-[1.65rem] leading-none font-semibold tracking-[-0.04em] text-violet-300">
                  {item.number}
                </span>
                <span className="ml-4 h-px flex-1 bg-white/10 transition-colors group-hover:bg-white/22" />
              </div>
              <h3 className="min-h-[2.8rem] text-[1.1rem] leading-[1.2] font-semibold tracking-[-0.03em] text-white">
                {item.title}
              </h3>
              <p className="mt-4 text-[14px] leading-[1.72] text-white/68 break-keep">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
