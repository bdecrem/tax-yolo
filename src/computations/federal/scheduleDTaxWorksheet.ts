import type { ScheduleDTaxWorksheetResult } from '../../types/outputs';
import { MFJ_BRACKETS, MFJ_LTCG_BRACKETS } from '../../constants/federal2025';
import { computeProgressiveTax } from '../shared/brackets';
import { roundDollars } from '../shared/rounding';

/**
 * Schedule D Tax Worksheet (Form 1040, Schedule D, line 21)
 *
 * Layers qualified dividends and net LTCG at preferential rates (0/15/20%)
 * on top of ordinary income taxed at regular brackets.
 * Applies to any filer with qualified dividends or net long-term capital gains.
 */
export function computeScheduleDTaxWorksheet(params: {
  taxableIncome: number;
  qualifiedDividends: number;
  netLTCG: number;               // Schedule D Line 15 (net gain, already positive)
  unrecapturedSection1250Gain?: number;
  collectiblesGain?: number;
}): ScheduleDTaxWorksheetResult {
  const { taxableIncome, qualifiedDividends, unrecapturedSection1250Gain = 0 } = params;
  // Net long-term capital gain (must be > 0 to use this worksheet)
  const netLTCG = Math.max(params.netLTCG, 0);

  // Line 5: Qualified dividends
  // Line 6: Net capital gain from Schedule D (positive amount)
  // Line 7: Total preferential income = qual divs + net LTCG
  // But can't exceed taxable income
  const preferentialIncome = Math.min(qualifiedDividends + netLTCG, taxableIncome);

  // Line 10: Ordinary income = taxable income - preferential income
  const ordinaryIncome = Math.max(taxableIncome - preferentialIncome, 0);

  // Line 11: Tax on ordinary income at regular rates
  const taxOnOrdinaryIncome = roundDollars(computeProgressiveTax(ordinaryIncome, MFJ_BRACKETS));

  // Now layer preferential income on top using LTCG brackets
  // The LTCG brackets apply to the total stack (ordinary + preferential)
  // but we only tax the preferential layer

  // The 0%/15%/20% breakpoints for LTCG brackets (MFJ 2025):
  const bracket0Max = MFJ_LTCG_BRACKETS[0].max;  // $96,700
  const bracket15Max = MFJ_LTCG_BRACKETS[1].max;  // $600,050

  // Amount of preferential income in each layer:
  // 0% layer: from ordinaryIncome to min(ordinaryIncome + preferential, bracket0Max)
  const zeroPercentRoom = Math.max(bracket0Max - ordinaryIncome, 0);
  const taxAt0Percent_amount = Math.min(preferentialIncome, zeroPercentRoom);

  // Remaining preferential income after 0% layer
  const remainingAfter0 = preferentialIncome - taxAt0Percent_amount;

  // Handle unrecaptured Section 1250 gain at 25% (between 15% and 20% layers)
  // For simplicity, we'll handle the standard case first
  const adjUnrecaptured1250 = Math.min(unrecapturedSection1250Gain, netLTCG);

  // 15% layer: from end of 0% to min(bracket15Max)
  const fifteenPercentStart = ordinaryIncome + taxAt0Percent_amount;
  const fifteenPercentRoom = Math.max(bracket15Max - fifteenPercentStart, 0);
  const taxAt15Percent_amount = Math.min(remainingAfter0, fifteenPercentRoom);

  // 20% layer: everything above bracket15Max
  const remainingAfter15 = remainingAfter0 - taxAt15Percent_amount;

  // Compute tax on each layer
  const taxAt0 = 0;
  let taxAt15 = roundDollars(taxAt15Percent_amount * 0.15);
  let taxAt20 = roundDollars(remainingAfter15 * 0.20);

  // Apply 25% rate to unrecaptured Section 1250 gain if applicable
  // This replaces some of the 15% layer
  if (adjUnrecaptured1250 > 0) {
    const sec1250InPrefLayer = Math.min(adjUnrecaptured1250, taxAt15Percent_amount + remainingAfter15);
    if (sec1250InPrefLayer <= taxAt15Percent_amount) {
      taxAt15 += roundDollars(sec1250InPrefLayer * (0.25 - 0.15));
    }
  }

  const totalPreferentialTax = taxAt0 + taxAt15 + taxAt20;
  const totalTax = taxOnOrdinaryIncome + totalPreferentialTax;

  // Also compute regular bracket tax for comparison (Line 25)
  const regularTax = roundDollars(computeProgressiveTax(taxableIncome, MFJ_BRACKETS));

  // Use the lesser (Line 26)
  const finalTax = Math.min(totalTax, regularTax);

  return {
    taxableIncome,
    qualifiedDividends,
    netLTCG,
    preferentialIncome,
    ordinaryIncome,
    taxOnOrdinaryIncome,
    taxAt0Percent: taxAt0,
    taxAt15Percent: taxAt15,
    taxAt20Percent: taxAt20,
    totalPreferentialTax,
    totalTax,
    regularTax,
    finalTax,
  };
}
