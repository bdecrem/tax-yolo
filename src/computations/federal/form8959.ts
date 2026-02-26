import type { TaxReturnInput } from '../../types/inputs';
import type { Form8959Result } from '../../types/outputs';
import { ADDITIONAL_MEDICARE_RATE, ADDITIONAL_MEDICARE_THRESHOLD_MFJ } from '../../constants/federal2025';
import { roundDollars } from '../shared/rounding';

/**
 * Form 8959 - Additional Medicare Tax
 * 0.9% on Medicare wages exceeding $250,000 (MFJ)
 */
export function computeForm8959(input: TaxReturnInput): Form8959Result {
  const totalMedicareWages = input.w2s.reduce((sum, w2) => sum + w2.medicareWages, 0);
  const threshold = ADDITIONAL_MEDICARE_THRESHOLD_MFJ;
  const excessWages = Math.max(totalMedicareWages - threshold, 0);
  const additionalMedicareTax = roundDollars(excessWages * ADDITIONAL_MEDICARE_RATE);

  // Medicare tax already withheld by employers (at regular 1.45% rate)
  const medicareWithheld = input.w2s.reduce((sum, w2) => sum + w2.medicareTax, 0);

  // Additional tax owed (the 0.9% portion minus any excess withholding)
  // Line 19: total additional Medicare = 0.9% of excess
  // Line 23: withholding allocated = regular Medicare withholding
  // Line 24: additional tax = Line 19 (added to 1040 Line 17)
  // The withholding credit goes to 1040 Line 25
  const additionalTaxOwed = additionalMedicareTax;

  return {
    totalMedicareWages: roundDollars(totalMedicareWages),
    threshold,
    excessWages: roundDollars(excessWages),
    additionalMedicareTax,
    medicareWithheld: roundDollars(medicareWithheld),
    additionalTaxOwed,
  };
}
