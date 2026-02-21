import Link from "next/link";

const email = "team.mablous@gmail.com";
const instagram = "https://instagram.com/mightyblessing_";
const studioNote = "마이티 스튜디오, 둔촌동역에서 걸어 올 수 있어요.";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F8F9FB] py-12 dark:border-gray-800 dark:bg-[#0F0F12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#AAAAAA]">
              Contact
            </h4>
            <p className="mb-2 text-sm text-[#111111] dark:text-[#EEEEEE]">
              <a href={`mailto:${email}`} className="transition-colors hover:text-[#6A00FF]">
                {email}
              </a>
            </p>
            <p className="text-sm text-[#666666] dark:text-[#AAAAAA]">{studioNote}</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#AAAAAA]">
              SNS
            </h4>
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#111111] transition-colors hover:text-[#6A00FF] dark:text-[#EEEEEE] dark:hover:text-[#6A00FF]"
            >
              Instagram @mightyblessing_
            </a>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#AAAAAA]">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-[#111111] transition-colors hover:text-[#6A00FF] dark:text-[#EEEEEE] dark:hover:text-[#6A00FF]">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[#111111] transition-colors hover:text-[#6A00FF] dark:text-[#EEEEEE] dark:hover:text-[#6A00FF]">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:text-right">
            <p className="mt-8 text-xs text-[#666666] dark:text-[#AAAAAA] md:mt-0">
              © {new Date().getFullYear()} Mighty Blessing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
