import { resolveContentMediaAsset } from "./content-media";
import type { PortfolioMediaAsset } from "./portfolio-media";

export const FEATURED_PORTFOLIO_ORDER_VALUES = [1, 2, 3] as const;

export type FeaturedPortfolioOrder = (typeof FEATURED_PORTFOLIO_ORDER_VALUES)[number];

type PortfolioDisplayInput = {
  title?: string;
  featured?: boolean;
  featured_order?: number;
  thumbnail?: string;
  heroMedia?: PortfolioMediaAsset | null;
  gallery?: PortfolioMediaAsset[] | null;
};

function isFeaturedPortfolioOrder(value: number): value is FeaturedPortfolioOrder {
  return FEATURED_PORTFOLIO_ORDER_VALUES.includes(value as FeaturedPortfolioOrder);
}

function resolvePortfolioPreviewMedia(asset?: PortfolioMediaAsset | null): PortfolioMediaAsset | undefined {
  const normalizedAsset = resolveContentMediaAsset(asset);
  if (!normalizedAsset) {
    return undefined;
  }

  if (normalizedAsset.type === "image") {
    return normalizedAsset;
  }

  if (!normalizedAsset.poster) {
    return undefined;
  }

  return {
    type: "image",
    url: normalizedAsset.poster,
    alt: normalizedAsset.alt,
    caption: normalizedAsset.caption,
  };
}

export function normalizeFeaturedPortfolioOrder(value: unknown): FeaturedPortfolioOrder | undefined {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsedValue) || !isFeaturedPortfolioOrder(parsedValue)) {
    return undefined;
  }

  return parsedValue;
}

export function normalizePortfolioFeaturedSelection(
  input: Pick<PortfolioDisplayInput, "featured" | "featured_order">,
) {
  const featuredOrder = normalizeFeaturedPortfolioOrder(input.featured_order);

  if (!input.featured || featuredOrder === undefined) {
    return {
      featured: false,
      featured_order: undefined as FeaturedPortfolioOrder | undefined,
    };
  }

  return {
    featured: true,
    featured_order: featuredOrder,
  };
}

export function resolvePortfolioThumbnailUrl(
  input?: Partial<PortfolioDisplayInput> | null,
  options: { fallbackUrl?: string } = {},
) {
  const explicitThumbnail = input?.thumbnail?.trim();
  if (explicitThumbnail) {
    return explicitThumbnail;
  }

  const heroPreview = resolvePortfolioPreviewMedia(input?.heroMedia);
  if (heroPreview?.url) {
    return heroPreview.url;
  }

  const galleryPreview = (input?.gallery || []).map((item) => resolvePortfolioPreviewMedia(item)).find(Boolean);
  if (galleryPreview?.url) {
    return galleryPreview.url;
  }

  return options.fallbackUrl;
}

export function resolvePortfolioCardMedia(
  input?: Partial<PortfolioDisplayInput> | null,
  options: { fallbackUrl?: string; fallbackAlt?: string } = {},
): PortfolioMediaAsset | undefined {
  const explicitThumbnail = input?.thumbnail?.trim();
  if (explicitThumbnail) {
    return {
      type: "image",
      url: explicitThumbnail,
      alt: input?.title || options.fallbackAlt,
    };
  }

  const heroPreview = resolvePortfolioPreviewMedia(input?.heroMedia);
  if (heroPreview) {
    return heroPreview;
  }

  const galleryPreview = (input?.gallery || []).map((item) => resolvePortfolioPreviewMedia(item)).find(Boolean);
  if (galleryPreview) {
    return galleryPreview;
  }

  if (!options.fallbackUrl) {
    return undefined;
  }

  return {
    type: "image",
    url: options.fallbackUrl,
    alt: input?.title || options.fallbackAlt,
  };
}
