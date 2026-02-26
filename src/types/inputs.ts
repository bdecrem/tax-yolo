// ─── W-2 Wage & Tax Statement ───────────────────────────────────────
export interface W2Data {
  employer: string;
  ein: string;
  wages: number;           // Box 1: Wages, tips, other compensation
  federalWithheld: number; // Box 2
  socialSecurityWages: number; // Box 3
  socialSecurityTax: number;   // Box 4
  medicareWages: number;       // Box 5
  medicareTax: number;         // Box 6
  stateWages: number;          // Box 16
  stateWithheld: number;       // Box 17
  localWages?: number;
  localWithheld?: number;
  box12?: { code: string; amount: number }[];
  box13?: { statutory: boolean; retirementPlan: boolean; thirdPartySickPay: boolean };
  box14?: { description: string; amount: number }[];
}

// ─── 1099-INT / 1099-DIV ────────────────────────────────────────────
export interface Form1099DivInt {
  payer: string;
  accountNumber?: string;
  // 1099-INT fields
  interestIncome?: number;          // Box 1
  earlyWithdrawalPenalty?: number;   // Box 2
  usSavingsBondInterest?: number;    // Box 3
  federalTaxWithheld?: number;       // Box 4
  taxExemptInterest?: number;        // Box 8
  specifiedPrivateActivityBondInterest?: number; // Box 9
  // 1099-DIV fields
  ordinaryDividends?: number;        // Box 1a
  qualifiedDividends?: number;       // Box 1b
  totalCapitalGainDistributions?: number; // Box 2a
  unrecapturedSection1250Gain?: number;   // Box 2b
  section1202Gain?: number;              // Box 2c
  collectiblesGain?: number;             // Box 2d
  section199ADividends?: number;         // Box 5
  foreignTaxPaid?: number;              // Box 7
  foreignCountry?: string;              // Box 8
  exemptInterestDividends?: number;      // Box 12
  specifiedPrivateActivityBondDividends?: number; // Box 13
  stateTaxWithheld?: number;
}

// ─── 1099-B / 8949 Summary ──────────────────────────────────────────
export type Form8949Box = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Form1099BEntry {
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustmentCode?: string;
  adjustmentAmount?: number;
  washSaleDisallowed?: number;
  gainLoss: number;
  box: Form8949Box;
}

export interface Form1099BSummary {
  broker: string;
  entries: Form1099BEntry[];
  // Aggregate totals by box
  shortTermBasisReported: number;    // Box A
  shortTermBasisNotReported: number; // Box B
  shortTermNotOn1099B: number;       // Box C
  longTermBasisReported: number;     // Box D
  longTermBasisNotReported: number;  // Box E
  longTermNotOn1099B: number;        // Box F
}

// ─── 1099-R (Retirement distributions) ──────────────────────────────
export interface Form1099R {
  payer: string;
  grossDistribution: number;      // Box 1
  taxableAmount: number;          // Box 2a
  taxableAmountNotDetermined: boolean; // Box 2b
  capitalGainAmount?: number;     // Box 3
  federalTaxWithheld: number;     // Box 4
  distributionCode: string;       // Box 7 (e.g., "02" for Roth conversion)
  iraSepSimple: boolean;          // IRA/SEP/SIMPLE checkbox
  totalDistribution: boolean;
  stateTaxWithheld?: number;
  stateDistribution?: number;
}

// ─── 1098 (Mortgage Interest) ───────────────────────────────────────
export interface Form1098 {
  lender: string;
  mortgageInterest: number;         // Box 1
  outstandingMortgagePrincipal: number; // Box 2
  mortgageOriginationDate: string;   // Box 3
  refundOfOverpaidInterest?: number; // Box 4
  mortgageInsurancePremiums?: number; // Box 5
  pointsPaid?: number;              // Box 6
  propertyAddress: string;
  acquisitionDate?: string;
  numberOfProperties?: number;
}

