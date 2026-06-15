"use client";

import { ADMIN_COPY } from "@/lib/admin/copy";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import {
  adminBtnSecondary,
  adminField,
  adminInput,
  adminInputCompact,
  adminLabel,
  adminMuted,
  adminTd,
  adminTh,
} from "@/lib/admin/ui";
import type {
  FitType,
  ProductFitProfile,
  ProductModelProfile,
  SizeReferenceBand,
} from "@/types/product-fit";
import type { ProductSize } from "@/types";

type ProductFitProfileFieldsProps = {
  value: ProductFitProfile;
  onChange: (fitProfile: ProductFitProfile) => void;
};

const FIT_TYPE_OPTIONS: FitType[] = ["slim", "regular", "relaxed", "boxy"];

function defaultModel(): ProductModelProfile {
  return { heightCm: 178, weightKg: 68, size: "L" };
}

function ensureSizeReference(
  bands: SizeReferenceBand[],
): SizeReferenceBand[] {
  const bySize = new Map(bands.map((band) => [band.size, band]));

  return PRODUCT_SIZES.map((size) => {
    const existing = bySize.get(size);

    return (
      existing ?? {
        size,
        heightMin: 0,
        heightMax: 0,
        heightLabel: "",
      }
    );
  });
}

export function ProductFitProfileFields({
  value,
  onChange,
}: ProductFitProfileFieldsProps) {
  const copy = ADMIN_COPY.products.fields;
  const sizeReference = ensureSizeReference(value.sizeReference);

  const updateModel = (
    index: number,
    patch: Partial<ProductModelProfile>,
  ) => {
    onChange({
      ...value,
      models: value.models.map((model, modelIndex) =>
        modelIndex === index ? { ...model, ...patch } : model,
      ),
    });
  };

  const updateSizeBand = (
    size: ProductSize,
    patch: Partial<SizeReferenceBand>,
  ) => {
    onChange({
      ...value,
      sizeReference: sizeReference.map((band) =>
        band.size === size ? { ...band, ...patch } : band,
      ),
    });
  };

  const addModel = () => {
    onChange({
      ...value,
      models: [...value.models, defaultModel()],
    });
  };

  const removeModel = (index: number) => {
    if (value.models.length <= 1) return;

    onChange({
      ...value,
      models: value.models.filter((_, modelIndex) => modelIndex !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <label className={adminField}>
          <span className={adminLabel}>{copy.fitType}</span>
          <select
            value={value.fitType}
            onChange={(event) =>
              onChange({
                ...value,
                fitType: event.target.value as FitType,
              })
            }
            className={adminInput}
          >
            {FIT_TYPE_OPTIONS.map((fitType) => (
              <option key={fitType} value={fitType}>
                {fitType}
              </option>
            ))}
          </select>
        </label>

        <label className={`${adminField} md:col-span-2`}>
          <span className={adminLabel}>{copy.fitLabel}</span>
          <input
            value={value.fitLabel}
            onChange={(event) =>
              onChange({ ...value, fitLabel: event.target.value })
            }
            required
            className={adminInput}
          />
        </label>

        <label className={adminField}>
          <span className={adminLabel}>{copy.fitTypeSizeOffset}</span>
          <input
            type="number"
            step={1}
            value={value.fitTypeSizeOffset ?? 0}
            onChange={(event) =>
              onChange({
                ...value,
                fitTypeSizeOffset: Number(event.target.value),
              })
            }
            className={`${adminInput} max-w-[8rem]`}
          />
          <p className={adminMuted}>{copy.fitTypeSizeOffsetHint}</p>
        </label>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-neutral-800">
          {copy.models}
        </legend>
        {value.models.map((model, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-md border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <label className={adminField}>
              <span className={adminLabel}>{copy.modelHeight}</span>
              <input
                type="number"
                min={1}
                step={1}
                value={model.heightCm}
                onChange={(event) =>
                  updateModel(index, { heightCm: Number(event.target.value) })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.modelWeight}</span>
              <input
                type="number"
                min={1}
                step={1}
                value={model.weightKg}
                onChange={(event) =>
                  updateModel(index, { weightKg: Number(event.target.value) })
                }
                className={adminInput}
              />
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.modelSize}</span>
              <select
                value={model.size}
                onChange={(event) =>
                  updateModel(index, {
                    size: event.target.value as ProductSize,
                  })
                }
                className={adminInput}
              >
                {PRODUCT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminField}>
              <span className={adminLabel}>{copy.modelLabel}</span>
              <input
                value={model.label ?? ""}
                onChange={(event) =>
                  updateModel(index, {
                    label: event.target.value || undefined,
                  })
                }
                placeholder={copy.modelLabelPlaceholder}
                className={adminInput}
              />
            </label>
            <div className="flex items-end">
              {value.models.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeModel(index)}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  {copy.removeModel}
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addModel}
          className={`${adminBtnSecondary} self-start`}
        >
          {copy.addModel}
        </button>
      </fieldset>

      <div className="space-y-4">
        <p className="text-sm font-medium text-neutral-800">
          {copy.sizeReference}
        </p>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className={adminTh}>{copy.size}</th>
                <th className={adminTh}>{copy.heightMin}</th>
                <th className={adminTh}>{copy.heightMax}</th>
                <th className={adminTh}>{copy.heightLabel}</th>
              </tr>
            </thead>
            <tbody>
              {sizeReference.map((band) => (
                <tr key={band.size}>
                  <td className={`${adminTd} font-medium`}>{band.size}</td>
                  <td className={adminTd}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={band.heightMin}
                      onChange={(event) =>
                        updateSizeBand(band.size, {
                          heightMin: Number(event.target.value),
                        })
                      }
                      className={`${adminInputCompact} w-24`}
                    />
                  </td>
                  <td className={adminTd}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={band.heightMax}
                      onChange={(event) =>
                        updateSizeBand(band.size, {
                          heightMax: Number(event.target.value),
                        })
                      }
                      className={`${adminInputCompact} w-24`}
                    />
                  </td>
                  <td className={adminTd}>
                    <input
                      value={band.heightLabel ?? ""}
                      onChange={(event) =>
                        updateSizeBand(band.size, {
                          heightLabel: event.target.value || undefined,
                        })
                      }
                      placeholder={`${band.heightMin}–${band.heightMax}cm`}
                      className={adminInputCompact}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-neutral-800">
          {copy.preferenceAdjustments}
        </legend>
        <p className={adminMuted}>{copy.preferenceAdjustmentsHint}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["justFit", "relaxed", "oversized"] as const).map((key) => (
            <label key={key} className={adminField}>
              <span className={adminLabel}>{copy.preferenceOffset(key)}</span>
              <input
                type="number"
                step={1}
                value={value.preferenceAdjustments?.[key] ?? 0}
                onChange={(event) =>
                  onChange({
                    ...value,
                    preferenceAdjustments: {
                      justFit: value.preferenceAdjustments?.justFit ?? 0,
                      relaxed: value.preferenceAdjustments?.relaxed ?? 1,
                      oversized: value.preferenceAdjustments?.oversized ?? 2,
                      [key]: Number(event.target.value),
                    },
                  })
                }
                className={`${adminInput} max-w-[8rem]`}
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
