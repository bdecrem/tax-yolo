import type { TaxReturnInput } from '../../types/inputs';
import type { ScheduleBResult } from '../../types/outputs';

export function computeScheduleB(input: TaxReturnInput): ScheduleBResult {
  const interestItems: { payer: string; amount: number }[] = [];
  const dividendItems: { payer: string; amount: number }[] = [];

  for (const f of input.form1099DivInts) {
    if (f.interestIncome && f.interestIncome > 0) {
      interestItems.push({ payer: f.payer, amount: f.interestIncome });
    }
    if (f.ordinaryDividends && f.ordinaryDividends > 0) {
      dividendItems.push({ payer: f.payer, amount: f.ordinaryDividends });
    }
  }

  const totalInterest = interestItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOrdinaryDividends = dividendItems.reduce((sum, item) => sum + item.amount, 0);

  // Part III: Foreign accounts - required if total interest or dividends > $1,500
  // or if the taxpayer has foreign accounts
  const hasForeignAccounts = totalInterest > 1500 || totalOrdinaryDividends > 1500;

  return {
    interestItems,
    totalInterest,
    dividendItems,
    totalOrdinaryDividends,
    hasForeignAccounts,
  };
}
