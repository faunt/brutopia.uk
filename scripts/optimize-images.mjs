import { glob } from "glob";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

// --- CONFIG ---
const INPUT_GLOBS = [
  "../img/**/*.{png,jpg,jpeg}"
];

// Only generate meaningful breakpoints - no more than 3 sizes
const SIZES = [400, 800, 1200]; // Mobile, tablet, desktop

// Quality settings optimized for web
const AVIF_OPTIONS = { quality: 60, effort: 4 };
const WEBP_OPTIONS = { quality: 80, effort: 4 };

function outPathFor(file, width, ext) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  return path.join(dir, `${base}-${width}.${ext}`);
}

async function processOne(file) {
  const buf = await fs.readFile(file);
  const meta = await sharp(buf).metadata();
  
  // Skip if image is smaller than our smallest size
  if (meta.width < SIZES[0]) {
    console.log(`  Skipping ${file} - too small (${meta.width}px)`);
    return;
  }

  for (const width of SIZES) {
    const targetWidth = Math.min(width, meta.width);
    
    // Skip if target width is larger than original (no upscaling)
    if (targetWidth >= meta.width) {
      console.log(`  Skipping ${width}px - original is ${meta.width}px`);
      continue;
    }

    // Generate AVIF (best compression)
    await sharp(buf)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .avif(AVIF_OPTIONS)
      .toFile(outPathFor(file, targetWidth, "avif"));

    // Generate WebP (good browser support)
    await sharp(buf)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp(WEBP_OPTIONS)
      .toFile(outPathFor(file, targetWidth, "webp"));
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
