import type { PortfolioEntry } from "./content";
import { toProjectLink, type ProjectLink } from "./project-presentation";

/** Public presentation fields only. Review evidence and input paths never cross into the browser. */
export type SystemProject = ProjectLink & {
  fullTitle: string;
  summary: string;
  roles: string[];
  excludedRoles: string[];
  category: string;
  ourRole: string;
  credits: { name: string; role: string }[];
};

export function toSystemProject(project: PortfolioEntry): SystemProject {
  return {
    ...toProjectLink(project),
    fullTitle: project.frontmatter.title,
    summary: project.frontmatter.summary,
    roles: project.frontmatter.roles,
    excludedRoles: project.frontmatter.excludedRoles || [],
    category: project.frontmatter.categories[0] || "프로젝트",
    ourRole: project.frontmatter.our_role || "",
    credits: project.frontmatter.credits || [],
  };
}

// Values live in globals.css. The catalogue refers to the same CSS properties.
export const colorTokens = [
  { label: "Brand purple", token: "--primary", use: "브랜드 · 주요 행동" },
  { label: "Paper", token: "--background", use: "기본 바탕" },
  { label: "Ink", token: "--foreground", use: "제목 · 본문" },
  { label: "Muted", token: "--text-muted", use: "보조 정보 · 캡션" },
] as const;
export const purpleTokens = [100, 200, 300, 400, 500, 600].map((step) => `--brand-purple-${step}`);
export const accentTokens = [
  { label: "Orange", token: "--brand-orange", use: "작은 강조" },
  { label: "Amber", token: "--brand-amber", use: "주의 표식" },
  { label: "Green", token: "--brand-green", use: "완료 표식" },
];
export const typeTokens = [
  { label: "Display", token: "--mb-type-display", sample: "mighty blessing", className: "mb-display", detail: "Title Regular / 400" },
  { label: "Page", token: "--mb-type-page", sample: "기획을 현장으로", className: "mb-page-title", detail: "Pretendard / 500" },
  { label: "Section", token: "--mb-type-section", sample: "함께 만드는 현장", className: "mb-section-title", detail: "Pretendard / 500" },
  { label: "Project", token: "--mb-type-project", sample: "관객과 무대를 연결합니다", className: "mb-project-title", detail: "Pretendard / 500" },
  { label: "Body", token: "--mb-type-body", sample: "공연과 행사의 기획·연출부터 현장 운영까지 함께합니다.", className: "mb-body", detail: "Pretendard / 400" },
  { label: "Caption", token: "--mb-type-caption", sample: "현장 연출 · 화면 송출 · 관객 운영", className: "mb-caption", detail: "Pretendard / 400" },
] as const;
export const capabilities = [
  { number: "01", title: "기획·연출", summary: "프로그램을 구성하고, 리허설부터 본 행사까지 진행을 만듭니다.", items: "프로그램 · 큐시트 · 리허설 · 현장 연출" },
  { number: "02", title: "프로덕션·현장 운영", summary: "무대와 공간, 제작 파트너와 관객의 흐름을 함께 조율합니다.", items: "무대·공간 구성 · 관객 운영 · 예산·일정 · 파트너 조율" },
  { number: "03", title: "디지털 경험", summary: "등록과 체크인, 관객의 참여를 현장에 필요한 기술로 연결합니다.", items: "GRAPETREE · LIVE TEXT · 화면 적용" },
] as const;
