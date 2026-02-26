import type { TaxReturnInput } from '../../types/inputs';
import type { IncomeResult } from '../../types/outputs';
import { CAPITAL_LOSS_LIMIT } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

export function computeIncome(input: TaxReturnInput): IncomeResult {
  // Wages (Line 1)
  const wages = input.w2s.reduce((sum, w2) => sum + w2.wages, 0);

  // Interest income (Line 2b)
  const taxableInterest = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.interestIncome ?? 0),
    0
  );
  const taxExemptInterest = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.taxExemptInterest ?? 0) + (f.exemptInterestDividends ?? 0),
    0
  );

  // Dividends (Line 3a, 3b)
  const ordinaryDividends = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.ordinaryDividends ?? 0),
    0
  );
  const qualifiedDividends = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.qualifiedDividends ?? 0),
    0
  );

  // Capital gains from 1099-B (aggregated by Schedule D)
  let netShortTermGainLoss = 0;
  let netLongTermGainLoss = 0;

  for (const b of input.form1099Bs) {
    netShortTermGainLoss += b.shortTermBasisReported + b.shortTermBasisNotReported + b.shortTermNotOn1099B;
    netLongTermGainLoss += b.longTermBasisReported + b.longTermBasisNotReported + b.longTermNotOn1099B;
  }

  // Capital gain distributions from mutual funds (1099-DIV Box 2a)
  const capitalGainDistributions = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.totalCapitalGainDistributions ?? 0),
    0
  );
  netLongTermGainLoss += capitalGainDistributions;

  // Add crypto
  if (input.cryptoData) {
    netShortTermGainLoss += input.cryptoData.shortTermGainLoss;
    netLongTermGainLoss += input.cryptoData.longTermGainLoss;
  }

  // Apply capital loss carryovers
  netShortTermGainLoss += input.priorYearCarryovers.capitalLossCarryover.shortTerm; // negative number
  netLongTermGainLoss += input.priorYearCarryovers.capitalLossCarryover.longTerm;   // negative number

  // Net capital gain/loss with $3K limit
  const combinedGainLoss = netShortTermGainLoss + netLongTermGainLoss;
  const netCapitalGainLoss = combinedGainLoss >= 0
    ? combinedGainLoss
    : Math.max(combinedGainLoss, -CAPITAL_LOSS_LIMIT);

  // Calculate carryover if losses exceed $3K limit
  let carryoverST = 0;
  let carryoverLT = 0;
  if (combinedGainLoss < -CAPITAL_LOSS_LIMIT) {
    // Excess loss carries over, allocated ST first then LT
    let excessLoss = Math.abs(combinedGainLoss) - CAPITAL_LOSS_LIMIT;
    if (netShortTermGainLoss < 0) {
      carryoverST = Math.min(excessLoss, Math.abs(netShortTermGainLoss));
      excessLoss -= carryoverST;
      carryoverLT = excessLoss;
    } else {
      carryoverLT = excessLoss;
    }
    carryoverST = -carryoverST;
    carryoverLT = -carryoverLT;
  }

  // IRA distributions (1099-R)
  const iraDistributions = input.form1099Rs.reduce((sum, r) => sum + r.grossDistribution, 0);
  const iraDistributionsTaxable = input.form1099Rs.reduce((sum, r) => sum + r.taxableAmount, 0);

  // Other income
  const otherIncome = input.otherIncome.reduce((sum, o) => sum + o.amount, 0);

  // Total income (Line 9)
  const totalIncome = roundDollars(
    wages +
    taxableInterest +
    ordinaryDividends +
    netCapitalGainLoss +
    iraDistributionsTaxable +
    otherIncome
  );

  // Adjustments to income (Line 10) - for this household, typically none
  // IRA deduction not available (covered by employer plan + income too high)
  const adjustments = 0;

  // AGI (Line 11)
  const agi = totalIncome - adjustments;

  return {
    wages,
    taxableInterest: roundDollars(taxableInterest),
    taxExemptInterest: roundDollars(taxExemptInterest),
    ordinaryDividends: roundDollars(ordinaryDividends),
    qualifiedDividends: roundDollars(qualifiedDividends),
    netShortTermGainLoss: roundDollars(netShortTermGainLoss),
    netLongTermGainLoss: roundDollars(netLongTermGainLoss),
    netCapitalGainLoss: roundDollars(netCapitalGainLoss),
    capitalLossCarryoverToNextYear: { shortTerm: carryoverST, longTerm: carryoverLT },
    iraDistributions: roundDollars(iraDistributions),
    iraDistributionsTaxable: roundDollars(iraDistributionsTaxable),
    otherIncome: roundDollars(otherIncome),
    totalIncome,
    adjustments,
    agi,
  };
}
