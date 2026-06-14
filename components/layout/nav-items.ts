import { SITE_UI_COPY } from "@/lib/copy/site-ui";

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Fabric", href: "/fabric" },
  { label: "Products", href: "/products" },
  { label: SITE_UI_COPY.cart.title, href: "/cart" },
  { label: "About", href: "/about" },
  { label: "Stories", href: "/stories" },
];
