export const productNames = { grapetree: "포도나무", "live-text": "LIVE TEXT", twoline: "두줄자막" } as const;
export type ProductId = keyof typeof productNames;
export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && Object.hasOwn(productNames, value);
}
export type ProductScreen = { src: string; alt: string; caption: string; width: number; height: number };
export type ProductContent = { description: string; detail: string; screen: ProductScreen | null; screenHidden?: boolean };
export type ProductEditorValue = ProductContent & { id: ProductId; revision: string };
export type ProductEditorPayload = { id: ProductId; revision: string; description: string; detail: string; alt: string; caption: string; removeScreen: boolean };
