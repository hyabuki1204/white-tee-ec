"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";
import type { NewsletterSource } from "@/types/database";

export const getNewsletterCopy = defineCopy(
  {
    heading: "新しい白の知らせを。",
    emailLabel: "Email address",
    submit: "SUBSCRIBE",
    submitting: "SENDING",
    success: "登録を受け付けました。",
    invalidEmail: "メールアドレスの形式をご確認ください。",
    unavailable:
      "ただいま登録を受け付けられませんでした。時間をおいて、もう一度お試しください。",
    notice:
      "ご登録のメールアドレスは、新しい商品などのお知らせにのみ使用します。",
    privacyLink: "プライバシーポリシー",
  },
  {
    heading: "News of the next white.",
    emailLabel: "Email address",
    submit: "SUBSCRIBE",
    submitting: "SENDING",
    success: "You are on the list.",
    invalidEmail: "Please check the format of the email address.",
    unavailable:
      "We could not register you just now. Please try again in a little while.",
    notice:
      "We use your email address only for news from the store, such as new pieces.",
    privacyLink: "Privacy policy",
  },
);

type Status = "idle" | "submitting" | "success" | "error";

/** Shared submit logic for the home and footer newsletter forms. */
export function useNewsletterSubscribe(
  source: NewsletterSource,
  locale: Locale,
) {
  const copy = getNewsletterCopy(locale);
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
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
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
      setError(
        data?.error === "invalid_email"
          ? copy.invalidEmail
          : copy.unavailable,
      );
    } catch {
      setStatus("error");
      setError(copy.unavailable);
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
    status,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    handleSubmit,
  };
}
