import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { getSiteContent } from "@/lib/content/queries";
import { listProductsForAdmin } from "@/lib/products/admin-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "ホームページ設定 | 管理画面 | WHITE TEE",
};

export default async function AdminContentPage() {
  const [home, about, stories, products] = await Promise.all([
    getSiteContent("home"),
    getSiteContent("about"),
    getSiteContent("stories"),
    isSupabaseConfigured() ? listProductsForAdmin() : Promise.resolve([]),
  ]);

  const productOptions = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    isPublished: product.isPublished,
  }));

  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader
        title={ADMIN_COPY.content.title}
        subtitle={ADMIN_COPY.content.subtitle}
      />
      <ContentEditor
        initialContent={{ home, about, stories }}
        products={productOptions}
      />
      <AdminBackLink href="/admin" label={ADMIN_COPY.common.backToDashboard} />
    </Container>
  );
}
