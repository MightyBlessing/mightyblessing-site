import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const LOGO_TARGET_WIDTH = 880;

const sourceLogo = path.join(projectRoot, "design", "logo-reference.png");
const outputPath = path.join(projectRoot, "public", "media", "og-default.png");

const logoMetadata = await sharp(sourceLogo).metadata();
const logoAspect = (logoMetadata.height ?? 360) / (logoMetadata.width ?? 1024);
const logoTargetHeight = Math.round(LOGO_TARGET_WIDTH * logoAspect);

const resizedLogo = await sharp(sourceLogo)
  .resize({ width: LOGO_TARGET_WIDTH })
  .toBuffer();

const left = Math.round((OG_WIDTH - LOGO_TARGET_WIDTH) / 2);
const top = Math.round((OG_HEIGHT - logoTargetHeight) / 2);

await sharp({
  create: {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: resizedLogo, left, top }])
  .png()
  .toFile(outputPath);

console.log(`Wrote ${outputPath} (${OG_WIDTH}x${OG_HEIGHT})`);
