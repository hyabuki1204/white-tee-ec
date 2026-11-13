"use client";

import { Link } from "@/components/i18n/Link";
import { useSearchParams } from "next/navigation";
import { CurrencySwitch } from "@/components/currency/CurrencySwitch";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LocaleSwitch } from "@/components/i18n/LocaleSwitch";
import { useStorePathname } from "@/components/i18n/use-store-pathname";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { SearchNavControl } from "@/components/layout/SearchNavControl";
import { SavedNavLink } from "@/components/saved/SavedNavLink";
import { getGaugeLadder } from "@/lib/fabric/gauge";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { isNavActive } from "@/lib/store-ui/nav-active";
import { getStorePrimaryNav } from "@/lib/store-ui/nav-links";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

const utilityClass =
  "!min-h-12 flex-1 justify-center border border-[var(--color-navy)] px-4 !text-[13px] tracking-[0.12em] !text-[var(--color-navy)]";

export function MobileNav({
  isOpen,
  onClose,
  products,
  fabricNameBySlug,
}: MobileNavProps) {
  const locale = useLocale();
  const copy = getStoreCopy(locale);
  const primaryNav = getStorePrimaryNav(locale);
  const pathname = useStorePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const secondaryLinks = [
    { label: copy.footer.storeGuide, href: "/store-guide" },
    { label: copy.footer.shipping, href: "/shipping" },
    { label: copy.footer.contact, href: "/contact" },
    { label: copy.nav.stockist, href: "/stockist" },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-[var(--color-surface)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)] md:hidden",
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      {isOpen ? (
        <nav
          aria-label={copy.nav.menu}
          className="flex h-full flex-col overflow-y-auto overscroll-y-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(72px+var(--space-3))]"
        >
          <div className="flex items-center justify-between gap-6">
            <p className="type-label !text-[var(--color-navy)]">
              {copy.nav.menu}
            </p>
            <LocaleSwitch onNavigate={onClose} />
          </div>

          <ul className="mt-3 border-t border-[var(--color-ink)]">
            {primaryNav.map((item) => {
              const active = isNavActive(pathname, item.href, search);

              return (
                <li
                  key={item.href}
                  className="border-b border-[var(--color-hairline)]"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline justify-between gap-4 py-4"
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "font-en text-[40px] font-light leading-none tracking-[-0.02em] transition-colors duration-[var(--duration-quiet)]",
                        active
                          ? "text-[var(--color-navy)]"
                          : "text-[var(--color-ink)]",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="type-caption shrink-0">
                      {item.sublabel ?? ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <p className="type-caption">{copy.nav.chooseByGauge}</p>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {getGaugeLadder(locale).map((spec) => (
                <li key={spec.fabricSlug}>
                  <Link
                    href={`/fabric/${spec.fabricSlug}`}
                    onClick={onClose}
                    className="block border border-[var(--color-hairline)] bg-[var(--color-ground)] px-3 pb-3 pt-4 transition-colors duration-[var(--duration-quiet)] active:border-[var(--color-navy)]"
                  >
                    <span className="block font-en text-[30px] font-light leading-none tracking-[-0.03em] tabular-nums text-[var(--color-ink)]">
                      {spec.gauge}
                      <span className="ml-0.5 text-[0.45em] tracking-normal">
                        G
                      </span>
                    </span>
                    <span className="type-label mt-2 block !text-[11px] !text-[var(--color-navy)]">
                      {spec.character}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex gap-2">
            <SearchNavControl
              products={products}
              fabricNameBySlug={fabricNameBySlug}
              className={utilityClass}
            />
            <SavedNavLink onNavigate={onClose} className={utilityClass} />
            <CartNavLink onNavigate={onClose} className={utilityClass} />
          </div>

          <CurrencySwitch className="mt-6" />

          <ul className="mt-auto grid grid-cols-2 gap-x-4 pt-8">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center text-[13px] tracking-[0.04em] text-[var(--color-ink-soft)] transition-colors duration-[var(--duration-quiet)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
