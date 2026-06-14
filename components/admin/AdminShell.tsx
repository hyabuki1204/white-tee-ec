"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
};

const ADMIN_LINKS = [
  { href: "/admin", label: "Admin", exact: true },
  { href: "/admin/orders", label: "Orders", exact: false },
  { href: "/admin/products", label: "Products", exact: false },
  { href: "/admin/content", label: "Content", exact: false },
  { href: "/", label: "Store", exact: true },
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
    return <>{children}</>;
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-neutral-200/70 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-light tracking-wide">
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
                    "transition-opacity hover:opacity-60",
                    isActive ? "text-neutral-900" : "text-neutral-500",
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
    </>
  );
}
