import type { TaxBracket } from './federal2025';
import {
  MFJ_BRACKETS, MFJ_LTCG_BRACKETS, STANDARD_DEDUCTION_MFJ,
  NIIT_RATE, NIIT_THRESHOLD_MFJ,
  ADDITIONAL_MEDICARE_RATE, ADDITIONAL_MEDICARE_THRESHOLD_MFJ,
  QBI_DEDUCTION_RATE, CAPITAL_LOSS_LIMIT,
} from './federal2025';
import { CA_MFJ_BRACKETS, CA_STANDARD_DEDUCTION_MFJ, MENTAL_HEALTH_TAX_THRESHOLD, MENTAL_HEALTH_TAX_RATE } from './california2025';
import * as ca2025 from './california2025';
import { MFJ_BRACKETS_2024, MFJ_LTCG_BRACKETS_2024, STANDARD_DEDUCTION_MFJ_2024, SALT_CAP_2024 } from './federal2024';
import { CA_MFJ_BRACKETS_2024, CA_STANDARD_DEDUCTION_MFJ_2024, CA_PERSONAL_EXEMPTION_CREDIT_2024, CA_DEPENDENT_EXEMPTION_CREDIT_2024, CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ_2024 } from './california2024';

export interface FederalTaxConfig {
  brackets: TaxBracket[];
  ltcgBrackets: TaxBracket[];
  standardDeductionMFJ: number;
  saltCap: number | ((magi: number) => number);
  niitRate: number;
  niitThreshold: number;
  additionalMedicareRate: number;
  additionalMedicareThreshold: number;
  qbiRate: number;
  capitalLossLimit: number;
}

export interface CaliforniaTaxConfig {
  brackets: TaxBracket[];
  standardDeductionMFJ: number;
  personalExemptionCredit: number;
  dependentExemptionCredit: number;
  exemptionPhaseoutThreshold: number;
  exemptionPhaseoutAmount: number;
  exemptionPhaseoutIncrement: number;
  itemizedPhaseoutThreshold: number;
  itemizedPhaseoutRate: number;
  itemizedPhaseoutCap: number;
  mentalHealthThreshold: number;
  mentalHealthRate: number;
}

export interface TaxConfig {
  year: number;
  federal: FederalTaxConfig;
  california: CaliforniaTaxConfig;
}

function computeSALTCap2025(magi: number): number {
  const base = 40000;
  const start = 500000;
  const rate = 0.30;
  const floor = 10000;
  if (magi <= start) return base;
  const reduction = (magi - start) * rate;
  return Math.max(base - reduction, floor);
}

export const config2025: TaxConfig = {
  year: 2025,
  federal: {
    brackets: MFJ_BRACKETS,
    ltcgBrackets: MFJ_LTCG_BRACKETS,
    standardDeductionMFJ: STANDARD_DEDUCTION_MFJ,
    saltCap: computeSALTCap2025,
    niitRate: NIIT_RATE,
    niitThreshold: NIIT_THRESHOLD_MFJ,
    additionalMedicareRate: ADDITIONAL_MEDICARE_RATE,
    additionalMedicareThreshold: ADDITIONAL_MEDICARE_THRESHOLD_MFJ,
    qbiRate: QBI_DEDUCTION_RATE,
    capitalLossLimit: CAPITAL_LOSS_LIMIT,
  },
  california: {
    brackets: CA_MFJ_BRACKETS,
    standardDeductionMFJ: CA_STANDARD_DEDUCTION_MFJ,
    personalExemptionCredit: ca2025.CA_PERSONAL_EXEMPTION_CREDIT,
    dependentExemptionCredit: ca2025.CA_DEPENDENT_EXEMPTION_CREDIT,
    exemptionPhaseoutThreshold: ca2025.CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ,
    exemptionPhaseoutAmount: ca2025.CA_EXEMPTION_PHASEOUT_AMOUNT,
    exemptionPhaseoutIncrement: ca2025.CA_EXEMPTION_PHASEOUT_INCREMENT,
    itemizedPhaseoutThreshold: ca2025.CA_ITEMIZED_PHASEOUT_THRESHOLD_MFJ,
    itemizedPhaseoutRate: ca2025.CA_ITEMIZED_PHASEOUT_RATE,
    itemizedPhaseoutCap: ca2025.CA_ITEMIZED_PHASEOUT_CAP,
    mentalHealthThreshold: MENTAL_HEALTH_TAX_THRESHOLD,
    mentalHealthRate: MENTAL_HEALTH_TAX_RATE,
  },
};

export const config2024: TaxConfig = {
  year: 2024,
  federal: {
    brackets: MFJ_BRACKETS_2024,
    ltcgBrackets: MFJ_LTCG_BRACKETS_2024,
    standardDeductionMFJ: STANDARD_DEDUCTION_MFJ_2024,
    saltCap: SALT_CAP_2024,
    niitRate: NIIT_RATE,
    niitThreshold: NIIT_THRESHOLD_MFJ,
    additionalMedicareRate: ADDITIONAL_MEDICARE_RATE,
    additionalMedicareThreshold: ADDITIONAL_MEDICARE_THRESHOLD_MFJ,
    qbiRate: QBI_DEDUCTION_RATE,
    capitalLossLimit: CAPITAL_LOSS_LIMIT,
  },
  california: {
    brackets: CA_MFJ_BRACKETS_2024,
    standardDeductionMFJ: CA_STANDARD_DEDUCTION_MFJ_2024,
    personalExemptionCredit: CA_PERSONAL_EXEMPTION_CREDIT_2024,
    dependentExemptionCredit: CA_DEPENDENT_EXEMPTION_CREDIT_2024,
    exemptionPhaseoutThreshold: CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ_2024,
    exemptionPhaseoutAmount: 6,
    exemptionPhaseoutIncrement: 2500,
    itemizedPhaseoutThreshold: CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ_2024,
    itemizedPhaseoutRate: 0.06,
    itemizedPhaseoutCap: 0.80,
    mentalHealthThreshold: 1000000,
    mentalHealthRate: 0.01,
  },
};
