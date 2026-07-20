"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { SearchNavControl } from "@/components/layout/SearchNavControl";
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

const SECONDARY_LINKS = [
  { label: GRAPHPAPER_STORE_COPY.footer.storeGuide, href: "/store-guide" },
  { label: GRAPHPAPER_STORE_COPY.footer.shipping, href: "/shipping" },
  { label: GRAPHPAPER_STORE_COPY.footer.contact, href: "/contact" },
] as const;

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
        "fixed inset-0 z-40 bg-[var(--color-bg)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)] md:hidden",
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
          className="flex h-full flex-col px-6 pb-10 pt-[calc(72px+var(--space-4))]"
        >
          <ul className="flex flex-col gap-1">
            {STORE_PRIMARY_NAV.map((item) => {
              const active = isNavActive(pathname, item.href, search);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex min-h-12 items-center text-[20px] font-normal tracking-[0.08em] uppercase text-[var(--color-ink)] transition-opacity hover:opacity-60",
                      active &&
                        "underline decoration-[var(--color-ink)] underline-offset-[6px]",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-col gap-5 border-t border-[var(--color-hairline)] pt-8">
            <SearchNavControl
              products={products}
              fabricNameBySlug={fabricNameBySlug}
              className="text-left text-[14px] tracking-[0.12em]"
            />
            <CartNavLink
              onNavigate={onClose}
              className="justify-start text-[14px] tracking-[0.12em]"
            />
          </div>

          <ul className="mt-auto space-y-1 border-t border-[var(--color-hairline)] pt-8">
            {SECONDARY_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center text-[14px] font-normal tracking-[0.04em] text-[var(--color-ink-soft)] transition-opacity hover:opacity-60"
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
