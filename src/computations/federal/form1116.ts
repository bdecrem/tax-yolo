import type { TaxReturnInput } from '../../types/inputs';
import type { Form1116Result } from '../../types/outputs';
import { roundDollars } from '../shared/rounding';

/**
 * Form 1116 - Foreign Tax Credit
 *
 * For this household, foreign tax is paid on international fund dividends
 * (reported on 1099-DIV Box 7). Usually qualifies for simplified method
 * if total foreign tax paid is under $600 MFJ.
 *
 * Credit limitation = (Foreign source income / Total income) * US tax
 */
export function computeForm1116(
  input: TaxReturnInput,
  totalTax: number,
  totalIncome: number
): Form1116Result {
  // Foreign tax paid (from 1099-DIV Box 7)
  const foreignTaxPaid = roundDollars(
    input.form1099DivInts.reduce((sum, f) => sum + (f.foreignTaxPaid ?? 0), 0)
  );

  // Foreign source income (approximated as dividends from funds that paid foreign tax)
  const foreignSourceIncome = roundDollars(
    input.form1099DivInts
      .filter(f => (f.foreignTaxPaid ?? 0) > 0)
      .reduce((sum, f) => sum + (f.ordinaryDividends ?? 0), 0)
  );

  // Credit limitation
  const creditLimitation = totalIncome > 0
    ? roundDollars((foreignSourceIncome / totalIncome) * totalTax)
    : 0;

  // Credit allowed = lesser of tax paid or limitation
  const creditAllowed = Math.min(foreignTaxPaid, creditLimitation);

  // Carryover (unused credit)
  const creditCarryover = foreignTaxPaid - creditAllowed;

  return {
    foreignTaxPaid,
    foreignSourceIncome,
    creditLimitation,
    creditAllowed,
    creditCarryover,
  };
}
