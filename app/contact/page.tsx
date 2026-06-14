import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { CONTACT_INTRO, LEGAL_BUSINESS } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Contact | WHITE TEE",
  description: "WHITE TEE へのお問い合わせ",
};

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact">
      <div className="space-y-6 text-center">
        {CONTACT_INTRO.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="space-y-4 border-t border-neutral-200/70 pt-10 text-center">
        <p>
          <span className="text-neutral-400">Email</span>
          <br />
          <a
            href={`mailto:${LEGAL_BUSINESS.email}`}
            className="text-neutral-800 transition-opacity hover:opacity-60"
          >
            {LEGAL_BUSINESS.email}
          </a>
        </p>
        <p>
          <span className="text-neutral-400">Hours</span>
          <br />
          {LEGAL_BUSINESS.phone}
        </p>
      </div>
    </LegalPageLayout>
  );
}
