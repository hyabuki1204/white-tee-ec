import type { ReactNode } from "react";
import { adminEyebrow, adminPageSubtitle, adminPageTitle } from "@/lib/admin/ui";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className={adminEyebrow}>{eyebrow}</p> : null}
        <h1 className={adminPageTitle}>{title}</h1>
        {subtitle ? <p className={adminPageSubtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
