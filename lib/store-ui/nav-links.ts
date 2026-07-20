import { FABRICS } from "@/lib/fabric/content";
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

export function buildStoreHeaderRightNav(
  journalArticles: Array<{ slug: string; title: string }>,
): NavDropdownItem[] {
  return [
    {
      label: copy.fabric,
      href: "/fabric",
      children: [
        { label: copy.fabricAll, href: "/fabric" },
        ...FABRICS.map((fabric) => ({
          label: fabric.name,
          href: `/fabric/${fabric.slug}`,
        })),
      ],
    },
    {
      label: copy.journal,
      href: "/journal",
      children: [
        { label: copy.journalAll, href: "/journal" },
        ...journalArticles.map((article) => ({
          label: article.title,
          href: `/journal/${article.slug}`,
        })),
      ],
    },
  ];
}

export function buildStoreMobilePrimaryNav(
  journalArticles: Array<{ slug: string; title: string }>,
): NavDropdownItem[] {
  return [...STORE_HEADER_LEFT_NAV, ...buildStoreHeaderRightNav(journalArticles)];
}
