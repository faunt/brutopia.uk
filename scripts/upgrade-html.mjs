import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import { load } from "cheerio";

// --- CONFIG ---
const HTML_GLOBS = [
  "../index.html"
];
const IMAGE_DIR_HINTS = ["/img/", "img/"]; // only rewrite imgs that look like site assets
const WIDTHS = [400, 800, 1200]; // Match the sizes from optimize-images.mjs
const DEFAULT_FALLBACK_WIDTH = 800; // which size to use as fallback
const DEFAULT_SIZES_ATTR = "(max-width: 600px) 100vw, (max-width: 1000px) 80vw, 60vw"; // responsive sizes

function looksLikeSiteImage(src) {
  if (!src) return false;
  if (!/\.(png|jpe?g)$/i.test(src)) return false;
  return IMAGE_DIR_HINTS.some((h) => src.includes(h));
}

function buildSrcset(baseNoExt, ext, widths) {
  return widths.map((w) => `${baseNoExt}-${w}.${ext} ${w}w`).join(",\n                  ");
}

function baseParts(src) {
  const ext = path.extname(src); // .png
  const noExt = src.slice(0, -ext.length); // images/hero
  return { noExt, ext: ext.replace(/^\./, "").toLowerCase() };
}

// Remove any existing size suffixes from base name
function normalizeBase(noExt) {
  // strip trailing numeric segments (e.g., -800, -400)
  return noExt.replace(/-\d+$/, "");
}

async function detectAvailableWidths(normalizedBase) {
  // Look for AVIF variants to determine available sizes
  const dir = path.dirname(normalizedBase);
  const base = path.basename(normalizedBase);
  const pattern = path.join("..", dir, `${base}-*.avif`);
  const matches = await glob(pattern);
  const widths = new Set();
  for (const file of matches) {
    const bn = path.basename(file);
    const m = bn.match(/-(\d+)\.avif$/);
    if (m) widths.add(Number(m[1]));
  }
  const sorted = Array.from(widths).sort((a,b)=>a-b);
  if (!sorted.length) return WIDTHS; // fallback to default sizes
  return sorted;
}

async function transformHtml(file) {
  const html = await fs.readFile(file, "utf8");
  const $ = load(html, { decodeEntities: false });

  $("img[src]").each((_, el) => {
    const $img = $(el);
    if ($img.attr("data-optimized") === "true") return; // skip if already processed
    if ($img.closest('picture[data-optimized="true"]').length) return; // avoid nesting

    let src = $img.attr("src");
    if (!looksLikeSiteImage(src)) return;

    const alt = $img.attr("alt") || "";
    const cls = $img.attr("class");
    const id = $img.attr("id");
    const widthAttr = $img.attr("width");
    const heightAttr = $img.attr("height");

    // Normalize base to remove alias suffixes
    const { noExt } = baseParts(src);
    const normalizedBase = normalizeBase(noExt);

    // Use original image as fallback, optimized versions for modern browsers
    const avifSrcset = buildSrcset(normalizedBase, "avif", WIDTHS);
    const webpSrcset = buildSrcset(normalizedBase, "webp", WIDTHS);
    const originalFallback = src; // Use the original image as fallback

    const sizesAttr = $img.attr("sizes") || DEFAULT_SIZES_ATTR;

    // Build <picture> with original as fallback
    const picture = $(
      `<picture data-optimized="true">
        <source srcset="${avifSrcset}" type="image/avif">
        <source srcset="${webpSrcset}" type="image/webp">
        <img src="${originalFallback}" alt="${alt}" data-optimized="true">
      </picture>`
    );

    // Preserve attributes on <img>
    const pictureImg = picture.find("img");
    if (cls) pictureImg.attr("class", cls);
    if (id) pictureImg.attr("id", id);
    if (widthAttr) pictureImg.attr("width", widthAttr);
    if (heightAttr) pictureImg.attr("height", heightAttr);
    if (sizesAttr) pictureImg.attr("sizes", sizesAttr);

    // Replace original <img>
    $img.replaceWith(picture);
  });

  // Normalize existing optimized <picture> blocks (remove nesting and alias suffixes)
  await Promise.all(
    $("picture[data-optimized=\"true\"]").map(async (_, el) => {
      const $outer = $(el);
      if ($outer.parents('picture[data-optimized="true"]').length) return; // only handle outermost
      const innerImg = $outer.find('img[src]')[0];
      if (!innerImg) return;
      const $img = $(innerImg);
      const src = $img.attr("src");
      if (!looksLikeSiteImage(src)) return;
      const { noExt } = baseParts(src);
      const normalizedBase = normalizeBase(noExt);
      const widths = await detectAvailableWidths(normalizedBase);
      const avifSrcset = buildSrcset(normalizedBase, "avif", widths);
      const webpSrcset = buildSrcset(normalizedBase, "webp", widths);
      const originalFallback = src; // Use original as fallback
      const alt = $img.attr("alt") || "";
      const cls = $img.attr("class");
      const id = $img.attr("id");
      const widthAttr = $img.attr("width");
      const heightAttr = $img.attr("height");
      const sizesAttr = $img.attr("sizes") || DEFAULT_SIZES_ATTR;

      const picture = $(
        `<picture data-optimized="true">
          <source srcset="${avifSrcset}" type="image/avif">
          <source srcset="${webpSrcset}" type="image/webp">
          <img src="${originalFallback}" alt="${alt}" data-optimized="true">
        </picture>`
      );

      const pictureImg = picture.find("img");
      if (cls) pictureImg.attr("class", cls);
      if (id) pictureImg.attr("id", id);
      if (widthAttr) pictureImg.attr("width", widthAttr);
      if (heightAttr) pictureImg.attr("height", heightAttr);
      if (sizesAttr) pictureImg.attr("sizes", sizesAttr);

      $outer.replaceWith(picture);
    }).get()
  );

  await fs.writeFile(file, $.html());
}

(async () => {
  const files = await glob(HTML_GLOBS);
  if (!files.length) {
    console.log("No HTML files found to upgrade.");
    return;
  }
  console.log(`Upgrading <img> → <picture> in ${files.length} file(s)…`);
  for (const f of files) {
    await transformHtml(f);
    console.log("→", f);
  }
  console.log("HTML upgrade complete.");
})();
