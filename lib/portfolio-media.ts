export type PortfolioMediaAsset = {
  type: "image" | "video";
  url: string;
  alt?: string;
  caption?: string;
  poster?: string;
};

export const portfolioHeroMedia: PortfolioMediaAsset = {
  type: "video",
  url: "/media/portfolio/hero-draft.mp4",
  poster: "/media/portfolio/blue-stage.jpg",
  alt: "무대를 향해 모여드는 예배 현장의 움직임",
  caption: "Portfolio film",
};

export const portfolioMoodFrames: PortfolioMediaAsset[] = [
  {
    type: "image",
    url: "/media/portfolio/blue-stage.jpg",
    alt: "푸른 조명 아래 펼쳐진 집회 무대",
    caption: "Stage scale",
  },
  {
    type: "image",
    url: "/media/portfolio/worship-hands.jpg",
    alt: "조용히 예배에 집중하는 참가자들",
    caption: "Quiet focus",
  },
  {
    type: "image",
    url: "/media/portfolio/church-event.jpg",
    alt: "행사 현장에서 서로 인사하는 참가자들",
    caption: "Gathering",
  },
  {
    type: "image",
    url: "/media/portfolio/atmosphere-detail.jpg",
    alt: "공간을 가르는 한 줄기 조명",
    caption: "Light and air",
  },
];
