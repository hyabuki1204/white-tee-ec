"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";

/** Screen-reader "Loading" text for skeletons (loading.tsx gets no params). */
export function LoadingLabel() {
  return (
    <span className="sr-only">{getStoreCopy(useLocale()).states.loading}</span>
  );
}
