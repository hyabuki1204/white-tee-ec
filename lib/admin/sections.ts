import type { AdminSection } from "@/components/common/AdminSectionList";

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    label: "Orders",
    href: "/admin/orders",
    description: "Search, filter, and export orders",
  },
  {
    label: "Products",
    href: "/admin/products",
    description: "Add and edit products",
  },
  {
    label: "Content",
    href: "/admin/content",
    description: "Edit Home, About, and Stories copy",
  },
];
