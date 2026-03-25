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
    <section className="border-t border-neutral-200 bg-white py-16 sm:py-20">
      <div className="container-wide">
        <div className="mb-10 max-w-[720px]">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">우리가 하는 일</p>
          <h2 className="text-[1.7rem] leading-[1.22] font-semibold tracking-[-0.045em] text-neutral-950 break-keep sm:text-[2.5rem]">
            예배와 집회가 잘 열리도록 기획하고 운영합니다.
          </h2>
          <p className="mt-4 text-[1.02rem] leading-[1.8] text-neutral-600 break-keep">
            역할을 잘게 나누기보다, 실제 현장에서 반드시 필요한 단위로 다시 정리했습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.title}
              className="group rounded-[1.5rem] border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300"
            >
              <div className="mb-5 flex items-center">
                <span className="text-[12px] font-semibold tracking-[0.15em] text-neutral-500">{item.number}</span>
                <span className="ml-4 h-px flex-1 bg-neutral-200 transition-colors group-hover:bg-neutral-300" />
              </div>
              <h3 className="mb-3 text-[1.12rem] font-semibold tracking-[-0.03em] text-neutral-950">{item.title}</h3>
              <p className="text-[15px] leading-[1.8] text-neutral-600 break-keep">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
