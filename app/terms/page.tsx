import { PageHero } from "@/components/PageHero";

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="이용약관" />
      <div className="container-wide py-12 sm:py-16">
        <p className="max-w-[720px] text-[1rem] leading-[1.8] text-neutral-500">
          이용약관 내용을 이곳에 작성해 주세요. (간단한 버전으로 운영 가능)
        </p>
      </div>
    </>
  );
}
