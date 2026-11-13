/**
 * Renders every English storefront route on a running server and fails if
 *
 *   - a route does not answer with the expected status,
 *   - `<html lang>` is not "en",
 *   - Japanese text (Hiragana, Katakana, Kanji, CJK punctuation, full-width
 *     forms) is found outside the explicit allow-list, or
 *   - an internal link leaves the English storefront.
 *
 * Usage (server must be running, e.g. `npm run build && npx next start -p 3141`):
 *
 *   npm run check:en                          # http://localhost:3141
 *   npm run check:en -- http://localhost:3000
 *   npm run check:en -- --no-browser          # server HTML only
 *
 * With Playwright available (it is resolved through NODE_PATH; it is not a
 * dependency of this repo) pages are checked as rendered in Chromium, at
 * desktop and phone widths, including the search overlay, the mobile menu,
 * the cart drawer, the gauge tabs and the product purchase controls.
 * Without it, the server HTML and the data sent to client components are
 * checked.
 *
 * Allow-list (lib/i18n/japanese-text.ts):
 *   - the mill's registered name カネマサ莫大小株式会社, once per page, and
 *     its address in Japanese, once per page (both sit beside English);
 *   - on /en/legal, /en/privacy and /en/terms only: the block marked
 *     `data-legal-original`, which is the governing Japanese text.
 */
import { createRequire } from "node:module";
import { findJapanese } from "@/lib/i18n/japanese-text";

const args = process.argv.slice(2);
const useBrowser = !args.includes("--no-browser");
const verbose = args.includes("--verbose");
const BASE = (
  args.find((arg) => arg.startsWith("http")) ??
  process.env.CHECK_BASE_URL ??
  "http://localhost:3141"
).replace(/\/$/, "");

/** Routes that are not in the sitemap, and the status each must return. */
const EXTRA_ROUTES: Array<[string, number]> = [
  ["/en/cart", 200],
  ["/en/saved", 200],
  ["/en/checkout/cancel", 200],
  ["/en/checkout/success", 200],
  ["/en/concierge?from=46g-regular-tee", 200],
  ["/en/products?fabric=46g-jersey&fit=boxy", 200],
  ["/en/products?stock=in", 200],
  ["/en/nope", 404],
  ["/en/nope/deeper", 404],
  ["/en/products/nope", 404],
  ["/en/fabric/nope", 404],
  ["/en/journal/nope", 404],
];

/** Pages on which the governing Japanese legal text is shown. */
const LEGAL_ROUTES = new Set(["/en/legal", "/en/privacy", "/en/terms"]);

const TEXT_ATTRIBUTES = ["alt", "title", "aria-label", "placeholder", "content"];

type Problem = { route: string; kind: string; detail: string };

const problems: Problem[] = [];

function report(route: string, kind: string, detail: string) {
  problems.push({ route, kind, detail });
}

async function discoverRoutes(): Promise<Array<[string, number]>> {
  const response = await fetch(`${BASE}/sitemap.xml`);

  if (!response.ok) {
    throw new Error(`Cannot read ${BASE}/sitemap.xml (${response.status}). Is the server running?`);
  }

  const xml = await response.text();
  const paths = new Set<string>();

  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const { pathname } = new URL(match[1]!);
    if (pathname === "/en" || pathname.startsWith("/en/")) paths.add(pathname);
  }

  if (paths.size === 0) {
    throw new Error("The sitemap lists no /en routes.");
  }

  return [...[...paths].sort().map((path): [string, number] => [path, 200]), ...EXTRA_ROUTES];
}

function checkText(route: string, where: string, text: string) {
  for (const run of findJapanese(text)) {
    report(route, "japanese", `${where}: ${run.slice(0, 60)}`);
  }
}

