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
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {sections.map((section) => (
        <li key={section.href}>
          <Link
            href={section.href}
            className="group flex items-center justify-between gap-6 px-6 py-6 transition-colors hover:bg-neutral-50"
          >
            <div className="space-y-1.5">
              <p className="text-base font-medium text-neutral-900">
                {section.label}
              </p>
              <p className="text-sm text-neutral-600">{section.description}</p>
            </div>
            <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
