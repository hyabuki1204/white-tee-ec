import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSize } from "@/types";

export type SavedItem = {
  productId: string;
  /** Null until the customer picks one. */
  size: ProductSize | null;
  savedAt: number;
};

/** What the live catalog says about a saved product. */
export type SavedCatalogEntry = {
  sizes: ProductSize[];
};

type SavedState = {
  items: SavedItem[];
  /** Entries dropped by reconcile in this session. Never persisted. */
  droppedCount: number;
  save: (productId: string, size?: ProductSize | null) => void;
  remove: (productId: string) => void;
  toggle: (productId: string, size?: ProductSize | null) => void;
  setSize: (productId: string, size: ProductSize) => void;
  reconcile: (catalog: Record<string, SavedCatalogEntry>) => void;
};

export function isSaved(items: SavedItem[], productId: string): boolean {
  return items.some((item) => item.productId === productId);
}

/**
 * Saved pieces. One entry per product, kept in this browser only —
 * there is no account, so nothing is sent to the server.
 */
export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      droppedCount: 0,

      save: (productId, size = null) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === productId,
          );

          if (!existing) {
            return {
              items: [{ productId, size, savedAt: Date.now() }, ...state.items],
            };
          }

          if (size === null || existing.size === size) return state;

          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, size } : item,
            ),
          };
        });
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggle: (productId, size = null) => {
        if (isSaved(get().items, productId)) {
          get().remove(productId);
        } else {
          get().save(productId, size);
        }
      },

      setSize: (productId, size) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, size } : item,
          ),
        }));
      },

      reconcile: (catalog) => {
        const current = get().items;
        const next: SavedItem[] = [];
        const seen = new Set<string>();
        let changed = false;
        let dropped = 0;

        for (const item of current) {
          const entry = catalog[item.productId];

          // Unpublished or deleted since it was saved — or a duplicate from
          // hand-edited / corrupted storage.
          if (!entry || seen.has(item.productId)) {
            changed = true;
            if (!entry) dropped += 1;
            continue;
          }

          seen.add(item.productId);

          // The saved size is no longer offered: keep the piece, ask again.
          if (item.size !== null && !entry.sizes.includes(item.size)) {
            next.push({ ...item, size: null });
            changed = true;
            continue;
          }

          next.push(item);
        }

        if (!changed) return;

        set((state) => ({
          items: next,
          droppedCount: state.droppedCount + dropped,
        }));
      },
    }),
    {
      name: "white-tee-saved",
      version: 1,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
