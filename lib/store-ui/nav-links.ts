import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

export type NavLinkItem = {
  label: string;
  href: string;
};

export type NavDropdownItem = NavLinkItem & {
  children?: NavLinkItem[];
};

const copy = GRAPHPAPER_STORE_COPY.nav;

/** Primary header / mobile nav — flat, no dropdowns. */
export const STORE_PRIMARY_NAV: NavLinkItem[] = [
  { label: copy.products, href: "/products" },
  { label: copy.fabric, href: "/fabric" },
  { label: copy.journal, href: "/journal" },
  { label: copy.about, href: "/about" },
];
