import type { TaxReturnInput } from '../types/inputs';

/**
 * Demo 2025 tax return data for Alex & Jordan Rivera.
 * This is fictional data designed to exercise the full tax engine.
 *
 * Household: MFJ, 2 dependents (college-age)
 * Key items: W-2 income, dividends, capital gains, backdoor Roth,
 *            mortgage interest, property tax, charitable donations
 */
export const seed2025: TaxReturnInput = {
  taxYear: 2025,
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

  // ─── W-2s ────────────────────────────────────────────────────
  w2s: [
    {
      employer: 'Redwood Technologies Inc',
      ein: '12-3456789',
      wages: 195000,
      federalWithheld: 36000,
      socialSecurityWages: 176100,
      socialSecurityTax: 10918,
      medicareWages: 195000,
      medicareTax: 2828,
      stateWages: 195000,
      stateWithheld: 15000,
    },
    {
      employer: 'San Jose Unified School District',
      ein: '94-1234567',
      wages: 55000,
      federalWithheld: 3500,
      socialSecurityWages: 55000,
      socialSecurityTax: 3410,
      medicareWages: 55000,
      medicareTax: 798,
      stateWages: 55000,
      stateWithheld: 2200,
      box13: { statutory: false, retirementPlan: true, thirdPartySickPay: false },
    },
  ],

  // ─── 1099-INT/DIV ───────────────────────────────────────────
  form1099DivInts: [
    {
      payer: 'Vanguard Brokerage',
      accountNumber: '4521-7890',
      ordinaryDividends: 48000,
      qualifiedDividends: 42000,
      section199ADividends: 2800,
    },
    {
      payer: 'Schwab Investments',
      accountNumber: '7890-1234',
      interestIncome: 350,
      ordinaryDividends: 1200,
      qualifiedDividends: 1100,
      taxExemptInterest: 18000,
    },
    {
      payer: 'Fidelity Growth Fund',
      accountNumber: '3456-5678',
      ordinaryDividends: 800,
      qualifiedDividends: 720,
      section199ADividends: 45,
    },
    {
      payer: 'TD Ameritrade',
      accountNumber: '6789-0123',
      interestIncome: 180,
    },
  ],

  // ─── 1099-B / Capital Gains ─────────────────────────────────
  form1099Bs: [
    {
      broker: 'Vanguard Brokerage',
      entries: [
        { description: 'VTI (Vanguard Total Stock Mkt)', dateAcquired: '2024-02-15', dateSold: '2025-07-20', proceeds: 185000, costBasis: 142000, gainLoss: 43000, box: 'D' as const },
        { description: 'VXUS (Vanguard Intl Stock)', dateAcquired: '2024-05-10', dateSold: '2025-09-15', proceeds: 92000, costBasis: 78500, gainLoss: 13500, box: 'D' as const },
      ],
      shortTermBasisReported: 0,
      shortTermBasisNotReported: 0,
      shortTermNotOn1099B: 0,
      longTermBasisReported: 56500,
      longTermBasisNotReported: 0,
      longTermNotOn1099B: 0,
    },
    {
      broker: 'Schwab Investments',
      entries: [
        { description: 'AAPL (Apple Inc)', dateAcquired: '2020-03-20', dateSold: '2025-04-10', proceeds: 125000, costBasis: 48000, gainLoss: 77000, box: 'D' as const },
        { description: 'MSFT (Microsoft)', dateAcquired: '2019-11-05', dateSold: '2025-06-22', proceeds: 98000, costBasis: 35000, gainLoss: 63000, box: 'D' as const },
      ],
      shortTermBasisReported: 0,
      shortTermBasisNotReported: 0,
      shortTermNotOn1099B: 0,
      longTermBasisReported: 140000,
      longTermBasisNotReported: 0,
      longTermNotOn1099B: 0,
    },
    {
      broker: 'Fidelity Growth Fund',
      entries: [
        { description: 'GOOG (Alphabet)', dateAcquired: '2025-01-15', dateSold: '2025-08-30', proceeds: 45000, costBasis: 38000, gainLoss: 7000, box: 'A' as const },
      ],
      shortTermBasisReported: 7000,
      shortTermBasisNotReported: 0,
      shortTermNotOn1099B: 0,
      longTermBasisReported: 0,
      longTermBasisNotReported: 0,
      longTermNotOn1099B: 0,
    },
  ],

  cryptoData: {
    shortTermGainLoss: 0,
    longTermGainLoss: 18500,
    entries: [
      {
        description: 'ETH (Ethereum)',
        dateAcquired: '2021-06-15',
        dateSold: '2025-10-01',
        proceeds: 32000,
        costBasis: 13500,
        gainLoss: 18500,
        box: 'F',
      },
    ],
  },

  // ─── 1099-R (Backdoor Roth) ─────────────────────────────────
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

  otherIncome: [],

  // ─── Form 1098 - Mortgage Interest ──────────────────────────
  form1098s: [
    {
      lender: 'Pacific Home Loans',
      mortgageInterest: 14500,
      outstandingMortgagePrincipal: 520000,
      mortgageOriginationDate: '2019-06-01',
      propertyAddress: '123 Oak Street, San Jose, CA 95110',
    },
  ],

  form1098Ts: [],

  // ─── Property Tax ───────────────────────────────────────────
  propertyTaxPayments: [
    {
      jurisdiction: 'Santa Clara County',
      propertyAddress: '123 Oak Street, San Jose, CA 95110',
      amount: 13400,
      datePaid: '2025-04-10',
    },
    {
      jurisdiction: 'Santa Clara County',
      propertyAddress: '123 Oak Street, San Jose, CA 95110',
      amount: 13900,
      datePaid: '2025-10-15',
    },
  ],

  // ─── Charitable Donations ───────────────────────────────────
  charitableDonations: [
    { recipient: 'United Way', amount: 1000, type: 'cash', date: '2025-06-15', acknowledgmentReceived: true },
    { recipient: 'Local Food Bank', amount: 500, type: 'cash', date: '2025-11-20', acknowledgmentReceived: true },
    { recipient: 'Red Cross', amount: 700, type: 'cash', date: '2025-12-01', acknowledgmentReceived: true },
  ],

  vehicleRegistrations: [
    { description: 'Vehicle', vlf: 520, totalFee: 520 },
  ],

  backdoorRothData: [
    {
      spouse: 'taxpayer',
      traditionalIRAContribution: 8000,
      rothConversionAmount: 7000,
      priorYearBasis: 7000,
      yearEndTraditionalIRABalance: 0,
      yearEndSEPIRABalance: 0,
      yearEndSIMPLEIRABalance: 0,
    },
    {
      spouse: 'spouse',
      traditionalIRAContribution: 8000,
      rothConversionAmount: 7000,
      priorYearBasis: 7000,
      yearEndTraditionalIRABalance: 0,
      yearEndSEPIRABalance: 0,
      yearEndSIMPLEIRABalance: 0,
    },
  ],

  // ─── Prior Year Carryovers ──────────────────────────────────
  priorYearCarryovers: {
    capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
    form8606Basis: { taxpayer: 7000, spouse: 7000 },
    foreignTaxCreditCarryover: 0,
    charitableCarryover: 0,
    priorYearOverpaymentApplied: 0,
  },

  estimatedPayments: {
    federal: { q1: 10000, q2: 10000, q3: 10000, q4: 10000 },
    california: { q1: 5000, q2: 5000, q3: 5000, q4: 5000 },
  },

};
