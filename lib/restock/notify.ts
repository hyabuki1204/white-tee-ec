import "server-only";

import {
  getPendingRestockRequests,
  markRestockRequestNotified,
} from "@/lib/db/restock/repository";
import { isEmailConfigured, sendEmail } from "@/lib/email/send-email";
import type { Locale } from "@/lib/i18n/config";
import { localizedUrl } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProductSize } from "@/types";

/**
 * Back-in-stock notices.
 *
 * restock_requests is the queue: a row is pending while notified_at is
 * null, and notified_at is written only after the provider accepted the
 * message. The dispatch is level-triggered — "this size has stock and
 * someone is still waiting" — rather than tied to the single moment stock
 * went from 0 to >0, so a send that failed (or happened while email was
 * not configured) is picked up again by the next product save or by
 * POST /api/internal/restock/dispatch.
 *
 * The integration outbox (lib/images/outbox.ts) is not used: it delivers
 * signed events to n8n, and customer addresses should not leave the
 * application for a message it can send itself.
 */

/** Per run. Keeps one admin save well inside the route's time limit. */
const MAX_SENDS_PER_RUN = 50;

export type RestockDispatchResult = {
  sent: number;
  failed: number;
  /** Deliverable requests left for a later run. */
  remaining: number;
  skipped?: "no_database" | "email_not_configured";
};

export function buildRestockEmail(input: {
  productName: string;
  productSlug: string;
  size: ProductSize;
  /** Language the request was made in (restock_requests.locale). */
  locale: Locale;
}): { subject: string; text: string } {
  // The link returns the customer to the storefront in their language.
  const url = `${localizedUrl(`/products/${input.productSlug}`, input.locale)}?size=${input.size}`;
  const home = localizedUrl("/", input.locale);

  if (input.locale === "en") {
    return {
      subject: `WHITE TEE: ${input.productName} (${input.size}) is back in stock`,
      text: [
        "This is WHITE TEE.",
        "",
        "The piece you asked us to tell you about is back in stock.",
        "",
        input.productName,
        `Size: ${input.size}`,
        url,
        "",
        "Stock is limited, so it may be gone again by the time you look.",
        "",
        "Prices are charged in Japanese yen. We currently ship within Japan only.",
        "",
        "We are sending this email once, as the back-in-stock notice you registered for. We will not email you about this again.",
        "",
        "WHITE TEE",
        home,
      ].join("\n"),
    };
  }

  return {
    subject: `【WHITE TEE】${input.productName}（${input.size}）が再入荷しました`,
    text: [
      "WHITE TEE です。",
      "",
      "再入荷のお知らせをご希望いただいた商品が入荷しました。",
      "",
      input.productName,
      `サイズ：${input.size}`,
      url,
      "",
      "数に限りがあるため、ご覧いただいた時点で在庫がない場合があります。",
      "",
      "このメールは、ご登録いただいた再入荷のお知らせとして1回だけお送りしています。今後、この件でメールをお送りすることはありません。",
      "",
      "WHITE TEE",
      getSiteUrl(),
    ].join("\n"),
  };
}

/**
 * Send one email per pending request whose size is purchasable again.
 * Never throws — a notification problem must not fail the product save
 * that triggered it.
 */
export async function dispatchRestockNotifications(options?: {
  productId?: string;
}): Promise<RestockDispatchResult> {
  const result: RestockDispatchResult = { sent: 0, failed: 0, remaining: 0 };

  if (!isSupabaseConfigured()) {
    return { ...result, skipped: "no_database" };
  }

  // Nothing is marked, so every request stays pending until email exists.
  if (!isEmailConfigured()) {
    return { ...result, skipped: "email_not_configured" };
  }

  try {
    const { requests, products } = await getPendingRestockRequests(
      options?.productId,
    );

    const deliverable = requests.filter((request) => {
      const product = products.get(request.productId);

      return (
        product?.isPublished === true &&
        (product.stockBySize[request.size] ?? 0) > 0
      );
    });

    result.remaining = deliverable.length;

    for (const request of deliverable.slice(0, MAX_SENDS_PER_RUN)) {
      const product = products.get(request.productId)!;
      const email = buildRestockEmail({
        productName: product.displayName,
        productSlug: product.slug,
        size: request.size,
        locale: request.locale,
      });

      const outcome = await sendEmail({
        to: request.email,
        subject: email.subject,
        text: email.text,
        idempotencyKey: `restock-${request.id}`,
      });

      if (!outcome.sent) {
        result.failed += 1;
        console.error("restock: send failed", request.id, outcome.reason);

        // The provider is throttling: stop and leave the rest pending.
        if (outcome.reason === "rate_limited") break;
        continue;
      }

      await markRestockRequestNotified(request.id);
      result.sent += 1;
      result.remaining -= 1;
    }
  } catch (error) {
    console.error(
      "restock: dispatch failed",
      error instanceof Error ? error.message : error,
    );
  }

  return result;
}
