import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SortKey } from "../ColumnsConfig";

interface ColumnVisibilityState {
  visibleColumns: SortKey[];
  toggleColumn: (key: SortKey) => void;
  setVisibleColumns: (keys: SortKey[]) => void;
  resetToDefaults: () => void;
  showAllColumns: (allKeys: SortKey[]) => void;
}

export const useColumnVisibilityStore = create<ColumnVisibilityState>()(
  persist(
    (set, get) => ({
      visibleColumns: ["optimizedScore", "AssetName", "expectedReturnPct", "Bid", "Offer", "daysUntilExpiry"],

      toggleColumn: (key: SortKey) => {
        set((state) => ({
          visibleColumns: state.visibleColumns.includes(key) ? state.visibleColumns.filter((k) => k !== key) : [...state.visibleColumns, key],
        }));
      },

      setVisibleColumns: (keys: SortKey[]) => {
        set({ visibleColumns: keys });
      },

      resetToDefaults: () => {
        set({ visibleColumns: ["optimizedScore", "AssetName", "expectedReturnPct", "Bid", "Offer", "daysUntilExpiry"] });
      },

      showAllColumns: (allKeys: SortKey[]) => {
        set({ visibleColumns: allKeys });
      },
    }),
    {
      name: "column-visibility-storage",
    }
  )
);
