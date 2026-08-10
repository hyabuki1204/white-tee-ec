import type { Metadata } from "next";

import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageReviewQueue } from "@/components/admin/images/ImageReviewQueue";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { listReviewQueue } from "@/lib/db/images/review-repository";
import { IMAGE_ADMIN_COPY } from "@/lib/images/labels";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "画像レビュー | 管理画面 | WHITE TEE",
};

/**
 * Rendered per request, never cached: the signed URLs it hands out expire
 * within minutes, and a cached page would serve dead links.
 */
export const dynamic = "force-dynamic";

export default async function AdminImageReviewPage() {
  const items = isSupabaseConfigured() ? await listReviewQueue() : [];

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={IMAGE_ADMIN_COPY.review.title}
        subtitle={ADMIN_COPY.common.count(items.length, "枚")}
      />

      {!isSupabaseConfigured() ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {ADMIN_COPY.products.supabaseRequired}
        </p>
      ) : null}

      <ImageReviewQueue items={items} />

      <AdminBackLink href="/admin/images" label="画像ブリーフに戻る" />
    </Container>
  );
}
