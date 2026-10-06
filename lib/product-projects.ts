import type { PortfolioEntry } from "./content";
import { featuredProducts } from "./company-content";

export type ProductId = "grapetree" | "live-text";

// Confirmed applications, not inferred from equipment visible in a photograph.
// Keep this module on the server: callers render only the relations they need.
// F.I.A and LOVE & REVIVAL used Eventus for registration; these two relations
// describe only GrapeTree's on-site QR check-in, not pre-registration.
export const productProjectRelations: { productId: ProductId; projectSlug: string; usage: string }[] = [
  { productId: "grapetree", projectSlug: "campus-worship-2026", usage: "사전 등록과 현장 QR 체크인" },
  { productId: "live-text", projectSlug: "campus-worship-2026", usage: "공연 현장의 관객 참여" },
  { productId: "grapetree", projectSlug: "fia-welove-2026", usage: "관객 입장을 위한 현장 QR 체크인" },
  { productId: "grapetree", projectSlug: "welove-reconciliation-2026", usage: "사전 등록과 현장 QR 체크인" },
  { productId: "live-text", projectSlug: "welove-reconciliation-2026", usage: "예배 현장의 관객 참여" },
  { productId: "grapetree", projectSlug: "love-and-revival-2025", usage: "관객 입장을 위한 현장 QR 체크인" },
];

/** Accept the already publication-filtered collection from getAllPortfolios(). */
export function getProductProjects(productId: ProductId, portfolios: PortfolioEntry[]) {
  return productProjectRelations.filter((relation) => relation.productId === productId).flatMap((relation) => {
    const entry = portfolios.find(({ slug }) => slug === relation.projectSlug);
    return entry ? [{ ...relation, project: entry.frontmatter }] : [];
  });
}

/** Called only after the route has resolved a visible project. */
export function getProjectProducts(projectSlug: string) {
  return productProjectRelations.filter((relation) => relation.projectSlug === projectSlug).flatMap((relation) => {
    const product = featuredProducts.find(({ id }) => id === relation.productId);
    return product ? [{ ...relation, product }] : [];
  });
}
