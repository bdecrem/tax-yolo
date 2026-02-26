import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaxReturnInput } from '../types/inputs';
import type { FederalTaxResult, CaliforniaTaxResult } from '../types/outputs';
import { seed2025 } from '../data/seed2025';

interface TaxStore {
  input: TaxReturnInput;
  federalResult: FederalTaxResult | null;
  californiaResult: CaliforniaTaxResult | null;
  lastComputed: string | null;

  setInput: (input: Partial<TaxReturnInput>) => void;
  setFullInput: (input: TaxReturnInput) => void;
  setResults: (federal: FederalTaxResult, california: CaliforniaTaxResult) => void;
  clearResults: () => void;
  resetToSeed: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

export const useTaxStore = create<TaxStore>()(
  persist(
    (set, get) => ({
      input: seed2025,
      federalResult: null,
      californiaResult: null,
      lastComputed: null,

      setInput: (partial) =>
        set((state) => ({
          input: { ...state.input, ...partial },
          federalResult: null,
          californiaResult: null,
        })),

      setFullInput: (input) =>
        set({ input, federalResult: null, californiaResult: null }),

      setResults: (federal, california) =>
        set({ federalResult: federal, californiaResult: california, lastComputed: new Date().toISOString() }),

      clearResults: () =>
        set({ federalResult: null, californiaResult: null, lastComputed: null }),

      resetToSeed: () =>
        set({ input: seed2025, federalResult: null, californiaResult: null, lastComputed: null }),

      exportJSON: () => {
        const { input } = get();
        return JSON.stringify(input, null, 2);
      },

      importJSON: (json) => {
        const input = JSON.parse(json) as TaxReturnInput;
        set({ input, federalResult: null, californiaResult: null });
      },
    }),
    {
      name: 'tax-yolo-2025',
    }
  )
);
