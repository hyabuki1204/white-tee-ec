import type { AdminFabricInput } from "@/types/admin-fabric";

type ParseResult =
  | { ok: true; data: AdminFabricInput }
  | { ok: false; error: string };

function requireString(value: unknown, field: string): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `${field} is required.`;
  }
  return null;
}

export function parseAdminFabricInput(value: unknown): ParseResult {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid fabric payload." };
  }

  const input = value as Record<string, unknown>;

  const nameError = requireString(input.name, "Name");
  if (nameError) return { ok: false, error: nameError };

  const taglineError = requireString(input.tagline, "Tagline");
  if (taglineError) return { ok: false, error: taglineError };

  const imageUrlError = requireString(input.imageUrl, "Image URL");
  if (imageUrlError) return { ok: false, error: imageUrlError };

  const imageAltError = requireString(input.imageAlt, "Image alt");
  if (imageAltError) return { ok: false, error: imageAltError };

  if (!Array.isArray(input.descriptionLines) || input.descriptionLines.length === 0) {
    return { ok: false, error: "Description lines are required." };
  }

  const descriptionLines: string[] = [];

  for (const line of input.descriptionLines) {
    if (typeof line !== "string" || line.trim().length === 0) {
      return { ok: false, error: "Description lines must be non-empty strings." };
    }
    descriptionLines.push(line.trim());
  }

  const sortOrder = Number(input.sortOrder);

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { ok: false, error: "Sort order must be a non-negative integer." };
  }

  return {
    ok: true,
    data: {
      name: (input.name as string).trim(),
      tagline: (input.tagline as string).trim(),
      descriptionLines,
      imageUrl: (input.imageUrl as string).trim(),
      imageAlt: (input.imageAlt as string).trim(),
      sortOrder,
    },
  };
}
