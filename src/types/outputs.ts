// ─── Federal output types ───────────────────────────────────────────

export interface IncomeResult {
  wages: number;
  taxableInterest: number;
  taxExemptInterest: number;
  ordinaryDividends: number;
  qualifiedDividends: number;
  netShortTermGainLoss: number;
  netLongTermGainLoss: number;
  netCapitalGainLoss: number;           // After $3K loss limit
  capitalLossCarryoverToNextYear: { shortTerm: number; longTerm: number };
  iraDistributions: number;
  iraDistributionsTaxable: number;
  otherIncome: number;
  totalIncome: number;
  adjustments: number;
  agi: number;
}

export interface ScheduleBResult {
  interestItems: { payer: string; amount: number }[];
  totalInterest: number;
  dividendItems: { payer: string; amount: number }[];
  totalOrdinaryDividends: number;
  hasForeignAccounts: boolean;
}

export interface ScheduleDResult {
  shortTermTotals: {
    proceeds: number;
    costBasis: number;
    adjustments: number;
    gainLoss: number;
  };
  longTermTotals: {
    proceeds: number;
    costBasis: number;
    adjustments: number;
    gainLoss: number;
  };
  netShortTermGainLoss: number;
  netLongTermGainLoss: number;
  netGainLoss: number;
  capitalLossDeduction: number;
  capitalLossCarryover: { shortTerm: number; longTerm: number };
  useScheduleDTaxWorksheet: boolean;   // True if net LTCG or qualified dividends
  use28PercentRateWorksheet: boolean;  // True if collectibles gain
}

export interface ScheduleDTaxWorksheetResult {
  taxableIncome: number;               // Line 1
  qualifiedDividends: number;          // Line 5
  netLTCG: number;                     // (from Sch D)
  preferentialIncome: number;          // Line 7: qual divs + net LTCG
  ordinaryIncome: number;             // Line 10: taxable - preferential
  taxOnOrdinaryIncome: number;        // Line 11
  taxAt0Percent: number;              // Lines 12-15
  taxAt15Percent: number;             // Lines 16-19
  taxAt20Percent: number;             // Lines 20-22
  totalPreferentialTax: number;       // Sum of preferential layers
  totalTax: number;                   // Line 24: ordinary + preferential
  regularTax: number;                 // Line 25: tax from regular brackets
  finalTax: number;                   // Line 26: min(total, regular) - always total for this household
}

export interface ScheduleAResult {
  medicalExpenses: number;
  saltDeduction: number;               // Capped per OBBBA rules
  saltBeforeCap: number;
  mortgageInterest: number;
  charitableCash: number;
  charitableNonCash: number;
  totalCharitable: number;
  totalItemized: number;
  usesItemized: boolean;               // Federal: usually false (standard > itemized after SALT cap)
}

export interface DeductionResult {
  standardDeduction: number;
  itemizedDeduction: number;
  deductionUsed: 'standard' | 'itemized';
  deductionAmount: number;
  qbiDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
}

export interface TaxComputationResult {
  method: 'scheduleD_worksheet' | 'regular_brackets' | 'qualified_div_worksheet';
  tax: number;
}

export interface Form8606Result {
  spouse: 'taxpayer' | 'spouse';
  currentYearContribution: number;
  priorYearBasis: number;
  totalBasis: number;
  yearEndIRAValue: number;          // Including SEP/SIMPLE
  conversionAmount: number;
  taxableConversion: number;        // Should be ~$0 if clean backdoor
  remainingBasis: number;
  proRataWarning: boolean;          // True if SEP/SIMPLE balance > 0
}

export interface Form8959Result {
  totalMedicareWages: number;
  threshold: number;
  excessWages: number;
  additionalMedicareTax: number;        // 0.9%
  medicareWithheld: number;
  additionalTaxOwed: number;
}

export interface Form8960Result {
  netInvestmentIncome: number;
  magi: number;
  magiThreshold: number;
  magiExcess: number;
  niitBase: number;                     // Lesser of NII or MAGI excess
  niit: number;                         // 3.8%
}

export interface Form8995AResult {
  qualifiedREITDividends: number;       // Section 199A
  qbiDeduction: number;                 // 20% of qualified REIT dividends
  taxableIncomeBeforeQBI: number;
  taxableIncomeLimitation: number;
}

export interface Form1116Result {
  foreignTaxPaid: number;
  foreignSourceIncome: number;
  creditLimitation: number;
  creditAllowed: number;
  creditCarryover: number;
}

export interface Form2210Result {
  requiredAnnualPayment: number;         // 110% of prior year tax (AGI > $150K)
  priorYearTax: number;
  currentYearTax: number;
  totalPaymentsAndCredits: number;
  underpaymentAmount: number;
  penaltyDue: number;
  safeHarborMet: boolean;
}

// ─── Federal pipeline result ────────────────────────────────────────
export interface FederalTaxResult {
  income: IncomeResult;
  scheduleB: ScheduleBResult;
  scheduleD: ScheduleDResult;
  scheduleDTaxWorksheet?: ScheduleDTaxWorksheetResult;
  scheduleA: ScheduleAResult;
  deductions: DeductionResult;
  taxComputation: TaxComputationResult;
  form8606: Form8606Result[];
  form8959: Form8959Result;
  form8960: Form8960Result;
  form8995A: Form8995AResult;
  form1116: Form1116Result;

  // 1040 summary
  totalTax: number;
  totalCredits: number;
  otherTaxes: number;           // NIIT + Additional Medicare
  totalPayments: number;        // Withholding + estimated + prior year overpayment
  balanceDueOrRefund: number;   // Positive = due, negative = refund
}

// ─── California output types ────────────────────────────────────────

export interface ScheduleCAResult {
  federalAGI: number;
  caAdjustments: number;
  caAGI: number;
}

export interface CAItemizedDeductionResult {
  federalItemized: number;
  saltAddBack: number;                  // Add back state income tax deduction
  saltCapReversal: number;              // Undo federal SALT cap - allow full property tax
  miscDeductions: number;               // 2% floor deductions (CA still allows)
  agiPhaseoutReduction: number;         // 6% of AGI excess, max 80% reduction
  totalCAItemized: number;
  usesItemized: boolean;                // CA: usually true (no SALT cap)
}

export interface CAExemptionCreditResult {
  personalCredits: number;              // $144/person
  dependentCredits: number;             // $446/dependent
  totalBeforePhaseout: number;
  phaseoutReduction: number;
  totalCredit: number;
}

export interface CATaxComputationResult {
  taxableIncome: number;
  regularTax: number;
  mentalHealthTax: number;              // 1% on income > $1M
  totalTax: number;
  exemptionCredit: number;
  otherCredits: number;
  taxAfterCredits: number;
}

export interface CaliforniaTaxResult {
  scheduleCA: ScheduleCAResult;
  itemizedDeductions: CAItemizedDeductionResult;
  exemptionCredit: CAExemptionCreditResult;
  taxComputation: CATaxComputationResult;

  totalTax: number;
  totalPayments: number;               // Withholding + estimated
  balanceDueOrRefund: number;
}

// ─── Combined result ────────────────────────────────────────────────
export interface TaxReturnResult {
  federal: FederalTaxResult;
  california: CaliforniaTaxResult;
}
