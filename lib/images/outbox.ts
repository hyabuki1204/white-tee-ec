import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json } from "@/types/database";

/**
 * Outbound integration events.
 *
 * The boundary with n8n / Make is deliberately narrow: two holes, one out
 * and one in. Automation tools never hold an API key, never write to the
 * database, and never make an approval decision — those stay inside the
 * application, which is the only place that can be held to the release
 * policy.
 *
 * See docs/image-generation-workflow.md §9.
 */

export type OutboxEventType =
  | "image.review_pending"
  | "image.approved"
  | "image.rejected"
  | "image.job_failed"
  | "image.budget_warning";

export function getN8nWebhookUrl(): string | undefined {
  return process.env.N8N_WEBHOOK_URL;
}

export function getSigningSecret(): string | undefined {
  return process.env.N8N_SIGNING_SECRET;
}

/**
 * Queue an event.
 *
 * Never throws: a notification that cannot be queued must not fail the
 * approval or generation that triggered it.
 */
export async function enqueueOutboxEvent(
  eventType: OutboxEventType,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = createSupabaseAdminClient();

    await supabase
      .from("integration_outbox")
      .insert({ event_type: eventType, payload: payload as Json });
  } catch {
    // Intentionally ignored.
  }
}

export function signPayload(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

/** Constant-time compare, so a bad signature leaks nothing by timing. */
export function verifySignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }

  const expected = Buffer.from(signPayload(body, secret));
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export type DispatchResult = {
  delivered: number;
  failed: number;
  skipped: boolean;
};

const BATCH_SIZE = 20;

export async function dispatchOutbox(): Promise<DispatchResult> {
  const url = getN8nWebhookUrl();
  const secret = getSigningSecret();

  if (!isSupabaseConfigured() || !url || !secret) {
    return { delivered: 0, failed: 0, skipped: true };
  }

  const supabase = createSupabaseAdminClient();

  const { data: pending, error } = await supabase
    .from("integration_outbox")
    .select("*")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to read outbox: ${error.message}`);
  }

  const result: DispatchResult = { delivered: 0, failed: 0, skipped: false };

  for (const row of pending ?? []) {
    // The event id is the dedupe key on the consumer side, since delivery
    // is at-least-once.
    const body = JSON.stringify({
      id: row.id,
      type: row.event_type,
      createdAt: row.created_at,
      payload: row.payload,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-whitetee-signature": signPayload(body, secret),
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await supabase
        .from("integration_outbox")
        .update({ status: "delivered", delivered_at: new Date().toISOString() })
        .eq("id", row.id);

      result.delivered += 1;
    } catch (caught) {
      const attempt = row.attempt_count + 1;
      const exhausted = attempt >= row.max_attempts;

      await supabase
        .from("integration_outbox")
        .update({
          status: exhausted ? "failed" : "pending",
          attempt_count: attempt,
          next_attempt_at: new Date(
            Date.now() + Math.min(2 ** attempt * 30, 900) * 1000,
          ).toISOString(),
          last_error:
            caught instanceof Error ? caught.message : String(caught),
        })
        .eq("id", row.id);

      result.failed += 1;
    }
  }

  return result;
}
