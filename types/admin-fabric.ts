import type { FabricCharacter } from "@/lib/fabric/character";

/** Admin list view of a fabric. */
export type AdminFabricListItem = {
  slug: string;
  name: string;
  tagline: string;
  sortOrder: number;
  imageUrl: string;
};

/** Admin detail / edit payload for a fabric. */
export type AdminFabricDetail = {
  slug: string;
  name: string;
  tagline: string;
  descriptionLines: string[];
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  character: FabricCharacter;
};

export type AdminFabricInput = Omit<AdminFabricDetail, "slug">;
