import type { TaxReturnInput } from '../../types/inputs';
import type { ScheduleAResult, CAItemizedDeductionResult } from '../../types/outputs';
import {
  CA_STANDARD_DEDUCTION_MFJ,
  CA_ITEMIZED_PHASEOUT_THRESHOLD_MFJ,
  CA_ITEMIZED_PHASEOUT_RATE,
  CA_ITEMIZED_PHASEOUT_CAP,
} from '../../constants/california2025';
import { roundDollars } from '../shared/rounding';

/**
 * California Itemized Deductions
 *
 * Key differences from federal:
 * 1. No SALT cap - full property tax is deductible
 * 2. State income tax is NOT deductible (can't deduct state tax from state tax)
 * 3. CA still allows 2% miscellaneous deductions (tax prep, investment expenses)
 * 4. Subject to 6% AGI phaseout (max 80% reduction)
 *
 * For this household, CA itemized > CA standard because full property tax is allowed.
 */
export function computeCAItemizedDeductions(
  input: TaxReturnInput,
  federalScheduleA: ScheduleAResult,
  caAGI: number,
  miscDeductions: number = 0
): CAItemizedDeductionResult {
  // Start with federal itemized
  const federalItemized = federalScheduleA.totalItemized;

  // Add back the difference between SALT before cap and after cap
  // (undo the federal SALT cap)
  const saltCapReversal = federalScheduleA.saltBeforeCap - federalScheduleA.saltDeduction;

  // Subtract state income tax (not deductible for CA)
  const stateIncomeTaxPaid =
    input.w2s.reduce((sum, w2) => sum + w2.stateWithheld, 0) +
    input.estimatedPayments.california.q1 +
    input.estimatedPayments.california.q2 +
    input.estimatedPayments.california.q3 +
    input.estimatedPayments.california.q4;
  const saltAddBack = -stateIncomeTaxPaid; // Negative because we're removing it

  // 2% miscellaneous deductions (CA still allows these)
  // e.g., tax preparation fees, investment advisory fees
  const miscAfter2Percent = Math.max(miscDeductions - caAGI * 0.02, 0);

  // CA itemized before phaseout
  const itemizedBeforePhaseout = roundDollars(
    federalItemized + saltCapReversal + saltAddBack + miscAfter2Percent
  );

  // Apply 6% AGI phaseout
  let agiPhaseoutReduction = 0;
  if (caAGI > CA_ITEMIZED_PHASEOUT_THRESHOLD_MFJ) {
    const excess = caAGI - CA_ITEMIZED_PHASEOUT_THRESHOLD_MFJ;
    const reduction = roundDollars(excess * CA_ITEMIZED_PHASEOUT_RATE);
    const maxReduction = roundDollars(itemizedBeforePhaseout * CA_ITEMIZED_PHASEOUT_CAP);
    agiPhaseoutReduction = Math.min(reduction, maxReduction);
  }

  const totalCAItemized = roundDollars(Math.max(itemizedBeforePhaseout - agiPhaseoutReduction, 0));
  const usesItemized = totalCAItemized > CA_STANDARD_DEDUCTION_MFJ;

  return {
    federalItemized,
    saltAddBack: roundDollars(saltAddBack),
    saltCapReversal: roundDollars(saltCapReversal),
    miscDeductions: roundDollars(miscAfter2Percent),
    agiPhaseoutReduction,
    totalCAItemized,
    usesItemized,
  };
}
