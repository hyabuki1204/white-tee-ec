"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getRestockCopy, type RestockCopy } from "@/lib/restock/copy";
import type { ProductSize } from "@/types";

type Status = "idle" | "submitting" | "success" | "error";

function messageFor(code: string | undefined, RESTOCK_COPY: RestockCopy): string {
  switch (code) {
    case "invalid_email":
      return RESTOCK_COPY.invalidEmail;
    case "in_stock":
      return RESTOCK_COPY.inStock;
    case "rate_limited":
      return RESTOCK_COPY.rateLimited;
    default:
      return RESTOCK_COPY.unavailable;
  }
}

/**
 * Submit state for one product + size. Mount it with a `key` of
 * `${productId}-${size}` so switching size starts from a clean form.
 */
export function useRestockRequest(
  productId: string,
  size: ProductSize,
  locale: Locale,
) {
  const RESTOCK_COPY = getRestockCopy(locale);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting" || !email.trim()) return;

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The stored locale decides the language of the notification email.
        body: JSON.stringify({ email, productId, size, company, locale }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (response.ok && data?.ok) {
        setStatus("success");
        return;
      }

      setStatus("error");
      setError(messageFor(data?.error, RESTOCK_COPY));
    } catch {
      setStatus("error");
      setError(RESTOCK_COPY.unavailable);
    }
  };

  return {
    email,
    setEmail: (value: string) => {
      setEmail(value);
      if (status === "error") {
        setStatus("idle");
        setError(null);
      }
    },
    company,
    setCompany,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    handleSubmit,
  };
}
