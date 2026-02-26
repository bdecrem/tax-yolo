import type { TaxReturnInput } from '../../types/inputs';
import type { ScheduleDResult } from '../../types/outputs';
import { CAPITAL_LOSS_LIMIT } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

interface CategoryTotals {
  proceeds: number;
  costBasis: number;
  adjustments: number;
  gainLoss: number;
}

function emptyTotals(): CategoryTotals {
  return { proceeds: 0, costBasis: 0, adjustments: 0, gainLoss: 0 };
}

export function computeScheduleD(input: TaxReturnInput): ScheduleDResult {
  // Aggregate 8949 entries across all brokers
  const shortTerm = emptyTotals();
  const longTerm = emptyTotals();

  for (const broker of input.form1099Bs) {
    if (broker.entries.length > 0) {
      // Use individual entries when available
      for (const entry of broker.entries) {
        const target = ['A', 'B', 'C'].includes(entry.box) ? shortTerm : longTerm;
        target.proceeds += entry.proceeds;
        target.costBasis += entry.costBasis;
        target.adjustments += entry.adjustmentAmount ?? 0;
        target.gainLoss += entry.gainLoss;
      }
    } else {
      // Fall back to summary totals
      shortTerm.gainLoss += broker.shortTermBasisReported + broker.shortTermBasisNotReported + broker.shortTermNotOn1099B;
      longTerm.gainLoss += broker.longTermBasisReported + broker.longTermBasisNotReported + broker.longTermNotOn1099B;
    }
  }

  // Add crypto entries
  if (input.cryptoData) {
    for (const entry of input.cryptoData.entries) {
      const target = ['A', 'B', 'C'].includes(entry.box) ? shortTerm : longTerm;
      target.proceeds += entry.proceeds;
      target.costBasis += entry.costBasis;
      target.adjustments += entry.adjustmentAmount ?? 0;
      target.gainLoss += entry.gainLoss;
    }
  }

  // Capital gain distributions from mutual funds (Line 13)
  const capitalGainDistributions = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.totalCapitalGainDistributions ?? 0),
    0
  );
  longTerm.gainLoss += capitalGainDistributions;

  // Unrecaptured Section 1250 gain (Line 19) - from 1099-DIV Box 2b
  const unrecaptured1250 = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.unrecapturedSection1250Gain ?? 0),
    0
  );

  // Collectibles gain (28% rate) - from 1099-DIV Box 2d
  const collectiblesGain = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.collectiblesGain ?? 0),
    0
  );

  // Apply capital loss carryovers
  const stAfterCarryover = shortTerm.gainLoss + input.priorYearCarryovers.capitalLossCarryover.shortTerm;
  const ltAfterCarryover = longTerm.gainLoss + input.priorYearCarryovers.capitalLossCarryover.longTerm;

  const netGainLoss = stAfterCarryover + ltAfterCarryover;

  // Capital loss deduction (limited to $3,000)
  const capitalLossDeduction = netGainLoss < 0
    ? Math.max(netGainLoss, -CAPITAL_LOSS_LIMIT)
    : 0;

  // Carryover computation (Capital Loss Carryover Worksheet)
  let carryoverST = 0;
  let carryoverLT = 0;
  if (netGainLoss < -CAPITAL_LOSS_LIMIT) {
    // There's excess loss to carry over
    // Short-term losses are used first against the $3K limit
    let remainingLimit = CAPITAL_LOSS_LIMIT;

    if (stAfterCarryover < 0) {
      const stUsed = Math.min(Math.abs(stAfterCarryover), remainingLimit);
      remainingLimit -= stUsed;
      carryoverST = -(Math.abs(stAfterCarryover) - stUsed);
    }

    if (ltAfterCarryover < 0 && remainingLimit > 0) {
      const ltUsed = Math.min(Math.abs(ltAfterCarryover), remainingLimit);
      carryoverLT = -(Math.abs(ltAfterCarryover) - ltUsed);
    } else if (ltAfterCarryover < 0) {
      carryoverLT = ltAfterCarryover;
    }
  }

  // Qualified dividends from 1099-DIVs
  const qualifiedDividends = input.form1099DivInts.reduce(
    (sum, f) => sum + (f.qualifiedDividends ?? 0),
    0
  );

  // Determine which tax computation to use
  // Use Schedule D Tax Worksheet if there's a net capital gain (Line 15 > 0)
  // OR qualified dividends > 0
  const netLTCGForWorksheet = Math.max(ltAfterCarryover, 0);
  const useScheduleDTaxWorksheet = (netLTCGForWorksheet > 0 || qualifiedDividends > 0) && netGainLoss >= 0;
  const use28PercentRateWorksheet = collectiblesGain > 0 || unrecaptured1250 > 0;

  return {
    shortTermTotals: {
      proceeds: roundDollars(shortTerm.proceeds),
      costBasis: roundDollars(shortTerm.costBasis),
      adjustments: roundDollars(shortTerm.adjustments),
      gainLoss: roundDollars(stAfterCarryover),
    },
    longTermTotals: {
      proceeds: roundDollars(longTerm.proceeds),
      costBasis: roundDollars(longTerm.costBasis),
      adjustments: roundDollars(longTerm.adjustments),
      gainLoss: roundDollars(ltAfterCarryover),
    },
    netShortTermGainLoss: roundDollars(stAfterCarryover),
    netLongTermGainLoss: roundDollars(ltAfterCarryover),
    netGainLoss: roundDollars(netGainLoss),
    capitalLossDeduction: roundDollars(capitalLossDeduction),
    capitalLossCarryover: { shortTerm: carryoverST, longTerm: carryoverLT },
    useScheduleDTaxWorksheet,
    use28PercentRateWorksheet,
  };
}
