"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { NavDropdownItem } from "@/lib/store-ui/nav-links";
import { isNavActive, isNavDropdownActive } from "@/lib/store-ui/nav-active";
import { cn } from "@/lib/utils";

type HeaderNavDropdownProps = {
  item: NavDropdownItem;
};

export function HeaderNavDropdown({ item }: HeaderNavDropdownProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const active = isNavDropdownActive(pathname, item.href, search, item.children);

  if (!item.children?.length) {
    return (
      <Link
        href={item.href}
        className={cn(
          "text-[12px] font-light tracking-[0.18em] transition-opacity hover:opacity-60",
          active ? "text-neutral-900" : "text-neutral-600",
        )}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1.5 text-[12px] font-light tracking-[0.18em] transition-opacity hover:opacity-60",
          active ? "text-neutral-900" : "text-neutral-600",
        )}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
        <span
          aria-hidden
          className="text-[10px] tracking-normal text-neutral-600 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
        >
          ▾
        </span>
      </Link>

      <div
        className={cn(
          "pointer-events-none absolute left-0 top-full z-50 min-w-[11rem] pt-3",
          "opacity-0 transition-opacity duration-200",
          "group-hover:pointer-events-auto group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        )}
      >
        <ul className="border border-neutral-200/80 bg-background py-2 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          {item.children.map((child) => {
            const childActive = isNavActive(pathname, child.href, search);

            return (
              <li key={`${child.href}-${child.label}`}>
                <Link
                  href={child.href}
                  className={cn(
                    "block px-4 py-2.5 text-[12px] font-light tracking-[0.12em] transition-opacity hover:opacity-60",
                    childActive ? "text-neutral-900" : "text-neutral-600",
                  )}
                  aria-current={childActive ? "page" : undefined}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
