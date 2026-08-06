// Icon generator — the manifest referenced /icon-192.png and /icon-512.png
// but neither existed on disk, so push notifications and any install
// prompt were showing broken icons.
//
// Usage:
//   node scripts/generate-icons.mjs                  draws the built-in loop+/90 mark
//   node scripts/generate-icons.mjs path/to/your.svg  rasterizes your own SVG instead
//
// A custom SVG is used as-is at every required size — square source art
// works best, since each output (icon-512, icon-192, apple-touch-icon,
// favicon) is just your SVG resized, not re-composed. Any transparent
// background is filled with the brand background color rather than left
// see-through, since store/OS install surfaces expect an opaque icon.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const BG = "#0C4A39"; // primary-deep
const FG = "#EFA63C"; // marigold

const customSvgPath = process.argv[2];
const customSvg = customSvgPath ? readFileSync(customSvgPath) : null;

// The infinity glyph (the "Loop") — two overlapping circles rather than the
// ∞ text glyph, so it renders identically regardless of which fonts the
// rasterizer/OS has available. Every measurement (radius, stroke, vertical
// position) is passed in as an absolute pixel value in the icon's own
// viewBox, so the same helper draws it small-and-high above the "/90"
// label, or big-and-centered alone on the favicon.
function loopGlyph({ size, r, cy, strokeColor }) {
  // Centers exactly 2r apart (tangent) so the rings meet at a single pinch
  // point in the middle — a true figure-8 — instead of overlapping into a
  // blob. A thin stroke relative to r keeps it reading as a loop, not a dumbbell.
  const cxL = size * 0.5 - r;
  const cxR = size * 0.5 + r;
  const sw = r * 0.4;
  return `<circle cx="${cxL}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>
  <circle cx="${cxR}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>`;
}

// Loop glyph stacked over "/90" — kept inside the ~80% safe zone so
// Android's adaptive-icon mask never clips it.
function iconSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  ${loopGlyph({ size, r: size * 0.1, cy: size * 0.36, strokeColor: FG })}
  <text x="50%" y="76%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="700"
        font-size="${size * 0.24}" fill="${FG}">/90</text>
</svg>`;
}

// Favicon is too small for the "/90" label to read — just the loop glyph,
// centered, drawn larger since there's no label competing for space below it.
function faviconSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  ${loopGlyph({ size, r: size * 0.16, cy: size * 0.5, strokeColor: FG })}
</svg>`;
}

// Rasterizes either the given SVG string (built-in mark) or, if a custom
// SVG was passed on the command line, that file resized to `size` with a
// flattened (opaque) background.
async function make(size, path, builtInSvg) {
  const image = customSvg
    ? sharp(customSvg).resize(size, size).flatten({ background: BG })
    : sharp(Buffer.from(builtInSvg));
  await image.png().toFile(path);
  console.log("wrote", path);
}

await make(192, "public/icon-192.png", iconSvg(192));
await make(512, "public/icon-512.png", iconSvg(512));
await make(180, "public/apple-touch-icon.png", iconSvg(180));
await make(32, "public/favicon-32.png", faviconSvg(32));

// public/favicon.ico — sharp can't write .ico directly; a 32x32 PNG served
// as favicon.ico works in every modern browser.
const faviconBuffer = customSvg
  ? await sharp(customSvg).resize(32, 32).flatten({ background: BG }).png().toBuffer()
  : await sharp(Buffer.from(faviconSvg(32))).png().toBuffer();
writeFileSync("public/favicon.ico", faviconBuffer);
console.log(customSvg ? `done (from ${customSvgPath})` : "done");
