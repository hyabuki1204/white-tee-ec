/** Fabric character scale — sensory traits, 1 (low) to 5 (high). */

export type FabricCharacterLevel = 1 | 2 | 3 | 4 | 5;

export type FabricCharacter = {
  thickness: FabricCharacterLevel;
  softness: FabricCharacterLevel;
  structure: FabricCharacterLevel;
  sheerness: FabricCharacterLevel;
  surface: FabricCharacterLevel;
};

export type FabricCharacterKey = keyof FabricCharacter;

export const FABRIC_CHARACTER_KEYS: FabricCharacterKey[] = [
  "thickness",
  "softness",
  "structure",
  "sheerness",
  "surface",
];

export const DEFAULT_FABRIC_CHARACTER: FabricCharacter = {
  thickness: 3,
  softness: 3,
  structure: 3,
  sheerness: 2,
  surface: 3,
};

/** Seed values per fabric — mock fallback and migration backfill. */
export const FABRIC_CHARACTER_BY_SLUG: Record<string, FabricCharacter> = {
  "heavyweight-jersey": {
    thickness: 5,
    softness: 2,
    structure: 5,
    sheerness: 1,
    surface: 4,
  },
  "lightweight-jersey": {
    thickness: 2,
    softness: 5,
    structure: 2,
    sheerness: 4,
    surface: 3,
  },
  "relaxed-jersey": {
    thickness: 3,
    softness: 4,
    structure: 3,
    sheerness: 3,
    surface: 3,
  },
  "compact-jersey": {
    thickness: 3,
    softness: 3,
    structure: 4,
    sheerness: 2,
    surface: 4,
  },
  "essential-jersey": {
    thickness: 3,
    softness: 3,
    structure: 3,
    sheerness: 2,
    surface: 3,
  },
  "box-jersey": {
    thickness: 4,
    softness: 2,
    structure: 5,
    sheerness: 1,
    surface: 5,
  },
};

export function getDefaultFabricCharacter(slug: string): FabricCharacter {
  return FABRIC_CHARACTER_BY_SLUG[slug] ?? DEFAULT_FABRIC_CHARACTER;
}

export function normalizeFabricCharacterLevel(
  value: unknown,
  fallback: FabricCharacterLevel,
): FabricCharacterLevel {
  const level = Number(value);

  if (Number.isInteger(level) && level >= 1 && level <= 5) {
    return level as FabricCharacterLevel;
  }

  return fallback;
}

export function parseFabricCharacterFromRow(
  slug: string,
  row: {
    character_thickness?: unknown;
    character_softness?: unknown;
    character_structure?: unknown;
    character_sheerness?: unknown;
    character_surface?: unknown;
  },
): FabricCharacter {
  const defaults = getDefaultFabricCharacter(slug);

  return {
    thickness: normalizeFabricCharacterLevel(
      row.character_thickness,
      defaults.thickness,
    ),
    softness: normalizeFabricCharacterLevel(
      row.character_softness,
      defaults.softness,
    ),
    structure: normalizeFabricCharacterLevel(
      row.character_structure,
      defaults.structure,
    ),
    sheerness: normalizeFabricCharacterLevel(
      row.character_sheerness,
      defaults.sheerness,
    ),
    surface: normalizeFabricCharacterLevel(
      row.character_surface,
      defaults.surface,
    ),
  };
}
