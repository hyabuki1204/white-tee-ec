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
  IMAGE_PURPOSE_LABELS,
  IMAGE_SUBJECT_CLASS_LABELS,
} from "@/lib/images/labels";
import { resolveReleasePolicy } from "@/lib/images/release-policy";
import type { ImagePurpose, ImageSubjectClass } from "@/types/database";

/**
 * Create a brief.
 *
 * The release policy is shown but never entered: it is derived from the
 * subject class, both here and — independently — in the API and in a
 * database CHECK. Showing it as the subject class changes is the point,
 * so nobody discovers after generating that the work cannot be published.
 */

const PURPOSES: readonly ImagePurpose[] = [
  "instagram_teaser",
  "ec_hero",
  "product_lp",
  "journal",
  "fabric",
];

const SUBJECT_CLASSES: readonly ImageSubjectClass[] = [
  "scenery_mood",
  "styling_scene",
  "product_depiction",
  "fabric_macro",
];

export function BriefForm() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState<ImagePurpose>("instagram_teaser");
  const [subjectClass, setSubjectClass] =
    useState<ImageSubjectClass>("scenery_mood");
  const [intent, setIntent] = useState("");
  const [variantCount, setVariantCount] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const releasePolicy = resolveReleasePolicy(subjectClass);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetch("/api/admin/images/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          purpose,
          subjectClass,
          intent,
          desiredVariantCount: variantCount,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        warnings?: string[];
        brief?: { id: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "ブリーフを作成できませんでした。");
      }

      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }

      if (data.brief) {
        router.push(`/admin/images/${data.brief.id}`);
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ブリーフを作成できませんでした。",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${adminBtnPrimary} mb-8`}
      >
        ブリーフを作成
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-lg border border-neutral-200 p-5"
    >
      <div className={adminField}>
        <label className={adminLabel} htmlFor="brief-title">
          タイトル
        </label>
        <input
          id="brief-title"
          className={adminInput}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="初夏の朝の光"
          required
        />
      </div>

      <div className={adminField}>
        <label className={adminLabel} htmlFor="brief-purpose">
          用途
        </label>
        <select
          id="brief-purpose"
          className={adminInput}
          value={purpose}
          onChange={(event) =>
            setPurpose(event.target.value as ImagePurpose)
          }
        >
          {PURPOSES.map((value) => (
            <option key={value} value={value}>
              {IMAGE_PURPOSE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className={adminField}>
        <label className={adminLabel} htmlFor="brief-subject">
          被写体
        </label>
        <select
          id="brief-subject"
          className={adminInput}
          value={subjectClass}
          onChange={(event) =>
            setSubjectClass(event.target.value as ImageSubjectClass)
          }
        >
          {SUBJECT_CLASSES.map((value) => (
            <option key={value} value={value}>
              {IMAGE_SUBJECT_CLASS_LABELS[value]}
            </option>
          ))}
        </select>
        <p className={`${adminMuted} mt-2 text-xs`}>
          {releasePolicy === "production"
            ? "この被写体は実運用に使えます。"
            : "この被写体はテスト専用です。承認しても公開バケットには出ません。"}
        </p>
      </div>

      <div className={adminField}>
        <label className={adminLabel} htmlFor="brief-intent">
          意図
        </label>
        <textarea
          id="brief-intent"
          className={adminTextarea}
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          rows={4}
          placeholder="初夏の朝、白いTシャツが似合う静かな光。人物は入れず、空気感だけを写す。"
        />
      </div>

      <div className={adminField}>
        <label className={adminLabel} htmlFor="brief-variants">
          生成枚数
        </label>
        <input
          id="brief-variants"
          type="number"
          min={1}
          max={8}
          className={adminInput}
          value={variantCount}
          onChange={(event) => setVariantCount(Number(event.target.value))}
        />
      </div>

      {error ? <p className={adminError}>{error}</p> : null}

      {warnings.length > 0 ? (
        <ul className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          className={adminBtnPrimary}
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? "作成中…" : "作成"}
        </button>
        <button
          type="button"
          className={adminMuted}
          onClick={() => setIsOpen(false)}
          disabled={isSaving}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
