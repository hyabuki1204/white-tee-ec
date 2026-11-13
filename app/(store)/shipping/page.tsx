import type { Metadata } from "next";
import Link from "next/link";
import { InfoRows } from "@/components/layout/InfoRows";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getShippingContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { RETURNS_POLICY } from "@/lib/store-ui/returns-policy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/lib/store-ui/ui-classes";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "配送・返品",
    description: "配送・返品について",
    path: "/shipping",
  });
}

const FACTS = [
  { value: "3–7", unit: "営業日", label: "ご注文確定から発送まで" },
  { value: "¥600", unit: "", label: "送料（全国一律・税込）" },
  { value: "¥10,000", unit: "以上", label: "送料無料になるご注文額" },
  { value: String(RETURNS_POLICY.windowDays), unit: "日以内", label: "返品のご連絡期限（到着後）" },
] as const;

export default async function ShippingPage() {
  const shipping = await getShippingContent();

  return (
    <LegalPageLayout
      label={shipping.pageTitle}
      title="配送・返品"
      lead="発送までの日数、送料、返品の条件です。"
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {FACTS.map((fact) => (
          <div key={fact.label} className="border-t border-[var(--color-ink)] pt-4">
            <dd className="font-en text-[clamp(28px,3.6vw,44px)] font-light leading-none tracking-[-0.02em] tabular-nums text-[var(--color-ink)]">
              {fact.value}
              {fact.unit ? (
                <span className="ml-1 font-[family-name:var(--font-sans-jp)] text-[13px] font-normal tracking-[0.04em]">
                  {fact.unit}
                </span>
              ) : null}
            </dd>
            <dt className="type-caption mt-3">{fact.label}</dt>
          </div>
        ))}
      </dl>

      <InfoRows
        className="mt-[var(--space-5)]"
        rows={shipping.sections.map((section) => ({
          title: section.title,
          body: section.body,
        }))}
      />

      <div className="mt-[var(--space-4)] flex flex-wrap gap-3">
        <Link href="/contact" className={buttonPrimaryClass}>
          返品・交換のご連絡
        </Link>
        <Link href="/store-guide" className={buttonSecondaryClass}>
          ご利用ガイド
        </Link>
      </div>
    </LegalPageLayout>
  );
}
