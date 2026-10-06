import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const rows = JSON.parse(await fs.readFile('docs/redesign/assets/hero-photo-selection.json', 'utf8'));
const output = path.join(root, 'artifacts-local/site-preview');
await fs.mkdir(output, { recursive: true });
const report = [];
for (const row of rows) {
  const source = path.resolve(root, row.source);
  if (!source.startsWith(path.join(root, 'input') + path.sep) || !/^[PR]\d{3,4}$/.test(row.id)) throw new Error('Invalid hero photo source');
  const bytes = await fs.readFile(source);
  const metadata = await sharp(bytes).metadata();
  const variants = [];
  for (const width of [640, 1280, 1920]) {
    const file = `${row.id.toLowerCase()}-${width}.webp`;
    const data = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
    await fs.writeFile(path.join(output, file), data);
    variants.push({ file, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
  }
  report.push({ id: row.id, sourceSha256: createHash('sha256').update(bytes).digest('hex'), width: metadata.width, height: metadata.height, variants });
}
await fs.writeFile(path.join(output, 'hero-photos-integrity.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Prepared ${rows.length} hero photos / ${report.length * 3} responsive derivatives; input originals unchanged.`);
