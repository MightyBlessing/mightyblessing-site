import { getAdminAuthConfig, getGoogleOAuthConfig, isDevelopmentLoginEnabled } from "@/lib/admin/env";
import { adminLoginDestination } from "@/lib/admin/redirect";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  config: "Google 로그인 설정이 준비되지 않았습니다. 운영 담당자에게 설정 확인을 요청해 주세요.",
  state: "로그인 요청이 만료됐습니다. 다시 시도해 주세요.",
  cancelled: "Google 로그인을 취소했습니다.",
  not_allowed: "관리자로 등록되지 않은 계정입니다. 회사 Google 계정으로 로그인했는지 확인하고, 계속 안 되면 운영 담당자에게 등록을 요청해 주세요.",
  busy: "로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
  failed: "Google 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = adminLoginDestination(params.next);
  const googleReady = Boolean(getAdminAuthConfig() && getGoogleOAuthConfig());
  const error = params.error ? errorMessages[params.error] || errorMessages.failed : "";

  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="container-wide py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Admin</p>
            <h1 className="mt-4 max-w-[10ch] text-[2.3rem] leading-[0.96] font-semibold tracking-[-0.055em] text-white sm:text-[3.5rem]">
              사이트 콘텐츠를
              <br />
              직접 관리하는
              <br />
              관리자 화면
            </h1>
            <p className="mt-6 max-w-[38rem] text-[1rem] leading-[1.85] text-white/68 break-keep">
              프로젝트와 제품 소개, 이미지와 영상을 관리합니다.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            {error && <p role="alert" className="mb-5 text-[0.92rem] leading-[1.7] text-[#ffb1b1] break-keep">{error}</p>}
            {googleReady ? (
              <>
                <a
                  href={`/api/admin/auth/google/start?next=${encodeURIComponent(next)}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#a9bcff] px-5 py-3 text-[0.95rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff]"
                >
                  Google 계정으로 로그인
                </a>
                <p className="mt-4 text-[0.88rem] leading-[1.7] text-white/56 break-keep">회사 Google 계정 중 관리자로 등록된 계정만 들어올 수 있습니다.</p>
              </>
            ) : !isDevelopmentLoginEnabled() && (
              <p role="status" className="text-white/78 break-keep">
                관리자 인증 설정이 준비되지 않아 로그인할 수 없습니다. 운영 담당자에게 설정 확인을 요청해 주세요.
              </p>
            )}
            {isDevelopmentLoginEnabled() && (
              <form method="post" action={`/api/admin/auth/dev?next=${encodeURIComponent(next)}`} className={googleReady ? "mt-6 border-t border-white/10 pt-6" : undefined}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/16 px-5 py-3 text-[0.95rem] font-medium text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  로컬 개발용으로 로그인
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
