"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  adminBtnDanger,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
} from "@/lib/admin/ui";
import {
  IMAGE_ADMIN_COPY,
  IMAGE_PURPOSE_LABELS,
} from "@/lib/images/labels";
import type { AdminImageReferenceSet } from "@/types/admin-image";
import type { ImagePurpose } from "@/types/database";

const PURPOSES: readonly ImagePurpose[] = [
  "instagram_teaser",
  "ec_hero",
  "product_lp",
  "journal",
  "fabric",
];

type Candidate = {
  id: string;
  publicUrl: string;
  altTextJa: string;
  purpose: ImagePurpose;
};

type ReferenceSetEditorProps = {
  set: AdminImageReferenceSet;
  candidates: Candidate[];
};

export function ReferenceSetEditor({
  set,
  candidates,
}: ReferenceSetEditorProps) {
  const router = useRouter();
  const copy = IMAGE_ADMIN_COPY.references;

  const [name, setName] = useState(set.name);
  const [description, setDescription] = useState(set.description);
  const [isDefault, setIsDefault] = useState(set.isDefault);
  const [purposes, setPurposes] = useState<ImagePurpose[]>(set.purposes);
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePurpose = (purpose: ImagePurpose) => {
    setPurposes((current) =>
      current.includes(purpose)
        ? current.filter((value) => value !== purpose)
        : [...current, purpose],
    );
  };

  const saveSet = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/images/references/${set.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isDefault, purposes }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "保存に失敗しました。");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const addImage = async (nextUrl: string, assetId?: string) => {
    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/images/references/${set.id}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: nextUrl, assetId: assetId ?? null }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "追加に失敗しました。");
      }

      setUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました。");
    } finally {
      setIsAdding(false);
    }
  };

  const removeImage = async (imageId: string) => {
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/images/references/${set.id}/images?imageId=${imageId}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "削除に失敗しました。");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
    }
  };

  const deleteSet = async () => {
    if (!window.confirm("この参照セットを削除しますか？")) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/admin/images/references/${set.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "削除に失敗しました。");
      }

      router.push("/admin/images/references");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={saveSet}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
      >
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
            className={`${adminInput} min-h-[5rem] resize-y`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
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

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={adminBtnPrimary} disabled={isSaving}>
            {isSaving ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            className={adminBtnDanger}
            onClick={() => void deleteSet()}
          >
            {copy.deleteSet}
          </button>
        </div>
      </form>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-medium text-neutral-900">
          参照画像（{set.images.length} / 9）
        </h2>
        <p className={adminMuted}>{copy.urlHint}</p>

        <div className="flex flex-wrap gap-3">
          <input
            className={`${adminInput} max-w-xl`}
            placeholder="https://..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button
            type="button"
            className={adminBtnSecondary}
            disabled={isAdding || !url.trim()}
            onClick={() => void addImage(url)}
          >
            {isAdding ? "追加中…" : copy.addImage}
          </button>
        </div>

        {set.images.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {set.images.map((image) => (
              <li
                key={image.id}
                className="overflow-hidden rounded-md border border-neutral-200"
              >
                <div className="relative aspect-square bg-neutral-100">
                  <Image
                    src={image.url}
                    alt={image.note || "reference"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-2 p-3">
                  <p className="break-all text-xs text-neutral-600">{image.url}</p>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    onClick={() => void removeImage(image.id)}
                  >
                    {copy.removeImage}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={adminMuted}>まだ参照画像がありません。</p>
        )}

        {candidates.length > 0 ? (
          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-medium text-neutral-800">
              承認済みアセットから選ぶ
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="space-y-2">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={candidate.publicUrl}
                      alt={candidate.altTextJa || "asset"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={isAdding}
                    onClick={() =>
                      void addImage(candidate.publicUrl, candidate.id)
                    }
                  >
                    追加
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {error ? <p className={adminError}>{error}</p> : null}
    </div>
  );
}
