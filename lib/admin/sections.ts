import type { AdminSection } from "@/components/common/AdminSectionList";
import { ADMIN_COPY } from "@/lib/admin/copy";

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    label: ADMIN_COPY.sections.orders.label,
    href: "/admin/orders",
    description: ADMIN_COPY.sections.orders.description,
  },
  {
    label: ADMIN_COPY.sections.products.label,
    href: "/admin/products",
    description: ADMIN_COPY.sections.products.description,
  },
  {
    label: ADMIN_COPY.sections.fabrics.label,
    href: "/admin/fabrics",
    description: ADMIN_COPY.sections.fabrics.description,
  },
  {
    label: ADMIN_COPY.sections.content.label,
    href: "/admin/content",
    description: ADMIN_COPY.sections.content.description,
  },
  {
    label: ADMIN_COPY.sections.journal.label,
    href: "/admin/journal",
    description: ADMIN_COPY.sections.journal.description,
  },
  {
    label: ADMIN_COPY.sections.pages.label,
    href: "/admin/pages",
    description: ADMIN_COPY.sections.pages.description,
  },
  {
    label: ADMIN_COPY.sections.seo.label,
    href: "/admin/seo",
    description: ADMIN_COPY.sections.seo.description,
  },
];
