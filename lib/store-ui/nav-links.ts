import type { Locale } from "@/lib/i18n/config";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";

export type NavLinkItem = {
  label: string;
  href: string;
  /** Short reading shown beside the label in the mobile menu. */
  sublabel?: string;
};

export type NavDropdownItem = NavLinkItem & {
  children?: NavLinkItem[];
};

/** Primary header / mobile nav — flat, no dropdowns. */
export function getStorePrimaryNav(locale: Locale): NavLinkItem[] {
  const { nav } = getStoreCopy(locale);

  return [
    { label: nav.products, href: "/products", sublabel: nav.sublabels.products },
    { label: nav.fabric, href: "/fabric", sublabel: nav.sublabels.fabric },
    { label: nav.journal, href: "/journal", sublabel: nav.sublabels.journal },
    { label: nav.about, href: "/about", sublabel: nav.sublabels.about },
  ];
}
