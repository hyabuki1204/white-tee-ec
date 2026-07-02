"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { Container } from "@/components/layout/Container";
import { HeaderNavDropdown } from "@/components/layout/HeaderNavDropdown";
import { MobileNav } from "@/components/layout/MobileNav";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import {
  STORE_HEADER_LEFT_NAV,
  STORE_HEADER_RIGHT_NAV,
} from "@/lib/store-ui/nav-links";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isAdmin = pathname.startsWith("/admin");
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, [pathname, isAdmin]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOpen]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/70 bg-background"
      >
        <AnnouncementBar />

        <Container as="div" className="py-5 md:py-6">
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-8">
            <nav aria-label="Main navigation" className="justify-self-start">
              <ul className="flex items-center gap-x-8 lg:gap-x-10">
                {STORE_HEADER_LEFT_NAV.map((item) => (
                  <li key={item.href}>
                    <HeaderNavDropdown item={item} />
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/"
              className="justify-self-center text-[12px] tracking-[0.32em] text-neutral-800 transition-opacity hover:opacity-60 lg:text-[13px]"
            >
              {GRAPHPAPER_STORE_COPY.brandLine}
            </Link>

            <nav aria-label="Secondary navigation" className="justify-self-end">
              <ul className="flex items-center gap-x-8 lg:gap-x-10">
                {STORE_HEADER_RIGHT_NAV.map((item) => (
                  <li key={item.href}>
                    <HeaderNavDropdown item={item} />
                  </li>
                ))}
                <li>
                  <CartNavLink />
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-between gap-6 md:hidden">
            <Link
              href="/"
              className="text-[12px] tracking-[0.32em] text-neutral-800 transition-opacity hover:opacity-60"
            >
              {GRAPHPAPER_STORE_COPY.brandLine}
            </Link>

            <div className="flex items-center gap-1">
              <CartNavLink
                showLabel={false}
                className="flex min-h-11 min-w-11 items-center justify-center"
              />
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center text-neutral-700"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-current transition-transform",
                      menuOpen ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity",
                      menuOpen ? "opacity-0" : "opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-current transition-transform",
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
        <MobileNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </>
  );
}
