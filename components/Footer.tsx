import Link from "next/link";

const email = "team.mablous@gmail.com";
const instagram = "https://instagram.com/mightyblessing_";
const studioNote = "마이티 스튜디오, 둔촌동역에서 걸어 올 수 있어요.";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Contact
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              <a href={`mailto:${email}`} className="hover:text-brand-primary dark:hover:text-brand-secondary">
                {email}
              </a>
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{studioNote}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">SNS</h3>
            <p className="mt-2">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-brand-primary dark:text-gray-300 dark:hover:text-brand-secondary"
              >
                Instagram @mightyblessing_
              </a>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Legal</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-brand-primary dark:hover:text-brand-secondary">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-primary dark:hover:text-brand-secondary">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Mighty Blessing</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
