import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

// Local source mapping is deliberately excluded from the public bundle.
const root = process.cwd();
const review = path.join(root, 'artifacts-local/project-review-photos');
const selection = JSON.parse(await fs.readFile(path.join(review, 'selection.json'), 'utf8'));
const output = path.join(root, 'artifacts-local/site-preview');
await fs.mkdir(output, { recursive: true });
await fs.mkdir(path.join(review, 'decoded'), { recursive: true });
const catalog = {};
const report = [];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
for (const row of selection) {
  const source = path.resolve(root, row.source);
  if (!source.startsWith(path.join(root, 'input') + path.sep) || !/^[PR]\d{3,4}$/.test(row.id)) throw new Error('Invalid project photo source');
  const sourceHash = digest(await fs.readFile(source));
  let decoded = source;
  const widths = [640, 1280, 1920];
  const variants = [];
  for (const width of widths) {
    const file = `${row.id.toLowerCase()}-${width}.webp`;
    const target = path.join(output, file);
    const exists = await fs.access(target).then(() => true, () => false);
    // Shared hero/preview derivatives keep their existing bytes and crop.
    if (!exists) {
      if (/\.heic$/i.test(source) && decoded === source) {
        decoded = path.join(review, 'decoded', `${row.id}.jpg`);
        execFileSync('heif-convert', [source, decoded], { stdio: 'pipe' });
      }
      await sharp(decoded).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(target);
    }
    const bytes = await fs.readFile(target);
    const info = await sharp(bytes).metadata();
    variants.push({ file, width: info.width, height: info.height, bytes: bytes.length, sha256: digest(bytes), reused: exists });
  }
  if (sourceHash !== digest(await fs.readFile(source))) throw new Error(`Source changed: ${row.id}`);
  const largest = variants.at(-1);
  catalog[row.id.toLowerCase()] = { width: largest.width, height: largest.height, widths };
  report.push({ id: row.id, slug: row.slug, sourceSha256: sourceHash, variants });
}
await fs.writeFile(path.join(root, 'lib/project-photo-assets.json'), JSON.stringify(catalog, null, 2) + '\n');
await fs.writeFile(path.join(review, 'derivatives.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Prepared ${report.length} project photos; existing derivatives and originals preserved.`);
