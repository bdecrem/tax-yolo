import type { ScheduleCAResult } from '../../types/outputs';

/**
 * Schedule CA (540) - California Adjustments
 *
 * Start from federal AGI and apply CA-specific adjustments.
 * For this household, typically no adjustments are needed.
 *
 * Common adjustments (if applicable):
 * - State tax refund (not taxable for CA since you deducted it federally)
 * - CA lottery winnings (not taxable for CA)
 * - Social Security (not taxable for CA)
 */
export function computeScheduleCA(params: {
  federalAGI: number;
  // CA additions (income CA taxes but federal doesn't)
  caAdditions?: number;
  // CA subtractions (income federal taxes but CA doesn't)
  caSubtractions?: number;
}): ScheduleCAResult {
  const { federalAGI, caAdditions = 0, caSubtractions = 0 } = params;

  const caAdjustments = caAdditions - caSubtractions;
  const caAGI = federalAGI + caAdjustments;

  return {
    federalAGI,
    caAdjustments,
    caAGI,
  };
}
