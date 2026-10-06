#!/usr/bin/env node
// Build a separate, source-controlled Sites review copy. Never relax the main
// application's production publication rules or copy credentials/source media.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'artifacts-local/site-review');
const origin = process.argv[2];
assert.ok(origin && new URL(origin).protocol === 'https:', 'Pass the Sites expected_url');
const manifest = path.join(target, '.openai/hosting.json');
assert.ok(JSON.parse(fs.readFileSync(manifest, 'utf8')).project_id, 'Register the Site first');
const snapshot = {};
const assetIds = new Set(['r0648', 'p043']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function write(relative, value) {
  const dest = path.join(target, relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, value);
}
function copy(relative) {
  const source = path.join(root, relative);
  const bytes = fs.readFileSync(source);
  snapshot[relative] = crypto.createHash('sha256').update(bytes).digest('hex');
  write(relative, bytes);
}
function edit(relative, transform) {
  const file = path.join(target, relative);
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}
function replace(text, before, after) {
  assert.ok(text.includes(before), `Source changed; expected ${before.slice(0, 80)}`);
  return text.replace(before, after);
}

const excluded = /^(?:app\/(?:admin|api|design-system)\/|app\/(?:sitemap\.ts|robots\.ts|services\/page\.tsx)$|components\/admin\/|lib\/admin\/)/;
for (const dir of ['app', 'components', 'lib', 'content']) {
  for (const file of walk(path.join(root, dir))) {
    const relative = path.relative(root, file);
    if (!excluded.test(relative)) copy(relative);
  }
}
for (const file of ['package.json', 'package-lock.json', 'postcss.config.mjs', 'tsconfig.json', 'eslint.config.mjs', 'next-env.d.ts']) copy(file);

// Include only web-ready files. Neither original input nor local audit manifests
// are part of the source copy or the deployment archive.
const unusedLegacyVideos = new Set(['public/media/portfolio/home-hero-worship.mp4', 'public/media/portfolio/hero-draft.mp4']);
for (const file of walk(path.join(root, 'public'))) {
  const relative = path.relative(root, file);
  if (unusedLegacyVideos.has(relative)) {
    fs.rmSync(path.join(target, relative), { force: true });
    continue;
  }
  copy(relative);
}
for (const file of walk(path.join(root, 'content/portfolio'))) {
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/\/api\/preview-media\/([pr]\d{3,4})-\d+\.webp/g)) assetIds.add(match[1]);
}
for (const id of assetIds) for (const width of [640, 1280, 1920]) {
  const name = `${id}-${width}.webp`;
  const source = path.join(root, 'artifacts-local/site-preview', name);
  assert.ok(fs.existsSync(source), `Missing reviewed derivative ${name}`);
  write(`public/review-media/${name}`, fs.readFileSync(source));
}
for (const name of ['grapetree.webp', 'livetext.webp', 'production.webp', 'registration.webp', 'live-text-field.webp']) {
  write(`public/review-products/${name}`, fs.readFileSync(path.join(root, 'artifacts-local/design-system', name)));
}
for (const name of ['desktop.mp4', 'mobile.mp4', 'poster-desktop.webp', 'poster-mobile.webp']) {
  write(`public/review-film/${name}`, fs.readFileSync(path.join(root, 'artifacts-local/site-film', name)));
}

// This checkout is a review deliverable authorized by the user, not the official
// production source. Its draft statuses remain intact; the review build includes
// the same draft v2 records as the local development site.
for (const relative of ['lib/content.ts', 'lib/project-presentation.ts', 'lib/home-hero-slides.ts', 'components/redesign/ProductionHome.tsx', 'app/about/page.tsx', 'app/products/page.tsx']) {
  edit(relative, text => text.replaceAll('process.env.NODE_ENV === "development"', 'true'));
}
edit('lib/home-film.ts', text => text.replaceAll('environment = process.env.NODE_ENV', 'environment = "development"'));
const openingMediaId = JSON.parse(fs.readFileSync(path.join(root, 'lib/home-film.json'), 'utf8')).posterMediaId;
edit('lib/home-hero-photos.json', text => JSON.stringify(JSON.parse(text).filter(photo => photo.id === openingMediaId), null, 2) + '\n');

for (const dir of ['app', 'components', 'lib', 'content']) for (const file of walk(path.join(target, dir))) {
  if (!/\.(tsx?|css|json|md)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, text
    .replaceAll('/api/preview-media/', '/review-media/')
    .replaceAll('\\/api\\/preview-media\\/', '\\/review-media\\/')
    .replaceAll('/api/design-system-media/', '/review-products/')
    .replaceAll('/api/preview-film/', '/review-film/'));
}

