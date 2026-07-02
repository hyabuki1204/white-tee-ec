"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { STORE_MOBILE_PRIMARY_NAV } from "@/lib/store-ui/nav-links";
import { isNavActive, isNavDropdownActive } from "@/lib/store-ui/nav-active";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LEGAL_LINKS = [
  { label: GRAPHPAPER_STORE_COPY.footer.privacy, href: "/privacy" },
  { label: GRAPHPAPER_STORE_COPY.footer.terms, href: "/terms" },
  { label: GRAPHPAPER_STORE_COPY.footer.legal, href: "/legal" },
] as const;

const SECONDARY_LINKS = [
  { label: GRAPHPAPER_STORE_COPY.footer.storeGuide, href: "/store-guide" },
  { label: GRAPHPAPER_STORE_COPY.footer.shipping, href: "/shipping" },
  { label: GRAPHPAPER_STORE_COPY.footer.stockist, href: "/stockist" },
  { label: GRAPHPAPER_STORE_COPY.footer.contact, href: "/contact" },
  { label: GRAPHPAPER_STORE_COPY.footer.about, href: "/about" },
] as const;

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-neutral-900/20"
        onClick={onClose}
      />

      <nav
        aria-label="Mobile navigation"
        className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-background px-6 pb-10 pt-[calc(var(--header-height)+0.75rem)]"
      >
        <ul className="flex flex-col">
          {STORE_MOBILE_PRIMARY_NAV.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const itemActive = isNavDropdownActive(
              pathname,
              item.href,
              search,
              item.children,
            );

            if (!hasChildren) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex min-h-12 items-center text-[13px] font-light tracking-[0.16em] transition-opacity active:opacity-60",
                      itemActive ? "text-neutral-900" : "text-neutral-600",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href} className="border-b border-neutral-200/50 pb-2">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-12 items-center text-[13px] font-light tracking-[0.16em] transition-opacity active:opacity-60",
                    itemActive ? "text-neutral-900" : "text-neutral-600",
                  )}
                >
                  {item.label}
                </Link>
                <ul className="mb-1 ml-3 border-l border-neutral-200/70 pl-4">
                  {item.children?.map((child) => {
                    const childActive = isNavActive(pathname, child.href, search);

                    return (
                      <li key={`${child.href}-${child.label}`}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex min-h-10 items-center text-[12px] font-light tracking-[0.12em] transition-opacity active:opacity-60",
                            childActive ? "text-neutral-900" : "text-neutral-600",
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}

          <li className="mt-4 border-t border-neutral-200/70 pt-4">
            <CartNavLink onNavigate={onClose} />
          </li>

          {SECONDARY_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex min-h-11 items-center text-[14px] font-light tracking-wide text-neutral-600"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {LEGAL_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex min-h-10 items-center text-[13px] font-light tracking-[0.06em] text-neutral-600"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
