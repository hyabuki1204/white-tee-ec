import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageGutterClass } from "@/lib/store-ui/ui-classes";

type LegalPageLayoutProps = {
  /** English label above the title, e.g. "Privacy Policy". */
  label: ReactNode;
  /** Japanese page title. */
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
};

/** Policy and information pages: standard header, left-aligned content. */
export function LegalPageLayout({
  label,
  title,
  lead,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <PageHeader label={label} title={title} lead={lead} />
      <div
        className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}
      >
        {children}
      </div>
    </>
  );
}
