const defaultSiteUrl = "https://mightyblessing.com";

export const siteName = "Mighty Blessing";
export const siteTitle = `${siteName} | 이제껏 없던 예배를 만듭니다`;
export const siteDescription = "예배와 집회가 잘 열리도록 기획하고 운영하는 마이티블레싱 팀.";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || defaultSiteUrl;
export const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
