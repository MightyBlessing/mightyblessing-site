import { PageHero } from "@/components/PageHero";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="법률 안내"
        title="개인정보 처리방침"
        subtitle="마이티블레싱은 문의 대응에 필요한 최소한의 개인정보만 처리합니다."
      />
      <div className="container-wide py-12 sm:py-16">
        <div className="max-w-[820px] space-y-10 text-[0.98rem] leading-[1.85] text-neutral-700 break-keep">
          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">1. 수집하는 정보</h2>
            <p className="mt-3">
              문의 이메일을 통해 이름, 소속, 연락처, 프로젝트 관련 정보와 같이 상담에 필요한 내용을 받을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">2. 이용 목적</h2>
            <p className="mt-3">
              수집한 정보는 프로젝트 문의 확인, 상담 진행, 회신 및 협업 제안 검토를 위해서만 사용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">3. 보관 기간</h2>
            <p className="mt-3">
              상담이 종료된 후 관련 기록은 최대 12개월까지 보관할 수 있으며, 법령상 보관 의무가 없는 경우 그 이후에는 지체 없이
              삭제합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">4. 제3자 제공</h2>
            <p className="mt-3">법령에 따른 경우를 제외하고, 사전 동의 없이 개인정보를 외부에 제공하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">5. 문의처</h2>
            <p className="mt-3">
              개인정보 처리에 관한 문의는{" "}
              <a href="mailto:contact@mightyblessing.com" className="font-medium text-neutral-950 underline underline-offset-4">
                contact@mightyblessing.com
              </a>
              으로 보내주시면 확인 후 안내드리겠습니다.
            </p>
          </section>

          <p className="border-t border-neutral-200 pt-6 text-[0.9rem] text-neutral-500">시행일: 2026년 3월 25일</p>
        </div>
      </div>
    </>
  );
}
