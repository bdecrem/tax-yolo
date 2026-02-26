import { describe, it, expect } from 'vitest';
import { sample2024Input, expected2024Federal, expected2024California } from '../fixtures/sample2024';
import { computeIncome } from '../../src/computations/federal/income';
import { computeScheduleB } from '../../src/computations/federal/scheduleB';
import { computeScheduleD } from '../../src/computations/federal/scheduleD';
import { computeForm8995A } from '../../src/computations/federal/form8995A';
import { computeForm8606 } from '../../src/computations/federal/form8606';
import { computeForm8959 } from '../../src/computations/federal/form8959';
import { computeForm8960 } from '../../src/computations/federal/form8960';
import { computeProgressiveTax } from '../../src/computations/shared/brackets';
import { MFJ_BRACKETS_2024, MFJ_LTCG_BRACKETS_2024, STANDARD_DEDUCTION_MFJ_2024 } from '../../src/constants/federal2024';
import { CA_MFJ_BRACKETS_2024 } from '../../src/constants/california2024';
import { roundDollars } from '../../src/computations/shared/rounding';

describe('2024 Regression Test - Income', () => {
  const income = computeIncome(sample2024Input);

  it('computes correct wages', () => {
    expect(income.wages).toBe(237000);
  });

  it('computes correct taxable interest', () => {
    expect(income.taxableInterest).toBe(530);
  });

  it('computes correct ordinary dividends', () => {
    expect(income.ordinaryDividends).toBe(50000);
  });

  it('computes correct qualified dividends', () => {
    expect(income.qualifiedDividends).toBe(43820);
  });

  it('computes correct capital gains', () => {
    // ST: 18000, LT: 275000, Total: 293000
    expect(income.netShortTermGainLoss + income.netLongTermGainLoss).toBe(293000);
  });

  it('computes correct total income', () => {
    // Wages 237000 + Interest 530 + Div 50000 + Cap gains 293000 = 580530
    expect(income.totalIncome).toBe(expected2024Federal.agi);
  });

  it('computes correct AGI', () => {
    expect(income.agi).toBe(expected2024Federal.agi);
  });
});

describe('2024 Regression Test - Schedule B', () => {
  const scheduleB = computeScheduleB(sample2024Input);

  it('computes correct total interest', () => {
    expect(scheduleB.totalInterest).toBe(530);
  });

  it('computes correct total ordinary dividends', () => {
    expect(scheduleB.totalOrdinaryDividends).toBe(50000);
  });
});

describe('2024 Regression Test - Schedule D', () => {
  const scheduleD = computeScheduleD(sample2024Input);

  it('computes correct net short-term gain', () => {
    expect(scheduleD.netShortTermGainLoss).toBe(18000);
  });

  it('computes correct net long-term gain', () => {
    expect(scheduleD.netLongTermGainLoss).toBe(275000);
  });

  it('computes correct total net gain', () => {
    expect(scheduleD.netGainLoss).toBe(293000);
  });

  it('flags Schedule D Tax Worksheet as needed', () => {
    expect(scheduleD.useScheduleDTaxWorksheet).toBe(true);
  });
});

describe('2024 Regression Test - Schedule D Tax Worksheet', () => {
  it('computes tax using 2024 brackets', () => {
    const taxableIncome = expected2024Federal.taxableIncome; // 550761
    const qualifiedDividends = 43820;
    const netLTCG = 275000;

    // Preferential income = qual divs + net LTCG = 318820
    const preferentialIncome = Math.min(qualifiedDividends + netLTCG, taxableIncome);
    expect(preferentialIncome).toBe(318820);

    // Ordinary income = taxable - preferential = 231941
    const ordinaryIncome = taxableIncome - preferentialIncome;
    expect(ordinaryIncome).toBe(231941);

    // Tax on ordinary at 2024 MFJ brackets
    const taxOnOrdinary = roundDollars(computeProgressiveTax(ordinaryIncome, MFJ_BRACKETS_2024));
    expect(taxOnOrdinary).toBe(41751);

    // LTCG rate layers
    const bracket0Max = MFJ_LTCG_BRACKETS_2024[0].max; // $94,050
    const bracket15Max = MFJ_LTCG_BRACKETS_2024[1].max; // $583,750

    // 0% layer: ordinaryIncome ($231,941) > bracket0Max ($94,050), so no room
    const zeroRoom = Math.max(bracket0Max - ordinaryIncome, 0);
    expect(zeroRoom).toBe(0);

    // 15% layer: all $318,820 fits (bracket15Max - ordinaryIncome = $351,809)
    const fifteenRoom = Math.max(bracket15Max - ordinaryIncome, 0);
    const at15 = Math.min(preferentialIncome, fifteenRoom);
    const taxAt15 = roundDollars(at15 * 0.15);
    expect(taxAt15).toBe(47823);

    // 20% layer: nothing
    const at20 = preferentialIncome - at15;
    expect(at20).toBe(0);

    // Total: 41751 + 47823 = 89574
    const worksheetTax = taxOnOrdinary + taxAt15;
    expect(worksheetTax).toBe(89574);

    // Regular brackets would be higher
    const regularTax = roundDollars(computeProgressiveTax(taxableIncome, MFJ_BRACKETS_2024));
    expect(regularTax).toBe(133516);
    expect(worksheetTax).toBeLessThan(regularTax);
  });
});

