import "server-only";

/**
 * Plain-text transactional email through Resend — the same provider and
 * env vars as send-shipping-notification.ts (RESEND_API_KEY, EMAIL_FROM).
 *
 * Never throws. When email is not configured this is a no-op that reports
 * `not_configured`, so callers can leave their work pending instead of
 * recording a send that did not happen.
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  /**
   * Resend drops a second request with the same key for 24 hours, which
   * keeps a retried or concurrent dispatch from mailing someone twice.
   */
  idempotencyKey?: string;
};

export type SendEmailResult =
  | { sent: true }
  | {
      sent: false;
      reason: "not_configured" | "rate_limited" | "failed";
      detail?: string;
    };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey }
          : {}),
      },
      // `text` only: no HTML part, so there is nothing to carry a tracking
      // pixel or rewritten links.
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return { sent: true };
    }

    return {
      sent: false,
      reason: response.status === 429 ? "rate_limited" : "failed",
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      sent: false,
      reason: "failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
