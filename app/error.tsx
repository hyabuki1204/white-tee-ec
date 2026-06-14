"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container as="section" className="py-32 md:py-40">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Error</p>
        <p className="mt-6 text-sm font-light text-neutral-700">
          問題が発生しました。しばらくしてからお試しください。
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-light tracking-wide text-neutral-900 transition-opacity hover:opacity-60"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-xs font-light tracking-wide text-neutral-500 transition-opacity hover:opacity-60"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Container>
  );
}
