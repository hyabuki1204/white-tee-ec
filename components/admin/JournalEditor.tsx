"use client";

import { useEffect, useState } from "react";
import { ContentImageField } from "@/components/admin/ContentImageField";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSection,
  adminSuccess,
  adminTextarea,
} from "@/lib/admin/ui";
import type { JournalPageContent } from "@/types/site-content";

type JournalEditorProps = {
  initialContent: JournalPageContent;
};

function snapshotContent(content: JournalPageContent) {
  return JSON.stringify(content);
}

function createEmptyArticle(): JournalPageContent["articles"][number] {
  return {
    slug: "",
    title: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    excerpt: "",
    helperJa: null,
    heroImage: "",
    heroImageAlt: "",
    featured: false,
    body: [""],
  };
}

export function JournalEditor({ initialContent }: JournalEditorProps) {
  const copy = ADMIN_COPY.journal;
  const [content, setContent] = useState<JournalPageContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshotContent(initialContent),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isDirty = snapshotContent(content) !== savedSnapshot;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? ADMIN_COPY.common.saveFailed);
      }

      setSavedSnapshot(snapshotContent(content));
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

  const updateArticle = (
    index: number,
    patch: Partial<JournalPageContent["articles"][number]>,
  ) => {
    const next = [...content.articles];
    next[index] = { ...next[index]!, ...patch };
    setContent({ ...content, articles: next });
  };

  const removeArticle = (index: number) => {
    if (content.articles.length <= 1) return;
    setContent({
      ...content,
      articles: content.articles.filter((_, i) => i !== index),
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="space-y-6">
      <div className={`${adminSection} space-y-6`}>
        <label className={adminField}>
          <span className={adminLabel}>{copy.pageTitle}</span>
          <input
            value={content.pageTitle}
            onChange={(event) =>
              setContent({ ...content, pageTitle: event.target.value })
            }
            className={adminInput}
          />
        </label>
        <label className={adminField}>
          <span className={adminLabel}>{copy.intro1}</span>
          <input
            value={content.introLines[0]}
            onChange={(event) =>
              setContent({
                ...content,
                introLines: [event.target.value, content.introLines[1]],
              })
            }
            className={adminInput}
          />
        </label>
        <label className={adminField}>
          <span className={adminLabel}>{copy.intro2}</span>
          <input
            value={content.introLines[1]}
            onChange={(event) =>
              setContent({
                ...content,
                introLines: [content.introLines[0], event.target.value],
              })
            }
            className={adminInput}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
          <p className="text-sm font-medium text-neutral-800">{copy.articles}</p>
          <button
            type="button"
            onClick={() =>
              setContent({
                ...content,
                articles: [...content.articles, createEmptyArticle()],
              })
            }
            className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
          >
            {copy.addArticle}
          </button>
        </div>

        {content.articles.map((article, index) => (
          <div
            key={`journal-article-${index}-${article.slug}`}
            className="space-y-4 border-t border-neutral-200 pt-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-800">
                {copy.entry(index + 1)}
              </p>
              {content.articles.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeArticle(index)}
                  className="text-xs text-red-600 underline decoration-red-200 underline-offset-2 hover:text-red-800"
                >
                  {copy.removeArticle}
                </button>
              ) : null}
            </div>

            <label className={adminField}>
              <span className={adminLabel}>{copy.slug}</span>
              <input
                value={article.slug}
                onChange={(event) =>
                  updateArticle(index, { slug: event.target.value })
                }
                className={adminInput}
                placeholder="circular-knitting-wakayama"
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.articleTitle}</span>
              <input
                value={article.title}
                onChange={(event) =>
                  updateArticle(index, { title: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.publishedAt}</span>
              <input
                type="date"
                value={article.publishedAt}
                onChange={(event) =>
                  updateArticle(index, { publishedAt: event.target.value })
                }
                className={`${adminInput} max-w-[12rem]`}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.excerpt}</span>
              <textarea
                rows={2}
                value={article.excerpt}
                onChange={(event) =>
                  updateArticle(index, { excerpt: event.target.value })
                }
                className={adminTextarea}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.helperJa}</span>
              <input
                value={article.helperJa ?? ""}
                onChange={(event) =>
                  updateArticle(index, {
                    helperJa: event.target.value.trim() || null,
                  })
                }
                className={adminInput}
              />
            </label>
            <ContentImageField
              label={copy.heroImage}
              hint={copy.heroImageHint}
              previewAspectClass="aspect-video"
              value={article.heroImage}
              onChange={(heroImage) => updateArticle(index, { heroImage })}
            />
            <label className={adminField}>
              <span className={adminLabel}>{copy.heroImageAlt}</span>
              <input
                value={article.heroImageAlt}
                onChange={(event) =>
                  updateArticle(index, { heroImageAlt: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={article.featured ?? false}
                onChange={(event) =>
                  updateArticle(index, { featured: event.target.checked })
                }
              />
              {copy.featured}
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.body}</span>
              <textarea
                rows={8}
                value={article.body.join("\n\n")}
                onChange={(event) =>
                  updateArticle(index, {
                    body: event.target.value
                      .split(/\n\s*\n/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean),
                  })
                }
                className={adminTextarea}
              />
              <p className={adminMuted}>{copy.bodyHint}</p>
            </label>
          </div>
        ))}
      </div>

      <div className={`${adminSection} flex flex-wrap items-center gap-4`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={adminBtnPrimary}
        >
          {isSaving ? ADMIN_COPY.common.saving : copy.save}
        </button>
        {isDirty ? <p className={adminMuted}>{copy.unsaved}</p> : null}
        {message ? <p className={adminSuccess}>{message}</p> : null}
        {error ? <p className={adminError}>{error}</p> : null}
      </div>
    </div>
  );
}
