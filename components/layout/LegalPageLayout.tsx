import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <Container as="section" className="py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="text-xs tracking-[0.3em] text-neutral-500">{title}</p>
        </header>
        <div className="mt-16 space-y-10 text-xs font-light leading-[2] tracking-[0.03em] text-neutral-500 md:mt-20">
          {children}
        </div>
      </div>
    </Container>
  );
}
