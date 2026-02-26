// Federal tax constants for tax year 2025
// Source: IRS Rev. Proc. 2024-40, OBBBA 2025

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// ─── MFJ Ordinary Income Brackets ──────────────────────────────────
export const MFJ_BRACKETS: TaxBracket[] = [
  { min: 0,       max: 23850,   rate: 0.10 },
  { min: 23850,   max: 96950,   rate: 0.12 },
  { min: 96950,   max: 206700,  rate: 0.22 },
  { min: 206700,  max: 394600,  rate: 0.24 },
  { min: 394600,  max: 501050,  rate: 0.32 },
  { min: 501050,  max: 751600,  rate: 0.35 },
  { min: 751600,  max: Infinity, rate: 0.37 },
];

// ─── Long-term capital gains / qualified dividends brackets (MFJ) ──
export const MFJ_LTCG_BRACKETS: TaxBracket[] = [
  { min: 0,       max: 96700,   rate: 0.00 },
  { min: 96700,   max: 600050,  rate: 0.15 },
  { min: 600050,  max: Infinity, rate: 0.20 },
];

// ─── Standard Deduction ─────────────────────────────────────────────
export const STANDARD_DEDUCTION_MFJ = 30000;
export const STANDARD_DEDUCTION_SINGLE = 15000;

// ─── SALT Cap (OBBBA 2025) ──────────────────────────────────────────
// Base cap: $40,000 MFJ
// Phaseout: reduced by 30% of MAGI over $500,000
// Floor: $10,000 (original TCJA cap)
export const SALT_CAP_BASE_MFJ = 40000;
export const SALT_PHASEOUT_START_MFJ = 500000;
export const SALT_PHASEOUT_RATE = 0.30;
export const SALT_CAP_FLOOR = 10000;

export function computeSALTCap(magi: number): number {
  if (magi <= SALT_PHASEOUT_START_MFJ) return SALT_CAP_BASE_MFJ;
  const reduction = (magi - SALT_PHASEOUT_START_MFJ) * SALT_PHASEOUT_RATE;
  const cap = SALT_CAP_BASE_MFJ - reduction;
  return Math.max(cap, SALT_CAP_FLOOR);
}

// ─── NIIT (Net Investment Income Tax) ───────────────────────────────
export const NIIT_RATE = 0.038;
export const NIIT_THRESHOLD_MFJ = 250000;

// ─── Additional Medicare Tax ────────────────────────────────────────
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD_MFJ = 250000;

// ─── Social Security ────────────────────────────────────────────────
export const SS_WAGE_BASE = 176100;
export const SS_TAX_RATE = 0.062;
export const MEDICARE_TAX_RATE = 0.0145;

// ─── IRA Limits ─────────────────────────────────────────────────────
export const IRA_CONTRIBUTION_LIMIT = 7000;
export const IRA_CONTRIBUTION_LIMIT_50PLUS = 8000;

// ─── Capital Loss Limit ─────────────────────────────────────────────
export const CAPITAL_LOSS_LIMIT = 3000;

// ─── QBI / Section 199A ─────────────────────────────────────────────
export const QBI_DEDUCTION_RATE = 0.20;

// ─── Child Tax Credit (not applicable - dependents are 17+) ────────
export const CHILD_TAX_CREDIT = 2000;
export const CHILD_TAX_CREDIT_PHASEOUT_MFJ = 400000;
export const CHILD_TAX_CREDIT_AGE_LIMIT = 17; // Must be under 17 at end of year

// ─── Other Dependent Credit ─────────────────────────────────────────
export const OTHER_DEPENDENT_CREDIT = 500;

// ─── Foreign Tax Credit Simplified Limit ────────────────────────────
export const FTC_SIMPLIFIED_LIMIT_MFJ = 600;

// ─── Underpayment Penalty ───────────────────────────────────────────
export const SAFE_HARBOR_RATE_HIGH_INCOME = 1.10; // 110% of prior year for AGI > $150K
export const SAFE_HARBOR_AGI_THRESHOLD = 150000;

// ─── 28% Rate Gain (Collectibles) ──────────────────────────────────
export const COLLECTIBLES_RATE = 0.28;

// ─── Unrecaptured Section 1250 Gain ─────────────────────────────────
export const UNRECAPTURED_1250_RATE = 0.25;
