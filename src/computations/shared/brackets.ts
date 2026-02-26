import type { TaxBracket } from '../../constants/federal2025';

/**
 * Compute progressive tax on a given amount using the supplied bracket schedule.
 * Works for both ordinary income and capital gains brackets.
 */
export function computeProgressiveTax(amount: number, brackets: TaxBracket[]): number {
  if (amount <= 0) return 0;

  let tax = 0;
  for (const bracket of brackets) {
    if (amount <= bracket.min) break;
    const taxableInBracket = Math.min(amount, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

/**
 * Compute tax on a specific layer of income that sits on top of a base amount.
 * Used for Schedule D Tax Worksheet where preferential income is layered
 * on top of ordinary income to determine the correct rate.
 *
 * @param baseAmount - Income below this layer (e.g., ordinary income)
 * @param layerAmount - The amount of income in this layer
 * @param brackets - The bracket schedule to use
 * @returns Tax on just the layer amount, at the marginal rates it falls into
 */
export function computeLayeredTax(
  baseAmount: number,
  layerAmount: number,
  brackets: TaxBracket[]
): number {
  if (layerAmount <= 0) return 0;
  const taxOnBase = computeProgressiveTax(baseAmount, brackets);
  const taxOnTotal = computeProgressiveTax(baseAmount + layerAmount, brackets);
  return taxOnTotal - taxOnBase;
}
