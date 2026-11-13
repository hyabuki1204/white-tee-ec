"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { SearchNavControl } from "@/components/layout/SearchNavControl";
import { SavedNavLink } from "@/components/saved/SavedNavLink";
import { GAUGE_LADDER } from "@/lib/fabric/gauge";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { isNavActive } from "@/lib/store-ui/nav-active";
import { STORE_PRIMARY_NAV } from "@/lib/store-ui/nav-links";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

/** Japanese reading under each English nav item. */
const NAV_SUBLABELS: Record<string, string> = {
  "/products": "コレクション",
  "/fabric": "ゲージ",
  "/journal": "読みもの",
  "/about": "工場",
};

const SECONDARY_LINKS = [
  { label: GRAPHPAPER_STORE_COPY.footer.storeGuide, href: "/store-guide" },
  { label: GRAPHPAPER_STORE_COPY.footer.shipping, href: "/shipping" },
  { label: GRAPHPAPER_STORE_COPY.footer.contact, href: "/contact" },
  { label: "取扱店", href: "/stockist" },
] as const;

const utilityClass =
  "!min-h-12 flex-1 justify-center border border-[var(--color-navy)] px-4 !text-[13px] tracking-[0.12em] !text-[var(--color-navy)]";

export function MobileNav({
  isOpen,
  onClose,
  products,
  fabricNameBySlug,
}: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

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
          aria-label="Mobile navigation"
          className="flex h-full flex-col overflow-y-auto overscroll-y-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(72px+var(--space-3))]"
        >
          <p className="type-label !text-[var(--color-navy)]">Menu</p>

          <ul className="mt-3 border-t border-[var(--color-ink)]">
            {STORE_PRIMARY_NAV.map((item) => {
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
                      {NAV_SUBLABELS[item.href] ?? ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <p className="type-caption">ゲージから選ぶ</p>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {GAUGE_LADDER.map((spec) => (
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

          <ul className="mt-auto grid grid-cols-2 gap-x-4 pt-8">
            {SECONDARY_LINKS.map((item) => (
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
