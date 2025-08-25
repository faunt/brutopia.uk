import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import { load } from "cheerio";

// --- CONFIG ---
const HTML_GLOBS = [
  "../index.html"
];
const IMAGE_DIR_HINTS = ["/img/", "img/"]; // only rewrite imgs that look like site assets
const WIDTHS = [400, 800, 1600];
const DEFAULT_FALLBACK_WIDTH = 800; // which PNG to point <img src> at
const DEFAULT_SIZES_ATTR = "(max-width: 800px) 100vw, 800px"; // adjust for your layout

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

async function transformHtml(file) {
  const html = await fs.readFile(file, "utf8");
  const $ = load(html, { decodeEntities: false });

  $("img[src]").each((_, el) => {
    const $img = $(el);
    if ($img.attr("data-optimized") === "true") return; // skip if already processed

    const src = $img.attr("src");
    if (!looksLikeSiteImage(src)) return;

    const alt = $img.attr("alt") || "";
    const cls = $img.attr("class");
    const id = $img.attr("id");
    const widthAttr = $img.attr("width");
    const heightAttr = $img.attr("height");

    const { noExt } = baseParts(src);

    const avifSrcset = buildSrcset(noExt, "avif", WIDTHS);
    const webpSrcset = buildSrcset(noExt, "webp", WIDTHS);
    const pngFallback = `${noExt}-${DEFAULT_FALLBACK_WIDTH}.png`;

    const sizesAttr = $img.attr("sizes") || DEFAULT_SIZES_ATTR;

    // Build <picture>
    const picture = $(
      `<picture data-optimized="true">
        <source srcset="${avifSrcset}" type="image/avif">
        <source srcset="${webpSrcset}" type="image/webp">
        <img src="${pngFallback}" alt="${alt}">
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
