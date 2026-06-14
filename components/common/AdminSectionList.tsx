import Link from "next/link";

export type AdminSection = {
  label: string;
  href: string;
  description: string;
};

type AdminSectionListProps = {
  sections: AdminSection[];
};

export function AdminSectionList({ sections }: AdminSectionListProps) {
  return (
    <ul className="divide-y divide-neutral-200/70">
      {sections.map((section) => (
        <li key={section.href}>
          <Link
            href={section.href}
            className="group flex items-baseline justify-between py-8 transition-opacity hover:opacity-60"
          >
            <div className="space-y-2">
              <p className="text-sm font-light tracking-wide text-neutral-900">
                {section.label}
              </p>
              <p className="text-xs font-light text-neutral-500">
                {section.description}
              </p>
            </div>
            <span className="text-xs font-light text-neutral-400">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
