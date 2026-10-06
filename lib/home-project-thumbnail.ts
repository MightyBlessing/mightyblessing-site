type ThumbnailCrop = { position: string; zoom: number };

// Display crops for these exact review photos, independent of hero focal points.
// A replacement or published image starts with its own neutral crop.
const crops: Record<string, ThumbnailCrop> = {
  "/api/preview-media/p047-1920.webp": { position: "10% 72%", zoom: 1.45 },
  "/api/preview-media/r2978-1920.webp": { position: "0% 42%", zoom: 1.35 },
  "/api/preview-media/r0511-1920.webp": { position: "100% 58%", zoom: 1.25 },
  "/api/preview-media/r1778-1920.webp": { position: "54% 32%", zoom: 1.5 },
  "/api/preview-media/p043-1920.webp": { position: "48% 45%", zoom: 1.3 },
};
const neutralCrop: ThumbnailCrop = { position: "50% 50%", zoom: 1 };

export function homeProjectThumbnail(image: string): ThumbnailCrop {
  return crops[image] ?? neutralCrop;
}
