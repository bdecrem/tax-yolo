// California tax constants for tax year 2025
// Source: FTB 540 Booklet, FTB adjustments

import type { TaxBracket } from './federal2025';

// ─── MFJ Tax Brackets ──────────────────────────────────────────────
// CA indexes for inflation annually. 2025 estimated values.
export const CA_MFJ_BRACKETS: TaxBracket[] = [
  { min: 0,       max: 21438,   rate: 0.01 },
  { min: 21438,   max: 50834,   rate: 0.02 },
  { min: 50834,   max: 80222,   rate: 0.04 },
  { min: 80222,   max: 111368,  rate: 0.06 },
  { min: 111368,  max: 140756,  rate: 0.08 },
  { min: 140756,  max: 721318,  rate: 0.093 },
  { min: 721318,  max: 865580,  rate: 0.103 },
  { min: 865580,  max: 1000000, rate: 0.113 },
  { min: 1000000, max: Infinity, rate: 0.123 },
];

// ─── Mental Health Services Tax ─────────────────────────────────────
export const MENTAL_HEALTH_TAX_THRESHOLD = 1000000;
export const MENTAL_HEALTH_TAX_RATE = 0.01;

// ─── Standard Deduction ─────────────────────────────────────────────
export const CA_STANDARD_DEDUCTION_MFJ = 11412;

// ─── Exemption Credits ──────────────────────────────────────────────
export const CA_PERSONAL_EXEMPTION_CREDIT = 144;    // Per person (taxpayer + spouse)
export const CA_DEPENDENT_EXEMPTION_CREDIT = 446;   // Per dependent

// ─── Exemption Credit Phaseout ──────────────────────────────────────
// Reduced by $6 per $2,500 (or fraction) of AGI over threshold
export const CA_EXEMPTION_PHASEOUT_THRESHOLD_MFJ = 489719;
export const CA_EXEMPTION_PHASEOUT_AMOUNT = 6;          // $6 reduction
export const CA_EXEMPTION_PHASEOUT_INCREMENT = 2500;    // Per $2,500

// ─── Itemized Deduction Phaseout ────────────────────────────────────
// Reduce by lesser of: 6% of AGI excess over threshold, or 80% of itemized deductions
export const CA_ITEMIZED_PHASEOUT_THRESHOLD_MFJ = 489719;
export const CA_ITEMIZED_PHASEOUT_RATE = 0.06;
export const CA_ITEMIZED_PHASEOUT_CAP = 0.80;

// ─── SDI Rate ───────────────────────────────────────────────────────
export const CA_SDI_RATE = 0.011;
export const CA_SDI_WAGE_LIMIT = 175000; // 2025 estimate

// ─── Renter's Credit (not applicable - homeowners) ─────────────────
export const CA_RENTERS_CREDIT_MFJ = 120;
export const CA_RENTERS_CREDIT_AGI_LIMIT_MFJ = 110454;
