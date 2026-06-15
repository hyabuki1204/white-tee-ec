const fs = require("fs");
const path = require("path");

const SLUGS = [
  "heavyweight-crew-neck",
  "lightweight-pocket-tee",
  "relaxed-fit-tee",
  "compact-cotton-tee",
  "long-sleeve-essential",
  "box-fit-tee",
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

function sideSvg(slug) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${slug} model side">
  <rect width="100%" height="100%" fill="${BG}"/>
  <ellipse cx="420" cy="930" rx="120" ry="14" fill="${SHADOW}" opacity="0.7"/>
  <path d="M410 640 L405 900" stroke="${LIMB}" stroke-width="30" stroke-linecap="round"/>
  <path d="M395 390 Q455 400 460 660 Q455 670 395 660 Z" fill="${TEE}"/>
  <path d="M430 430 Q520 500 505 590" stroke="${LIMB}" stroke-width="24" stroke-linecap="round" fill="none"/>
  <ellipse cx="430" cy="340" rx="36" ry="44" fill="${SKIN}"/>
  <text x="50%" y="960" text-anchor="middle" fill="#c8c4bc" font-family="system-ui,sans-serif" font-size="11" letter-spacing="0.18em">MODEL · SIDE</text>
</svg>`;
}

const outDir = path.join(__dirname, "..", "public", "products");

for (const slug of SLUGS) {
  fs.writeFileSync(path.join(outDir, `${slug}-04.svg`), frontSvg(slug));
  fs.writeFileSync(path.join(outDir, `${slug}-05.svg`), sideSvg(slug));
}

console.log(`Generated ${SLUGS.length * 2} model wear SVGs.`);
