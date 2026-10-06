import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { siteDescription, siteName, siteNameKo, siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo";
import { getAllPortfolios } from "@/lib/content";
import { selectRailProjects } from "@/lib/project-presentation";
import { motionVariables } from "@/lib/motion";
import { SiteFrame } from "@/components/redesign/SiteFrame";

export const metadata: Metadata = {
  ...buildPageMetadata({
    path: "/",
    keywords: ["공연 기획", "행사 연출", "프로덕션", "현장 운영"],
  }),
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    other: {
      "naver-site-verification": "60bd4071883dc996d703fa46ad4677d7e92a026d",
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      alternateName: siteNameKo,
      url: siteUrl,
      description: siteDescription,
      email: "contact@mightyblessing.com",
      logo: toAbsoluteUrl("/images/logo.png"),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: siteNameKo,
      url: siteUrl,
      description: siteDescription,
      inLanguage: "ko-KR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={motionVariables} suppressHydrationWarning>
      <head>
        <link rel="preload" href="/brand/mightyblessing-title.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body className="bg-white text-neutral-900 antialiased">
        <GoogleAnalytics />
        <Header projects={selectRailProjects(getAllPortfolios())} />
        <main id="main-content" tabIndex={-1}><SiteFrame projects={selectRailProjects(getAllPortfolios())}>{children}</SiteFrame></main>
        <Footer />
      </body>
    </html>
  );
}
