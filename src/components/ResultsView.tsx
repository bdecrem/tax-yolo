import { useTaxStore } from '../store/taxStore';
import { useComputation } from '../hooks/useComputation';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

function WaterfallRow({ label, amount, indent = 0, bold = false, color }: {
  label: string; amount: number; indent?: number; bold?: boolean; color?: 'red' | 'green';
}) {
  return (
    <tr className={`border-b last:border-b-0 ${bold ? 'font-semibold' : ''}`}>
      <td className="py-1.5" style={{ paddingLeft: `${indent * 20 + 8}px` }}>{label}</td>
      <td className={`py-1.5 text-right pr-2 ${color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : ''}`}>
        {fmt(amount)}
      </td>
    </tr>
  );
}

export function ResultsView() {
  const { input, federalResult: fed, californiaResult: ca } = useTaxStore();
  const { compute } = useComputation();

  if (!fed || !ca) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">No results computed yet.</p>
        <button onClick={compute} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Compute Tax
        </button>
      </div>
    );
  }

  const tpName = input.taxpayer.firstName;
  const spName = input.spouse?.firstName ?? 'Spouse';

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Federal */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Federal (Form 1040)</h2>
        <table className="w-full text-sm">
          <tbody>
            <WaterfallRow label="Wages" amount={fed.income.wages} />
            <WaterfallRow label="Taxable interest" amount={fed.income.taxableInterest} indent={1} />
            <WaterfallRow label="Ordinary dividends" amount={fed.income.ordinaryDividends} indent={1} />
            <WaterfallRow label="Capital gain/loss" amount={fed.income.netShortTermGainLoss + fed.income.netLongTermGainLoss} indent={1} />
            <WaterfallRow label="IRA distributions (taxable)" amount={fed.income.iraDistributionsTaxable} indent={1} />
            <WaterfallRow label="Other income" amount={fed.income.otherIncome} indent={1} />
            <WaterfallRow label="Total Income" amount={fed.income.totalIncome} bold />
            <WaterfallRow label="Adjusted Gross Income" amount={fed.income.agi} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label={`Deduction (${fed.deductions.deductionUsed})`} amount={-fed.deductions.deductionAmount} />
            <WaterfallRow label="QBI deduction" amount={-fed.deductions.qbiDeduction} indent={1} />
            <WaterfallRow label="Taxable Income" amount={fed.deductions.taxableIncome} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label={`Tax (${fed.taxComputation.method})`} amount={fed.taxComputation.tax} />
            <WaterfallRow label="Additional Medicare Tax" amount={fed.form8959.additionalMedicareTax} indent={1} />
            <WaterfallRow label="NIIT" amount={fed.form8960.niit} indent={1} />
            <WaterfallRow label="Credits" amount={-fed.totalCredits} indent={1} />
            <WaterfallRow label="Total Tax" amount={fed.totalTax} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label="Total Payments" amount={fed.totalPayments} />
            <WaterfallRow
              label={fed.balanceDueOrRefund > 0 ? "Balance Due" : "Refund"}
              amount={Math.abs(fed.balanceDueOrRefund)}
              bold
              color={fed.balanceDueOrRefund > 0 ? 'red' : 'green'}
            />
          </tbody>
        </table>
      </div>

      {/* California */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">California (Form 540)</h2>
        <table className="w-full text-sm">
          <tbody>
            <WaterfallRow label="Federal AGI" amount={ca.scheduleCA.federalAGI} />
            <WaterfallRow label="CA adjustments" amount={ca.scheduleCA.caAdjustments} indent={1} />
            <WaterfallRow label="CA AGI" amount={ca.scheduleCA.caAGI} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label={ca.itemizedDeductions.usesItemized ? "Itemized deductions" : "Standard deduction"} amount={-(ca.itemizedDeductions.usesItemized ? ca.itemizedDeductions.totalCAItemized : 0)} />
            {ca.itemizedDeductions.usesItemized && (
              <WaterfallRow label="AGI phaseout reduction" amount={ca.itemizedDeductions.agiPhaseoutReduction} indent={1} />
            )}
            <WaterfallRow label="CA Taxable Income" amount={ca.taxComputation.taxableIncome} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label="Regular tax" amount={ca.taxComputation.regularTax} />
            <WaterfallRow label="Mental Health Tax" amount={ca.taxComputation.mentalHealthTax} indent={1} />
            <WaterfallRow label="Exemption credit" amount={-ca.exemptionCredit.totalCredit} indent={1} />
            <WaterfallRow label="Total CA Tax" amount={ca.totalTax} bold />
            <tr><td colSpan={2} className="py-1" /></tr>
            <WaterfallRow label="Total Payments" amount={ca.totalPayments} />
            <WaterfallRow
              label={ca.balanceDueOrRefund > 0 ? "Balance Due" : "Refund"}
              amount={Math.abs(ca.balanceDueOrRefund)}
              bold
              color={ca.balanceDueOrRefund > 0 ? 'red' : 'green'}
            />
          </tbody>
        </table>
      </div>

      {/* Schedule D Tax Worksheet detail */}
      {fed.scheduleDTaxWorksheet && (
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule D Tax Worksheet</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <table className="w-full">
                <tbody>
                  <WaterfallRow label="Taxable income" amount={fed.scheduleDTaxWorksheet.taxableIncome} />
                  <WaterfallRow label="Qualified dividends" amount={fed.scheduleDTaxWorksheet.qualifiedDividends} />
                  <WaterfallRow label="Net LTCG" amount={fed.scheduleDTaxWorksheet.netLTCG} />
                  <WaterfallRow label="Preferential income" amount={fed.scheduleDTaxWorksheet.preferentialIncome} bold />
                  <WaterfallRow label="Ordinary income" amount={fed.scheduleDTaxWorksheet.ordinaryIncome} bold />
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full">
                <tbody>
                  <WaterfallRow label="Tax on ordinary income" amount={fed.scheduleDTaxWorksheet.taxOnOrdinaryIncome} />
                  <WaterfallRow label="Tax at 0%" amount={fed.scheduleDTaxWorksheet.taxAt0Percent} />
                  <WaterfallRow label="Tax at 15%" amount={fed.scheduleDTaxWorksheet.taxAt15Percent} />
                  <WaterfallRow label="Tax at 20%" amount={fed.scheduleDTaxWorksheet.taxAt20Percent} />
                  <WaterfallRow label="Total (preferential rates)" amount={fed.scheduleDTaxWorksheet.totalTax} bold />
                  <WaterfallRow label="Regular brackets would be" amount={fed.scheduleDTaxWorksheet.regularTax} />
                  <WaterfallRow label="Savings from pref. rates" amount={fed.scheduleDTaxWorksheet.regularTax - fed.scheduleDTaxWorksheet.finalTax} bold color="green" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Form 8606 */}
      {fed.form8606.length > 0 && (
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Form 8606 - Backdoor Roth</h2>
          <div className="grid grid-cols-2 gap-4">
            {fed.form8606.map((f, i) => (
              <div key={i} className="text-sm">
                <h3 className="font-medium mb-2">{f.spouse === 'taxpayer' ? tpName : spName}</h3>
                <table className="w-full">
                  <tbody>
                    <WaterfallRow label="Contribution" amount={f.currentYearContribution} />
                    <WaterfallRow label="Prior basis" amount={f.priorYearBasis} />
                    <WaterfallRow label="Total basis" amount={f.totalBasis} />
                    <WaterfallRow label="Conversion" amount={f.conversionAmount} />
                    <WaterfallRow label="Taxable portion" amount={f.taxableConversion} color={f.taxableConversion > 0 ? 'red' : undefined} />
                    <WaterfallRow label="Remaining basis" amount={f.remainingBasis} />
                  </tbody>
                </table>
                {f.proRataWarning && (
                  <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded">Pro-rata rule triggered!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
