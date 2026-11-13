import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getContactContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { textLinkClass } from "@/lib/store-ui/ui-classes";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Contact",
    description: "WHITE TEE へのお問い合わせ",
    path: "/contact",
  });
}

const BEFORE_LINKS = [
  { href: "/store-guide", label: "ご利用ガイド", note: "ご注文からお届けまでの流れ" },
  { href: "/shipping", label: "配送・返品", note: "発送日数、送料、返品の条件" },
  { href: "/fabric", label: "ゲージ", note: "28G・36G・46Gの違い" },
] as const;

export default async function ContactPage() {
  const contact = await getContactContent();

  return (
    <LegalPageLayout
      label="Contact"
      title="お問い合わせ"
      lead={contact.introLines.join("")}
    >
      <div className="grid gap-14 md:grid-cols-12 md:gap-0">
        <dl className="border-t border-[var(--color-ink)] md:col-span-7">
          {contact.email ? (
            <div className="border-b border-[var(--color-hairline)] py-7">
              <dt className="type-caption">メール</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all font-en text-[clamp(20px,2.6vw,30px)] leading-snug tracking-[0.01em] text-[var(--color-ink)] underline decoration-[var(--color-hairline)] underline-offset-8 transition-colors duration-[var(--duration-quiet)] hover:text-[var(--color-navy)] hover:decoration-[var(--color-navy)]"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
          ) : null}
          {contact.hours ? (
            <div className="border-b border-[var(--color-hairline)] py-7">
              <dt className="type-caption">受付</dt>
              <dd className="type-body mt-2 text-[var(--color-ink)]">
                {contact.hours}
              </dd>
            </div>
          ) : null}
          <div className="border-b border-[var(--color-hairline)] py-7">
            <dt className="type-caption">ご注文についてのお問い合わせ</dt>
            <dd className="type-body mt-2 max-w-[36em] text-[var(--color-ink)]">
              確認メールに記載の注文番号を添えてご連絡ください。
            </dd>
          </div>
        </dl>

        <aside className="md:col-span-4 md:col-start-9">
          <p className="type-label !text-[var(--color-navy)]">Before you write</p>
          <h2 className="mt-2 text-[16px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
            先にご確認ください
          </h2>
          <ul className="mt-5 border-t border-[var(--color-hairline)]">
            {BEFORE_LINKS.map((link) => (
              <li
                key={link.href}
                className="border-b border-[var(--color-hairline)] py-4"
              >
                <Link href={link.href} className={textLinkClass}>
                  {link.label}
                </Link>
                <p className="type-caption mt-1">{link.note}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </LegalPageLayout>
  );
}
