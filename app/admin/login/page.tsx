import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminAuthConfig } from "@/lib/admin/env";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Admin</p>
            <h1 className="mt-4 max-w-[10ch] text-[2.3rem] leading-[0.96] font-semibold tracking-[-0.055em] text-white sm:text-[3.5rem]">
              포트폴리오를
              <br />
              직접 관리하는
              <br />
              관리자 화면
            </h1>
            <p className="mt-6 max-w-[38rem] text-[1rem] leading-[1.85] text-white/68 break-keep">
              포트폴리오 글, 태그, 대표 프로젝트 노출, 이미지와 영상까지 한 곳에서 관리할 수 있도록 구성합니다.
            </p>
          </div>

          {getAdminAuthConfig() ? <LoginForm next={params.next} /> : (
            <p role="status" className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 text-white/78 sm:p-7">
              관리자 인증 설정이 준비되지 않아 로그인할 수 없습니다. 운영 담당자에게 설정 확인을 요청해 주세요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
