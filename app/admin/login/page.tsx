import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Sign In | Admin | WHITE TEE",
};

export default function AdminLoginPage() {
  return (
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 space-y-4">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Admin</p>
        <h1 className="text-sm font-light text-neutral-900">Sign in</h1>
      </header>

      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </Container>
  );
}
