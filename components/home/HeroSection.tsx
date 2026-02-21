import { CTAButton } from "../CTAButton";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white py-20 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
          We Move, God Does
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          이제껏 없던 예배를 만듭니다
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          하나님과 함께 여태껏 세상에 없던 즐거움을 만들어갑니다. 예배/집회가 잘 열리도록 만드는 행정·기획·운영
          중심 기독교 플랫폼 팀입니다.
        </p>
        <div className="mt-10">
          <CTAButton href="/inquiry" label="프로젝트 문의하기" size="md" />
        </div>
      </div>
    </section>
  );
}
