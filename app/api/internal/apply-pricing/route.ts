import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCT_PRICE_BY_SLUG } from "@/lib/products/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * One-shot premium pricing sync for production.
 * Protected by MIGRATION_SECRET header (set on Vercel).
 * POST /api/internal/apply-pricing
 * Header: Authorization: Bearer <MIGRATION_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.MIGRATION_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "MIGRATION_SECRET is not configured" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const slugs = Object.keys(PRODUCT_PRICE_BY_SLUG);

  const { data: rows, error: fetchError } = await supabase
    .from("products")
    .select("slug, price")
    .in("slug", slugs);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const currentBySlug = Object.fromEntries(
    (rows ?? []).map((row) => [row.slug, row.price]),
  );

  const updated: string[] = [];
  const skipped: string[] = [];

  for (const [slug, price] of Object.entries(PRODUCT_PRICE_BY_SLUG)) {
    if (currentBySlug[slug] === price) {
      skipped.push(slug);
      continue;
    }

    const { error } = await supabase
      .from("products")
      .update({ price, updated_at: new Date().toISOString() })
      .eq("slug", slug);

    if (error) {
      return NextResponse.json(
        { error: `${slug}: ${error.message}` },
        { status: 500 },
      );
    }

    updated.push(slug);
  }

  return NextResponse.json({ ok: true, updated, skipped });
}
