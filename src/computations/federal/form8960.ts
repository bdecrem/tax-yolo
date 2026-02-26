import type { TaxReturnInput } from '../../types/inputs';
import type { IncomeResult, Form8960Result } from '../../types/outputs';
import { NIIT_RATE, NIIT_THRESHOLD_MFJ } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

/**
 * Form 8960 - Net Investment Income Tax (NIIT)
 * 3.8% on the lesser of:
 *   (a) Net investment income, or
 *   (b) MAGI in excess of $250,000 (MFJ)
 */
export function computeForm8960(
  _input: TaxReturnInput,
  income: IncomeResult
): Form8960Result {
  // Net Investment Income includes:
  // - Taxable interest
  // - Ordinary dividends
  // - Capital gains (net)
  // - Other investment income
  // Does NOT include: wages, self-employment income, Social Security
  const netInvestmentIncome = roundDollars(
    income.taxableInterest +
    income.ordinaryDividends +
    Math.max(income.netShortTermGainLoss + income.netLongTermGainLoss, 0) +
    // Rental income, royalties would go here
    0
  );

  // MAGI for NIIT purposes = AGI (for most filers)
  const magi = income.agi;
  const magiThreshold = NIIT_THRESHOLD_MFJ;
  const magiExcess = Math.max(magi - magiThreshold, 0);

  // NIIT base = lesser of NII or MAGI excess
  const niitBase = Math.min(netInvestmentIncome, magiExcess);

  // NIIT = 3.8%
  const niit = roundDollars(niitBase * NIIT_RATE);

  return {
    netInvestmentIncome,
    magi,
    magiThreshold,
    magiExcess,
    niitBase,
    niit,
  };
}
