import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Container } from "@/components/layout/Container";
import { ADMIN_COPY } from "@/lib/admin/copy";

export const metadata: Metadata = {
  title: "ログイン | 管理画面 | WHITE TEE",
};

export default function AdminLoginPage() {
  return (
    <Container as="section" className="py-10 md:py-12">
      <AdminPageHeader title={ADMIN_COPY.login.title} />
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </Container>
  );
}
