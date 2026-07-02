"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StoreNavGroup, StoreNavMenu } from "@/lib/navigation/store-nav";
import { cn } from "@/lib/utils";

type NavDropdownProps = {
  label: string;
  href: string;
  isActive: boolean;
  allLabel: string;
  links?: { label: string; href: string }[];
  groups?: StoreNavGroup[];
};

export function NavDropdown({
  label,
  href,
  isActive,
  allLabel,
  links = [],
  groups = [],
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const hasMenu = links.length > 0 || groups.length > 0;

  return (
    <li
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-light tracking-wide transition-colors",
          isActive ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900",
        )}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasMenu ? "menu" : undefined}
        aria-expanded={hasMenu ? open : undefined}
        onFocus={() => setOpen(true)}
      >
        {label}
        {hasMenu ? (
          <span aria-hidden className="text-[11px] text-neutral-600">
            ▾
          </span>
        ) : null}
      </Link>

      {hasMenu && open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[11rem] pt-4"
        >
          <div className="bg-background py-3 pl-1 pr-4">
            <Link
              href={href}
              role="menuitem"
              className="block py-1.5 text-[12px] font-light tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
            >
              {allLabel}
            </Link>

            {groups.length > 0
              ? groups.map((group) => (
                  <div key={group.label} className="mt-4 first:mt-3">
                    {group.href ? (
                      <Link
                        href={group.href}
                        role="menuitem"
                        className="block py-1 text-[11px] font-light uppercase tracking-[0.1em] text-neutral-600 transition-opacity hover:opacity-60"
                      >
                        {group.label}
                      </Link>
                    ) : (
                      <p className="py-1 text-[11px] font-light uppercase tracking-[0.1em] text-neutral-600">
                        {group.label}
                      </p>
                    )}
                    <ul className="mt-1 space-y-1">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            role="menuitem"
                            className="block py-1 pl-2 text-[12px] font-light tracking-[0.04em] text-neutral-600 transition-opacity hover:opacity-60"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              : null}

            {links.length > 0 ? (
              <ul className={cn(groups.length > 0 ? "mt-4 space-y-1" : "mt-2 space-y-1")}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      role="menuitem"
                      className="block py-1 text-[12px] font-light tracking-[0.04em] text-neutral-600 transition-opacity hover:opacity-60"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

export type { StoreNavMenu };
