import type { TaxReturnInput } from '../../types/inputs';
import type { CaliforniaTaxResult, ScheduleAResult } from '../../types/outputs';
import { CA_STANDARD_DEDUCTION_MFJ } from '../../constants/california2025';
import { computeScheduleCA } from './scheduleCA';
import { computeCAItemizedDeductions } from './itemizedDeductions';
import { computeCAExemptionCredit } from './exemptionCredit';
import { computeCATax } from './taxComputation';
import { roundDollars } from '../shared/rounding';

/**
 * Run the complete California 540 tax computation pipeline.
 */
export function computeCaliforniaTax(
  input: TaxReturnInput,
  federalAGI: number,
  federalScheduleA: ScheduleAResult,
  miscDeductions: number = 0
): CaliforniaTaxResult {
  // Step 1: Schedule CA - California AGI
  const scheduleCA = computeScheduleCA({ federalAGI });

  // Step 2: Itemized deductions (CA-specific)
  const itemizedDeductions = computeCAItemizedDeductions(
    input,
    federalScheduleA,
    scheduleCA.caAGI,
    miscDeductions
  );

  // Step 3: Taxable income
  const deductionAmount = itemizedDeductions.usesItemized
    ? itemizedDeductions.totalCAItemized
    : CA_STANDARD_DEDUCTION_MFJ;
  const taxableIncome = roundDollars(Math.max(scheduleCA.caAGI - deductionAmount, 0));

  // Step 4: Exemption credits
  const exemptionCredit = computeCAExemptionCredit(input, scheduleCA.caAGI);

  // Step 5: Tax computation
  const taxComputation = computeCATax({
    taxableIncome,
    exemptionCredit,
  });

  // Step 6: Total tax
  const totalTax = taxComputation.taxAfterCredits;

  // Step 7: Payments
  const stateWithheld = input.w2s.reduce((sum, w2) => sum + w2.stateWithheld, 0);
  const form1099StateWithheld = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.stateTaxWithheld ?? 0),
    0
  );
  const form1099RStateWithheld = input.form1099Rs.reduce(
    (sum, r) => sum + (r.stateTaxWithheld ?? 0),
    0
  );
  const estimatedPayments =
    input.estimatedPayments.california.q1 +
    input.estimatedPayments.california.q2 +
    input.estimatedPayments.california.q3 +
    input.estimatedPayments.california.q4;

  const totalPayments = roundDollars(
    stateWithheld + form1099StateWithheld + form1099RStateWithheld + estimatedPayments
  );

  // Step 8: Balance due or refund
  const balanceDueOrRefund = roundDollars(totalTax - totalPayments);

  return {
    scheduleCA,
    itemizedDeductions,
    exemptionCredit,
    taxComputation,
    totalTax,
    totalPayments,
    balanceDueOrRefund,
  };
}
