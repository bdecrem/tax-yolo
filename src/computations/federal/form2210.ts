import type { Form2210Result } from '../../types/outputs';
import { SAFE_HARBOR_RATE_HIGH_INCOME } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

/**
 * Form 2210 - Underpayment of Estimated Tax
 *
 * For AGI > $150K, safe harbor = 110% of prior year tax.
 * If total payments (withholding + estimated) >= safe harbor, no penalty.
 */
export function computeForm2210(params: {
  currentYearTax: number;
  priorYearTax: number;
  totalPaymentsAndCredits: number;
}): Form2210Result {
  const { currentYearTax, priorYearTax, totalPaymentsAndCredits } = params;

  // Required annual payment = lesser of:
  // (a) 90% of current year tax, or
  // (b) 110% of prior year tax (for AGI > $150K)
  const option90 = roundDollars(currentYearTax * 0.90);
  const option110 = roundDollars(priorYearTax * SAFE_HARBOR_RATE_HIGH_INCOME);
  const requiredAnnualPayment = Math.min(option90, option110);

  const underpaymentAmount = Math.max(requiredAnnualPayment - totalPaymentsAndCredits, 0);
  const safeHarborMet = totalPaymentsAndCredits >= option110;

  // Simplified penalty estimate (actual depends on quarterly timing)
  // Using ~8% annual rate on underpayment
  const penaltyDue = safeHarborMet ? 0 : roundDollars(underpaymentAmount * 0.08);

  return {
    requiredAnnualPayment,
    priorYearTax: roundDollars(priorYearTax),
    currentYearTax: roundDollars(currentYearTax),
    totalPaymentsAndCredits: roundDollars(totalPaymentsAndCredits),
    underpaymentAmount,
    penaltyDue,
    safeHarborMet,
  };
}
