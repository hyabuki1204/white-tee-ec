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
  { id: "sizeGuide", label: "Size Guide" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDetailTabs({ detail }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const baseId = useId();

  return (
    <div className="mt-10 md:mt-12 lg:mt-0">
      <div
        role="tablist"
        aria-label="Product details"
        className="flex flex-wrap gap-x-6 gap-y-2 border-b border-neutral-200/70 md:gap-x-8"
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
                "-mb-px pb-3 text-[11px] font-light tracking-[0.06em] transition-colors duration-300",
                isActive
                  ? "border-b border-neutral-900 text-neutral-900"
                  : "border-b border-transparent text-neutral-400 hover:text-neutral-600",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-8">
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
                <div className="max-w-sm space-y-4">
                  <p className="text-sm font-light leading-[2] tracking-[0.02em] text-neutral-500">
                    {detail.description}
                  </p>
                  {detail.fitNote ? (
                    <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400">
                      {detail.fitNote}
                    </p>
                  ) : null}
                </div>
              )}

              {tab.id === "material" && (
                <p className="text-sm font-light uppercase tracking-[0.08em] text-neutral-500">
                  {detail.material}
                </p>
              )}

              {tab.id === "care" && (
                <p className="max-w-sm text-[11px] font-light uppercase leading-[1.9] tracking-[0.06em] text-neutral-500">
                  {detail.care}
                </p>
              )}

              {tab.id === "sizeGuide" && (
                <div className="max-w-md">
                  <p className="text-[10px] font-light tracking-[0.12em] text-neutral-400">
                    Product measurements (cm)
                  </p>
                  <table className="mt-5 w-full border-collapse text-left">
                    <caption className="sr-only">
                      Size guide measurements in centimeters
                    </caption>
                    <thead>
                      <tr className="border-b border-neutral-200/70">
                        <th
                          scope="col"
                          className="pb-2 pr-4 text-[10px] font-light tracking-[0.1em] text-neutral-400"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="pb-2 pr-4 text-[10px] font-light tracking-[0.1em] text-neutral-400"
                        >
                          Length
                        </th>
                        <th
                          scope="col"
                          className="pb-2 pr-4 text-[10px] font-light tracking-[0.1em] text-neutral-400"
                        >
                          Shoulder
                        </th>
                        <th
                          scope="col"
                          className="pb-2 pr-4 text-[10px] font-light tracking-[0.1em] text-neutral-400"
                        >
                          Chest
                        </th>
                        <th
                          scope="col"
                          className="pb-2 text-[10px] font-light tracking-[0.1em] text-neutral-400"
                        >
                          Sleeve
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.sizeGuide.map((row) => (
                        <tr
                          key={row.size}
                          className="border-b border-neutral-100 last:border-0"
                        >
                          <th
                            scope="row"
                            className="py-2.5 pr-4 text-left text-xs font-light text-neutral-700"
                          >
                            {row.size}
                          </th>
                          <td className="py-2.5 pr-4 text-xs font-light text-neutral-500">
                            {row.length}
                          </td>
                          <td className="py-2.5 pr-4 text-xs font-light text-neutral-500">
                            {row.shoulder}
                          </td>
                          <td className="py-2.5 pr-4 text-xs font-light text-neutral-500">
                            {row.chest}
                          </td>
                          <td className="py-2.5 text-xs font-light text-neutral-500">
                            {row.sleeve}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-6 max-w-sm text-[10px] font-light leading-[1.8] tracking-[0.04em] text-neutral-400">
                    Length measured from back collar to hem. Shoulder width from
                    tip to tip. Chest measured flat across the body.
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
