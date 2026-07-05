import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

export type NavLinkItem = {
  label: string;
  href: string;
};

export type NavDropdownItem = NavLinkItem & {
  children?: NavLinkItem[];
};

const copy = GRAPHPAPER_STORE_COPY.nav;

export const STORE_HEADER_LEFT_NAV: NavDropdownItem[] = [
  { label: copy.all, href: "/" },
  {
    label: copy.tops,
    href: "/products?sleeve=short",
    children: [
      { label: copy.topsShortSleeve, href: "/products?sleeve=short" },
      { label: copy.topsLongSleeve, href: "/products?sleeve=long" },
    ],
  },
];

export const STORE_HEADER_RIGHT_NAV: NavDropdownItem[] = [];

export const STORE_MOBILE_PRIMARY_NAV: NavDropdownItem[] = [
  ...STORE_HEADER_LEFT_NAV,
  { label: copy.fabric, href: "/fabric" },
  { label: copy.journal, href: "/journal" },
];
