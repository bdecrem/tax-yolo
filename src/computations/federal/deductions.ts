import type { ScheduleAResult, DeductionResult, Form8995AResult } from '../../types/outputs';
import { STANDARD_DEDUCTION_MFJ } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

export function computeDeductions(
  agi: number,
  scheduleA: ScheduleAResult,
  qbiResult: Form8995AResult
): DeductionResult {
  const standardDeduction = STANDARD_DEDUCTION_MFJ;
  const itemizedDeduction = scheduleA.totalItemized;

  // Pick the larger deduction
  const deductionUsed = itemizedDeduction > standardDeduction ? 'itemized' as const : 'standard' as const;
  const deductionAmount = Math.max(standardDeduction, itemizedDeduction);

  // QBI deduction (Section 199A REIT dividends * 20%)
  const qbiDeduction = qbiResult.qbiDeduction;

  const totalDeductions = deductionAmount + qbiDeduction;
  const taxableIncome = roundDollars(Math.max(agi - totalDeductions, 0));

  return {
    standardDeduction,
    itemizedDeduction,
    deductionUsed,
    deductionAmount,
    qbiDeduction: roundDollars(qbiDeduction),
    totalDeductions: roundDollars(totalDeductions),
    taxableIncome,
  };
}
