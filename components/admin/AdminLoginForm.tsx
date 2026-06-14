"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(data.error ?? "Failed to sign in.");
      }

      const nextPath = searchParams.get("next") ?? "/admin";
      router.push(nextPath);
      router.refresh();
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Failed to sign in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-8">
      <div>
        <label
          htmlFor="admin-password"
          className="mb-3 block text-xs font-light tracking-wide text-neutral-500"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm font-light text-neutral-900 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="text-xs tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 disabled:text-neutral-300"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      {error ? (
        <p className="text-xs font-light text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
