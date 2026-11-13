import type { Metadata } from "next";
import Link from "next/link";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  STORE_GUIDE_PAGE,
  STORE_GUIDE_SECTIONS,
} from "@/lib/store-ui/store-guide";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/lib/store-ui/ui-classes";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: STORE_GUIDE_PAGE.title,
    description: STORE_GUIDE_PAGE.intro,
    path: "/store-guide",
  });
}

export default function StoreGuidePage() {
  return (
    <LegalPageLayout
      label="Guide"
      title={STORE_GUIDE_PAGE.title}
      lead={STORE_GUIDE_PAGE.intro}
    >
      <InfoRows
        numbered
        rows={STORE_GUIDE_SECTIONS.map((section) => ({
          title: section.title,
          body: section.summary,
          href: section.href,
          linkLabel: section.linkLabel,
        }))}
      />

      <div className="mt-[var(--space-4)] flex flex-wrap gap-3">
        <Link href="/shipping" className={buttonPrimaryClass}>
          配送・返品の詳細
        </Link>
        <Link href="/contact" className={buttonSecondaryClass}>
          お問い合わせ
        </Link>
      </div>
    </LegalPageLayout>
  );
}
