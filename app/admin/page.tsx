import type { Metadata } from "next";
import { AdminSectionList } from "@/components/common/AdminSectionList";
import { Container } from "@/components/layout/Container";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";

export const metadata: Metadata = {
  title: "Admin | WHITE TEE",
  description: "Store administration",
};

export default function AdminPage() {
  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-16 md:mb-20">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Admin</p>
      </header>

      <AdminSectionList sections={ADMIN_SECTIONS} />
    </Container>
  );
}
