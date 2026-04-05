import {
  resolveContentMediaAsset,
  type ContentMediaAsset,
  type ContentMediaAssetInput,
} from "./content-media";

export type PortfolioMediaAsset = ContentMediaAsset;

export const portfolioFallbackImageUrl =
  resolveContentMediaAsset({
    type: "image",
    storageKey: "portfolio/shared/ambient-stage.jpg",
    fallbackUrl: "/media/portfolio/ambient-stage.jpg",
  })?.url || "/media/portfolio/ambient-stage.jpg";

export const portfolioHeroMedia =
  resolveContentMediaAsset({
    type: "video",
    storageKey: "portfolio/shared/hero-draft.mp4",
    posterStorageKey: "portfolio/shared/blue-stage.jpg",
    fallbackUrl: "/media/portfolio/hero-draft.mp4",
    fallbackPosterUrl: "/media/portfolio/blue-stage.jpg",
    alt: "무대를 향해 모여드는 예배 현장의 움직임",
    caption: "대표 필름",
  }) || {
    type: "video",
    url: "/media/portfolio/hero-draft.mp4",
    poster: "/media/portfolio/blue-stage.jpg",
    alt: "무대를 향해 모여드는 예배 현장의 움직임",
    caption: "대표 필름",
  };

const portfolioMoodFrameSources: ContentMediaAssetInput[] = [
  {
    type: "video",
    storageKey: "portfolio/welove-case/hero.mp4",
    posterStorageKey: "portfolio/welove-case/poster.jpg",
    fallbackUrl: "/media/portfolio/welove-case/hero.mp4",
    fallbackPosterUrl: "/media/portfolio/welove-case/poster.jpg",
    alt: "라이브 무대의 열기와 관객 흐름을 담은 영상",
    caption: "현장 흐름",
  },
  {
    type: "image",
    storageKey: "portfolio/shared/worship-room.jpg",
    fallbackUrl: "/media/portfolio/worship-room.jpg",
    alt: "함께 찬양에 집중하는 참가자들",
    caption: "집중의 순간",
  },
  {
    type: "image",
    storageKey: "portfolio/shared/ambient-stage.jpg",
    fallbackUrl: "/media/portfolio/ambient-stage.jpg",
    alt: "공연 전 무대와 공간의 조명 분위기",
    caption: "무대 준비",
  },
  {
    type: "video",
    storageKey: "portfolio/the-sent-case/hero.mp4",
    posterStorageKey: "portfolio/the-sent-case/poster.jpg",
    fallbackUrl: "/media/portfolio/the-sent-case/hero.mp4",
    fallbackPosterUrl: "/media/portfolio/the-sent-case/poster.jpg",
    alt: "컨퍼런스 현장의 청중과 세션 흐름을 담은 영상",
    caption: "현장 리듬",
  },
];

export const portfolioMoodFrames: PortfolioMediaAsset[] = portfolioMoodFrameSources
  .map((item) => resolveContentMediaAsset(item))
  .filter((item): item is PortfolioMediaAsset => Boolean(item));
