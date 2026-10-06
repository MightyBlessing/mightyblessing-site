import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, 'docs/redesign/assets/preview-asset-manifest.json'), 'utf8'));
for (const item of manifest) {
  const source = path.resolve(root, item.source);
  const target = path.resolve(root, item.asset);
  if (!source.startsWith(path.join(root, 'input') + path.sep) || !target.startsWith(path.join(root, 'artifacts-local/site-preview') + path.sep)) throw new Error('Invalid preview asset path');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(source).rotate().resize({ width: item.width, height: item.height, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(target);
}
console.log(`Prepared ${manifest.length} local review derivatives. Source files were not changed.`);
