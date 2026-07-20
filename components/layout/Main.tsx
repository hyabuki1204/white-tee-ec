"use client";

import { usePathname } from "next/navigation";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { cn } from "@/lib/utils";

type MainProps = {
  children: React.ReactNode;
};

export function Main({ children }: MainProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <main
      id="main-content"
      className={cn(
        "flex flex-1 flex-col",
        !isAdmin && "pt-[var(--header-height)]",
      )}
    >
      {children}
      {!isAdmin ? <RevealObserver /> : null}
    </main>
  );
}
