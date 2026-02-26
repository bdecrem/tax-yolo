# TaxYOLO

A client-side tax return calculator for federal (Form 1040) and California (Form 540) returns. MFJ households with capital gains, backdoor Roth, NIIT, and other common tax situations.

**No backend. No data leaves your browser.** Everything runs client-side with localStorage persistence.

## Quick Start

```bash
npm install
npm run dev
```

The app loads with demo data for a fictional household. Click "Compute Tax" to see the full computation.

## How to Use With Your Own Data

1. Edit `src/data/seed2025.ts` with your actual tax data (W-2s, 1099s, deductions, etc.)
2. Or use the web UI to enter data manually — it persists in localStorage
3. Click "Compute Tax" on the Dashboard
4. Review results on the Results and Form Preview tabs

## What It Computes

- **Federal**: Form 1040 with Schedule A, B, D, Schedule D Tax Worksheet, Forms 8606/8959/8960/8995-A/1116/2210
- **California**: Form 540 with Schedule CA, itemized deductions, exemption credit, mental health tax

The Schedule D Tax Worksheet is the most valuable computation — it applies preferential rates (0%/15%/20%) to qualified dividends and long-term capital gains, which can save tens of thousands in tax.

## Tax Years

- **2025**: Current year (brackets from IRS Rev. Proc. 2024-40, OBBBA SALT cap)
- **2024**: Regression test fixture validates the engine against known results

## Tech Stack

React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, react-router-dom

## Tests

```bash
npm test
```

Regression tests validate the tax engine computes correct results for a complete 2024 return.

## Disclaimer

This is a tax calculation tool, not tax advice. Always verify results against official IRS/FTB publications and consult a tax professional for your specific situation.
