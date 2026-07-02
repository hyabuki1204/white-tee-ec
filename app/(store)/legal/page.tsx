import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getLegalBusiness } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Legal Notice",
    description: "特定商取引法に基づく表記",
    path: "/legal",
  });
}

export default async function LegalPage() {
  const legal = await getLegalBusiness();

  const rows = [
    { label: "販売業者", value: legal.operator },
    { label: "所在地", value: legal.address },
    { label: "連絡先", value: legal.email },
    { label: "電話番号", value: legal.phone },
    { label: "販売価格", value: "各商品ページに税込価格を表示" },
    { label: "商品代金以外の必要料金", value: "送料（Shipping ページ参照）" },
    { label: "支払方法", value: "クレジットカード（Stripe）" },
    { label: "支払時期", value: "注文確定時" },
    { label: "商品の引渡時期", value: "決済確認後 3〜7 営業日以内に発送" },
    { label: "返品・交換", value: "Shipping & Returns ページ参照" },
  ] as const;

  return (
    <LegalPageLayout title="Legal Notice">
      <p className="text-center text-neutral-600">
        特定商取引法に基づく表記
      </p>

      <dl className="divide-y divide-neutral-200/70 border-t border-neutral-200/70">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2 py-6 md:grid-cols-[10rem_1fr]">
            <dt className="text-neutral-600">{row.label}</dt>
            <dd className="text-neutral-600">{row.value}</dd>
          </div>
        ))}
      </dl>
    </LegalPageLayout>
  );
}
