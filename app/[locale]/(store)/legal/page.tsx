import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { EnglishLegalNotice } from "@/components/legal/EnglishLegalNotice";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { LEGAL_SUMMARY_EN } from "@/lib/store-ui/info-pages";
import { getLegalBusiness } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { textLinkClass } from "@/lib/store-ui/ui-classes";

type LegalPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({
    title: "Legal Notice",
    description:
      locale === "en" ? LEGAL_SUMMARY_EN.legal.lead : "特定商取引法に基づく表記",
    path: "/legal",
    locale,
  });
}

const shippingLink = (
  <Link href="/shipping" className={textLinkClass}>
    配送・返品
  </Link>
);

export default async function LegalPage({ params }: LegalPageProps) {
  const locale = await resolveLocale(params);
  const legal = await getLegalBusiness();

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "販売業者", value: legal.operator },
    { label: "所在地", value: legal.address },
    { label: "連絡先", value: legal.email },
    { label: "電話番号", value: legal.phone },
    { label: "販売価格", value: "各商品ページに税込価格を表示しています。" },
    {
      label: "商品代金以外の必要料金",
      value: <>送料。金額は{shippingLink}のページをご覧ください。</>,
    },
    { label: "支払方法", value: "クレジットカード（Stripe）" },
    { label: "支払時期", value: "注文確定時" },
    { label: "商品の引渡時期", value: "決済確認後、3〜7営業日以内に発送" },
    {
      label: "返品・交換",
      value: <>条件は{shippingLink}のページをご覧ください。</>,
    },
  ];

  const original = (
      <dl className="border-t border-[var(--color-ink)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-b border-[var(--color-hairline)] py-5 md:grid-cols-12 md:gap-0 md:py-6"
          >
            <dt className="text-[14px] font-bold tracking-[0.06em] text-[var(--color-ink)] md:col-span-4">
              {row.label}
            </dt>
            <dd className="type-body break-words text-[var(--color-ink)] md:col-span-7 md:col-start-6">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
  );

  if (locale === "en") {
    return (
      <LegalPageLayout
        label={LEGAL_SUMMARY_EN.legal.label}
        title={LEGAL_SUMMARY_EN.legal.title}
      >
        <EnglishLegalNotice page="legal">{original}</EnglishLegalNotice>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      label="Legal Notice"
      title="特定商取引法に基づく表記"
    >
      {original}
    </LegalPageLayout>
  );
}
