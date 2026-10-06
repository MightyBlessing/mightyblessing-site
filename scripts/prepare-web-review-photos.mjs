import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Downloaded sources and their provenance stay outside public/ and deployment.
const root = process.cwd();
const sourceRoot = path.join(root, 'artifacts-local/photo-addition-2026-09-15');
const selection = JSON.parse(await fs.readFile(path.join(sourceRoot, 'selection.json'), 'utf8'));
const target = path.join(root, 'artifacts-local/site-preview');
await fs.mkdir(target, { recursive: true });
const catalog = {};
const files = [];
for (const item of selection) {
  const source = path.resolve(root, item.source);
  if (!source.startsWith(sourceRoot + path.sep) || !/^w\d{3}$/.test(item.id)) throw new Error('Invalid review photo source');
  const { width, height } = await sharp(source).metadata();
  const maximum = Math.min(width, item.maxWidth);
  const widths = [...new Set([Math.min(480, maximum), Math.min(960, maximum), maximum])];
  for (const outputWidth of widths) {
    const file = `${item.id}-${outputWidth}.webp`;
    const info = await sharp(source).rotate().resize({ width: outputWidth, withoutEnlargement: true }).webp({ quality: 86, effort: 6 }).toFile(path.join(target, file));
    files.push({ file, width: info.width, height: info.height, bytes: info.size });
  }
  catalog[item.id] = { width: maximum, height: Math.round(height * maximum / width), widths };
}
await fs.writeFile(path.join(root, 'lib/review-photo-assets.json'), JSON.stringify(catalog, null, 2) + '\n');
await fs.writeFile(path.join(sourceRoot, 'derivatives.json'), JSON.stringify(files, null, 2) + '\n');
console.log(`Prepared ${files.length} derivatives from ${selection.length} verified review photos.`);
