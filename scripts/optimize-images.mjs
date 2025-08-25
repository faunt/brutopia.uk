import { glob } from "glob";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

// --- CONFIG ---
const INPUT_GLOBS = [
  "../img/**/*.{png,jpg,jpeg}"
];
const SIZES = [400, 800, 1600]; // widths to generate
const MAKE_PNG_FALLBACK = true; // keep a downsized PNG alongside AVIF/WebP

// Quality knobs (tweak to taste)
const AVIF_OPTIONS = { quality: 50, effort: 4 }; // good balance
const WEBP_OPTIONS = { quality: 70, effort: 4 }; // visually solid
const PNG_OPTIONS = { compressionLevel: 9, effort: 6 }; // lossless-ish

function outPathFor(file, width, ext) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  return path.join(dir, `${base}-${width}.${ext}`);
}

async function processOne(file) {
  const buf = await fs.readFile(file);
  const meta = await sharp(buf).metadata();

  for (const width of SIZES) {
    const targetWidth = Math.min(width, meta.width || width);

    // AVIF
    await sharp(buf)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .avif(AVIF_OPTIONS)
      .toFile(outPathFor(file, targetWidth, "avif"));

    // WebP
    await sharp(buf)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp(WEBP_OPTIONS)
      .toFile(outPathFor(file, targetWidth, "webp"));

    if (MAKE_PNG_FALLBACK) {
      await sharp(buf)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .png(PNG_OPTIONS)
        .toFile(outPathFor(file, targetWidth, "png"));
    }
  }
}

(async () => {
  const files = (await Promise.all(INPUT_GLOBS.map((g) => glob(g)))).flat();
  if (!files.length) {
    console.log("No source images found in:", INPUT_GLOBS.join(", "));
    return;
  }
  console.log(`Optimizing ${files.length} image(s)…`);
  for (const f of files) {
    console.log("→", f);
    await processOne(f);
  }
  console.log("Done generating AVIF/WebP + PNG fallbacks.");
})();
