import type { TaxReturnInput } from '../../types/inputs';
import type { Form8995AResult } from '../../types/outputs';
import { QBI_DEDUCTION_RATE } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

/**
 * Form 8995-A - Qualified Business Income Deduction
 *
 * For this household, the QBI deduction comes from
 * Section 199A REIT dividends (1099-DIV Box 5).
 * Deduction = 20% of qualified REIT dividends.
 *
 * The deduction is limited to the lesser of:
 * - 20% of qualified REIT dividends
 * - 20% of taxable income before QBI deduction
 */
export function computeForm8995A(
  input: TaxReturnInput,
  taxableIncomeBeforeQBI: number
): Form8995AResult {
  // Section 199A dividends from 1099-DIV Box 5
  const qualifiedREITDividends = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.section199ADividends ?? 0),
    0
  );

  // QBI deduction = 20% of qualified REIT dividends
  const tentativeDeduction = roundDollars(qualifiedREITDividends * QBI_DEDUCTION_RATE);

  // Limited to 20% of taxable income (before QBI deduction)
  const taxableIncomeLimitation = roundDollars(taxableIncomeBeforeQBI * QBI_DEDUCTION_RATE);

  const qbiDeduction = Math.min(tentativeDeduction, taxableIncomeLimitation);

  return {
    qualifiedREITDividends: roundDollars(qualifiedREITDividends),
    qbiDeduction,
    taxableIncomeBeforeQBI: roundDollars(taxableIncomeBeforeQBI),
    taxableIncomeLimitation,
  };
}
