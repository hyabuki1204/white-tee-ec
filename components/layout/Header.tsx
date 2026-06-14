"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { Container } from "@/components/layout/Container";
import { isNavActive, MobileNav } from "@/components/layout/MobileNav";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const HERO_SCROLL_RATIO = 0.72;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const headerRef = useRef<HTMLElement>(null);
  const [isInHero, setIsInHero] = useState(isHome);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const header = headerRef.current;
    if (!header) return;

    const setHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight + 12}px`,
      );
    };

    setHeaderHeight();

    const resizeObserver = new ResizeObserver(setHeaderHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
    };
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (!isHome) {
      setIsInHero(false);
      return;
    }

    const update = () => {
      const threshold = window.innerHeight * HERO_SCROLL_RATIO;
      setIsInHero(window.scrollY < threshold);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isMuted = isHome && isInHero;

  if (isAdmin) {
    return null;
  }

  const navLinks = NAV_ITEMS.filter((item) => item.href !== "/cart");

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "border-b border-neutral-200/70 bg-background transition-opacity duration-700 ease-out",
          !isHome && "fixed inset-x-0 top-0 z-50",
          isMuted ? "opacity-[0.65]" : "opacity-100",
        )}
      >
        <Container as="div" className="py-8 md:py-10">
          <div className="flex items-center justify-between gap-6">
            <Link
              href="/"
              className="text-[12px] tracking-[0.35em] text-neutral-800 transition-opacity hover:opacity-60 md:text-xs"
            >
              WHITE TEE
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden md:block"
            >
              <ul className="flex flex-wrap items-center justify-end gap-x-10">
                {navLinks.map((item) => {
                  const isActive = isNavActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-light tracking-wide transition-colors",
                          isActive
                            ? "text-neutral-900"
                            : "text-neutral-600 hover:text-neutral-900",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <CartNavLink />
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4 md:hidden">
              <CartNavLink />
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center text-neutral-700"
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
