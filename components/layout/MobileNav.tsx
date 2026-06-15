"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import type { StoreNavMenu } from "@/lib/navigation/store-nav";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
  storeNav: StoreNavMenu;
};

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavSection({
  label,
  href,
  isActive,
  onClose,
  allLabel,
  links = [],
  groups = [],
}: {
  label: string;
  href: string;
  isActive: boolean;
  onClose: () => void;
  allLabel: string;
  links?: Array<{ label: string; href: string }>;
  groups?: StoreNavMenu["products"]["groups"];
}) {
  const [expanded, setExpanded] = useState(isActive);
  const hasChildren = links.length > 0 || groups.length > 0;

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={href}
          onClick={onClose}
          className={cn(
            "flex min-h-11 flex-1 items-center text-[15px] font-light tracking-wide transition-colors md:text-sm",
            label === "Fabric" && "tracking-[0.12em]",
            isActive
              ? "text-neutral-900"
              : "text-neutral-600 active:text-neutral-900",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          {label}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
            onClick={() => setExpanded((open) => !open)}
            className="flex h-11 w-11 items-center justify-center text-neutral-400"
          >
            <span
              aria-hidden
              className={cn(
                "text-[10px] transition-transform",
                expanded && "rotate-180",
              )}
            >
              ▾
            </span>
          </button>
        ) : null}
      </div>

      {hasChildren && expanded ? (
        <ul className="mb-2 ml-3 space-y-1 border-l border-neutral-200/80 pl-4">
          <li>
            <Link
              href={href}
              onClick={onClose}
              className="flex min-h-9 items-center text-[13px] font-light tracking-wide text-neutral-500"
            >
              {allLabel}
            </Link>
          </li>

          {groups.map((group) => (
            <li key={group.label} className="pt-2">
              {group.href ? (
                <Link
                  href={group.href}
                  onClick={onClose}
                  className="flex min-h-8 items-center text-[11px] font-light uppercase tracking-[0.08em] text-neutral-400"
                >
                  {group.label}
                </Link>
              ) : (
                <p className="min-h-8 text-[11px] font-light uppercase tracking-[0.08em] text-neutral-400">
                  {group.label}
                </p>
              )}
              <ul className="mt-1 space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex min-h-9 items-center text-[13px] font-light tracking-wide text-neutral-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex min-h-9 items-center text-[13px] font-light tracking-wide text-neutral-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function MobileNav({ isOpen, onClose, storeNav }: MobileNavProps) {
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
        className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-background px-6 pb-10 pt-[calc(var(--header-height)+0.5rem)] shadow-sm"
      >
        <ul className="flex flex-col">
          {links.map((item) => {
            if (item.href === "/fabric") {
              return (
                <MobileNavSection
                  key={item.href}
                  label={item.label}
                  href={storeNav.fabric.href}
                  isActive={isNavActive(pathname, "/fabric")}
                  onClose={onClose}
                  allLabel={storeNav.fabric.allLabel}
                  links={storeNav.fabric.links}
                />
              );
            }

            if (item.href === "/products") {
              return (
                <MobileNavSection
                  key={item.href}
                  label={item.label}
                  href={storeNav.products.href}
                  isActive={isNavActive(pathname, "/products")}
                  onClose={onClose}
                  allLabel={storeNav.products.allLabel}
                  groups={storeNav.products.groups}
                />
              );
            }

            const isActive = isNavActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-11 items-center text-[15px] font-light tracking-wide transition-colors md:text-sm",
                    isActive
                      ? "text-neutral-900"
                      : "text-neutral-600 active:text-neutral-900",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          <li>
            <CartNavLink
              onNavigate={onClose}
              className="flex min-h-11 items-center text-[15px] md:text-sm"
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export { isNavActive };
