"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductDetailContent } from "@/types";

type ProductDetailTabsProps = {
  detail: ProductDetailContent;
};

const TABS = [
  { id: "description", label: "Description" },
  { id: "material", label: "Material" },
  { id: "care", label: "Care" },
  { id: "sizeGuide", label: "Size" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDetailTabs({ detail }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const baseId = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product details"
        className="flex flex-wrap gap-x-5 gap-y-2 md:gap-x-6"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabId = `${baseId}-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tabId}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-10 py-1 text-[11px] font-light tracking-[0.08em] transition-opacity duration-300 md:min-h-0 md:py-0 md:text-[10px] md:tracking-[0.1em]",
                isActive
                  ? "text-neutral-600 opacity-100"
                  : "text-neutral-400 opacity-60 hover:opacity-80",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-10 md:pt-12">
        {TABS.map((tab) => {
          const tabId = `${baseId}-${tab.id}`;
          const isActive = activeTab === tab.id;

          if (!isActive) {
            return null;
          }

          return (
            <div
              key={tab.id}
              id={`${tabId}-panel`}
              role="tabpanel"
              aria-labelledby={tabId}
            >
              {tab.id === "description" && (
                <div className="space-y-5">
                  <p className="text-xs font-light leading-[2.05] tracking-[0.03em] text-neutral-500">
                    {detail.description}
                  </p>
                  {detail.fitNote ? (
                    <p className="text-[10px] font-light leading-[1.9] tracking-[0.04em] text-neutral-400">
                      {detail.fitNote}
                    </p>
                  ) : null}
                </div>
              )}

              {tab.id === "material" && (
                <p className="text-xs font-light leading-[2] tracking-[0.04em] text-neutral-500">
                  {detail.material}
                </p>
              )}

              {tab.id === "care" && (
                <p className="text-xs font-light leading-[2.05] tracking-[0.03em] text-neutral-500">
                  {detail.care}
                </p>
              )}

              {tab.id === "sizeGuide" && (
                <div>
                  <p className="text-[10px] font-light tracking-[0.1em] text-neutral-400">
                    Measurements (cm)
                  </p>
                  <table className="mt-6 w-full text-left">
                    <caption className="sr-only">
                      Size guide measurements in centimeters
                    </caption>
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="pb-3 pr-3 text-[10px] font-light tracking-[0.08em] text-neutral-400"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="pb-3 pr-3 text-[10px] font-light tracking-[0.08em] text-neutral-400"
                        >
                          Length
                        </th>
                        <th
                          scope="col"
                          className="pb-3 pr-3 text-[10px] font-light tracking-[0.08em] text-neutral-400"
                        >
                          Shoulder
                        </th>
                        <th
                          scope="col"
                          className="pb-3 pr-3 text-[10px] font-light tracking-[0.08em] text-neutral-400"
                        >
                          Chest
                        </th>
                        <th
                          scope="col"
                          className="pb-3 text-[10px] font-light tracking-[0.08em] text-neutral-400"
                        >
                          Sleeve
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.sizeGuide.map((row) => (
                        <tr key={row.size}>
                          <th
                            scope="row"
                            className="py-2 pr-3 text-left text-[11px] font-light text-neutral-600"
                          >
                            {row.size}
                          </th>
                          <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                            {row.length}
                          </td>
                          <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                            {row.shoulder}
                          </td>
                          <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                            {row.chest}
                          </td>
                          <td className="py-2 text-[11px] font-light text-neutral-500">
                            {row.sleeve}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-8 text-[10px] font-light leading-[1.9] tracking-[0.04em] text-neutral-400">
                    Length from back collar to hem. Shoulder tip to tip. Chest
                    measured flat.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
