"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  AboutPageContent,
  HomePageContent,
  SiteContentMap,
  StoriesPageContent,
} from "@/types/site-content";

type ContentEditorProps = {
  initialContent: SiteContentMap;
};

type TabId = keyof SiteContentMap;

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stories", label: "Stories" },
];

const inputClassName =
  "w-full border-b border-neutral-300 bg-transparent py-2 text-xs font-light text-neutral-800 outline-none";

export function ContentEditor({ initialContent }: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [home, setHome] = useState<HomePageContent>(initialContent.home);
  const [about, setAbout] = useState<AboutPageContent>(initialContent.about);
  const [stories, setStories] = useState<StoriesPageContent>(
    initialContent.stories,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const payload =
      activeTab === "home"
        ? home
        : activeTab === "about"
          ? about
          : stories;

    try {
      const response = await fetch(`/api/admin/content/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save content.");
      }

      setMessage("Saved.");
    } catch (saveError) {
      const text =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save content.";
      setError(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-neutral-200/70">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
              setMessage(null);
            }}
            className={cn(
              "-mb-px pb-3 text-xs font-light tracking-wide transition-colors",
              activeTab === tab.id
                ? "border-b border-neutral-900 text-neutral-900"
                : "border-b border-transparent text-neutral-400 hover:text-neutral-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "home" ? (
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Hero image path
            </span>
            <input
              value={home.heroImage}
              onChange={(event) =>
                setHome({ ...home, heroImage: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">Hero copy</span>
            <input
              value={home.heroCopy}
              onChange={(event) =>
                setHome({ ...home, heroCopy: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Concept line 1
            </span>
            <input
              value={home.conceptLines[0]}
              onChange={(event) =>
                setHome({
                  ...home,
                  conceptLines: [event.target.value, home.conceptLines[1]],
                })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Concept line 2
            </span>
            <input
              value={home.conceptLines[1]}
              onChange={(event) =>
                setHome({
                  ...home,
                  conceptLines: [home.conceptLines[0], event.target.value],
                })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Featured products count
            </span>
            <input
              type="number"
              min={1}
              max={12}
              value={home.featuredProductCount}
              onChange={(event) =>
                setHome({
                  ...home,
                  featuredProductCount: Number(event.target.value),
                })
              }
              className={inputClassName}
            />
          </label>
        </div>
      ) : null}

      {activeTab === "about" ? (
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">Headline</span>
            <input
              value={about.headline}
              onChange={(event) =>
                setAbout({ ...about, headline: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          {about.bodyParagraphs.map((paragraph, index) => (
            <label key={`about-paragraph-${index}`} className="block space-y-2">
              <span className="text-xs font-light text-neutral-500">
                Paragraph {index + 1} (one line per row)
              </span>
              <textarea
                rows={3}
                value={paragraph.join("\n")}
                onChange={(event) => {
                  const next = [...about.bodyParagraphs];
                  next[index] = event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  setAbout({ ...about, bodyParagraphs: next });
                }}
                className={`${inputClassName} resize-y`}
              />
            </label>
          ))}
        </div>
      ) : null}

      {activeTab === "stories" ? (
        <div className="space-y-10">
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Page title
            </span>
            <input
              value={stories.pageTitle}
              onChange={(event) =>
                setStories({ ...stories, pageTitle: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Intro line 1
            </span>
            <input
              value={stories.introLines[0]}
              onChange={(event) =>
                setStories({
                  ...stories,
                  introLines: [event.target.value, stories.introLines[1]],
                })
              }
              className={inputClassName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">
              Intro line 2
            </span>
            <input
              value={stories.introLines[1]}
              onChange={(event) =>
                setStories({
                  ...stories,
                  introLines: [stories.introLines[0], event.target.value],
                })
              }
              className={inputClassName}
            />
          </label>

          {stories.entries.map((entry, index) => (
            <div
              key={entry.id}
              className="space-y-4 border-t border-neutral-200/70 pt-8"
            >
              <p className="text-xs tracking-[0.2em] text-neutral-400">
                Story {index + 1}
              </p>
              <label className="block space-y-2">
                <span className="text-xs font-light text-neutral-500">Title</span>
                <input
                  value={entry.title}
                  onChange={(event) => {
                    const next = [...stories.entries];
                    next[index] = { ...entry, title: event.target.value };
                    setStories({ ...stories, entries: next });
                  }}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-light text-neutral-500">
                  Lines (one per row)
                </span>
                <textarea
                  rows={4}
                  value={entry.lines.join("\n")}
                  onChange={(event) => {
                    const next = [...stories.entries];
                    next[index] = {
                      ...entry,
                      lines: event.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    };
                    setStories({ ...stories, entries: next });
                  }}
                  className={`${inputClassName} resize-y`}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-light text-neutral-500">
                  Image path
                </span>
                <input
                  value={entry.imageUrl}
                  onChange={(event) => {
                    const next = [...stories.entries];
                    next[index] = { ...entry, imageUrl: event.target.value };
                    setStories({ ...stories, entries: next });
                  }}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-light text-neutral-500">
                  Image alt text
                </span>
                <input
                  value={entry.imageAlt}
                  onChange={(event) => {
                    const next = [...stories.entries];
                    next[index] = { ...entry, imageAlt: event.target.value };
                    setStories({ ...stories, entries: next });
                  }}
                  className={inputClassName}
                />
              </label>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-neutral-200/70 pt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="self-start py-2 text-xs tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          {isSaving ? "Saving..." : `Save ${activeTab}`}
        </button>
        {error ? (
          <p className="text-xs font-light text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="text-xs font-light text-neutral-500">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
