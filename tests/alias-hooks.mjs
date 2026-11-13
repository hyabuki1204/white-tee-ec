/**
 * Lets `node --test` import the app's TypeScript directly.
 *
 * Node strips types on its own; the only thing missing is the "@/..." path
 * alias from tsconfig.json, which this resolve hook maps onto the repo root,
 * and Next's "server-only" marker import.
 * No test runner or transpiler dependency is involved.
 */
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    // Next.js provides this marker package at build time; outside the
    // bundler it has nothing to do.
    if (specifier === "server-only") {
      return { url: "data:text/javascript,", shortCircuit: true };
    }

    if (specifier.startsWith("@/")) {
      const base = join(root, specifier.slice(2));
      const match = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(
        (candidate) => existsSync(candidate),
      );

      if (match) {
        return nextResolve(pathToFileURL(match).href, context);
      }
    }

    return nextResolve(specifier, context);
  },
});
