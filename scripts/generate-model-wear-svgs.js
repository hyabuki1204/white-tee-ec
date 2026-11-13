const fs = require("fs");
const path = require("path");

// Placeholder on-model SVGs. The live gallery uses JPGs:
// 01 front · 02 back · 03 on-model · 04 collar detail.
const SLUGS = [
  "28g-regular-tee",
  "28g-box-tee",
  "36g-regular-tee",
  "36g-box-tee",
  "46g-regular-tee",
  "46g-box-tee",
];

const BG = "#f2f1ed";
const SKIN = "#ddd9d2";
const LIMB = "#d4d2cb";
const TEE = "#fafaf9";
const SHADOW = "#e8e6e1";

function frontSvg(slug) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${slug} model front">
  <rect width="100%" height="100%" fill="${BG}"/>
  <ellipse cx="400" cy="930" rx="130" ry="14" fill="${SHADOW}" opacity="0.7"/>
  <path d="M355 640 L352 900 M445 640 L448 900" stroke="${LIMB}" stroke-width="30" stroke-linecap="round"/>
  <rect x="325" y="390" width="150" height="270" rx="10" fill="${TEE}"/>
  <path d="M325 430 L250 580 M475 430 L550 580" stroke="${LIMB}" stroke-width="24" stroke-linecap="round"/>
  <rect x="368" y="310" width="64" height="88" rx="32" fill="${SKIN}"/>
  <text x="50%" y="960" text-anchor="middle" fill="#c8c4bc" font-family="system-ui,sans-serif" font-size="11" letter-spacing="0.18em">MODEL · FRONT</text>
</svg>`;
}

const outDir = path.join(__dirname, "..", "public", "products");

for (const slug of SLUGS) {
  fs.writeFileSync(path.join(outDir, `${slug}-03.svg`), frontSvg(slug));
}

console.log(`Generated ${SLUGS.length} model wear SVGs.`);
