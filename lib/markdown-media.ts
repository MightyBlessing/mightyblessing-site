import remarkParse from "remark-parse";
import { unified } from "unified";
import { toMarkdown } from "mdast-util-to-markdown";

// Use the same CommonMark parser as ReactMarkdown. Code, escaped examples and
// unused definitions are not images; reference images resolve the first definition.
const parser = unified().use(remarkParse);
type MarkdownNode = Parameters<typeof toMarkdown>[0];
type MarkdownImage = Extract<MarkdownNode, { type: "image" }>;
type MarkdownDefinition = Extract<MarkdownNode, { type: "definition" }>;

function walk(node: MarkdownNode, visit: (node: MarkdownNode) => void) {
  visit(node);
  if ("children" in node) for (const child of node.children) walk(child, visit);
}

function imageNodes(content: string) {
  const tree = parser.parse(content);
  const definitions = new Map<string, MarkdownDefinition>();
  walk(tree, (node) => {
    if (node.type === "definition" && !definitions.has(node.identifier)) definitions.set(node.identifier, node);
  });
  const images: { node: MarkdownNode; image: MarkdownImage }[] = [];
  walk(tree, (node) => {
    if (node.type === "image") images.push({ node, image: node });
    if (node.type === "imageReference") {
      const definition = definitions.get(node.identifier);
      if (definition) images.push({ node, image: { type: "image", url: definition.url, title: definition.title, alt: node.alt } });
    }
  });
  return images;
}

/** Compare decoded Markdown destinations with the encoded URLs emitted in HTML. */
export function mediaSourceKey(source: string) {
  try {
    return decodeURI(new URL(source, "https://markdown.invalid/").href);
  } catch {
    return source;
  }
}

export function markdownImageSources(content: string) {
  return imageNodes(content).map(({ image }) => image.url);
}

/**
 * Patch actual image spans only. Untouched prose/formatting remains byte-for-byte
 * intact. A changed reference image becomes inline so shared link definitions
 * keep their original destination, title and formatting.
 */
export function updateMarkdownImages(content: string, replacements: ReadonlyMap<string, string | null>) {
  if (!replacements.size) return content;
  const keyed = new Map([...replacements].map(([source, replacement]) => [mediaSourceKey(source), replacement]));
  const edits: { start: number; end: number; text: string }[] = [];
  for (const { node, image } of imageNodes(content)) {
    const replacement = keyed.get(mediaSourceKey(image.url));
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (replacement === undefined || start === undefined || end === undefined) continue;
    if (replacement !== null && mediaSourceKey(replacement) === mediaSourceKey(image.url)) continue;
    edits.push({ start, end, text: replacement === null ? "" : toMarkdown({ ...image, url: replacement }).trimEnd() });
  }
  return edits.sort((a, b) => b.start - a.start).reduce((result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end), content);
}

/** Every local review endpoint is unavailable in production, including posters. */
export function isDevelopmentMediaUrl(source: string) {
  let pathname: string;
  try { pathname = new URL(source, "https://markdown.invalid/").pathname; }
  catch { return false; }
  try { pathname = decodeURIComponent(pathname); } catch { /* Keep a malformed path literal. */ }
  return /^\/api\/(?:preview-media|design-system-media|preview-film)(?:\/|$)/i.test(pathname);
}
