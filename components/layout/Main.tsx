"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MainProps = {
  children: React.ReactNode;
};

export function Main({ children }: MainProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);

  return (
    <main
      id="main-content"
      className={cn(
        "flex flex-1 flex-col",
        isProductDetail &&
          "pt-[calc(var(--header-height)+1.25rem)] lg:pt-[calc(var(--header-height)+0.5rem)]",
        !isHome &&
          !isProductDetail &&
          !isAdmin &&
          "pt-[var(--header-height)]",
      )}
    >
      {children}
    </main>
  );
}
