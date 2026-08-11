"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminMuted,
  adminSuccess,
} from "@/lib/admin/ui";
import { IMAGE_JOB_STATUS_BADGE, IMAGE_JOB_STATUS_LABELS } from "@/lib/images/labels";
import type { AdminImageConcept, AdminImageJob } from "@/types/admin-image";

/**
 * The operator's control surface for one brief.
 *
 * Every button here either spends money or moves a job, so each says which
 * before it is pressed rather than after. The order of the three actions is
 * the order of the pipeline: propose, render, advance.
 */

type BriefWorkbenchProps = {
  briefId: string;
  concepts: AdminImageConcept[];
  jobsByConcept: Record<string, AdminImageJob[]>;
  claudeConfigured: boolean;
  providerId: string;
  isMockProvider: boolean;
};

type ConceptBody = {
  rationale?: string;
  subject?: string;
  composition?: string;
  lighting?: string;
  environment?: string;
  aspectRatio?: string;
};

export function BriefWorkbench({
  briefId,
  concepts,
  jobsByConcept,
  claudeConfigured,
  providerId,
  isMockProvider,
}: BriefWorkbenchProps) {
  const router = useRouter();

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const call = async (
    key: string,
    url: string,
    successMessage: (data: Record<string, unknown>) => string,
  ) => {
    setBusy(key);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await response.json()) as Record<string, unknown> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "処理に失敗しました。");
      }

      setMessage(successMessage(data));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "処理に失敗しました。",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={adminBtnPrimary}
          disabled={busy !== null || !claudeConfigured}
          onClick={() =>
            call(
              "concepts",
              `/api/admin/images/briefs/${briefId}/concepts`,
              (data) =>
                `コンセプトを ${
                  Array.isArray(data.concepts) ? data.concepts.length : 0
                } 件生成しました。`,
            )
          }
        >
          {busy === "concepts"
            ? "Claude が考えています…"
            : "Claude にコンセプトを生成させる"}
        </button>

        <button
          type="button"
          className={adminBtnSecondary}
          disabled={busy !== null}
          onClick={() =>
            call("tick", "/api/admin/images/tick", (data) => {
              const counts = (data.counts ?? {}) as Record<string, number>;

              return `実行しました（投入 ${counts.submitted ?? 0} / 取得 ${
                counts.polled ?? 0
              } / 保存 ${counts.ingested ?? 0} / 失敗 ${counts.failed ?? 0}）`;
            })
          }
        >
          {busy === "tick" ? "実行中…" : "ジョブを今すぐ進める"}
        </button>

        <span className={`${adminMuted} text-xs`}>
          生成エンジン: {providerId}
          {isMockProvider ? "（モック・課金なし）" : "（実課金）"}
        </span>
      </div>

      {!claudeConfigured ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ANTHROPIC_API_KEY が設定されていないため、コンセプト生成は使えません。
        </p>
      ) : null}

      {error ? <p className={adminError}>{error}</p> : null}
      {message ? <p className={adminSuccess}>{message}</p> : null}

      {concepts.length === 0 ? (
        <p className={adminMuted}>
          コンセプトがまだありません。上のボタンで生成してください。
        </p>
      ) : (
        <ul className="space-y-4">
          {concepts.map((concept) => {
            const body = concept.concept as ConceptBody;
            const jobs = jobsByConcept[concept.id] ?? [];

            return (
              <li
                key={concept.id}
                className="rounded-lg border border-neutral-200 p-5"
              >
                <div className="mb-3 flex flex-wrap items-baseline gap-3">
                  <h3 className="font-medium">{concept.title}</h3>
                  <span className={`${adminMuted} text-xs`}>
                    第 {concept.revision} 案
                  </span>
                </div>

                {body.rationale ? (
                  <p className={`${adminMuted} mb-3 text-sm`}>
                    {body.rationale}
                  </p>
                ) : null}

                <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                  {(
                    [
                      ["被写体", body.subject],
                      ["構図", body.composition],
                      ["光", body.lighting],
                      ["環境", body.environment],
                    ] as const
                  ).map(([label, value]) =>
                    value ? (
                      <div key={label}>
                        <dt className={`${adminMuted} text-xs`}>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>

                {jobs.length > 0 ? (
                  <ul className="mb-4 flex flex-wrap gap-2">
                    {jobs.map((job) => (
                      <li
                        key={job.id}
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${IMAGE_JOB_STATUS_BADGE[job.status]}`}
                      >
                        {IMAGE_JOB_STATUS_LABELS[job.status]}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <button
                  type="button"
                  className={adminBtnSecondary}
                  disabled={busy !== null}
                  onClick={() =>
                    call(
                      `job-${concept.id}`,
                      `/api/admin/images/concepts/${concept.id}/jobs`,
                      () =>
                        "ジョブを投入しました。「ジョブを今すぐ進める」を押すと処理されます。",
                    )
                  }
                >
                  {busy === `job-${concept.id}`
                    ? "投入中…"
                    : concept.renderSpec
                      ? "この案でもう一度生成"
                      : "この案で画像を生成"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
