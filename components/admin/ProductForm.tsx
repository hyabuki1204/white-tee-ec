"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { ProductFitProfileFields } from "@/components/admin/ProductFitProfileFields";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminInput,
  adminInputCompact,
  adminLabel,
  adminSection,
  adminSectionTitle,
  adminSuccess,
  adminTextarea,
  adminTh,
  adminTd,
} from "@/lib/admin/ui";
import {
  DEFAULT_CARE,
  DEFAULT_MATERIAL,
  slugifyProductName,
} from "@/lib/products/defaults";
import type { AdminProductDetail } from "@/types/admin-product";
import type { ProductSize } from "@/types";

type ProductFormProps = {
  mode: "create" | "edit";
  initialProduct: AdminProductDetail;
  fabrics: Array<{ slug: string; name: string }>;
};

type FormImage = AdminProductDetail["images"][number];
type FormVariant = AdminProductDetail["variants"][number];

const sectionClass = `${adminSection} mb-6`;

export function ProductForm({
  mode,
  initialProduct,
  fabrics,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialProduct);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const copy = ADMIN_COPY.products;
  const sections = copy.sections;
  const fields = copy.fields;

  const enabledVariants = useMemo(
    () => form.variants.filter((variant) => variant.enabled),
    [form.variants],
  );

  const updateField = <K extends keyof AdminProductDetail>(
    key: K,
    value: AdminProductDetail[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugifyProductName(name),
    }));
  };

  const handleVariantChange = (
    size: ProductSize,
    patch: Partial<FormVariant>,
  ) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.size === size ? { ...variant, ...patch } : variant,
      ),
    }));
  };

  const handleSizeGuideChange = (
    size: ProductSize,
    field: "length" | "shoulder" | "chest" | "sleeve",
    value: number,
  ) => {
    setForm((current) => ({
      ...current,
      sizeGuide: current.sizeGuide.map((row) =>
        row.size === size ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const setPrimaryImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    }));
  };

  const setCardHoverImage = (index: number | null) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => ({
        ...image,
        isCardHover: index !== null && imageIndex === index,
      })),
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);

      if (nextImages.length === 0) {
        return { ...current, images: [] };
      }

      if (!nextImages.some((image) => image.isPrimary)) {
        nextImages[0] = { ...nextImages[0]!, isPrimary: true };
      }

      return { ...current, images: nextImages };
    });
  };

  const addImageUrl = (url: string) => {
    const trimmed = url.trim();

    if (!trimmed) return;

    setForm((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          url: trimmed,
          sortOrder: current.images.length,
          isPrimary: current.images.length === 0,
          isCardHover: false,
        },
      ],
    }));
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Failed to upload image.");
      }

      addImageUrl(data.url);
    } catch (uploadError) {
      const text =
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image.";
      setError(text);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      slug: form.slug,
      name: form.name,
      price: form.price,
      description: form.description,
      detailDescription: form.detailDescription,
      fitNote: form.fitNote,
      material: form.material,
      care: form.care,
      sizeGuide: form.sizeGuide,
      isPublished: form.isPublished,
      fabricSlug: form.fabricSlug,
      variants: form.variants,
      images: form.images.map((image, index) => ({
        id: image.id,
        url: image.url,
        sortOrder: index,
        isPrimary: image.isPrimary,
        isCardHover: image.isCardHover === true,
      })),
      fitProfile: form.fitProfile,
    };

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${form.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        product?: AdminProductDetail;
      };

      if (!response.ok) {
        throw new Error(
          data.error ??
            (mode === "create" ? copy.createFailed : copy.saveFailed),
        );
      }

      setMessage(ADMIN_COPY.common.saved);

      if (mode === "create" && data.product) {
        router.push(`/admin/products/${data.product.id}/edit`);
        router.refresh();
        return;
      }

      if (data.product) {
        setForm(data.product);
      }

      router.refresh();
    } catch (saveError) {
      const text =
        saveError instanceof Error
          ? saveError.message
          : mode === "create"
            ? copy.createFailed
            : copy.saveFailed;
      setError(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.basic}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="product-name" className={adminLabel}>
              {fields.name}
            </label>
            <input
              id="product-name"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              className={adminInput}
            />
          </div>
          <div>
            <label htmlFor="product-slug" className={adminLabel}>
              {fields.slug}
            </label>
            <input
              id="product-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              required
              className={adminInput}
            />
          </div>
          <div>
            <label htmlFor="product-price" className={adminLabel}>
              {fields.price}
            </label>
            <input
              id="product-price"
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(event) =>
                updateField("price", Number(event.target.value))
              }
              required
              className={adminInput}
            />
          </div>
          <div>
            <label htmlFor="product-fabric" className={adminLabel}>
              {fields.fabric}
            </label>
            <select
              id="product-fabric"
              value={form.fabricSlug}
              onChange={(event) =>
                updateField("fabricSlug", event.target.value)
              }
              required
              className={adminInput}
            >
              <option value="" disabled>
                {fields.fabricPlaceholder}
              </option>
              {fabrics.map((fabric) => (
                <option key={fabric.slug} value={fabric.slug}>
                  {fabric.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end md:col-span-2">
            <label className="flex items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.isPublished}
                onChange={(event) =>
                  updateField("isPublished", event.target.checked)
                }
              />
              {fields.published}
            </label>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="product-description" className={adminLabel}>
              {fields.description}
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={2}
              className={adminTextarea}
            />
          </div>
          <div>
            <label htmlFor="product-detail-description" className={adminLabel}>
              {fields.detailDescription}
            </label>
            <textarea
              id="product-detail-description"
              value={form.detailDescription}
              onChange={(event) =>
                updateField("detailDescription", event.target.value)
              }
              rows={5}
              className={adminTextarea}
            />
          </div>
          <div>
            <label htmlFor="product-fit-note" className={adminLabel}>
              {fields.fitNote}
            </label>
            <input
              id="product-fit-note"
              value={form.fitNote ?? ""}
              onChange={(event) =>
                updateField("fitNote", event.target.value || null)
              }
              className={adminInput}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.material}</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="product-material" className={adminLabel}>
              {fields.material}
            </label>
            <input
              id="product-material"
              value={form.material}
              onChange={(event) => updateField("material", event.target.value)}
              placeholder={DEFAULT_MATERIAL}
              className={adminInput}
            />
          </div>
          <div>
            <label htmlFor="product-care" className={adminLabel}>
              {fields.care}
            </label>
            <textarea
              id="product-care"
              value={form.care}
              onChange={(event) => updateField("care", event.target.value)}
              rows={3}
              placeholder={DEFAULT_CARE}
              className={adminTextarea}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.images}</h2>
        <div className="space-y-6">
          <p className="text-sm text-neutral-600">{fields.cardHoverHint}</p>
          {form.images.map((image, index) => (
            <div
              key={image.id ?? `${image.url}-${index}`}
              className="flex items-start gap-4 rounded-md border border-neutral-200 p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-700">{image.url}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                  <label className="flex items-center gap-2 text-sm text-neutral-800">
                    <input
                      type="radio"
                      name="primary-image"
                      checked={image.isPrimary}
                      onChange={() => setPrimaryImage(index)}
                    />
                    {fields.primary}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-800">
                    <input
                      type="radio"
                      name="card-hover-image"
                      checked={image.isCardHover === true}
                      onChange={() => setCardHoverImage(index)}
                    />
                    {fields.cardHover}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-sm font-medium text-red-700 hover:underline"
                  >
                    {fields.removeImage}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {form.images.length > 0 ? (
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="radio"
                name="card-hover-image"
                checked={!form.images.some((image) => image.isCardHover)}
                onChange={() => setCardHoverImage(null)}
              />
              {fields.cardHoverNone}
            </label>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="image-url" className={adminLabel}>
                {fields.addImageUrl}
              </label>
              <div className="flex gap-2">
                <input
                  id="image-url"
                  type="url"
                  value={imageUrlInput}
                  placeholder="https://..."
                  className={adminInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addImageUrl(imageUrlInput);
                      setImageUrlInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addImageUrl(imageUrlInput);
                    setImageUrlInput("");
                  }}
                  className={`${adminBtnSecondary} shrink-0`}
                >
                  {fields.addImage}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="image-upload" className={adminLabel}>
                {fields.uploadImage}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage(file);
                  }
                  event.target.value = "";
                }}
                className="block w-full text-sm text-neutral-700"
              />
            </div>
          </div>
          {form.images.length === 0 ? (
            <p className="text-sm text-neutral-600">{fields.imageRequired}</p>
          ) : null}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.variants}</h2>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className={adminTh}>{fields.enableSize}</th>
                <th className={adminTh}>{fields.size}</th>
                <th className={adminTh}>{fields.sku}</th>
                <th className={adminTh}>{fields.stock}</th>
              </tr>
            </thead>
            <tbody>
              {form.variants.map((variant) => (
                <tr key={variant.size}>
                  <td className={adminTd}>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={variant.enabled}
                      onChange={(event) =>
                        handleVariantChange(variant.size, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td className={`${adminTd} font-medium`}>{variant.size}</td>
                  <td className={adminTd}>
                    <input
                      value={variant.sku ?? ""}
                      onChange={(event) =>
                        handleVariantChange(variant.size, {
                          sku: event.target.value || null,
                        })
                      }
                      className={adminInputCompact}
                    />
                  </td>
                  <td className={adminTd}>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={variant.stockQuantity}
                      onChange={(event) =>
                        handleVariantChange(variant.size, {
                          stockQuantity: Number(event.target.value),
                        })
                      }
                      className={`${adminInputCompact} w-24`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {enabledVariants.length === 0 ? (
          <p className={`${adminError} mt-4`}>{fields.enableOneSize}</p>
        ) : null}
      </section>

      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.sizeGuide}</h2>
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className={adminTh}>{fields.size}</th>
                <th className={adminTh}>{fields.length}</th>
                <th className={adminTh}>{fields.shoulder}</th>
                <th className={adminTh}>{fields.chest}</th>
                <th className={adminTh}>{fields.sleeve}</th>
              </tr>
            </thead>
            <tbody>
              {form.sizeGuide.map((row) => (
                <tr key={row.size}>
                  <td className={`${adminTd} font-medium`}>{row.size}</td>
                  {(["length", "shoulder", "chest", "sleeve"] as const).map(
                    (field) => (
                      <td key={field} className={adminTd}>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={row[field]}
                          onChange={(event) =>
                            handleSizeGuideChange(
                              row.size,
                              field,
                              Number(event.target.value),
                            )
                          }
                          className={`${adminInputCompact} w-24`}
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={adminSectionTitle}>{sections.fitProfile}</h2>
        <ProductFitProfileFields
          value={form.fitProfile}
          onChange={(fitProfile) => updateField("fitProfile", fitProfile)}
        />
      </section>

      <div className={`${sectionClass} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        <button
          type="submit"
          disabled={
            isSaving ||
            form.images.length === 0 ||
            enabledVariants.length === 0
          }
          className={adminBtnPrimary}
        >
          {isSaving
            ? ADMIN_COPY.common.saving
            : mode === "create"
              ? copy.create
              : copy.saveChanges}
        </button>
        {message ? <p className={adminSuccess}>{message}</p> : null}
        {error ? <p className={adminError}>{error}</p> : null}
      </div>

      {mode === "edit" && form.id ? (
        <ProductDeleteButton
          productId={form.id}
          productName={form.name}
          hasOrders={form.hasOrders}
        />
      ) : null}
    </form>
  );
}
