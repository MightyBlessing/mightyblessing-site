import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

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
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F8F9FB] dark:bg-[#0F0F12] text-[#111111] dark:text-[#EEEEEE]">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
