import Link from "next/link";

const links = [
  { label: "홈", href: "/" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-neutral-950 pb-12 pt-16 text-neutral-400">
      <div className="container-wide">
        <div className="mb-14 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.15em] text-white">MightyBlessing</p>
            <p className="max-w-xs break-keep text-[13px] leading-[1.7] text-neutral-500">
              예배가 예배되게, 행사가 은혜롭게.
              <br />
              마이티블레싱 팀의 이야기와 노하우를 나눕니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-neutral-500">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8">
          <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-600">
            © {new Date().getFullYear()} Mighty Blessing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
