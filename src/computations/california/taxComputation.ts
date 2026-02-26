import type { CATaxComputationResult, CAExemptionCreditResult } from '../../types/outputs';
import { CA_MFJ_BRACKETS, MENTAL_HEALTH_TAX_THRESHOLD, MENTAL_HEALTH_TAX_RATE } from '../../constants/california2025';
import { computeProgressiveTax } from '../shared/brackets';
import { roundDollars } from '../shared/rounding';

/**
 * California Tax Computation
 *
 * Key difference: CA taxes ALL income at ordinary rates.
 * No preferential rate for capital gains or qualified dividends.
 * Plus 1% Mental Health Services Tax on income > $1M.
 */
export function computeCATax(params: {
  taxableIncome: number;
  exemptionCredit: CAExemptionCreditResult;
  otherCredits?: number;
}): CATaxComputationResult {
  const { taxableIncome, exemptionCredit, otherCredits = 0 } = params;

  // Regular CA tax (all at ordinary rates)
  const regularTax = roundDollars(computeProgressiveTax(taxableIncome, CA_MFJ_BRACKETS));

  // Mental Health Services Tax: 1% on taxable income > $1M
  const mentalHealthTax = taxableIncome > MENTAL_HEALTH_TAX_THRESHOLD
    ? roundDollars((taxableIncome - MENTAL_HEALTH_TAX_THRESHOLD) * MENTAL_HEALTH_TAX_RATE)
    : 0;

  const totalTax = regularTax + mentalHealthTax;

  // Apply credits
  const taxAfterCredits = roundDollars(
    Math.max(totalTax - exemptionCredit.totalCredit - otherCredits, 0)
  );

  return {
    taxableIncome,
    regularTax,
    mentalHealthTax,
    totalTax,
    exemptionCredit: exemptionCredit.totalCredit,
    otherCredits,
    taxAfterCredits,
  };
}
