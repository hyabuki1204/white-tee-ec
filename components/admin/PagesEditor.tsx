"use client";

import { useEffect, useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminError,
  adminField,
  adminInput,
  adminLabel,
  adminSection,
  adminSuccess,
  adminTabActive,
  adminTabInactive,
  adminTextarea,
} from "@/lib/admin/ui";
import { cn } from "@/lib/utils";
import type {
  ContactPageContent,
  LegalBusinessContent,
  PolicyPageContent,
  SiteContentMap,
} from "@/types/site-content";

type PagesEditorProps = {
  initialContent: Pick<
    SiteContentMap,
    "legal" | "contact" | "shipping" | "privacy" | "terms"
  >;
};

type TabId = keyof PagesEditorProps["initialContent"];

const TABS: { id: TabId; label: string }[] = [
  { id: "legal", label: ADMIN_COPY.pages.tabs.legal },
  { id: "contact", label: ADMIN_COPY.pages.tabs.contact },
  { id: "shipping", label: ADMIN_COPY.pages.tabs.shipping },
  { id: "privacy", label: ADMIN_COPY.pages.tabs.privacy },
  { id: "terms", label: ADMIN_COPY.pages.tabs.terms },
];

function snapshotTab(content: unknown) {
  return JSON.stringify(content);
}

export function PagesEditor({ initialContent }: PagesEditorProps) {
  const copy = ADMIN_COPY.pages;
  const [activeTab, setActiveTab] = useState<TabId>("legal");
  const [legal, setLegal] = useState<LegalBusinessContent>(initialContent.legal);
  const [contact, setContact] = useState<ContactPageContent>(
    initialContent.contact,
  );
  const [shipping, setShipping] = useState<PolicyPageContent>(
    initialContent.shipping,
  );
  const [privacy, setPrivacy] = useState<PolicyPageContent>(
    initialContent.privacy,
  );
  const [terms, setTerms] = useState<PolicyPageContent>(initialContent.terms);
  const [savedByTab, setSavedByTab] = useState<Record<TabId, string>>({
    legal: snapshotTab(initialContent.legal),
    contact: snapshotTab(initialContent.contact),
    shipping: snapshotTab(initialContent.shipping),
    privacy: snapshotTab(initialContent.privacy),
    terms: snapshotTab(initialContent.terms),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  const getTabContent = (tab: TabId) => {
    switch (tab) {
      case "legal":
        return legal;
      case "contact":
        return contact;
      case "shipping":
        return shipping;
      case "privacy":
        return privacy;
      case "terms":
        return terms;
    }
  };

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

  const updatePolicySection = (
    content: PolicyPageContent,
    setContent: (value: PolicyPageContent) => void,
    index: number,
    patch: Partial<PolicyPageContent["sections"][number]>,
  ) => {
    const next = [...content.sections];
    next[index] = { ...next[index]!, ...patch };
    setContent({ ...content, sections: next });
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

  const renderPolicyEditor = (
    content: PolicyPageContent,
    setContent: (value: PolicyPageContent) => void,
  ) => (
    <>
      <label className={adminField}>
        <span className={adminLabel}>{copy.policy.pageTitle}</span>
        <input
          value={content.pageTitle}
          onChange={(event) =>
            setContent({ ...content, pageTitle: event.target.value })
          }
          className={adminInput}
        />
      </label>
      {content.sections.map((section, index) => (
        <div
          key={`${content.pageTitle}-section-${index}`}
          className="space-y-4 border-t border-neutral-200 pt-6"
        >
          <p className="text-sm font-semibold text-neutral-800">
            {copy.policy.section(index + 1)}
          </p>
          <label className={adminField}>
            <span className={adminLabel}>{copy.policy.sectionTitle}</span>
            <input
              value={section.title}
              onChange={(event) =>
                updatePolicySection(content, setContent, index, {
                  title: event.target.value,
                })
              }
              className={adminInput}
            />
          </label>
          <label className={adminField}>
            <span className={adminLabel}>{copy.policy.sectionBody}</span>
            <textarea
              rows={4}
              value={section.body}
              onChange={(event) =>
                updatePolicySection(content, setContent, index, {
                  body: event.target.value,
                })
              }
              className={adminTextarea}
            />
          </label>
        </div>
      ))}
    </>
  );

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
        {activeTab === "legal" ? (
          <>
            <label className={adminField}>
              <span className={adminLabel}>{copy.legal.operator}</span>
              <input
                value={legal.operator}
                onChange={(event) =>
                  setLegal({ ...legal, operator: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.legal.address}</span>
              <textarea
                rows={2}
                value={legal.address}
                onChange={(event) =>
                  setLegal({ ...legal, address: event.target.value })
                }
                className={adminTextarea}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.legal.email}</span>
              <input
                type="email"
                value={legal.email}
                onChange={(event) =>
                  setLegal({ ...legal, email: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.legal.phone}</span>
              <input
                value={legal.phone}
                onChange={(event) =>
                  setLegal({ ...legal, phone: event.target.value })
                }
                className={adminInput}
              />
            </label>
          </>
        ) : null}

        {activeTab === "contact" ? (
          <>
            <label className={adminField}>
              <span className={adminLabel}>{copy.contact.intro1}</span>
              <input
                value={contact.introLines[0]}
                onChange={(event) =>
                  setContact({
                    ...contact,
                    introLines: [event.target.value, contact.introLines[1]],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.contact.intro2}</span>
              <input
                value={contact.introLines[1]}
                onChange={(event) =>
                  setContact({
                    ...contact,
                    introLines: [contact.introLines[0], event.target.value],
                  })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.contact.email}</span>
              <input
                type="email"
                value={contact.email}
                onChange={(event) =>
                  setContact({ ...contact, email: event.target.value })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.contact.hours}</span>
              <input
                value={contact.hours}
                onChange={(event) =>
                  setContact({ ...contact, hours: event.target.value })
                }
                className={adminInput}
              />
            </label>
          </>
        ) : null}

        {activeTab === "shipping"
          ? renderPolicyEditor(shipping, setShipping)
          : null}
        {activeTab === "privacy"
          ? renderPolicyEditor(privacy, setPrivacy)
          : null}
        {activeTab === "terms" ? renderPolicyEditor(terms, setTerms) : null}
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
