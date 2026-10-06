/* eslint-disable @next/next/no-img-element -- Responsive source media with explicit dimensions. */
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { PortfolioFrontmatter } from "@/lib/content";
import { imageSrcSet, projectDisplayDate } from "@/lib/project-presentation";
import { markdownImageSources, mediaSourceKey } from "@/lib/markdown-media";
import { getProjectProducts } from "@/lib/product-projects";
import { getReviewPhoto } from "@/lib/review-photos";
import "./project-story.css";

const detailImageSizes = "(min-width:1200px) calc(100vw - 352px - clamp(56px, 6vw, 96px)), (min-width:1024px) calc(100vw - 348px), (min-width:768px) calc(100vw - 72px), calc(100vw - 56px)";
const supportingPhotoWidth = (source: string) => {
  const dimensions = getReviewPhoto(source);
  return Math.min(dimensions?.width || 760, dimensions && dimensions.height > dimensions.width ? 420 : 760);
};

export function ProjectDetail({ project, content }: { project: PortfolioFrontmatter; content: string }) {
  const hero = project.heroMedia;
  const heroDimensions = hero && getReviewPhoto(hero.poster || hero.url);
  const gallery = project.gallery || [];
  const inlineImages = new Set(markdownImageSources(content).map(mediaSourceKey));
  const findMedia = (source: unknown) => typeof source === "string" ? gallery.find(item =>
    mediaSourceKey(item.url) === mediaSourceKey(source) || (item.poster && mediaSourceKey(item.poster) === mediaSourceKey(source))
  ) : undefined;
  const products = getProjectProducts(project.slug);
  const hasStory = /^##\s+/m.test(content);
  const supportingPhotos = gallery.filter(media => !inlineImages.has(mediaSourceKey(media.url)) && !(media.poster && inlineImages.has(mediaSourceKey(media.poster))));
  return <div className="site-detail">
    <article className={`project-detail${hero ? "" : " project-detail-text"}`}>
      <header className="detail-heading"><Link href="/portfolio" className="detail-back">← 전체 프로젝트</Link><p className="section-label">{[projectDisplayDate(project), ...project.categories].join(" / ")}</p><h1>{project.title}</h1>{project.summary && <p className="detail-summary">{project.summary}</p>}{project.roles.length > 0 && <div className="detail-role-summary"><span>수행 범위</span><ul aria-label="마이티블레싱 수행 범위">{project.roles.map(role => <li key={role}>{role}</li>)}</ul></div>}</header>
      {hero && <figure className="detail-hero"><img src={hero.poster || hero.url} srcSet={imageSrcSet(hero.poster || hero.url)} sizes="(min-width:1200px) calc(100vw - 352px), (min-width:1024px) calc(100vw - 292px), calc(100vw - 16px)" alt={hero.alt || project.title} width={heroDimensions?.width || 1920} height={heroDimensions?.height || 1280} fetchPriority="high" />{hero.caption && <figcaption>{hero.caption}</figcaption>}</figure>}
      <div className="detail-body"><section className="detail-overview"><h2>우리가 맡은 일</h2><div><p>{project.our_role || project.roles.join(" · ")}</p><dl>{project.location && <div><dt>장소</dt><dd>{project.location}</dd></div>}{project.metrics?.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}{project.credits?.map(({ name, role }) => <div key={name + role}><dt>{role}</dt><dd>{name}</dd></div>)}</dl></div></section>
        {content.trim() && <div className={`detail-narrative${hasStory ? " project-story" : ""}`}><ReactMarkdown components={{
          p: ({ children, node }) => {
            const onlyChild = node?.children.length === 1 ? node.children[0] : undefined;
            if (onlyChild?.type === "element" && onlyChild.tagName === "img") {
              const source = onlyChild.properties.src;
              const media = findMedia(source);
              return <figure className="project-story-figure" style={typeof source === "string" ? { maxWidth: supportingPhotoWidth(source) } : undefined}>{children}{media?.caption && <figcaption>{media.caption}</figcaption>}</figure>;
            }
            return <p>{children}</p>;
          },
          img: ({ src, alt }) => {
            if (typeof src !== "string" || !src) return null;
            const media = findMedia(src);
            const source = media?.poster || src;
            const dimensions = getReviewPhoto(source);
            return <img src={source} srcSet={imageSrcSet(source)} sizes={detailImageSizes} alt={media?.alt || alt || "프로젝트 현장"} width={dimensions?.width || 1920} height={dimensions?.height || 1280} loading="lazy" />;
          },
        }}>{content}</ReactMarkdown></div>}
        {supportingPhotos.length > 0 && <div className="detail-gallery-grid">{supportingPhotos.map((media) => {
          const dimensions = getReviewPhoto(media.poster || media.url);
          return <figure className="detail-gallery" key={media.url} style={{ maxWidth: supportingPhotoWidth(media.poster || media.url) }}><img src={media.poster || media.url} srcSet={imageSrcSet(media.poster || media.url)} sizes="(min-width:1200px) 520px, (min-width:768px) 380px, calc(100vw - 56px)" alt={media.alt || "프로젝트 현장"} width={dimensions?.width || 1920} height={dimensions?.height || 1280} loading="lazy" />{media.caption && <figcaption>{media.caption}</figcaption>}</figure>;
        })}</div>}
        {products.length > 0 && <section className="project-tools" aria-labelledby="project-tools-title"><h2 id="project-tools-title">현장에서 사용한 도구</h2><ul>{products.map(relation => <li key={relation.productId}><Link href={`/products#${relation.productId}`}><div><h3>{relation.product.name}</h3><p>{relation.usage}</p></div><span className="project-tool-link">제품 살펴보기 <span aria-hidden="true">→</span></span></Link></li>)}</ul></section>}
        <div className="detail-contact"><p>다음 프로젝트를 함께 준비해 볼까요?</p><Link href={`/inquiry?project=${encodeURIComponent(project.slug)}`} className="text-link">이 사례로 프로젝트 문의 ↗</Link></div>
      </div>
    </article>
  </div>;
}
