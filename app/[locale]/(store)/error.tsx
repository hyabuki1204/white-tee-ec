"use client";

import { Link } from "@/components/i18n/Link";
import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  pageGutterClass,
} from "@/lib/store-ui/ui-classes";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const copy = getStoreCopy(useLocale()).states.error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader label={copy.label} title={copy.title} lead={copy.message} />
      <section
        className={`${pageGutterClass} py-[var(--space-5)] md:py-[var(--space-6)]`}
      >
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={buttonPrimaryClass}>
            {copy.retry}
          </button>
          <Link href="/" className={buttonSecondaryClass}>
            {copy.back}
          </Link>
        </div>
        {error.digest ? (
          <p className="type-fine mt-8 font-en tabular-nums">
            Ref. {error.digest}
          </p>
        ) : null}
      </section>
    </>
  );
}
