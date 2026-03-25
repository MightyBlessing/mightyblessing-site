import Link from "next/link";

const links = [
  { label: "홈", href: "/" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "문의", href: "/inquiry" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 pb-12 pt-16 text-neutral-300">
      <div className="container-wide">
        <div className="mb-12 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="mb-3 text-[15px] font-semibold uppercase tracking-[0.15em] text-white">MightyBlessing</p>
            <p className="break-keep text-[15px] leading-[1.8] text-neutral-300">
              예배와 집회가 잘 열리도록 기획하고 운영합니다.
              <br />
              현장 운영과 디지털 제작을 함께 맡는 팀입니다.
            </p>
            <a
              href="mailto:team.mablous@gmail.com"
              className="mt-5 inline-flex text-[14px] font-medium text-white transition-colors hover:text-neutral-200"
            >
              team.mablous@gmail.com
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-neutral-300">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8">
          <p className="text-[12px] uppercase tracking-[0.1em] text-neutral-500">
            © {new Date().getFullYear()} Mighty Blessing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
