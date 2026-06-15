import type { FabricCharacter } from "@/lib/fabric/character";
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

  const characterError = parseCharacterInput(input.character);
  if (characterError) {
    return { ok: false, error: characterError };
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
      character: input.character as FabricCharacter,
    },
  };
}

function parseCharacterInput(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return "Fabric character is required.";
  }

  const row = value as Record<string, unknown>;
  const keys = [
    "thickness",
    "softness",
    "structure",
    "sheerness",
    "surface",
  ] as const;

  for (const key of keys) {
    const level = Number(row[key]);

    if (!Number.isInteger(level) || level < 1 || level > 5) {
      return `Character ${key} must be an integer from 1 to 5.`;
    }
  }

  return null;
}
