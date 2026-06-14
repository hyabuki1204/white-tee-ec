"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentImageField } from "@/components/admin/ContentImageField";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminSuccess,
  adminTextarea,
} from "@/lib/admin/ui";
import type { AdminFabricDetail } from "@/types/admin-fabric";

type FabricFormProps = {
  initialFabric: AdminFabricDetail;
};

export function FabricForm({ initialFabric }: FabricFormProps) {
  const router = useRouter();
  const copy = ADMIN_COPY.fabrics;
  const fields = copy.fields;

  const [form, setForm] = useState(initialFabric);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/fabrics/${form.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tagline: form.tagline,
          descriptionLines: form.descriptionLines,
          imageUrl: form.imageUrl,
          imageAlt: form.imageAlt,
          sortOrder: form.sortOrder,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        fabric?: AdminFabricDetail;
      };

      if (!response.ok) {
        throw new Error(data.error ?? copy.saveFailed);
      }

      if (data.fabric) {
        setForm(data.fabric);
      }

      setMessage(ADMIN_COPY.common.saved);
      router.refresh();
    } catch (saveError) {
      const text =
        saveError instanceof Error ? saveError.message : copy.saveFailed;
      setError(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <label className={adminField}>
        <span className={adminLabel}>{fields.slug}</span>
        <input value={form.slug} readOnly className={`${adminInput} bg-neutral-50`} />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>{fields.name}</span>
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
          className={adminInput}
        />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>{fields.tagline}</span>
        <input
          value={form.tagline}
          onChange={(event) => setForm({ ...form, tagline: event.target.value })}
          required
          className={adminInput}
        />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>{fields.descriptionLines}</span>
        <textarea
          rows={4}
          value={form.descriptionLines.join("\n")}
          onChange={(event) =>
            setForm({
              ...form,
              descriptionLines: event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
          className={adminTextarea}
        />
      </label>

      <ContentImageField
        label={fields.image}
        value={form.imageUrl}
        onChange={(imageUrl) => setForm({ ...form, imageUrl })}
      />

      <label className={adminField}>
        <span className={adminLabel}>{fields.imageAlt}</span>
        <input
          value={form.imageAlt}
          onChange={(event) => setForm({ ...form, imageAlt: event.target.value })}
          required
          className={adminInput}
        />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>{fields.sortOrder}</span>
        <input
          type="number"
          min={0}
          step={1}
          value={form.sortOrder}
          onChange={(event) =>
            setForm({ ...form, sortOrder: Number(event.target.value) })
          }
          className={`${adminInput} max-w-[8rem]`}
        />
      </label>

      <div className="flex flex-col gap-4">
        <button type="submit" disabled={isSaving} className={`${adminBtnPrimary} self-start`}>
          {isSaving ? ADMIN_COPY.common.saving : copy.saveChanges}
        </button>
        {error ? <p className={adminError}>{error}</p> : null}
        {message ? <p className={adminSuccess}>{message}</p> : null}
      </div>
    </form>
  );
}
