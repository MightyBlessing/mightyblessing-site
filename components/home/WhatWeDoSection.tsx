const items = [
  {
    title: "예배·집회 기획·진행",
    desc: "온/오프라인 행사 기획과 진행, 수련회, 캠프, 컨퍼런스, 집회를 함께 만듭니다. 컨셉 회의부터 스탭 모집·운영까지 전체 기획 및 진행.",
    icon: "event_note",
    colorClass: "bg-[#6A00FF]/10 text-[#6A00FF]",
  },
  {
    title: "무대·접수·프로그램",
    desc: "무대 연출, 소품 제작·배치, 접수·숙소 관리, 레크레이션·코스게임·온라인 방탈출·토크 콘서트 등 프로그램 진행.",
    icon: "theater_comedy",
    colorClass: "bg-[#FF5421]/10 text-[#FF5421]",
  },
  {
    title: "프로그래밍·서비스",
    desc: "온라인 방탈출, 수련회 등록 페이지, 예배 접수·관리 페이지, 웹사이트 제작 등 행사를 돕는 서비스를 만듭니다.",
    icon: "code",
    colorClass: "bg-[#00C200]/10 text-[#00C200]",
  },
  {
    title: "데이터·콘텐츠·뉴스레터",
    desc: "데이터 분석, CCM 분석, 마이티박스 뉴스레터 등 하나님을 흘려보내는 콘텐츠를 제작합니다.",
    icon: "analytics",
    colorClass: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "조명·음향·중계",
    desc: "예배에 필요한 조명, 음향, 중계 등을 함께 준비합니다.",
    icon: "mic_external_on",
    colorClass: "bg-yellow-500/10 text-yellow-500",
  },
];

export function WhatWeDoSection() {
  return (
    <section className="bg-white py-20 dark:bg-[#1E1E24]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-black text-[#111111] dark:text-white md:text-4xl">
            What We Do
          </h2>
          <p className="text-[#666666] dark:text-[#AAAAAA]">
            예배와 집회가 잘 열리도록 기획·운영·현장 오퍼레이션을 담당합니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-transparent bg-[#F8F9FB] p-8 transition-all duration-300 hover:border-[#6A00FF]/20 hover:shadow-2xl hover:shadow-[#6A00FF]/10 dark:bg-[#0F0F12]"
            >
              <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full ${item.colorClass} transition-transform group-hover:scale-110`}
              >
                <span className="material-icons-outlined text-2xl">{item.icon}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#111111] dark:text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#666666] dark:text-[#AAAAAA]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
