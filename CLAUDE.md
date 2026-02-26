# TaxYOLO — Project Guide

## What this is

A client-side React app that computes a complete draft federal (Form 1040) and California (Form 540) tax return for a married-filing-jointly household with dependents.

The app includes demo data for a fictional household (Alex & Jordan Rivera, 2 dependents) that exercises the full tax engine. Replace the seed data with your own numbers to compute your return.

## Tech stack

React 19 + Vite + TypeScript 5.9 + Tailwind CSS 4 + Zustand 5 + react-router-dom 7. No backend. Pure client-side with localStorage persistence.

## Project structure

```
src/
  types/           # TaxReturnInput, output types for all forms
  constants/       # Tax brackets, thresholds (federal2024, federal2025, california2024, california2025)
  computations/
    federal/       # income, scheduleA, scheduleB, scheduleD, scheduleDTaxWorksheet,
                   # form8606, form8959, form8960, form8995A, form1116, form2210, pipeline
    california/    # scheduleCA, itemizedDeductions, exemptionCredit, taxComputation, pipeline
    shared/        # brackets.ts (progressive tax), rounding.ts
  data/            # seed2025.ts (demo data, replace with your own)
  store/           # Zustand store + localStorage
  components/      # Dashboard, W2Form, Form1099Entry, DeductionsForm, RetirementForm,
                   # PaymentsForm, ResultsView, FormPreview, CurrencyInput, Layout
  hooks/           # useComputation
tests/
  computations/    # regression2024.test.ts
  fixtures/        # sample2024.ts (demo 2024 data + expected results)
```

## How the tax engine works

- **Pure functions**: Each form/schedule is a standalone module: `(inputs) => typed result`
- **Pipeline**: `pipeline.ts` wires them in dependency order
- **Schedule D Tax Worksheet**: The most critical computation — layers qualified dividends + net LTCG at 0%/15%/20% preferential rates on top of ordinary income. Can save tens of thousands in tax.
- **California key difference**: No preferential capital gains rate. All income taxed at ordinary rates. Also: no SALT cap (full property tax deductible), 6% AGI phaseout on itemized deductions.

## Key tax items handled

- W-2 wages (multiple employers)
- 1099-INT/DIV (interest, dividends, qualified dividends, Section 199A)
- 1099-B capital gains (short-term and long-term, multiple brokers)
- Crypto capital gains
- Schedule D Tax Worksheet (preferential rates for qualified dividends + LTCG)
- Schedule A itemized deductions (SALT cap, mortgage interest, charitable)
- SALT cap with OBBBA 2025 phaseout
- Form 8606 (backdoor Roth IRA)
- Form 8959 (Additional Medicare Tax)
- Form 8960 (Net Investment Income Tax / NIIT)
- Form 8995-A (QBI / Section 199A deduction)
- Form 1116 (Foreign Tax Credit)
- California Form 540 with Schedule CA
- California itemized deductions with AGI phaseout
- California exemption credit with income phaseout

## Commands

```bash
npm run dev           # Dev server
npm test              # Run vitest
npm run build         # Production build
```
