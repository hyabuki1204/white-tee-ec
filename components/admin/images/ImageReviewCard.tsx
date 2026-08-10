"use client";

import Image from "next/image";
import { useState } from "react";

import {
  adminBtnDanger,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminInput,
  adminLabel,
  adminMuted,
  adminTextarea,
} from "@/lib/admin/ui";
import {
  IMAGE_ADMIN_COPY,
  IMAGE_QA_VERDICT_BADGE,
  IMAGE_QA_VERDICT_LABELS,
  IMAGE_RELEASE_POLICY_BADGE,
  IMAGE_RELEASE_POLICY_LABELS,
  IMAGE_SUBJECT_CLASS_LABELS,
} from "@/lib/images/labels";
import type { AdminImageReviewItem } from "@/types/admin-image";

/**
 * One image awaiting a decision.
 *
 * Shows the brief's intent next to the picture on purpose: the question is
 * not "is this a good image" but "does this answer what was asked for", and
 * a reviewer cannot judge that from the picture alone.
 */

type Props = {
  item: AdminImageReviewItem;
  onReviewed: (resultId: string) => void;
};

export function ImageReviewCard({ item, onReviewed }: Props) {
  const [note, setNote] = useState("");
  const [altTextJa, setAltTextJa] = useState(item.altTextJa ?? "");
  const [altTextEn, setAltTextEn] = useState(item.altTextEn ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const copy = IMAGE_ADMIN_COPY.review;
  const isTestOnly = item.releasePolicy !== "production";
  const canApprove = !item.downloadError && item.storagePath;

  async function submit(action: "approve" | "reject" | "request_revision") {
    setError(null);

    if (action !== "approve" && !note.trim()) {
      setError(copy.noteRequired);
      return;
    }

    if (action === "approve" && !altTextJa.trim()) {
      setError(copy.altTextRequired);
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/images/results/${item.id}/review`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action, note, altTextJa, altTextEn }),
        },
      );

      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "レビューの記録に失敗しました。");
        return;
      }

      onReviewed(item.id);
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div>
          {item.signedUrl ? (
            <Image
              src={item.signedUrl}
              alt={item.conceptTitle}
              width={item.width ?? 400}
              height={item.height ?? 500}
              className="w-full rounded border border-neutral-200 object-cover"
              unoptimized
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-500">
              画像なし
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${IMAGE_RELEASE_POLICY_BADGE[item.releasePolicy]}`}
            >
              {IMAGE_RELEASE_POLICY_LABELS[item.releasePolicy]}
            </span>
            {item.qaVerdict ? (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${IMAGE_QA_VERDICT_BADGE[item.qaVerdict]}`}
              >
                AI: {IMAGE_QA_VERDICT_LABELS[item.qaVerdict]}
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {copy.concept}
            </p>
            <p className="font-medium text-neutral-900">{item.conceptTitle}</p>
            <p className={`${adminMuted} mt-2 text-xs`}>
              {copy.briefIntent}: {item.briefIntent}
            </p>
            <p className={`${adminMuted} mt-1 text-xs`}>
              {IMAGE_SUBJECT_CLASS_LABELS[item.subjectClass]} / {item.provider}
            </p>
          </div>

          {item.subjectClass === "styling_scene" ? (
            <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {copy.stylingSceneWarning}
            </p>
          ) : null}

          {item.qaIssues.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {item.qaIssues.map((issue, index) => (
                <li
                  key={index}
                  className={
                    issue.severity === "blocker"
                      ? "text-red-700"
                      : "text-neutral-600"
                  }
                >
                  {issue.severity === "blocker" ? "● " : "○ "}
                  {issue.description}
                </li>
              ))}
            </ul>
          ) : null}

          {item.downloadError ? (
            <p className={adminError}>{copy.downloadFailed}</p>
          ) : null}

          <label className="block space-y-1">
            <span className={adminLabel}>{copy.altTextJaLabel}</span>
            <input
              className={adminInput}
              value={altTextJa}
              onChange={(event) => setAltTextJa(event.target.value)}
              disabled={busy}
            />
          </label>

          <label className="block space-y-1">
            <span className={adminLabel}>{copy.altTextEnLabel}</span>
            <input
              className={adminInput}
              value={altTextEn}
              onChange={(event) => setAltTextEn(event.target.value)}
              disabled={busy}
            />
          </label>

          <label className="block space-y-1">
            <span className={adminLabel}>{copy.noteLabel}</span>
            <textarea
              className={adminTextarea}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
              rows={2}
            />
          </label>

          {error ? <p className={adminError}>{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={adminBtnPrimary}
              onClick={() => submit("approve")}
              disabled={busy || !canApprove}
            >
              {isTestOnly ? copy.approveTestOnly : copy.approve}
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() => submit("request_revision")}
              disabled={busy}
            >
              {copy.requestRevision}
            </button>
            <button
              type="button"
              className={adminBtnDanger}
              onClick={() => submit("reject")}
              disabled={busy}
            >
              {copy.reject}
            </button>
          </div>

          <p className="text-xs text-neutral-500">{copy.aiNotice}</p>
        </div>
      </div>
    </article>
  );
}
