import Link from "next/link";
import { adminLink } from "@/lib/admin/ui";

type AdminBackLinkProps = {
  href: string;
  label: string;
};

export function AdminBackLink({ href, label }: AdminBackLinkProps) {
  return (
    <Link href={href} className={`${adminLink} mt-10 inline-block`}>
      {label}
    </Link>
  );
}
