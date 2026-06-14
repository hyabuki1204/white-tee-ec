"use client";

import Image from "next/image";
import { useState } from "react";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { ADMIN_IMAGE_ACCEPT } from "@/lib/admin/image-upload";
import { adminError, adminField, adminInput, adminLabel, adminMuted } from "@/lib/admin/ui";

type ContentImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  previewAspectClass?: string;
  uploadEndpoint?: string;
};

export function ContentImageField({
  label,
  value,
  onChange,
  hint,
  previewAspectClass = "aspect-[4/3]",
  uploadEndpoint = "/api/admin/content/upload-image",
}: ContentImageFieldProps) {
  const copy = ADMIN_COPY.content.imageField;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? copy.uploadFailed);
      }

      onChange(data.url);
    } catch (error) {
      const text =
        error instanceof Error ? error.message : copy.uploadFailed;
      setUploadError(text);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={adminField}>
      <span className={adminLabel}>{label}</span>
      {hint ? <p className={adminMuted}>{hint}</p> : null}

      {value ? (
        <div
          className={`relative ${previewAspectClass} w-full max-w-sm overflow-hidden rounded-md border border-neutral-200 bg-neutral-100`}
        >
          <Image
            src={value}
            alt=""
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      ) : null}

      <label className={adminField}>
        <span className={adminLabel}>{copy.pathOrUrl}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/home/hero.jpg または https://..."
          className={adminInput}
        />
      </label>

      <label className={adminField}>
        <span className={adminLabel}>{copy.upload}</span>
        <input
          type="file"
          accept={ADMIN_IMAGE_ACCEPT}
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadImage(file);
            }
            event.target.value = "";
          }}
          className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
        />
      </label>

      {isUploading ? <p className={adminMuted}>{copy.uploading}</p> : null}
      {uploadError ? <p className={adminError}>{uploadError}</p> : null}
    </div>
  );
}
