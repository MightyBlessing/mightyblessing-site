import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "이용약관",
  description: "마이티블레싱 웹사이트 이용에 관한 기본 운영 기준입니다.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="법률 안내"
        title="이용약관"
        subtitle="마이티블레싱 웹사이트 이용에 관한 기본 운영 기준입니다."
      />
      <div className="container-wide py-12 sm:py-16">
        <div className="max-w-[820px] space-y-10 text-[0.98rem] leading-[1.85] text-neutral-700 break-keep">
          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">1. 서비스 안내</h2>
            <p className="mt-3">
              본 웹사이트는 마이티블레싱의 프로젝트 소개, 포트폴리오 안내, 문의 접수를 목적으로 운영됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">2. 저작권</h2>
            <p className="mt-3">
              사이트 내 텍스트, 이미지, 영상, 포트폴리오 자료의 저작권은 별도 표기가 없는 한 마이티블레싱 또는 각 권리자에게 있습니다.
              사전 동의 없는 무단 복제와 재배포는 허용되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">3. 외부 링크</h2>
            <p className="mt-3">
              사이트에는 외부 블로그나 서비스로 연결되는 링크가 포함될 수 있습니다. 외부 사이트의 운영 및 정책에 대해서는 해당
              서비스의 기준을 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">4. 책임의 제한</h2>
            <p className="mt-3">
              사이트에 게시된 정보는 소개 목적이며, 개별 프로젝트 진행은 별도 협의와 계약을 통해 확정됩니다. 게시 정보만으로 발생한
              간접 손해에 대해서는 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[1.15rem] font-semibold text-neutral-950">5. 문의</h2>
            <p className="mt-3">
              서비스 이용과 관련한 문의는{" "}
              <a href="mailto:contact@mightyblessing.com" className="font-medium text-neutral-950 underline underline-offset-4">
                contact@mightyblessing.com
              </a>
              으로 보내주시면 안내드리겠습니다.
            </p>
          </section>

          <p className="border-t border-neutral-200 pt-6 text-[0.9rem] text-neutral-500">시행일: 2026년 3월 25일</p>
        </div>
      </div>
    </>
  );
}
