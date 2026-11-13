import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { OverseasInterest } from "@/components/newsletter/OverseasInterest";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getContactContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  CONTACT_LEAD_EN,
  getContactPageCopy,
} from "@/lib/store-ui/info-pages";
import { SHIPS_WITHIN_JAPAN_ONLY } from "@/lib/store-ui/returns-policy";
import { textLinkClass } from "@/lib/store-ui/ui-classes";

type ContactPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({
    title: "Contact",
    description: getContactPageCopy(locale).metaDescription,
    path: "/contact",
    locale,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const locale = await resolveLocale(params);
  const copy = getContactPageCopy(locale);
  const contact = await getContactContent();
  // The stored intro and hours are Japanese only. English uses a static
  // intro and leaves the hours line out rather than show it untranslated.
  const lead = locale === "en" ? CONTACT_LEAD_EN : contact.introLines.join("");
  const hours = locale === "en" ? null : contact.hours;

  return (
    <LegalPageLayout label={copy.label} title={copy.title} lead={lead}>
      <div className="grid gap-14 md:grid-cols-12 md:gap-0">
        <dl className="border-t border-[var(--color-ink)] md:col-span-7">
          {contact.email ? (
            <div className="border-b border-[var(--color-hairline)] py-7">
              <dt className="type-caption">{copy.email}</dt>
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
          {hours ? (
            <div className="border-b border-[var(--color-hairline)] py-7">
              <dt className="type-caption">{copy.hours}</dt>
              <dd className="type-body mt-2 text-[var(--color-ink)]">
                {hours}
              </dd>
            </div>
          ) : null}
          <div className="border-b border-[var(--color-hairline)] py-7">
            <dt className="type-caption">{copy.orderTitle}</dt>
            <dd className="type-body mt-2 max-w-[36em] text-[var(--color-ink)]">
              {copy.orderBody}
            </dd>
          </div>
          {locale === "en" ? (
            <div className="border-b border-[var(--color-hairline)] py-7">
              <dt className="type-caption">Delivery</dt>
              <dd className="type-body mt-2 max-w-[36em] text-[var(--color-ink)]">
                {SHIPS_WITHIN_JAPAN_ONLY}
              </dd>
            </div>
          ) : null}
        </dl>

        <aside className="md:col-span-4 md:col-start-9">
          <p className="type-label !text-[var(--color-navy)]">
            {copy.beforeLabel}
          </p>
          <h2 className="mt-2 text-[16px] font-bold tracking-[0.08em] text-[var(--color-ink)]">
            {copy.beforeTitle}
          </h2>
          <ul className="mt-5 border-t border-[var(--color-hairline)]">
            {copy.beforeLinks.map((link) => (
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

      <OverseasInterest className="mt-[var(--space-5)]" />
    </LegalPageLayout>
  );
}
