"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const { error: copy } = GRAPHPAPER_STORE_COPY.states;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="mx-auto max-w-md text-center">
        <p className="text-[12px] font-normal tracking-[0.28em] text-neutral-600">
          {copy.label}
        </p>
        <p className="mt-6 text-[14px] font-normal leading-[1.8] tracking-[0.03em] text-neutral-700">
          {copy.message}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="text-[12px] font-normal tracking-[0.14em] text-neutral-800 transition-opacity hover:opacity-60"
          >
            {copy.retry}
          </button>
          <Link
            href="/"
            className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity hover:opacity-60"
          >
            {copy.back}
          </Link>
        </div>
      </div>
    </Container>
  );
}