/* —— Server HTML (always) —— */

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function checkServerHtml(route: string, expectedStatus: number) {
  const response = await fetch(`${BASE}${route}`, { redirect: "manual" });

  if (response.status !== expectedStatus) {
    report(route, "status", `expected ${expectedStatus}, got ${response.status}`);
    return;
  }

  let html = await response.text();
  const pathname = route.split("?")[0]!;

  if (expectedStatus === 200 && !/<html[^>]*\slang="en"/.test(html)) {
    report(route, "lang", "<html lang> is not \"en\"");
  }

  if (LEGAL_ROUTES.has(pathname)) {
    // The governing Japanese text is the last block of <main>.
    const start = html.indexOf("data-legal-original");
    const end = html.indexOf("</main>", start);

    if (start === -1) {
      report(route, "legal", "the Japanese original is missing");
    } else {
      html = html.slice(0, start) + html.slice(end === -1 ? html.length : end);
    }

    if (!html.includes("The Japanese text is the governing version.")) {
      report(route, "legal", "the governing-version notice is missing");
    }
  }

  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(
    (match) => match[1]!,
  );
  const markup = html
    .replace(/<script\b[\s\S]*?<\/script>/g, " ")
    .replace(/<style\b[\s\S]*?<\/style>/g, " ");

  checkText(route, "html", decodeEntities(markup));

  // Data handed to client components (e.g. the product list for search).
  // On legal pages this carries the Japanese original, which is allowed.
  if (!LEGAL_ROUTES.has(pathname)) {
    for (const script of scripts) {
      let payload = script;

      try {
        // Flight chunks are JSON strings inside self.__next_f.push([1,"…"]).
        payload = script.replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) =>
          String.fromCharCode(parseInt(hex, 16)),
        );
      } catch {
        // Keep the raw text.
      }

      checkText(route, "data sent to the browser", payload);
    }
  }
}

/* —— Rendered page (Playwright, when available) —— */

type Page = {
  goto(url: string, options?: object): Promise<{ status(): number } | null>;
  evaluate<T>(fn: string | ((arg: never) => T), arg?: unknown): Promise<T>;
  waitForTimeout(ms: number): Promise<void>;
  locator(selector: string): {
    first(): { click(options?: object): Promise<void>; count(): Promise<number> };
    count(): Promise<number>;
  };
  keyboard: { press(key: string): Promise<void> };
};

const COLLECT = `(() => {
  const allowLegal = ${JSON.stringify([...LEGAL_ROUTES])}.includes(location.pathname);
  const root = document.documentElement.cloneNode(true);
  root.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  if (allowLegal) root.querySelectorAll("[data-legal-original]").forEach((node) => node.remove());
  const attributes = [];
  for (const node of root.querySelectorAll("*")) {
    for (const name of ${JSON.stringify(TEXT_ATTRIBUTES)}) {
      const value = node.getAttribute(name);
      if (value) attributes.push(value);
    }
    if (node instanceof HTMLInputElement && node.type !== "hidden" && node.value) attributes.push(node.value);
  }
  const links = [...document.querySelectorAll("a[href]")]
    .filter((a) => a.getAttribute("hreflang") !== "ja")
    .map((a) => a.getAttribute("href"))
    .filter((href) => href.startsWith("/") && !href.startsWith("//"));
  return {
    lang: document.documentElement.lang,
    text: root.textContent ?? "",
    attributes,
    links,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
})()`;

type Collected = {
  lang: string;
  text: string;
  attributes: string[];
  links: string[];
  overflow: boolean;
};

