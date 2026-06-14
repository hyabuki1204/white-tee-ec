"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminNavLinkActive, adminNavLinkInactive } from "@/lib/admin/ui";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
};

const ADMIN_LINKS = [
  { href: "/admin", label: ADMIN_COPY.nav.dashboard, exact: true },
  { href: "/admin/orders", label: ADMIN_COPY.nav.orders, exact: false },
  { href: "/admin/products", label: ADMIN_COPY.nav.products, exact: false },
  { href: "/admin/fabrics", label: ADMIN_COPY.nav.fabrics, exact: false },
  { href: "/admin/content", label: ADMIN_COPY.nav.content, exact: false },
  { href: "/admin/pages", label: ADMIN_COPY.nav.pages, exact: false },
  { href: "/admin/seo", label: ADMIN_COPY.nav.seo, exact: false },
  { href: "/", label: ADMIN_COPY.nav.store, exact: true },
] as const;

function isAdminLinkActive(
  pathname: string,
  href: string,
  exact: boolean,
): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="min-h-screen bg-neutral-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
          <nav className="flex flex-wrap items-center gap-1">
            {ADMIN_LINKS.map((link) => {
              const isActive = isAdminLinkActive(
                pathname,
                link.href,
                link.exact,
              );

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    isActive ? adminNavLinkActive : adminNavLinkInactive,
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