write('next.config.ts', `import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", outputFileTracingRoot: process.cwd(), devIndicators: false, images: { unoptimized: true } };
export default nextConfig;
`);
edit('package.json', text => {
  const pkg = JSON.parse(text);
  pkg.scripts = { dev: 'next dev', build: 'next build --webpack', lint: 'eslint' };
  return JSON.stringify(pkg, null, 2) + '\n';
});
edit('lib/site.ts', text => replace(text, 'https://mightyblessing.com', origin));
edit('lib/seo.ts', text => replace(text, 'noIndex = process.env.NODE_ENV === "development"', 'noIndex = true'));
edit('app/layout.tsx', text => text.replace('import { GoogleAnalytics } from "@/components/GoogleAnalytics";\n', '').replace('        <GoogleAnalytics />\n', '').replace(/  verification: \{[\s\S]*?\n  \},\n/, ''));
write('public/robots.txt', 'User-agent: *\nDisallow: /\n');
write('public/_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n');
write('public/_redirects', '/services /products 308\n');
write('app/services/page.tsx', 'export { default, metadata } from "../products/page";\n');

// Archive search works in the browser on a static host, retaining URL queries,
// categories, empty results, navigation and the existing markup/classes.
let archive = fs.readFileSync(path.join(target, 'app/portfolio/page.tsx'), 'utf8');
const metadata = archive.slice(archive.indexOf('export const metadata:'), archive.indexOf('\ntype Props'));
archive = archive.replace('import type { Metadata } from "next";\n', '')
  .replace('import { getAllPortfolios } from "@/lib/content";', 'import type { PortfolioEntry } from "@/lib/content";\nimport { useSearchParams } from "next/navigation";')
  .replace('import { buildPageMetadata } from "@/lib/seo";\n', '')
  .replace(metadata, '')
  .replace(/type Props = .*\n/, '')
  .replace(/const param = .*\n/, '');
archive = replace(archive, 'export default async function Portfolio({ searchParams }: Props) {\n  const params = await searchParams;\n  const query = param(params.q);\n  const category = param(params.category);\n  const all = getAllPortfolios();\n  const index = selectIndexProjects(all);', 'export function ReviewArchive({ projects }: { projects: PortfolioEntry[] }) {\n  const params = useSearchParams();\n  const query = (params.get("q") || "").trim();\n  const category = (params.get("category") || "").trim();\n  const index = selectIndexProjects(projects);');
write('components/review/ReviewArchive.tsx', '"use client";\n' + archive);
write('app/portfolio/page.tsx', `import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPortfolios } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { ReviewArchive } from "@/components/review/ReviewArchive";
${metadata}
export default function Portfolio() {
  return <Suspense fallback={<div className="archive-content"><h1>함께한 프로젝트</h1><p>프로젝트 목록을 불러오고 있습니다.</p></div>}><ReviewArchive projects={getAllPortfolios()} /></Suspense>;
}
`);

// Preserve the form and validation, but never send review entries externally or
// claim they were received. No production provider secrets are copied.
edit('components/inquiry/InquiryForm.tsx', text => {
  text = text.replace('useEffect, ', '')
    .replace(/const REQUEST_TIMEOUT_MS[\s\S]*?type InquiryFormState/, 'type InquiryFormState')
    .replace(/function buildMailBody[\s\S]*?export function InquiryForm/, 'export function InquiryForm')
    .replace('  const activeRequest = useRef<AbortController | null>(null);\n', '')
    .replace(/  useEffect\(\(\) => \(\) => \{[\s\S]*?  \}, \[\]\);\n/, '')
    .replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const isSubmitting = false;')
    .replace('if (!isHydrated || activeRequest.current) return;', 'if (!isHydrated) return;');
  const start = text.indexOf('    const controller = new AbortController();');
  const end = text.indexOf('\n  return (', start);
  assert.ok(start > 0 && end > start, 'Inquiry source changed');
  return text.slice(0, start) + '    setSuccess("검수용 사이트입니다. 입력 형식을 확인했으며 문의는 발송되지 않았습니다.");\n  }\n' + text.slice(end);
});
edit('app/inquiry/page.tsx', text => replace(text, '<div className="inquiry-layout">', '<p className="inquiry-privacy">검수용 사이트입니다. 문의 내용은 저장하거나 발송하지 않습니다.</p><div className="inquiry-layout">'));
write('.gitignore', '/node_modules\n.next/\nout/\ndist/\n*.tsbuildinfo\n.env*\n');
write('README.md', `# MIGHTY BLESSING UI/UX review\n\nAuthorized review snapshot of the current site.\n\n- Preview: ${origin}\n- Build: npm ci && npm run build\n- Static output: out/\n- Includes 35 event records, three retained overview URLs, reviewed web derivatives and the continuous live-footage home film.\n- Search runs in the browser. Inquiry validates inputs without saving or sending them. Admin routes and production credentials are absent.\n- The main application and its publication policies remain unchanged.\n`);
if (!fs.existsSync(path.join(target, 'node_modules'))) fs.symlinkSync(path.join(root, 'node_modules'), path.join(target, 'node_modules'), 'dir');
fs.writeFileSync(path.join(root, 'artifacts-local/sites-review-source-hashes.json'), JSON.stringify(snapshot, null, 2));
console.log(JSON.stringify({ target, sourceFiles: Object.keys(snapshot).length, reviewPhotoSets: assetIds.size, originalFiles: 'preserved' }));
