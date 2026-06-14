"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const { error: copy } = SITE_UI_COPY.states;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">{copy.label}</p>
        <p className="mt-6 text-sm font-light text-neutral-700">{copy.message}</p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
          >
            {copy.retry}
          </button>
          <Link
            href="/"
            className="text-xs font-light tracking-wide text-neutral-500 transition-opacity hover:opacity-60"
          >
            {copy.back}
          </Link>
        </div>
      </div>
    </Container>
  );
}
