import type { TaxReturnInput } from '../../types/inputs';
import type { ScheduleAResult } from '../../types/outputs';
import { computeSALTCap, STANDARD_DEDUCTION_MFJ } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

export function computeScheduleA(input: TaxReturnInput, agi: number): ScheduleAResult {
  // ─── Medical Expenses (Line 1-4) ──────────────────────────────────
  // Not applicable for this household (no medical expenses claimed)
  const medicalExpenses = 0;

  // ─── State and Local Taxes (Line 5-5e) ────────────────────────────
  // State income tax paid (from W-2 withholding + estimated payments)
  const stateIncomeTax =
    input.w2s.reduce((sum, w2) => sum + w2.stateWithheld, 0) +
    input.estimatedPayments.california.q1 +
    input.estimatedPayments.california.q2 +
    input.estimatedPayments.california.q3 +
    input.estimatedPayments.california.q4;

  // Property tax
  const propertyTax = input.propertyTaxPayments.reduce((sum, p) => sum + p.amount, 0);

  // Vehicle License Fee (deductible as personal property tax in CA)
  const vlf = input.vehicleRegistrations.reduce((sum, v) => sum + v.vlf, 0);

  const saltBeforeCap = stateIncomeTax + propertyTax + vlf;

  // Apply SALT cap (OBBBA 2025 rules)
  const saltCap = computeSALTCap(agi);
  const saltDeduction = Math.min(saltBeforeCap, saltCap);

  // ─── Mortgage Interest (Line 8-8e) ────────────────────────────────
  const mortgageInterest = input.form1098s.reduce((sum, f) => sum + f.mortgageInterest, 0);

  // ─── Charitable (Line 11-14) ──────────────────────────────────────
  const charitableCash = input.charitableDonations
    .filter(d => d.type === 'cash')
    .reduce((sum, d) => sum + d.amount, 0);
  const charitableNonCash = input.charitableDonations
    .filter(d => d.type === 'noncash')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalCharitable = charitableCash + charitableNonCash;

  // ─── Total Itemized (Line 17) ─────────────────────────────────────
  const totalItemized = roundDollars(
    medicalExpenses + saltDeduction + mortgageInterest + totalCharitable
  );

  // Compare to standard deduction
  const usesItemized = totalItemized > STANDARD_DEDUCTION_MFJ;

  return {
    medicalExpenses,
    saltDeduction: roundDollars(saltDeduction),
    saltBeforeCap: roundDollars(saltBeforeCap),
    mortgageInterest: roundDollars(mortgageInterest),
    charitableCash: roundDollars(charitableCash),
    charitableNonCash: roundDollars(charitableNonCash),
    totalCharitable: roundDollars(totalCharitable),
    totalItemized,
    usesItemized,
  };
}
