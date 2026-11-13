"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/paths";

/** Current pathname without the locale prefix: `/en/saved` → `/saved`. */
export function useStorePathname(): string {
  return stripLocale(usePathname()).pathname;
}
