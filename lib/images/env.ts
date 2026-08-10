import type { ImageProviderId } from "@/lib/images/providers/types";

/**
 * Environment for the image generation pipeline.
 *
 * Every value here is server-only. None of these may ever be given a
 * NEXT_PUBLIC_ prefix: an API key reachable from the browser is a key
 * anyone can spend.
 */

const KNOWN_PROVIDER_IDS: readonly ImageProviderId[] = [
  "mock",
  "midjourney_proxy",
  "flux_bfl",
  "openai_images",
];

export const DEFAULT_MONTHLY_BUDGET_JPY = 20000;
export const BUDGET_WARNING_RATIO = 0.8;

/** Private bucket holding unapproved generations. Never publicly readable. */
export const IMAGE_DRAFTS_BUCKET = "ai-image-drafts";

export function getImageProviderApiKey(): string | undefined {
  return process.env.IMAGE_PROVIDER_API_KEY;
}

export function getImageProviderBaseUrl(): string | undefined {
  return process.env.IMAGE_PROVIDER_BASE_URL;
}

export function getImageProviderWebhookSecret(): string | undefined {
  return process.env.IMAGE_PROVIDER_WEBHOOK_SECRET;
}

export function getImageWorkerSecret(): string | undefined {
  return process.env.IMAGE_WORKER_SECRET;
}

/**
 * Which provider to use.
 *
 * Mirrors getDataSource(): an unset or unrecognised value falls back to the
 * mock, and so does a real provider id with no API key behind it. The result
 * is that a fresh checkout runs the whole pipeline offline and free, and
 * nobody is billed by forgetting to set something.
 */
export function getImageProviderId(): ImageProviderId {
  const explicit = process.env.IMAGE_PROVIDER as ImageProviderId | undefined;

  if (explicit === "mock") {
    return "mock";
  }

  if (!explicit || !KNOWN_PROVIDER_IDS.includes(explicit)) {
    return "mock";
  }

  return getImageProviderApiKey() ? explicit : "mock";
}

export function isMockImageProvider(): boolean {
  return getImageProviderId() === "mock";
}

export function getMonthlyBudgetJpy(): number {
  const raw = process.env.IMAGE_MONTHLY_BUDGET_JPY;
  const parsed = raw === undefined ? Number.NaN : Number(raw);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MONTHLY_BUDGET_JPY;
}

/**
 * How far the agent may drive the pipeline unattended.
 *
 * There is deliberately no value that permits auto-approving production
 * work. A flag that can turn off the human gate is a flag that eventually
 * gets left on in production; if the value does not exist, that cannot
 * happen. See design doc §7.8.
 */
export type AgentAutopilotMode = "off" | "internal_test_only";

export function getAgentAutopilotMode(): AgentAutopilotMode {
  return process.env.IMAGE_AGENT_AUTOPILOT === "internal_test_only"
    ? "internal_test_only"
    : "off";
}

// --- Mock knobs (development only) -----------------------------------------

export function getMockLatencyMs(): number {
  const parsed = Number(process.env.IMAGE_MOCK_LATENCY_MS);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3000;
}

/** 0.0–1.0. Injects transient failures so retry paths actually get walked. */
export function getMockFailureRate(): number {
  const parsed = Number(process.env.IMAGE_MOCK_FAILURE_RATE);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(Math.max(parsed, 0), 1);
}

/** 0.0–1.0. Fraction of variants that fail to download within a job. */
export function getMockPartialFailureRate(): number {
  const parsed = Number(process.env.IMAGE_MOCK_PARTIAL_FAILURE_RATE);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(Math.max(parsed, 0), 1);
}
