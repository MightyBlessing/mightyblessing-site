import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Explicit local-review derivatives only; originals and publication status stay intact.
const profile = "input/mighty-blessing-commercial-profile-v10/source";
const destination = path.join(process.cwd(), "artifacts-local/design-system");
const selected = await readFile("docs/redesign/assets/selected-media.csv", "utf8");
const liveTextPhoto = selected.split(/\r?\n/).find((line) => line.startsWith("P113,"))?.split(",")[3];
if (!liveTextPhoto?.startsWith("input/")) throw new Error("P113 source missing from selected media register");
const sources = [
  [`${profile}/web-captures/GRAPE_ACTIVE_TICKETS.png`, "grapetree.webp", 1200],
  [`${profile}/web-captures/LT_DISPLAY.png`, "livetext.webp", 1200],
  [`${profile}/web-captures/LT_APPROVAL.png`, "livetext-approval.webp", 1200],
  [`${profile}/assets/R0648.jpg`, "production.webp", 1440],
  [`${profile}/assets/REG_WIDE.jpg`, "registration.webp", 1440],
  [liveTextPhoto, "live-text-field.webp", 1440],
];
await mkdir(destination, { recursive: true });
for (const [input, output, width] of sources) {
  const result = await sharp(path.resolve(input)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(destination, output));
  console.log(`${output}: ${result.width}×${result.height}, ${result.size} bytes`);
}
