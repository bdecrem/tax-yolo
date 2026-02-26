import type { TaxReturnInput } from '../../types/inputs';
import type { CAExemptionCreditResult } from '../../types/outputs';
import {
  CA_PERSONAL_EXEMPTION_CREDIT,
  CA_DEPENDENT_EXEMPTION_CREDIT,
  CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ,
  CA_EXEMPTION_PHASEOUT_AMOUNT,
  CA_EXEMPTION_PHASEOUT_INCREMENT,
} from '../../constants/california2025';
import { roundDollars } from '../shared/rounding';

/**
 * California Exemption Credits
 *
 * $144 per person (taxpayer + spouse = 2)
 * $446 per dependent
 * Phased out: reduced $6 per $2,500 (or fraction) of AGI over threshold
 */
export function computeCAExemptionCredit(
  input: TaxReturnInput,
  caAGI: number
): CAExemptionCreditResult {
  // Personal credits: $144 each for taxpayer and spouse (MFJ)
  const numPersonal = input.filingStatus === 'mfj' ? 2 : 1;
  const personalCredits = numPersonal * CA_PERSONAL_EXEMPTION_CREDIT;

  // Dependent credits: $446 each
  const dependentCredits = input.dependents.length * CA_DEPENDENT_EXEMPTION_CREDIT;

  const totalBeforePhaseout = personalCredits + dependentCredits;

  // Phaseout computation
  let phaseoutReduction = 0;
  if (caAGI > CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ) {
    const excess = caAGI - CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ;
    // Number of $2,500 increments (round up)
    const increments = Math.ceil(excess / CA_EXEMPTION_PHASEOUT_INCREMENT);
    // $6 reduction per increment, per exemption
    const totalExemptions = numPersonal + input.dependents.length;
    phaseoutReduction = increments * CA_EXEMPTION_PHASEOUT_AMOUNT * totalExemptions;
  }

  const totalCredit = roundDollars(Math.max(totalBeforePhaseout - phaseoutReduction, 0));

  return {
    personalCredits,
    dependentCredits,
    totalBeforePhaseout,
    phaseoutReduction,
    totalCredit,
  };
}
