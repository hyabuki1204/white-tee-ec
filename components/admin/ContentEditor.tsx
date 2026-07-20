"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSection,
  adminSuccess,
  adminTabActive,
  adminTabInactive,
  adminTextarea,
} from "@/lib/admin/ui";
import { ContentImageField } from "@/components/admin/ContentImageField";
import { cn } from "@/lib/utils";
import type {
  AboutPageContent,
  HomePageContent,
  SiteContentMap,
  StoriesPageContent,
} from "@/types/site-content";

type ContentEditorProps = {
  initialContent: Pick<SiteContentMap, "home" | "about" | "stories">;
  products: Array<{ slug: string; name: string; isPublished: boolean }>;
};

type TabId = keyof ContentEditorProps["initialContent"];

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: ADMIN_COPY.content.tabs.home },
  { id: "about", label: ADMIN_COPY.content.tabs.about },
  { id: "stories", label: ADMIN_COPY.content.tabs.stories },
];

function snapshotTab(content: unknown) {
  return JSON.stringify(content);
}

export function ContentEditor({ initialContent, products }: ContentEditorProps) {
  const copy = ADMIN_COPY.content;
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [home, setHome] = useState<HomePageContent>(initialContent.home);
  const [about, setAbout] = useState<AboutPageContent>(initialContent.about);
  const [stories, setStories] = useState<StoriesPageContent>(
    initialContent.stories,
  );
  const [savedByTab, setSavedByTab] = useState<Record<TabId, string>>({
    home: snapshotTab(initialContent.home),
    about: snapshotTab(initialContent.about),
    stories: snapshotTab(initialContent.stories),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  const getTabContent = useCallback(
    (tab: TabId) => {
      switch (tab) {
        case "home":
          return home;
        case "about":
          return about;
        case "stories":
          return stories;
      }
    },
    [home, about, stories],
  );

  const isDirty = snapshotTab(getTabContent(activeTab)) !== savedByTab[activeTab];

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
    setError(null);
    setMessage(null);
    setPendingTab(null);
  };

  const requestTabSwitch = (tab: TabId) => {
    if (tab === activeTab) return;

    if (isDirty) {
      setPendingTab(tab);
      return;
    }

    switchTab(tab);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const payload = getTabContent(activeTab);

    try {
      const response = await fetch(`/api/admin/content/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? ADMIN_COPY.common.saveFailed);
      }

      setSavedByTab((current) => ({
        ...current,
        [activeTab]: snapshotTab(getTabContent(activeTab)),
      }));
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

  const publishedProducts = products.filter((product) => product.isPublished);

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
      <div className={`${adminSection} flex flex-wrap gap-x-6 gap-y-2`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => requestTabSwitch(tab.id)}
            className={cn(
              activeTab === tab.id ? adminTabActive : adminTabInactive,
            )}
          >
            {tab.label}
            {activeTab === tab.id && isDirty ? " *" : ""}
          </button>
        ))}
      </div>

      <div className={`${adminSection} space-y-6`}>
        {activeTab === "home" ? (
          <>
            <fieldset className={adminField}>
              <legend className={adminLabel}>{copy.home.heroCarousel}</legend>
              <p className={adminMuted}>{copy.home.heroCarouselHint}</p>
              <div className="mt-3 space-y-4">
                {home.heroCarouselImages.map((src, index) => (
                  <div
                    key={`hero-carousel-${index}`}
                    className="space-y-3 border-t border-neutral-200 pt-4 first:border-t-0 first:pt-0"
                  >
                    <ContentImageField
                      label={copy.home.heroCarouselImage(index + 1)}
                      previewAspectClass="aspect-[21/9]"
                      value={src}
                      onChange={(heroCarouselImage) => {
                        const next = [...home.heroCarouselImages];
                        next[index] = heroCarouselImage;
                        setHome({ ...home, heroCarouselImages: next });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setHome({
                          ...home,
                          heroCarouselImages: home.heroCarouselImages.filter(
                            (_, imageIndex) => imageIndex !== index,
                          ),
                        })
                      }
                      className={adminBtnSecondary}
                      disabled={home.heroCarouselImages.length <= 1}
                    >
                      {copy.home.removeHeroCarouselImage}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setHome({
                    ...home,
                    heroCarouselImages: [...home.heroCarouselImages, ""],
                  })
                }
                className={`${adminBtnSecondary} mt-4`}
              >
                {copy.home.addHeroCarouselImage}
              </button>
            </fieldset>

            <label className={adminField}>
              <span className={adminLabel}>{copy.home.announcementMessage}</span>
              <input
                value={home.announcementMessage}
                onChange={(event) =>
                  setHome({ ...home, announcementMessage: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.announcementLinkHref}</span>
              <input
                value={home.announcementLinkHref}
                onChange={(event) =>
                  setHome({ ...home, announcementLinkHref: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.announcementLinkLabel}</span>
              <input
                value={home.announcementLinkLabel}
                onChange={(event) =>
                  setHome({ ...home, announcementLinkLabel: event.target.value })
                }
                className={adminInput}
              />
            </label>

            <p className={adminMuted}>{copy.home.legacyNotice}</p>
            <ContentImageField
              label={copy.home.heroImage}
              hint={copy.home.heroImageHint}
              previewAspectClass="aspect-video"
              value={home.heroImage}
              onChange={(heroImage) => setHome({ ...home, heroImage })}
            />
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.heroCopy}</span>
              <input
                value={home.heroCopy}
                onChange={(event) =>
                  setHome({ ...home, heroCopy: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.concept1}</span>
              <input
                value={home.conceptLines[0]}
                onChange={(event) =>
                  setHome({
                    ...home,
                    conceptLines: [event.target.value, home.conceptLines[1]],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.concept2}</span>
              <input
                value={home.conceptLines[1]}
                onChange={(event) =>
                  setHome({
                    ...home,
                    conceptLines: [home.conceptLines[0], event.target.value],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.featuredCount}</span>
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
                className={`${adminInput} max-w-[8rem]`}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.fabricPreviewCount}</span>
              <input
                type="number"
                min={1}
                max={12}
                value={home.fabricPreviewCount}
                onChange={(event) =>
                  setHome({
                    ...home,
                    fabricPreviewCount: Number(event.target.value),
                  })
                }
                className={`${adminInput} max-w-[8rem]`}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.fabricIntro1}</span>
              <input
                value={home.fabricIntroLines[0]}
                onChange={(event) =>
                  setHome({
                    ...home,
                    fabricIntroLines: [
                      event.target.value,
                      home.fabricIntroLines[1],
                    ],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.home.fabricIntro2}</span>
              <input
                value={home.fabricIntroLines[1]}
                onChange={(event) =>
                  setHome({
                    ...home,
                    fabricIntroLines: [
                      home.fabricIntroLines[0],
                      event.target.value,
                    ],
                  })
                }
                className={adminInput}
              />
            </label>
            <fieldset className={adminField}>
              <legend className={adminLabel}>{copy.home.featuredSlugs}</legend>
              <p className={adminMuted}>{copy.home.featuredSlugsHint}</p>
              {publishedProducts.length === 0 ? (
                <p className={adminMuted}>{copy.home.featuredSlugsEmpty}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {publishedProducts.map((product) => (
                    <label
                      key={product.slug}
                      className="flex items-center gap-3 text-sm text-neutral-800"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={home.featuredProductSlugs.includes(
                          product.slug,
                        )}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...home.featuredProductSlugs, product.slug]
                            : home.featuredProductSlugs.filter(
                                (slug) => slug !== product.slug,
                              );
                          setHome({ ...home, featuredProductSlugs: next });
                        }}
                      />
                      {product.name}
                      <span className="text-xs text-neutral-500">
                        ({product.slug})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          </>
        ) : null}

        {activeTab === "about" ? (
          <>
            <label className={adminField}>
              <span className={adminLabel}>{copy.about.headline}</span>
              <input
                value={about.headline}
                onChange={(event) =>
                  setAbout({ ...about, headline: event.target.value })
                }
                className={adminInput}
              />
            </label>
            {about.bodyParagraphs.map((paragraph, index) => (
              <label key={`about-paragraph-${index}`} className={adminField}>
                <span className={adminLabel}>
                  {copy.about.paragraph(index + 1)}
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
                  className={adminTextarea}
                />
              </label>
            ))}
          </>
        ) : null}

        {activeTab === "stories" ? (
          <>
            <p className={adminMuted}>{copy.journalNotice}</p>
            <label className={adminField}>
              <span className={adminLabel}>{copy.stories.pageTitle}</span>
              <input
                value={stories.pageTitle}
                onChange={(event) =>
                  setStories({ ...stories, pageTitle: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.stories.intro1}</span>
              <input
                value={stories.introLines[0]}
                onChange={(event) =>
                  setStories({
                    ...stories,
                    introLines: [event.target.value, stories.introLines[1]],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.stories.intro2}</span>
              <input
                value={stories.introLines[1]}
                onChange={(event) =>
                  setStories({
                    ...stories,
                    introLines: [stories.introLines[0], event.target.value],
                  })
                }
                className={adminInput}
              />
            </label>

            {stories.entries.map((entry, index) => (
              <div
                key={entry.id}
                className="space-y-4 border-t border-neutral-200 pt-6"
              >
                <p className="text-sm font-medium text-neutral-800">
                  {copy.stories.entry(index + 1)}
                </p>
                <label className={adminField}>
                  <span className={adminLabel}>{copy.stories.title}</span>
                  <input
                    value={entry.title}
                    onChange={(event) => {
                      const next = [...stories.entries];
                      next[index] = { ...entry, title: event.target.value };
                      setStories({ ...stories, entries: next });
                    }}
                    className={adminInput}
                  />
                </label>
                <label className={adminField}>
                  <span className={adminLabel}>{copy.stories.lines}</span>
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
                    className={adminTextarea}
                  />
                </label>
                <ContentImageField
                  label={copy.stories.imagePath}
                  hint={copy.stories.imagePathHint}
                  value={entry.imageUrl}
                  onChange={(imageUrl) => {
                    const next = [...stories.entries];
                    next[index] = { ...entry, imageUrl };
                    setStories({ ...stories, entries: next });
                  }}
                />
                <label className={adminField}>
                  <span className={adminLabel}>{copy.stories.imageAlt}</span>
                  <input
                    value={entry.imageAlt}
                    onChange={(event) => {
                      const next = [...stories.entries];
                      next[index] = { ...entry, imageAlt: event.target.value };
                      setStories({ ...stories, entries: next });
                    }}
                    className={adminInput}
                  />
                </label>
              </div>
            ))}
          </>
        ) : null}
      </div>

      <div className={`${adminSection} flex flex-col gap-4`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`${adminBtnPrimary} self-start`}
        >
          {isSaving
            ? ADMIN_COPY.common.saving
            : copy.saveTab(TABS.find((tab) => tab.id === activeTab)!.label)}
        </button>
        {error ? <p className={adminError}>{error}</p> : null}
        {message ? <p className={adminSuccess}>{message}</p> : null}
      </div>

      <AdminConfirmDialog
        open={pendingTab !== null}
        title={ADMIN_COPY.confirm.title}
        message={ADMIN_COPY.common.unsavedChanges}
        confirmLabel={ADMIN_COPY.confirm.proceed}
        onConfirm={() => {
          if (pendingTab) {
            switchTab(pendingTab);
          }
        }}
        onCancel={() => setPendingTab(null)}
      />
    </div>
  );
}
