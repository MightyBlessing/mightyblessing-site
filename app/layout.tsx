import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mighty Blessing | 이제껏 없던 예배를 만듭니다",
  description:
    "예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀. We Move, God Does.",
  openGraph: {
    title: "Mighty Blessing | 이제껏 없던 예배를 만듭니다",
    description: "예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
