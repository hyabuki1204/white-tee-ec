"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { Container } from "@/components/layout/Container";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchNavControl } from "@/components/layout/SearchNavControl";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { isNavActive } from "@/lib/store-ui/nav-active";
import { STORE_PRIMARY_NAV } from "@/lib/store-ui/nav-links";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type HeaderProps = {
  products: Product[];
  fabricNameBySlug: Record<string, string>;
};

function navLinkClass(active: boolean) {
  return cn(
    "type-label inline-flex min-h-11 items-center text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60",
    active && "underline decoration-[var(--color-ink)] underline-offset-[6px]",
  );
}

export function Header({ products, fabricNameBySlug }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isAdmin = pathname.startsWith("/admin");
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isAdmin) return;

    const header = headerRef.current;
    if (!header) return;

    const setHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    };

    setHeaderHeight();
    const resizeObserver = new ResizeObserver(setHeaderHeight);
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, [pathname, isAdmin, menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    if (isAdmin) return;

    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      if (menuOpen) {
        setHeaderHidden(false);
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 8) {
        setHeaderHidden(false);
      } else if (delta > 4 && currentY > 72) {
        setHeaderHidden(true);
      } else if (delta < -4) {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin, menuOpen]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[var(--color-hairline)] bg-[var(--color-bg)] transition-transform duration-[var(--duration-quiet)] ease-[var(--ease-quiet)]",
          headerHidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <Container as="div" className="flex h-full items-center">
          <div className="hidden h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-x-8 md:grid">
            <nav aria-label="Main navigation" className="justify-self-start">
              <ul className="flex items-center gap-x-8 lg:gap-x-10">
                {STORE_PRIMARY_NAV.map((item) => {
                  const active = isNavActive(pathname, item.href, search);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={navLinkClass(active)}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Link
              href="/"
              className="justify-self-center text-[12px] tracking-[0.32em] text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:opacity-60 lg:text-[14px]"
            >
              {GRAPHPAPER_STORE_COPY.brandLine}
            </Link>

            <nav
              aria-label="Utility navigation"
              className="justify-self-end"
            >
              <ul className="flex items-center gap-x-8 lg:gap-x-10">
                <li>
                  <SearchNavControl
                    products={products}
                    fabricNameBySlug={fabricNameBySlug}
                  />
                </li>
                <li>
                  <CartNavLink />
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex h-full w-full items-center justify-between gap-6 md:hidden">
            <Link
              href="/"
              className="text-[12px] tracking-[0.32em] text-[var(--color-ink)] transition-opacity hover:opacity-60"
            >
              {GRAPHPAPER_STORE_COPY.brandLine}
            </Link>

            <div className="flex items-center gap-5">
              <CartNavLink />
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center text-[var(--color-ink)]"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-current transition-transform duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
                      menuOpen ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
                      menuOpen ? "opacity-0" : "opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-current transition-transform duration-[var(--duration-fast)] ease-[var(--ease-quiet)]",
                      menuOpen ? "top-1.5 -rotate-45" : "top-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <div id="mobile-navigation">
        <MobileNav
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          products={products}
          fabricNameBySlug={fabricNameBySlug}
        />
      </div>
    </>
  );
}
