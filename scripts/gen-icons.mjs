/**
 * MouldHealth — app icon & splash generator.
 *
 * Swiggy-style: a bold warm-orange gradient squircle with a clean white glyph
 * that fuses an industrial mould "gem/die" hexagon with a health/ECG pulse line.
 *
 * Run:  node scripts/gen-icons.mjs
 * (sharp is required:  npm i --no-save sharp)
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "assets");
const IMG = path.join(OUT, "images");
fs.mkdirSync(IMG, { recursive: true });

// ---- Brand ----
const ORANGE_A = "#FF8A2B"; // warm highlight
const ORANGE_B = "#FB3E2E"; // tomato base
const INK = "#2A1106";

// Flat geometry helpers on a 1024 canvas, centre (512,512)
const C = 512;

function hexPoints(r) {
  // pointy left/right gem hexagon
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  return pts;
}

function hexPath(r) {
  const p = hexPoints(r);
  return "M" + p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z";
}

/** White glyph group, scaled about the centre. */
function glyph(scale = 1, stroke = "#FFFFFF", fill = "rgba(255,255,255,0.14)") {
  const r = 300;
  const sw = 50;
  // ECG pulse across the centre
  const pulse =
    "M 296 512 L 404 512 L 452 408 L 516 632 L 566 430 L 614 512 L 728 512";
  return `
  <g transform="translate(${C} ${C}) scale(${scale}) translate(${-C} ${-C})">
    <path d="${hexPath(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"
          stroke-linejoin="round" />
    <circle cx="${C}" cy="${C}" r="${r - 110}" fill="none" stroke="${stroke}"
            stroke-width="6" stroke-opacity="0.35" />
    <path d="${pulse}" fill="none" stroke="${stroke}" stroke-width="${sw}"
          stroke-linecap="round" stroke-linejoin="round" />
  </g>`;
}

const GRAD = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${ORANGE_A}"/>
      <stop offset="1" stop-color="${ORANGE_B}"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.3" cy="0.22" r="0.9">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

// Apple-style squircle (superellipse approximation via rounded rect rx)
const SQUIRCLE_RX = 230;

function svgFullBleed() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${GRAD}
    <rect width="1024" height="1024" fill="url(#g)"/>
    <rect width="1024" height="1024" fill="url(#hl)"/>
    ${glyph(1)}
  </svg>`;
}

function svgSquircle() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${GRAD}
    <rect x="0" y="0" width="1024" height="1024" rx="${SQUIRCLE_RX}" ry="${SQUIRCLE_RX}" fill="url(#g)"/>
    <rect x="0" y="0" width="1024" height="1024" rx="${SQUIRCLE_RX}" ry="${SQUIRCLE_RX}" fill="url(#hl)"/>
    ${glyph(1)}
  </svg>`;
}

function svgBackground() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${GRAD}
    <rect width="1024" height="1024" fill="url(#g)"/>
    <rect width="1024" height="1024" fill="url(#hl)"/>
  </svg>`;
}

// Android adaptive foreground: glyph must live inside the central ~66% safe zone.
function svgForeground(color = "#FFFFFF", fill = "rgba(255,255,255,0.16)") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${glyph(0.62, color, fill)}
  </svg>`;
}

async function render(svg, file, size = 1024) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(file));
  console.log("✓", path.relative(path.join(__dirname, ".."), file));
}

const full = svgFullBleed();
const squ = svgSquircle();

await render(full, path.join(OUT, "icon.png"), 1024);
await render(squ, path.join(OUT, "logo.png"), 512);
await render(svgBackground(), path.join(IMG, "android-icon-background.png"), 1024);
await render(svgForeground(), path.join(IMG, "android-icon-foreground.png"), 1024);
await render(svgForeground("#FFFFFF", "rgba(255,255,255,0)"), path.join(IMG, "android-icon-monochrome.png"), 1024);
await render(squ, path.join(IMG, "splash-icon.png"), 1024);
await render(squ, path.join(IMG, "favicon.png"), 96);

console.log("\nAll icon assets generated.");
