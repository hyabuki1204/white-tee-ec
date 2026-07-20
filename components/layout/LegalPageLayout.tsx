import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <Container as="section" className="py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <h1 className="text-[14px] font-normal tracking-[0.28em] text-neutral-800 md:text-[14px]">
            {title}
          </h1>
        </header>
        <div className="mt-16 space-y-10 text-[14px] font-normal leading-[2] tracking-[0.03em] text-neutral-600 md:mt-20">
          {children}
        </div>
      </div>
    </Container>
  );
}
