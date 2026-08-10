/**
 * Shared client for the image pipeline scripts.
 *
 * These scripts deliberately hold no pipeline logic: they POST to
 * /api/internal/images/tick and read the database. The state machine lives
 * in the Route Handler alone, so there is never a second implementation to
 * keep in sync — which also means these scripts exercise the same code path
 * that GitHub Actions and production use.
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DEFAULT_BASE_URL = "http://localhost:3000";

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { flags: new Set(), values: {} };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];

    if (next && !next.startsWith("--")) {
      args.values[key] = next;
      i += 1;
    } else {
      args.flags.add(key);
    }
  }

  return args;
}

export function resolveBaseUrl(args) {
  if (args.values.url) {
    return args.values.url.replace(/\/$/, "");
  }

  if (args.flags.has("remote")) {
    const remote = process.env.IMAGE_TICK_URL;

    if (!remote) {
      throw new Error(
        "--remote requires IMAGE_TICK_URL to be set (the deployed tick URL).",
      );
    }

    return remote.replace(/\/api\/internal\/images\/tick$/, "");
  }

  return process.env.IMAGE_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;
}

export async function postTick(baseUrl) {
  const secret = process.env.IMAGE_WORKER_SECRET;

  if (!secret) {
    throw new Error(
      "IMAGE_WORKER_SECRET is not set. Add it to .env.local to drive the runner.",
    );
  }

  let response;

  try {
    response = await fetch(`${baseUrl}/api/internal/images/tick`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
    });
  } catch (error) {
    throw new Error(
      `Could not reach ${baseUrl}. Is \`npm run dev\` running? (${error.message})`,
    );
  }

  if (response.status === 401) {
    throw new Error(
      "Tick rejected the worker secret (401). Check IMAGE_WORKER_SECRET.",
    );
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Tick failed with HTTP ${response.status}: ${body.error ?? "unknown error"}`,
    );
  }

  return body;
}

export function formatCounts(counts) {
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
