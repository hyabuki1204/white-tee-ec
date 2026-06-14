"use client";

import { useState } from "react";
import { ContentImageField } from "@/components/admin/ContentImageField";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminSection,
  adminSuccess,
  adminTextarea,
} from "@/lib/admin/ui";
import type { SeoSettingsContent } from "@/types/site-content";

type SeoEditorProps = {
  initialContent: SeoSettingsContent;
};

export function SeoEditor({ initialContent }: SeoEditorProps) {
  const copy = ADMIN_COPY.seo;
  const [form, setForm] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? ADMIN_COPY.common.saveFailed);
      }

      setMessage(ADMIN_COPY.common.saved);
    } catch (saveError) {
      const text =
        saveError instanceof Error
          ? saveError.message
          : ADMIN_COPY.common.saveFailed;
      setError(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${adminSection} space-y-6`}>
        <label className={adminField}>
          <span className={adminLabel}>{copy.siteName}</span>
          <input
            value={form.siteName}
            onChange={(event) =>
              setForm({ ...form, siteName: event.target.value })
            }
            className={adminInput}
          />
        </label>
        <label className={adminField}>
          <span className={adminLabel}>{copy.siteDescription}</span>
          <textarea
            rows={3}
            value={form.siteDescription}
            onChange={(event) =>
              setForm({ ...form, siteDescription: event.target.value })
            }
            className={adminTextarea}
          />
        </label>
        <ContentImageField
          label={copy.defaultOgpImage}
          hint={copy.defaultOgpImageHint}
          previewAspectClass="aspect-video"
          value={form.defaultOgpImage}
          onChange={(defaultOgpImage) => setForm({ ...form, defaultOgpImage })}
        />
        <label className={adminField}>
          <span className={adminLabel}>{copy.twitterHandle}</span>
          <input
            value={form.twitterHandle ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                twitterHandle: event.target.value.trim() || null,
              })
            }
            placeholder="@white_tee"
            className={adminInput}
          />
        </label>
      </div>

      <div className={`${adminSection} flex flex-col gap-4`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`${adminBtnPrimary} self-start`}
        >
          {isSaving ? ADMIN_COPY.common.saving : copy.save}
        </button>
        {error ? <p className={adminError}>{error}</p> : null}
        {message ? <p className={adminSuccess}>{message}</p> : null}
      </div>
    </div>
  );
}