async function scan(page: Page, route: string, state: string) {
  const data = (await page.evaluate(COLLECT)) as Collected;
  const label = state ? ` [${state}]` : "";

  if (data.lang !== "en") {
    report(route, "lang", `<html lang="${data.lang}">${label}`);
  }

  checkText(route, `text${label}`, data.text);
  checkText(route, `attributes${label}`, data.attributes.join("\n"));

  for (const href of new Set(data.links)) {
    const pathname = href.split(/[?#]/)[0]!;
    const isFile = /\.[a-z0-9]+$/i.test(pathname);

    if (!isFile && pathname !== "/en" && !pathname.startsWith("/en/")) {
      report(route, "link", `leaves the English storefront: ${href}${label}`);
    }
  }

  if (data.overflow) {
    report(route, "layout", `page scrolls sideways${label}`);
  }
}

async function click(page: Page, selector: string): Promise<boolean> {
  const target = page.locator(selector);

  if ((await target.count()) === 0) return false;

  try {
    await target.first().click({ timeout: 1500 });
    await page.waitForTimeout(450);
    return true;
  } catch {
    return false;
  }
}

async function checkRendered(
  page: Page,
  route: string,
  expectedStatus: number,
  viewport: "desktop" | "phone",
) {
  let status = 0;

  try {
    // Not "load" or "networkidle": the home page streams a looping video.
    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    status = response?.status() ?? 0;
  } catch (error) {
    report(route, "load", error instanceof Error ? error.message.split("\n")[0]! : "failed");
    return;
  }

  if (status !== expectedStatus) {
    report(route, "status", `expected ${expectedStatus}, got ${status} (${viewport})`);
    return;
  }

  // Let hydration and the client-rendered parts (cart, saved, 404) settle.
  await page.waitForTimeout(1200);
  await scan(page, route, viewport);

  const pathname = route.split("?")[0]!;

  if (viewport === "phone") {
    if (pathname === "/en" || pathname === "/en/products/46g-regular-tee") {
      if (await click(page, 'button[aria-controls="mobile-navigation"]')) {
        await scan(page, route, "phone, menu open");
      }
    }
    return;
  }

  // Search overlay and cart drawer exist on every page.
  if (pathname === "/en" || pathname === "/en/products") {
    if (await click(page, 'header button:has-text("Search")')) {
      await scan(page, route, "search open");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }

    if (await click(page, 'header button:has-text("Bag")')) {
      await scan(page, route, "cart drawer open");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
  }

  if (pathname === "/en") {
    for (const index of [0, 1]) {
      if (await click(page, `#gauge [role="tab"] >> nth=${index}`)) {
        await scan(page, route, `gauge tab ${index + 1}`);
      }
    }
  }

  if (pathname === "/en/products/46g-regular-tee") {
    // Nothing chosen: the button explains what is missing.
    await click(page, 'main button:has-text("Select a size")');
    await scan(page, route, "no size chosen");
    await click(page, 'main button[aria-label^="Size M"]');
    await click(page, 'main summary:has-text("Find your size")');
    await click(page, 'main button:has-text("Care")');
    await click(page, 'main button:has-text("Shipping & returns")');
    await scan(page, route, "size M, panels open");
    await click(page, 'main button:has-text("Add to bag")');
    await click(page, 'main button:has-text("Save")');
    await scan(page, route, "added and saved");
  }
}

async function launchBrowser() {
  if (!useBrowser) return null;

  try {
    const require = createRequire(import.meta.url);
    const { chromium } = require("playwright") as {
      chromium: { launch(): Promise<Browser> };
    };
    return await chromium.launch();
  } catch {
    return null;
  }
}

type Browser = {
  newContext(options: object): Promise<{
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }>;
  close(): Promise<void>;
};

async function main() {
  const routes = await discoverRoutes();

  for (const [route, status] of routes) {
    await checkServerHtml(route, status);
  }

  const browser = await launchBrowser();

  if (browser) {
    for (const [viewport, size] of [
      ["desktop", { width: 1440, height: 900 }],
      ["phone", { width: 390, height: 844 }],
    ] as const) {
      const context = await browser.newContext({
        viewport: size,
        locale: "en-GB",
        reducedMotion: "reduce",
      });
      const page = await context.newPage();

      for (const [route, status] of routes) {
        const started = Date.now();
        await checkRendered(page, route, status, viewport);
        if (verbose) console.log(`  ${viewport} ${route} ${Date.now() - started}ms`);
      }

      await context.close();
    }

    await browser.close();
  }

  const mode = browser
    ? "server HTML + rendered in Chromium (1440 and 390)"
    : "server HTML only (Playwright not available)";

  console.log(`check-english-routes: ${routes.length} routes on ${BASE} — ${mode}`);

  if (problems.length === 0) {
    console.log("OK: no Japanese outside the allow-list, statuses and links as expected.");
    return;
  }

  const seen = new Set<string>();

  for (const { route, kind, detail } of problems) {
    const line = `${route}  [${kind}]  ${detail}`;
    if (seen.has(line)) continue;
    seen.add(line);
    console.error(`FAIL ${line}`);
  }

  console.error(`\n${seen.size} problem(s).`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
