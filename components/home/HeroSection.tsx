import { CTAButton } from "../CTAButton";

export function HeroSection() {
  return (
    <header className="bg-white">
      <div className="container-wide py-16 sm:py-20">
        <p className="mb-5 text-[12px] uppercase tracking-[0.15em] text-neutral-400">
          We Move, God Does
        </p>
        <h1 className="max-w-[920px] text-[2rem] leading-[1.2] font-bold tracking-tight text-neutral-900 break-keep sm:text-[3.8rem]">
          이제껏 없던
          <br className="hidden sm:block" />
          <span className="relative inline-block">
            예배를 만듭니다
            <span
              className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-[2px] bg-violet-100"
              aria-hidden="true"
            />
          </span>
        </h1>
        <p className="mt-5 max-w-[720px] text-[1rem] leading-[1.75] text-neutral-500 break-keep sm:text-[1.1rem]">
          하나님과 함께 여태껏 세상에 없던 즐거움을 만들어갑니다.
          <br />
          예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀입니다.
        </p>
        <div className="mt-10">
          <CTAButton
            href="/inquiry"
            label="프로젝트 문의하기"
            size="lg"
            showArrow
            className="shadow-none"
          />
        </div>
      </div>
    </header>
  );
}
