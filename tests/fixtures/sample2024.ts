import type { TaxReturnInput } from '../../src/types/inputs';

/**
 * Demo 2024 tax return data for Alex & Jordan Rivera.
 * Fictional household designed to exercise the full tax engine:
 * - MFJ with 2 dependents (college students, 17+)
 * - Two W-2 earners
 * - Significant capital gains (triggers Schedule D Tax Worksheet)
 * - Backdoor Roth conversions (both spouses)
 * - Mortgage, property tax, charitable (itemized vs standard comparison)
 * - NIIT (AGI > $250K with investment income)
 *
 * Expected results are computed by running the tax engine on this data.
 */
export const sample2024Input: TaxReturnInput = {
  taxYear: 2024,
  filingStatus: 'mfj',

  taxpayer: {
    firstName: 'Alex',
    lastName: 'Rivera',
    ssn: '000-00-1234',
    dateOfBirth: '1975-06-15',
    occupation: 'Software Engineer',
  },
  spouse: {
    firstName: 'Jordan',
    lastName: 'Rivera',
    ssn: '000-00-5678',
    dateOfBirth: '1977-03-22',
    occupation: 'Teacher',
  },
  dependents: [
    {
      firstName: 'Maya',
      lastName: 'Rivera',
      ssn: '000-00-9012',
      dateOfBirth: '2005-08-10',
      relationship: 'daughter',
      monthsLived: 12,
      isStudent: true,
      isDisabled: false,
    },
    {
      firstName: 'Ethan',
      lastName: 'Rivera',
      ssn: '000-00-3456',
      dateOfBirth: '2006-11-03',
      relationship: 'son',
      monthsLived: 12,
      isStudent: true,
      isDisabled: false,
    },
  ],

  address: {
    street: '123 Oak Street',
    city: 'San Jose',
    state: 'CA',
    zip: '95110',
  },

  // ─── W-2s ───────────────────────────────────────────────────────
  w2s: [
    {
      employer: 'Redwood Technologies Inc',
      ein: '12-3456789',
      wages: 185000,
      federalWithheld: 35000,
      socialSecurityWages: 168600,
      socialSecurityTax: 10453,
      medicareWages: 185000,
      medicareTax: 2683,
      stateWages: 185000,
      stateWithheld: 14200,
    },
    {
      employer: 'San Jose Unified School District',
      ein: '94-1234567',
      wages: 52000,
      federalWithheld: 3200,
      socialSecurityWages: 52000,
      socialSecurityTax: 3224,
      medicareWages: 52000,
      medicareTax: 754,
      stateWages: 52000,
      stateWithheld: 2100,
      box13: { statutory: false, retirementPlan: true, thirdPartySickPay: false },
    },
  ],

  // ─── 1099-INT/DIV ──────────────────────────────────────────────
  form1099DivInts: [
    {
      payer: 'Vanguard Brokerage',
      ordinaryDividends: 48000,
      qualifiedDividends: 42000,
      section199ADividends: 2800,
    },
    {
      payer: 'Schwab Investments',
      interestIncome: 350,
      ordinaryDividends: 1200,
      qualifiedDividends: 1100,
      taxExemptInterest: 18000,
    },
    {
      payer: 'Fidelity Growth Fund',
      ordinaryDividends: 800,
      qualifiedDividends: 720,
      section199ADividends: 45,
    },
    {
      payer: 'TD Ameritrade',
      interestIncome: 180,
    },
  ],

  // ─── 1099-B / Schedule D ──────────────────────────────────────
  form1099Bs: [
    {
      broker: 'Various Brokers',
      entries: [],
      shortTermBasisReported: 18000,
      shortTermBasisNotReported: 0,
      shortTermNotOn1099B: 0,
      longTermBasisReported: 275000,
      longTermBasisNotReported: 0,
      longTermNotOn1099B: 0,
    },
  ],

  // ─── 1099-R (Backdoor Roth) ──────────────────────────────────
  form1099Rs: [
    {
      payer: 'Vanguard - Alex Rivera',
      grossDistribution: 7000,
      taxableAmount: 0,
      taxableAmountNotDetermined: false,
      federalTaxWithheld: 0,
      distributionCode: '02',
      iraSepSimple: true,
      totalDistribution: true,
    },
    {
      payer: 'Vanguard - Jordan Rivera',
      grossDistribution: 7000,
      taxableAmount: 0,
      taxableAmountNotDetermined: false,
      federalTaxWithheld: 0,
      distributionCode: '02',
      iraSepSimple: true,
      totalDistribution: true,
    },
  ],

  cryptoData: undefined,

  otherIncome: [],

  // ─── 1098 (Mortgage Interest) ────────────────────────────────
  form1098s: [
    {
      lender: 'Pacific Home Loans',
      mortgageInterest: 14500,
      outstandingMortgagePrincipal: 540000,
      mortgageOriginationDate: '2019-06-01',
      propertyAddress: '123 Oak Street, San Jose, CA 95110',
    },
  ],

  form1098Ts: [],

  // ─── Property Tax ────────────────────────────────────────────
  propertyTaxPayments: [
    {
      jurisdiction: 'Santa Clara County',
      propertyAddress: '123 Oak Street, San Jose, CA 95110',
      amount: 26000,
      datePaid: '2024-12-10',
    },
  ],

  // ─── Charitable ──────────────────────────────────────────────
  charitableDonations: [
    { recipient: 'United Way', amount: 1500, type: 'cash', date: '2024-06-15', acknowledgmentReceived: true },
    { recipient: 'Red Cross', amount: 700, type: 'cash', date: '2024-12-01', acknowledgmentReceived: true },
  ],

  // ─── Vehicle Registration (VLF) ──────────────────────────────
  vehicleRegistrations: [
    { description: 'Vehicle', vlf: 480, totalFee: 480 },
  ],

  // ─── Backdoor Roth ───────────────────────────────────────────
  backdoorRothData: [
    {
      spouse: 'taxpayer',
      traditionalIRAContribution: 7500,
      rothConversionAmount: 7000,
      priorYearBasis: 7000,
      yearEndTraditionalIRABalance: 0,
      yearEndSEPIRABalance: 0,
      yearEndSIMPLEIRABalance: 0,
    },
    {
      spouse: 'spouse',
      traditionalIRAContribution: 7500,
      rothConversionAmount: 7000,
      priorYearBasis: 7000,
      yearEndTraditionalIRABalance: 0,
      yearEndSEPIRABalance: 0,
      yearEndSIMPLEIRABalance: 0,
    },
  ],

  // ─── Prior Year Carryovers ───────────────────────────────────
  priorYearCarryovers: {
    capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
    form8606Basis: { taxpayer: 7000, spouse: 7000 },
    foreignTaxCreditCarryover: 0,
    charitableCarryover: 0,
    priorYearOverpaymentApplied: 8500,
  },

  // ─── Estimated Payments ──────────────────────────────────────
  estimatedPayments: {
    federal: { q1: 0, q2: 0, q3: 5000, q4: 0 },
    california: { q1: 0, q2: 0, q3: 0, q4: 0 },
  },
};

// ─── Expected results (computed by running the tax engine) ──────
export const expected2024Federal = {
  agi: 580530,
  taxableIncome: 550761,
  standardDeduction: 29200,
  qbiDeduction: 569,
  taxFromWorksheet: 89574,
  additionalMedicareTax: 0,
  niit: 12560,
  totalTax: 101134,
  totalPayments: 51700,
  balanceDue: 49434,
};

export const expected2024California = {
  caAGI: 580530,
  caItemizedDeductions: 37731,
  caTaxableIncome: 542799,
  caTax: 43565,
  caExemptionCredit: 292,
  caNetTax: 43296,
  caWithholding: 16300,
  caEstimatedPayments: 0,
  caTotalPayments: 16300,
  caBalanceDue: 26996,
};
