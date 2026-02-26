// Federal tax constants for tax year 2024 (for regression testing)
// Source: IRS Rev. Proc. 2023-34

import type { TaxBracket } from './federal2025';

export const MFJ_BRACKETS_2024: TaxBracket[] = [
  { min: 0,       max: 23200,   rate: 0.10 },
  { min: 23200,   max: 94300,   rate: 0.12 },
  { min: 94300,   max: 201050,  rate: 0.22 },
  { min: 201050,  max: 383900,  rate: 0.24 },
  { min: 383900,  max: 487450,  rate: 0.32 },
  { min: 487450,  max: 731200,  rate: 0.35 },
  { min: 731200,  max: Infinity, rate: 0.37 },
];

export const MFJ_LTCG_BRACKETS_2024: TaxBracket[] = [
  { min: 0,       max: 94050,   rate: 0.00 },
  { min: 94050,   max: 583750,  rate: 0.15 },
  { min: 583750,  max: Infinity, rate: 0.20 },
];

export const STANDARD_DEDUCTION_MFJ_2024 = 29200;
export const SALT_CAP_2024 = 10000; // Pre-OBBBA, flat $10K cap
