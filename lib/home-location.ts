export type HomeSectionBounds = { id: string; top: number; bottom: number };

/** Viewport coordinates, not the hash: manual scrolling must not leave a stale selection. */
export function homeLocationAt(sections: HomeSectionBounds[], readingLine: number): string | null {
  return sections.find(({ top, bottom }) => top <= readingLine && bottom > readingLine)?.id ?? null;
}