// ─── 1098-T (Tuition Statement) ────────────────────────────────────
export interface Form1098T {
  institution: string;
  studentName: string;
  amountsPaid: number;        // Box 1
  scholarships?: number;      // Box 5
  adjustmentsPriorYear?: number; // Box 4
  halfTime: boolean;          // Box 8
  graduate: boolean;          // Box 9
}

// ─── Crypto (from Koinly) ───────────────────────────────────────────
export interface CryptoData {
  shortTermGainLoss: number;
  longTermGainLoss: number;
  entries: Form1099BEntry[];
}

// ─── Property tax ───────────────────────────────────────────────────
export interface PropertyTaxPayment {
  jurisdiction: string;
  propertyAddress: string;
  amount: number;
  datePaid: string;
}

// ─── Charitable donations ───────────────────────────────────────────
export interface CharitableDonation {
  recipient: string;
  amount: number;
  type: 'cash' | 'noncash';
  date: string;
  acknowledgmentReceived: boolean;
}

// ─── Vehicle registration (CA VLF) ──────────────────────────────────
export interface VehicleRegistration {
  description: string;
  vlf: number;        // Vehicle License Fee (deductible as personal property tax)
  totalFee: number;
}

// ─── Backdoor Roth data ─────────────────────────────────────────────
export interface BackdoorRothData {
  spouse: 'taxpayer' | 'spouse';
  traditionalIRAContribution: number;  // Step 1: contribute to trad IRA
  rothConversionAmount: number;         // Step 2: convert to Roth
  priorYearBasis: number;              // Form 8606 line 2 carryover
  yearEndTraditionalIRABalance: number; // Year-end trad IRA value (for pro-rata)
  yearEndSEPIRABalance: number;         // Year-end SEP-IRA value (pro-rata risk!)
  yearEndSIMPLEIRABalance: number;      // Year-end SIMPLE IRA value
}

// ─── Prior year carryovers ──────────────────────────────────────────
export interface PriorYearCarryovers {
  capitalLossCarryover: {
    shortTerm: number;
    longTerm: number;
  };
  form8606Basis: {
    taxpayer: number;  // Prior year nondeductible IRA basis
    spouse: number;
  };
  foreignTaxCreditCarryover: number;
  charitableCarryover: number;
  priorYearOverpaymentApplied: number;
}

// ─── Estimated tax payments ─────────────────────────────────────────
export interface EstimatedPayments {
  federal: { q1: number; q2: number; q3: number; q4: number };
  california: { q1: number; q2: number; q3: number; q4: number };
}

// ─── Other income ───────────────────────────────────────────────────
export interface OtherIncome {
  description: string;
  amount: number;
  form?: string; // e.g., "1099-MISC", "1099-NEC"
}

// ─── Master input ───────────────────────────────────────────────────
export interface TaxReturnInput {
  taxYear: number;
  filingStatus: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';

  // Personal info
  taxpayer: { firstName: string; lastName: string; ssn: string; dateOfBirth: string; occupation: string };
  spouse: { firstName: string; lastName: string; ssn: string; dateOfBirth: string; occupation: string };
  dependents: {
    firstName: string;
    lastName: string;
    ssn: string;
    dateOfBirth: string;
    relationship: string;
    monthsLived: number;
    isStudent: boolean;
    isDisabled: boolean;
  }[];

  address: { street: string; city: string; state: string; zip: string };

  // Income documents
  w2s: W2Data[];
  form1099DivInts: Form1099DivInt[];
  form1099Bs: Form1099BSummary[];
  form1099Rs: Form1099R[];
  cryptoData?: CryptoData;
  otherIncome: OtherIncome[];

  // Deduction documents
  form1098s: Form1098[];
  form1098Ts: Form1098T[];
  propertyTaxPayments: PropertyTaxPayment[];
  charitableDonations: CharitableDonation[];
  vehicleRegistrations: VehicleRegistration[];

  // Retirement
  backdoorRothData: BackdoorRothData[];

  // Carryovers and payments
  priorYearCarryovers: PriorYearCarryovers;
  estimatedPayments: EstimatedPayments;

  // Withholding already captured in W2s, 1099s, 1099-Rs
}
