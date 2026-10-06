const defaultSiteUrl = "https://mightyblessing.com";

export const siteName = "Mighty Blessing";
export const siteNameKo = "마이티블레싱";
export const siteTitle = `${siteNameKo} | 공연·행사 기획·제작·운영`;
export const siteDescription = "공연·행사 기획부터 무대 연출, 제작 관리와 현장 운영까지 함께하는 마이티블레싱. 예배·집회에서 쌓은 경험을 바탕으로 행사 등록·QR 체크인과 관객 참여 도구도 만듭니다.";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || defaultSiteUrl;
export const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
