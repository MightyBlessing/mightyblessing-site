import { ReactNode } from "react";
import { PortfolioMediaAsset } from "@/lib/portfolio-media";

type Props = {
  item: PortfolioMediaAsset;
  className?: string;
  mediaClassName?: string;
  captionClassName?: string;
  overlay?: ReactNode;
  priority?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
};

export function PortfolioMediaTile({
  item,
  className = "",
  mediaClassName = "",
  captionClassName = "",
  overlay,
  priority = false,
  autoPlay = item.type === "video",
  muted = true,
  loop = true,
  controls = false,
}: Props) {
  return (
    <figure className={className}>
      {item.type === "video" ? (
        <video
          className={mediaClassName}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={controls}
          poster={item.poster}
          preload={priority ? "auto" : "metadata"}
        >
          <source src={item.url} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt ?? ""}
          className={mediaClassName}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      {overlay}
      {item.caption && (
        <figcaption
          className={
            captionClassName ||
            "mt-3 text-[11px] font-medium tracking-[0.18em] text-neutral-400 uppercase"
          }
        >
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
