import { useTaxStore } from '../store/taxStore';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0 });

function FormLine({ line, label, amount }: { line: string; label: string; amount: number }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-1 pr-3 text-gray-400 text-xs w-12 text-right">{line}</td>
      <td className="py-1 text-sm">{label}</td>
      <td className="py-1 text-sm text-right font-mono w-28">{fmt(amount)}</td>
    </tr>
  );
}

export function FormPreview() {
  const { input, federalResult: fed, californiaResult: ca } = useTaxStore();

  if (!fed || !ca) {
    return <div className="text-center py-12 text-gray-400">Compute tax first to see form preview.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form 1040 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Form 1040 - U.S. Individual Income Tax Return (2025)</h2>
        <p className="text-xs text-gray-400 mb-4">{input.taxpayer.firstName} {input.taxpayer.lastName} & {input.spouse?.firstName} {input.spouse?.lastName} | MFJ</p>
        <table className="w-full">
          <tbody>
            <FormLine line="1" label="Wages, salaries, tips" amount={fed.income.wages} />
            <FormLine line="2a" label="Tax-exempt interest" amount={fed.income.taxExemptInterest} />
            <FormLine line="2b" label="Taxable interest" amount={fed.income.taxableInterest} />
            <FormLine line="3a" label="Qualified dividends" amount={fed.income.qualifiedDividends} />
            <FormLine line="3b" label="Ordinary dividends" amount={fed.income.ordinaryDividends} />
            <FormLine line="4a" label="IRA distributions" amount={fed.income.iraDistributions} />
            <FormLine line="4b" label="Taxable amount" amount={fed.income.iraDistributionsTaxable} />
            <FormLine line="7" label="Capital gain or (loss)" amount={fed.income.netShortTermGainLoss + fed.income.netLongTermGainLoss} />
            <FormLine line="8" label="Other income" amount={fed.income.otherIncome} />
            <FormLine line="9" label="Total income" amount={fed.income.totalIncome} />
            <FormLine line="11" label="Adjusted gross income" amount={fed.income.agi} />
            <FormLine line="12" label={`${fed.deductions.deductionUsed === 'standard' ? 'Standard' : 'Itemized'} deduction`} amount={fed.deductions.deductionAmount} />
            <FormLine line="13" label="Qualified business income deduction" amount={fed.deductions.qbiDeduction} />
            <FormLine line="14" label="Total deductions" amount={fed.deductions.totalDeductions} />
            <FormLine line="15" label="Taxable income" amount={fed.deductions.taxableIncome} />
            <FormLine line="16" label="Tax" amount={fed.taxComputation.tax} />
            <FormLine line="23" label="Other taxes (Sch 2)" amount={fed.otherTaxes} />
            <FormLine line="24" label="Total tax" amount={fed.totalTax} />
            <FormLine line="33" label="Total payments" amount={fed.totalPayments} />
            <FormLine line={fed.balanceDueOrRefund > 0 ? "37" : "34"} label={fed.balanceDueOrRefund > 0 ? "Amount you owe" : "Overpaid"} amount={Math.abs(fed.balanceDueOrRefund)} />
          </tbody>
        </table>
      </div>

      {/* Schedule A */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Schedule A - Itemized Deductions</h2>
        <table className="w-full">
          <tbody>
            <FormLine line="5e" label="State and local taxes (SALT, capped)" amount={fed.scheduleA.saltDeduction} />
            <FormLine line="" label={`(Before cap: ${fmt(fed.scheduleA.saltBeforeCap)})`} amount={0} />
            <FormLine line="8a" label="Home mortgage interest" amount={fed.scheduleA.mortgageInterest} />
            <FormLine line="14" label="Charitable contributions" amount={fed.scheduleA.totalCharitable} />
            <FormLine line="17" label="Total itemized deductions" amount={fed.scheduleA.totalItemized} />
            <FormLine line="" label={fed.scheduleA.usesItemized ? "Used: Itemized" : `Used: Standard ($${fmt(fed.deductions.standardDeduction)})`} amount={fed.deductions.deductionAmount} />
          </tbody>
        </table>
      </div>

      {/* Schedule D */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Schedule D - Capital Gains and Losses</h2>
        <table className="w-full">
          <tbody>
            <FormLine line="7" label="Net short-term gain/(loss)" amount={fed.scheduleD.netShortTermGainLoss} />
            <FormLine line="15" label="Net long-term gain/(loss)" amount={fed.scheduleD.netLongTermGainLoss} />
            <FormLine line="16" label="Combined gain/(loss)" amount={fed.scheduleD.netGainLoss} />
            <FormLine line="21" label="Tax computation method" amount={fed.taxComputation.tax} />
          </tbody>
        </table>
      </div>

      {/* Form 8960 - NIIT */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Form 8960 - Net Investment Income Tax</h2>
        <table className="w-full">
          <tbody>
            <FormLine line="8" label="Net investment income" amount={fed.form8960.netInvestmentIncome} />
            <FormLine line="13" label="MAGI" amount={fed.form8960.magi} />
            <FormLine line="14" label="Threshold" amount={fed.form8960.magiThreshold} />
            <FormLine line="15" label="MAGI excess" amount={fed.form8960.magiExcess} />
            <FormLine line="16" label="Lesser (NII or MAGI excess)" amount={fed.form8960.niitBase} />
            <FormLine line="17" label="NIIT (3.8%)" amount={fed.form8960.niit} />
          </tbody>
        </table>
      </div>

      {/* CA 540 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Form 540 - California Resident Income Tax Return</h2>
        <table className="w-full">
          <tbody>
            <FormLine line="13" label="Federal AGI" amount={ca.scheduleCA.federalAGI} />
            <FormLine line="17" label="CA adjusted gross income" amount={ca.scheduleCA.caAGI} />
            <FormLine line="18" label="CA itemized deductions" amount={ca.itemizedDeductions.totalCAItemized} />
            <FormLine line="19" label="Taxable income" amount={ca.taxComputation.taxableIncome} />
            <FormLine line="31" label="Tax" amount={ca.taxComputation.regularTax + ca.taxComputation.mentalHealthTax} />
            <FormLine line="32" label="Exemption credit" amount={ca.exemptionCredit.totalCredit} />
            <FormLine line="64" label="Total tax" amount={ca.totalTax} />
            <FormLine line="78" label="Total payments" amount={ca.totalPayments} />
            <FormLine line={ca.balanceDueOrRefund > 0 ? "100" : "91"} label={ca.balanceDueOrRefund > 0 ? "Tax due" : "Overpaid"} amount={Math.abs(ca.balanceDueOrRefund)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
