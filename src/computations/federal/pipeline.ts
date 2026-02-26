import type { TaxReturnInput } from '../../types/inputs';
import type { FederalTaxResult } from '../../types/outputs';
import { computeIncome } from './income';
import { computeScheduleB } from './scheduleB';
import { computeScheduleD } from './scheduleD';
import { computeScheduleA } from './scheduleA';
import { computeForm8995A } from './form8995A';
import { computeDeductions } from './deductions';
import { computeTax } from './taxComputation';
import { computeForm8606 } from './form8606';
import { computeForm8959 } from './form8959';
import { computeForm8960 } from './form8960';
import { computeForm1116 } from './form1116';
import { computeForm2210 } from './form2210';
import { STANDARD_DEDUCTION_MFJ } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

/**
 * Run the complete federal tax computation pipeline.
 * Order matters - each step depends on results from prior steps.
 */
export function computeFederalTax(
  input: TaxReturnInput,
  priorYearTax: number = 0
): FederalTaxResult {
  // Step 1: Compute income and AGI
  const income = computeIncome(input);

  // Step 2: Schedule B (interest/dividends detail)
  const scheduleB = computeScheduleB(input);

  // Step 3: Schedule D (capital gains/losses)
  const scheduleD = computeScheduleD(input);

  // Step 4: Schedule A (itemized deductions)
  const scheduleA = computeScheduleA(input, income.agi);

  // Step 5: QBI deduction (Form 8995-A)
  // Need taxable income before QBI = AGI - max(standard, itemized)
  const deductionBeforeQBI = Math.max(STANDARD_DEDUCTION_MFJ, scheduleA.totalItemized);
  const taxableIncomeBeforeQBI = Math.max(income.agi - deductionBeforeQBI, 0);
  const form8995A = computeForm8995A(input, taxableIncomeBeforeQBI);

  // Step 6: Deductions (standard vs itemized + QBI)
  const deductions = computeDeductions(income.agi, scheduleA, form8995A);

  // Step 7: Tax computation (Schedule D Tax Worksheet or regular brackets)
  const { result: taxComputation, worksheet: scheduleDTaxWorksheet } = computeTax({
    taxableIncome: deductions.taxableIncome,
    qualifiedDividends: income.qualifiedDividends,
    scheduleD,
  });

  // Step 8: Form 8606 (Backdoor Roth)
  const form8606 = input.backdoorRothData.map(data => computeForm8606(data));

  // Step 9: Form 8959 (Additional Medicare Tax)
  const form8959 = computeForm8959(input);

  // Step 10: Form 8960 (NIIT)
  const form8960 = computeForm8960(input, income);

  // Step 11: Other taxes
  const otherTaxes = roundDollars(form8959.additionalMedicareTax + form8960.niit);

  // Step 12: Total tax before credits
  const totalTaxBeforeCredits = taxComputation.tax + otherTaxes;

  // Step 13: Form 1116 (Foreign Tax Credit)
  const form1116 = computeForm1116(input, taxComputation.tax, income.totalIncome);

  // Step 14: Credits
  // Other dependent credit ($500 per qualifying dependent 17+)
  const otherDependentCredit = input.dependents.length * 500;
  const totalCredits = roundDollars(form1116.creditAllowed + otherDependentCredit);

  // Step 15: Total tax
  const totalTax = roundDollars(Math.max(totalTaxBeforeCredits - totalCredits, 0));

  // Step 16: Total payments
  const federalWithheld = input.w2s.reduce((sum, w2) => sum + w2.federalWithheld, 0);
  const form1099Withheld = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.federalTaxWithheld ?? 0),
    0
  );
  const form1099RWithheld = input.form1099Rs.reduce(
    (sum, r) => sum + r.federalTaxWithheld,
    0
  );
  const estimatedPayments =
    input.estimatedPayments.federal.q1 +
    input.estimatedPayments.federal.q2 +
    input.estimatedPayments.federal.q3 +
    input.estimatedPayments.federal.q4;
  const priorYearOverpayment = input.priorYearCarryovers.priorYearOverpaymentApplied;

  const totalPayments = roundDollars(
    federalWithheld +
    form1099Withheld +
    form1099RWithheld +
    estimatedPayments +
    priorYearOverpayment
  );

  // Step 17: Balance due or refund
  const balanceDueOrRefund = roundDollars(totalTax - totalPayments);

  // Step 18: Form 2210 (underpayment penalty)
  computeForm2210({
    currentYearTax: totalTax,
    priorYearTax,
    totalPaymentsAndCredits: totalPayments,
  });

  return {
    income,
    scheduleB,
    scheduleD,
    scheduleDTaxWorksheet: scheduleDTaxWorksheet ?? undefined,
    scheduleA,
    deductions,
    taxComputation,
    form8606,
    form8959,
    form8960,
    form8995A,
    form1116,
    totalTax,
    totalCredits,
    otherTaxes,
    totalPayments,
    balanceDueOrRefund,
  };
}
