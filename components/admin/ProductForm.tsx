"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
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

const inputClassName =
  "w-full border-b border-neutral-300 bg-transparent py-2 text-sm font-light text-neutral-900 outline-none";
const labelClassName =
  "mb-3 block text-xs font-light tracking-wide text-neutral-500";
const sectionClassName = "border-b border-neutral-200/70 py-10";

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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      variants: form.variants,
      images: form.images.map((image, index) => ({
        id: image.id,
        url: image.url,
        sortOrder: index,
        isPrimary: image.isPrimary,
      })),
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
        throw new Error(data.error ?? "Failed to save product.");
      }

      setMessage("Saved.");

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
          : "Failed to save product.";
      setError(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <section className={sectionClassName}>
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Basic Info
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="product-name" className={labelClassName}>
              Name
            </label>
            <input
              id="product-name"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="product-slug" className={labelClassName}>
              Slug
            </label>
            <input
              id="product-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="product-price" className={labelClassName}>
              Price (JPY)
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
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="product-fabric" className={labelClassName}>
              Fabric
            </label>
            <select
              id="product-fabric"
              value={form.fabricSlug}
              onChange={(event) =>
                updateField("fabricSlug", event.target.value)
              }
              required
              className={inputClassName}
            >
              <option value="" disabled>
                Select fabric
              </option>
              {fabrics.map((fabric) => (
                <option key={fabric.slug} value={fabric.slug}>
                  {fabric.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 text-xs font-light text-neutral-600">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  updateField("isPublished", event.target.checked)
                }
              />
              Published on storefront
            </label>
          </div>
        </div>
        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="product-description" className={labelClassName}>
              Short Description (list / SEO)
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={2}
              className={`${inputClassName} resize-y`}
            />
          </div>
          <div>
            <label htmlFor="product-detail-description" className={labelClassName}>
              Detail Description (PDP tab)
            </label>
            <textarea
              id="product-detail-description"
              value={form.detailDescription}
              onChange={(event) =>
                updateField("detailDescription", event.target.value)
              }
              rows={5}
              className={`${inputClassName} resize-y`}
            />
          </div>
          <div>
            <label htmlFor="product-fit-note" className={labelClassName}>
              Fit Note
            </label>
            <input
              id="product-fit-note"
              value={form.fitNote ?? ""}
              onChange={(event) =>
                updateField("fitNote", event.target.value || null)
              }
              placeholder="Regular fit"
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Material & Care
        </h2>
        <div className="space-y-8">
          <div>
            <label htmlFor="product-material" className={labelClassName}>
              Material
            </label>
            <input
              id="product-material"
              value={form.material}
              onChange={(event) => updateField("material", event.target.value)}
              placeholder={DEFAULT_MATERIAL}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="product-care" className={labelClassName}>
              Care
            </label>
            <textarea
              id="product-care"
              value={form.care}
              onChange={(event) => updateField("care", event.target.value)}
              rows={3}
              placeholder={DEFAULT_CARE}
              className={`${inputClassName} resize-y`}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Images
        </h2>
        <div className="space-y-6">
          {form.images.map((image, index) => (
            <div
              key={image.id ?? `${image.url}-${index}`}
              className="flex items-start gap-4 border-b border-neutral-100 pb-6 last:border-0"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-50">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-light text-neutral-600">
                  {image.url}
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <input
                      type="radio"
                      name="primary-image"
                      checked={image.isPrimary}
                      onChange={() => setPrimaryImage(index)}
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-[11px] text-red-700 hover:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="image-url" className={labelClassName}>
                Add Image URL
              </label>
              <input
                id="image-url"
                type="url"
                placeholder="https://..."
                className={inputClassName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addImageUrl((event.target as HTMLInputElement).value);
                    (event.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
            <div>
              <label htmlFor="image-upload" className={labelClassName}>
                Upload Image
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
                className="block text-xs text-neutral-500"
              />
            </div>
          </div>
          {form.images.length === 0 ? (
            <p className="text-xs font-light text-neutral-400">
              At least one image is required before saving.
            </p>
          ) : null}
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Sizes & Stock
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/70">
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Enabled
                </th>
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Size
                </th>
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  SKU
                </th>
                <th className="pb-3 text-xs font-light text-neutral-500">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {form.variants.map((variant) => (
                <tr key={variant.size} className="border-b border-neutral-100">
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      checked={variant.enabled}
                      onChange={(event) =>
                        handleVariantChange(variant.size, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td className="py-3 pr-4 text-xs font-light text-neutral-700">
                    {variant.size}
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      value={variant.sku ?? ""}
                      onChange={(event) =>
                        handleVariantChange(variant.size, {
                          sku: event.target.value || null,
                        })
                      }
                      className="w-full border-b border-neutral-200 bg-transparent py-1 text-xs font-light outline-none"
                    />
                  </td>
                  <td className="py-3">
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
                      className="w-24 border-b border-neutral-200 bg-transparent py-1 text-xs font-light outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {enabledVariants.length === 0 ? (
          <p className="mt-4 text-xs font-light text-red-600">
            Enable at least one size.
          </p>
        ) : null}
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-8 text-xs font-light tracking-wide text-neutral-500">
          Size Guide (cm)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/70">
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Size
                </th>
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Length
                </th>
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Shoulder
                </th>
                <th className="pb-3 pr-4 text-xs font-light text-neutral-500">
                  Chest
                </th>
                <th className="pb-3 text-xs font-light text-neutral-500">
                  Sleeve
                </th>
              </tr>
            </thead>
            <tbody>
              {form.sizeGuide.map((row) => (
                <tr key={row.size} className="border-b border-neutral-100">
                  <td className="py-3 pr-4 text-xs font-light text-neutral-700">
                    {row.size}
                  </td>
                  {(["length", "shoulder", "chest", "sleeve"] as const).map(
                    (field) => (
                      <td key={field} className="py-3 pr-4">
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
                          className="w-20 border-b border-neutral-200 bg-transparent py-1 text-xs font-light outline-none"
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

      <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={
            isSaving ||
            form.images.length === 0 ||
            enabledVariants.length === 0
          }
          className="text-xs tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 disabled:text-neutral-300"
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        {message ? (
          <p className="text-xs font-light text-neutral-500">{message}</p>
        ) : null}
        {error ? (
          <p className="text-xs font-light text-red-600">{error}</p>
        ) : null}
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
