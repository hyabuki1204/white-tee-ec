"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
};

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const links = NAV_ITEMS.filter((item) => item.href !== "/cart");

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
        className="absolute inset-x-0 top-0 border-b border-neutral-200/70 bg-background px-6 pb-8 pt-24 shadow-sm"
      >
        <ul className="flex flex-col gap-6">
          {links.map((item) => {
            const isActive = isNavActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "block text-sm font-light tracking-wide transition-colors",
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
            <CartNavLink onNavigate={onClose} className="text-sm" />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export { isNavActive };
