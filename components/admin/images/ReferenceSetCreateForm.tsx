"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminTextarea,
} from "@/lib/admin/ui";
import {
  IMAGE_ADMIN_COPY,
  IMAGE_PURPOSE_LABELS,
} from "@/lib/images/labels";
import type { ImagePurpose } from "@/types/database";

const PURPOSES: readonly ImagePurpose[] = [
  "instagram_teaser",
  "ec_hero",
  "product_lp",
  "journal",
  "fabric",
];

export function ReferenceSetCreateForm() {
  const router = useRouter();
  const copy = IMAGE_ADMIN_COPY.references;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [purposes, setPurposes] = useState<ImagePurpose[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePurpose = (purpose: ImagePurpose) => {
    setPurposes((current) =>
      current.includes(purpose)
        ? current.filter((value) => value !== purpose)
        : [...current, purpose],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/images/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isDefault, purposes }),
      });
      const data = (await response.json()) as {
        error?: string;
        set?: { id: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "作成に失敗しました。");
      }

      if (data.set) {
        router.push(`/admin/images/references/${data.set.id}`);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
    >
      <h2 className="text-base font-medium text-neutral-900">{copy.create}</h2>
      <p className={adminMuted}>{copy.defaultHint}</p>

      <label className={adminField}>
        <span className={adminLabel}>名前</span>
        <input
          className={adminInput}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>説明</span>
        <textarea
          className={adminTextarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </label>

      <fieldset className={adminField}>
        <legend className={adminLabel}>用途（空なら全用途）</legend>
        <div className="flex flex-wrap gap-3">
          {PURPOSES.map((purpose) => (
            <label key={purpose} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={purposes.includes(purpose)}
                onChange={() => togglePurpose(purpose)}
              />
              {IMAGE_PURPOSE_LABELS[purpose]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
        デフォルトにする（実運用ジョブへ自動添付）
      </label>

      {error ? <p className={adminError}>{error}</p> : null}

      <button type="submit" className={adminBtnPrimary} disabled={isSaving}>
        {isSaving ? "作成中…" : copy.create}
      </button>
    </form>
  );
}
