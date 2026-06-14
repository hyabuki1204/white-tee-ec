"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
} from "@/lib/admin/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = ADMIN_COPY.login;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? ADMIN_COPY.common.signInFailed);
      }

      const nextPath = searchParams.get("next") ?? "/admin";
      router.push(nextPath);
      router.refresh();
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : ADMIN_COPY.common.signInFailed;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-6 rounded-lg border border-neutral-200 bg-white p-6 md:p-8"
    >
      <div className={adminField}>
        <label htmlFor="admin-password" className={adminLabel}>
          {copy.password}
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className={adminInput}
        />
      </div>

      <button type="submit" disabled={isLoading} className={adminBtnPrimary}>
        {isLoading ? copy.submitting : copy.submit}
      </button>

      {error ? <p className={adminError}>{error}</p> : null}
    </form>
  );
}
