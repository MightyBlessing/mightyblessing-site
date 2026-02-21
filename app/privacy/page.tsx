import { PageHero } from "@/components/PageHero";

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="개인정보 처리방침" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-gray-600 dark:text-gray-400">
          개인정보 처리방침 내용을 이곳에 작성해 주세요. (간단한 버전으로 운영 가능)
        </p>
      </div>
    </>
  );
}
