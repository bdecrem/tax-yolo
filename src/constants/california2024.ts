// California tax constants for tax year 2024 (for regression testing)
// Source: FTB 2024 540 Tax Rate Schedules (Schedule Y - MFJ)

import type { TaxBracket } from './federal2025';

export const CA_MFJ_BRACKETS_2024: TaxBracket[] = [
  { min: 0,       max: 21512,   rate: 0.01 },
  { min: 21512,   max: 50998,   rate: 0.02 },
  { min: 50998,   max: 80490,   rate: 0.04 },
  { min: 80490,   max: 111732,  rate: 0.06 },
  { min: 111732,  max: 141212,  rate: 0.08 },
  { min: 141212,  max: 721318,  rate: 0.093 },
  { min: 721318,  max: 865574,  rate: 0.103 },
  { min: 865574,  max: 1442628, rate: 0.113 },
  { min: 1442628, max: Infinity, rate: 0.123 },
];

export const CA_STANDARD_DEDUCTION_MFJ_2024 = 11080;

// Exemption credits for 2024
export const CA_PERSONAL_EXEMPTION_CREDIT_2024 = 149;    // $149/person
export const CA_DEPENDENT_EXEMPTION_CREDIT_2024 = 461;   // $461/dependent
export const CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ_2024 = 489719;
