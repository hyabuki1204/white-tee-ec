import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { getContactContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Contact",
    description: "WHITE TEE へのお問い合わせ",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const contact = await getContactContent();

  return (
    <LegalPageLayout title="Contact">
      <div className="space-y-6 text-center">
        {contact.introLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="space-y-4 border-t border-neutral-200/70 pt-10 text-center">
        <p>
          <span className="text-[11px] font-light uppercase tracking-[0.14em] text-neutral-600">
            Email
          </span>
          <br />
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 inline-block text-[13px] font-light tracking-[0.03em] text-neutral-800 transition-opacity hover:opacity-60"
          >
            {contact.email}
          </a>
        </p>
        <p>
          <span className="text-[11px] font-light uppercase tracking-[0.14em] text-neutral-600">
            Hours
          </span>
          <br />
          <span className="mt-2 inline-block text-[13px] font-light tracking-[0.03em] text-neutral-600">
            {contact.hours}
          </span>
        </p>
      </div>
    </LegalPageLayout>
  );
}
