import type { TaxComputationResult, ScheduleDResult, ScheduleDTaxWorksheetResult } from '../../types/outputs';
import { MFJ_BRACKETS } from '../../constants/federal2025';
import { computeProgressiveTax } from '../shared/brackets';
import { roundDollars } from '../shared/rounding';
import { computeScheduleDTaxWorksheet } from './scheduleDTaxWorksheet';

export function computeTax(params: {
  taxableIncome: number;
  qualifiedDividends: number;
  scheduleD: ScheduleDResult;
}): { result: TaxComputationResult; worksheet?: ScheduleDTaxWorksheetResult } {
  const { taxableIncome, qualifiedDividends, scheduleD } = params;

  if (scheduleD.useScheduleDTaxWorksheet) {
    const worksheet = computeScheduleDTaxWorksheet({
      taxableIncome,
      qualifiedDividends,
      netLTCG: Math.max(scheduleD.netLongTermGainLoss, 0),
      unrecapturedSection1250Gain: 0, // Will be filled from 1099-DIV data
    });

    return {
      result: {
        method: 'scheduleD_worksheet',
        tax: worksheet.finalTax,
      },
      worksheet,
    };
  }

  // Regular tax computation (no preferential rates)
  const tax = roundDollars(computeProgressiveTax(taxableIncome, MFJ_BRACKETS));
  return {
    result: {
      method: 'regular_brackets',
      tax,
    },
  };
}
