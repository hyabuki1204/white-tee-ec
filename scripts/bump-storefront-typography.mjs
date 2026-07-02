#!/usr/bin/env node
/**
 * Bump storefront typography +1px and darken muted text colors.
 * Excludes admin UI.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", "admin", ".git"]);
const EXT = new Set([".tsx", ".ts", ".css"]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (path.includes(`${join("components", "admin")}`)) continue;
      if (path.includes(`${join("app", "admin")}`)) continue;
      walk(path, files);
    } else if (EXT.has(name.slice(name.lastIndexOf(".")))) {
      files.push(path);
    }
  }
  return files;
}

const SIZE_REPLACEMENTS = [
  ["text-[15px]", "text-[16px]"],
  ["text-[14px]", "text-[15px]"],
  ["text-[13px]", "text-[14px]"],
  ["text-[12px]", "text-[13px]"],
  ["text-[11px]", "text-[12px]"],
  ["text-[10px]", "text-[11px]"],
  ["text-[9px]", "text-[10px]"],
  ["md:text-[14px]", "md:text-[15px]"],
  ["md:text-[13px]", "md:text-[14px]"],
  ["md:text-[12px]", "md:text-[13px]"],
  ["md:text-[11px]", "md:text-[12px]"],
  ["md:text-[10px]", "md:text-[12px]"],
  ["md:text-xs", "md:text-[13px]"],
];

const COLOR_REPLACEMENTS = [
  ["text-[#c8c8c6]", "text-[#a8a8a6]"],
  ["text-[#9a9a9a]", "text-[#7a7a7a]"],
  ["text-[#6c6c6c]", "text-[#505050]"],
  ["text-neutral-500/90", "text-neutral-600/90"],
  ["text-neutral-400", "text-neutral-500"],
  ["text-neutral-500", "text-neutral-600"],
  ["text-neutral-300", "text-neutral-400"],
];

function applyReplacements(content) {
  let next = content;
  for (const [from, to] of SIZE_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  for (const [from, to] of COLOR_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

const targets = [
  ...walk(join(ROOT, "components")),
  ...walk(join(ROOT, "app", "(store)")),
  join(ROOT, "app", "globals.css"),
  join(ROOT, "lib", "copy", "site-ui.ts"),
  join(ROOT, "lib", "store-ui", "typography.ts"),
].filter((p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
});

let changed = 0;
for (const file of targets) {
  const original = readFileSync(file, "utf8");
  const updated = applyReplacements(original);
  if (updated !== original) {
    writeFileSync(file, updated);
    changed += 1;
  }
}

console.log(`Updated ${changed} files.`);