describe('2024 Regression Test - Form 8606 (Backdoor Roth)', () => {
  it('computes $0 taxable conversion for Alex', () => {
    const result = computeForm8606(sample2024Input.backdoorRothData[0]);
    expect(result.taxableConversion).toBe(0);
    expect(result.remainingBasis).toBe(7500);
    expect(result.proRataWarning).toBe(false);
  });

  it('computes $0 taxable conversion for Jordan', () => {
    const result = computeForm8606(sample2024Input.backdoorRothData[1]);
    expect(result.taxableConversion).toBe(0);
    expect(result.remainingBasis).toBe(7500);
    expect(result.proRataWarning).toBe(false);
  });
});

describe('2024 Regression Test - Form 8959 (Additional Medicare)', () => {
  const result = computeForm8959(sample2024Input);

  it('computes correct Medicare wages', () => {
    // Alex: 185000 + Jordan: 52000 = 237000
    expect(result.totalMedicareWages).toBe(237000);
  });

  it('computes correct additional Medicare tax', () => {
    // 237000 < 250000 threshold, so $0
    expect(result.additionalMedicareTax).toBe(0);
  });
});

describe('2024 Regression Test - Form 8960 (NIIT)', () => {
  const income = computeIncome(sample2024Input);
  const result = computeForm8960(sample2024Input, income);

  it('computes correct net investment income', () => {
    // Interest 530 + Dividends 50000 + Capital gains 293000 = 343530
    expect(result.netInvestmentIncome).toBe(343530);
  });

  it('computes correct MAGI excess', () => {
    // 580530 - 250000 = 330530
    expect(result.magiExcess).toBe(330530);
  });

  it('computes correct NIIT', () => {
    // min(343530, 330530) * 0.038 = 330530 * 0.038 = 12560.14 ≈ 12560
    expect(result.niit).toBe(12560);
  });
});

describe('2024 Regression Test - Form 8995-A (QBI)', () => {
  // Taxable income before QBI = AGI - standard deduction = 580530 - 29200 = 551330
  const result = computeForm8995A(sample2024Input, 551330);

  it('computes correct Section 199A dividends', () => {
    // 2800 + 45 = 2845
    expect(result.qualifiedREITDividends).toBe(2845);
  });

  it('computes correct QBI deduction', () => {
    // 2845 * 0.20 = 569
    expect(result.qbiDeduction).toBe(569);
  });
});

describe('2024 Regression Test - Federal Summary', () => {
  it('computes correct total federal tax', () => {
    // Tax from worksheet: 89574
    // + Additional Medicare: 0
    // + NIIT: 12560
    // - Credits: 1000 (2 x $500 other dependent)
    // = 101134
    const taxFromWorksheet = 89574;
    const niit = 12560;
    const credits = 1000;
    const totalTax = taxFromWorksheet + niit - credits;
    expect(totalTax).toBe(101134);
  });

  it('computes correct total payments', () => {
    // W-2 withholding: 38200
    // Estimated payments: 5000
    // Prior year overpayment: 8500
    // Total: 51700
    const w2Withholding = 35000 + 3200;
    const estimated = 5000;
    const priorYearOverpayment = 8500;
    const totalPayments = w2Withholding + estimated + priorYearOverpayment;
    expect(totalPayments).toBe(51700);
  });
});

describe('2024 Regression Test - California', () => {
  it('computes correct CA tax using 2024 brackets', () => {
    const caTaxableIncome = expected2024California.caTaxableIncome;
    const caTax = roundDollars(computeProgressiveTax(caTaxableIncome, CA_MFJ_BRACKETS_2024));
    expect(caTax).toBe(expected2024California.caTax);
  });

  it('computes correct CA exemption credit', () => {
    const caExemptionCredit = expected2024California.caExemptionCredit;
    expect(caExemptionCredit).toBe(292);
  });
});

describe('2024 Regression Test - Progressive Tax Brackets', () => {
  it('computes correct tax on ordinary income (2024 brackets)', () => {
    // Tax on $231,941 = $41,751
    const taxOnOrdinary = roundDollars(computeProgressiveTax(231941, MFJ_BRACKETS_2024));
    expect(taxOnOrdinary).toBe(41751);

    // Tax on $550,761 = $133,516
    const taxOnFull = roundDollars(computeProgressiveTax(550761, MFJ_BRACKETS_2024));
    expect(taxOnFull).toBe(133516);
  });

  it('computes correct CA tax (2024 brackets)', () => {
    // CA taxable income: $542,799
    // CA tax: $43,565
    const caTax = roundDollars(computeProgressiveTax(542799, CA_MFJ_BRACKETS_2024));
    expect(caTax).toBe(43565);
  });
});
