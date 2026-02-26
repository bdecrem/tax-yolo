import type { BackdoorRothData } from '../../types/inputs';
import type { Form8606Result } from '../../types/outputs';
import { roundDollars } from '../shared/rounding';

/**
 * Form 8606 - Nondeductible IRAs / Backdoor Roth
 *
 * For each spouse:
 * 1. Nondeductible contribution to Traditional IRA
 * 2. Convert to Roth IRA
 * 3. Pro-rata rule determines taxable portion
 *
 * If year-end Traditional/SEP/SIMPLE IRA balance is $0,
 * the conversion is 100% nontaxable (clean backdoor).
 */
export function computeForm8606(data: BackdoorRothData): Form8606Result {
  // Part I: Nondeductible Contributions
  const currentYearContribution = data.traditionalIRAContribution;
  const priorYearBasis = data.priorYearBasis;
  const totalBasis = currentYearContribution + priorYearBasis; // Line 3

  // Part II: Conversions (Roth)
  const conversionAmount = data.rothConversionAmount; // Line 8

  // Year-end IRA value (all traditional, SEP, SIMPLE combined)
  // Line 6: value of ALL traditional IRAs at year-end
  // PLUS any distributions/conversions during the year
  const yearEndIRAValue =
    data.yearEndTraditionalIRABalance +
    data.yearEndSEPIRABalance +
    data.yearEndSIMPLEIRABalance;

  // Total IRA value for pro-rata = year-end value + conversions + distributions
  const totalForProRata = yearEndIRAValue + conversionAmount; // Line 9

  // Pro-rata nontaxable percentage
  // Line 10: basis / total value (but not more than 1.0)
  const nontaxableRatio = totalForProRata > 0
    ? Math.min(totalBasis / totalForProRata, 1.0)
    : 1.0;

  // Nontaxable portion of conversion
  const nontaxablePortion = roundDollars(conversionAmount * nontaxableRatio);

  // Taxable conversion amount
  const taxableConversion = roundDollars(conversionAmount - nontaxablePortion);

  // Remaining basis for next year
  const remainingBasis = roundDollars(totalBasis - nontaxablePortion);

  // Pro-rata warning if SEP/SIMPLE balance exists
  const proRataWarning = data.yearEndSEPIRABalance > 0 || data.yearEndSIMPLEIRABalance > 0;

  return {
    spouse: data.spouse,
    currentYearContribution,
    priorYearBasis,
    totalBasis,
    yearEndIRAValue,
    conversionAmount,
    taxableConversion,
    remainingBasis,
    proRataWarning,
  };
}
