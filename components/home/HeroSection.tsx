import { CTAButton } from "../CTAButton";

export function HeroSection() {
  return (
    <header className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#6A00FF]/10 blur-3xl pointer-events-none dark:bg-[#6A00FF]/20" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FF5421]/10 blur-3xl pointer-events-none dark:bg-[#FF5421]/20" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-[#6A00FF]">
          We Move, God Does
        </p>
        <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight text-[#111111] dark:text-white md:text-7xl">
          이제껏 없던{" "}
          <br className="md:hidden" />
          <span className="relative inline-block text-gradient">
            예배를 만듭니다
            <svg
              className="absolute -bottom-1 left-0 h-3 w-full opacity-70 text-[#FF5421]"
              preserveAspectRatio="none"
              viewBox="0 0 100 10"
              aria-hidden
            >
              <path d="M0,5 Q50,10 100,5" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-[#666666] dark:text-[#AAAAAA]">
          하나님과 함께 여태껏 세상에 없던 즐거움을 만들어갑니다.
          <br />
          예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀입니다.
        </p>
        <div className="mt-12">
          <CTAButton href="/inquiry" label="프로젝트 문의하기" size="lg" showArrow />
        </div>
      </div>
    </header>
  );
}
