import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter/subscribe";

type NewsletterRequestBody = {
  email?: unknown;
  source?: unknown;
  /** Honeypot — hidden from people, filled by naive bots. */
  company?: unknown;
};

export async function POST(request: Request) {
  let body: NewsletterRequestBody;

  try {
    body = (await request.json()) as NewsletterRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 },
    );
  }

  // Pretend success to bots so they don't retry with variations.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = await subscribeToNewsletter(body.email, body.source);

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: result.reason },
    { status: result.reason === "invalid_email" ? 400 : 503 },
  );
}
