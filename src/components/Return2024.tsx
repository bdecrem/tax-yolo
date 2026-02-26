import { sample2024Input, expected2024Federal, expected2024California } from '../../tests/fixtures/sample2024';

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

function Spacer() {
  return <tr><td colSpan={2} className="py-1" /></tr>;
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-5 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Return2024() {
  const input = sample2024Input;
  const fed = expected2024Federal;
  const ca = expected2024California;

  // Derived values from input data
  const wages = input.w2s.reduce((s, w) => s + w.wages, 0);
  const taxableInterest = input.form1099DivInts.reduce((s, f) => s + (f.interestIncome ?? 0), 0);
  const ordinaryDividends = input.form1099DivInts.reduce((s, f) => s + (f.ordinaryDividends ?? 0), 0);
  const qualifiedDividends = input.form1099DivInts.reduce((s, f) => s + (f.qualifiedDividends ?? 0), 0);
  const capitalGainsST = input.form1099Bs.reduce((s, b) => s + b.shortTermBasisReported + b.shortTermBasisNotReported + b.shortTermNotOn1099B, 0);
  const capitalGainsLT = input.form1099Bs.reduce((s, b) => s + b.longTermBasisReported + b.longTermBasisNotReported + b.longTermNotOn1099B, 0);
  const totalCapitalGains = capitalGainsST + capitalGainsLT;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">2024 Tax Return</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Demo data</span>
      </div>

      {/* Top row: Federal + California summaries */}
      <div className="grid grid-cols-2 gap-6">
        {/* Federal */}
        <Card title="Federal (Form 1040)">
          <table className="w-full text-sm">
            <tbody>
              <WaterfallRow label="Wages (1z)" amount={wages} />
              <WaterfallRow label="Taxable interest (2b)" amount={taxableInterest} indent={1} />
              <WaterfallRow label="Ordinary dividends (3b)" amount={ordinaryDividends} indent={1} />
              <WaterfallRow label="Capital gain (7)" amount={totalCapitalGains} indent={1} />
              <WaterfallRow label="Adjusted Gross Income (11)" amount={fed.agi} bold />
              <Spacer />
              <WaterfallRow label="Standard deduction (12)" amount={-fed.standardDeduction} />
              <WaterfallRow label="QBI deduction (13)" amount={-fed.qbiDeduction} indent={1} />
              <WaterfallRow label="Taxable Income (15)" amount={fed.taxableIncome} bold />
              <Spacer />
              <WaterfallRow label="Tax (16)" amount={fed.taxFromWorksheet} />
              <WaterfallRow label="Additional Medicare Tax" amount={fed.additionalMedicareTax} indent={1} />
              <WaterfallRow label="NIIT" amount={fed.niit} indent={1} />
              <WaterfallRow label="Total Tax (24)" amount={fed.totalTax} bold />
              <Spacer />
              <WaterfallRow label="Total Payments (33)" amount={fed.totalPayments} />
              <WaterfallRow label="Balance Due (37)" amount={fed.balanceDue} bold color="red" />
            </tbody>
          </table>
        </Card>

        {/* California */}
        <Card title="California (Form 540)">
          <table className="w-full text-sm">
            <tbody>
              <WaterfallRow label="Federal AGI (13)" amount={ca.caAGI} />
              <WaterfallRow label="CA AGI (17)" amount={ca.caAGI} bold />
              <Spacer />
              <WaterfallRow label="CA itemized deductions (18)" amount={-ca.caItemizedDeductions} />
              <WaterfallRow label="CA Taxable Income (19)" amount={ca.caTaxableIncome} bold />
              <Spacer />
              <WaterfallRow label="CA tax (31)" amount={ca.caTax} />
              <WaterfallRow label="Exemption credit (32)" amount={-ca.caExemptionCredit} indent={1} />
              <WaterfallRow label="CA Net Tax (64)" amount={ca.caNetTax} bold />
              <Spacer />
              <WaterfallRow label="CA withholding (71)" amount={ca.caWithholding} />
              <WaterfallRow label="Total CA Payments (78)" amount={ca.caTotalPayments} />
              <WaterfallRow label="Balance Due (100)" amount={ca.caBalanceDue} bold color="red" />
            </tbody>
          </table>
        </Card>
      </div>

      {/* W-2 Summary */}
      <Card title="W-2 Summary" className="col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 px-2">Employer</th>
                <th className="py-2 px-2 text-right">Wages</th>
                <th className="py-2 px-2 text-right">Fed W/H</th>
                <th className="py-2 px-2 text-right">SS Wages</th>
                <th className="py-2 px-2 text-right">Medicare Wages</th>
                <th className="py-2 px-2 text-right">State Wages</th>
                <th className="py-2 px-2 text-right">State W/H</th>
              </tr>
            </thead>
            <tbody>
              {input.w2s.map((w, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-1.5 px-2">{w.employer}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.wages)}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.federalWithheld)}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.socialSecurityWages)}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.medicareWages)}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.stateWages)}</td>
                  <td className="py-1.5 px-2 text-right">{fmt(w.stateWithheld)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-1.5 px-2">Total</td>
                <td className="py-1.5 px-2 text-right">{fmt(wages)}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.w2s.reduce((s, w) => s + w.federalWithheld, 0))}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.w2s.reduce((s, w) => s + w.socialSecurityWages, 0))}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.w2s.reduce((s, w) => s + w.medicareWages, 0))}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.w2s.reduce((s, w) => s + w.stateWages, 0))}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.w2s.reduce((s, w) => s + w.stateWithheld, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1099 Income */}
      <Card title="1099 Income (Interest & Dividends)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 px-2">Payer</th>
                <th className="py-2 px-2 text-right">Interest</th>
                <th className="py-2 px-2 text-right">Ord Div</th>
                <th className="py-2 px-2 text-right">Qual Div</th>
                <th className="py-2 px-2 text-right">Sec 199A</th>
                <th className="py-2 px-2 text-right">Tax-Exempt</th>
              </tr>
            </thead>
            <tbody>
              {input.form1099DivInts.map((f, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-1.5 px-2 truncate max-w-[200px]">{f.payer}</td>
                  <td className="py-1.5 px-2 text-right">{f.interestIncome ? fmt(f.interestIncome) : '\u2014'}</td>
                  <td className="py-1.5 px-2 text-right">{f.ordinaryDividends ? fmt(f.ordinaryDividends) : '\u2014'}</td>
                  <td className="py-1.5 px-2 text-right">{f.qualifiedDividends ? fmt(f.qualifiedDividends) : '\u2014'}</td>
                  <td className="py-1.5 px-2 text-right">{f.section199ADividends ? fmt(f.section199ADividends) : '\u2014'}</td>
                  <td className="py-1.5 px-2 text-right">{f.taxExemptInterest ? fmt(f.taxExemptInterest) : '\u2014'}</td>
                </tr>
              ))}
              <tr className="font-semibold border-t">
                <td className="py-1.5 px-2">Total</td>
                <td className="py-1.5 px-2 text-right">{fmt(taxableInterest)}</td>
                <td className="py-1.5 px-2 text-right">{fmt(ordinaryDividends)}</td>
                <td className="py-1.5 px-2 text-right">{fmt(qualifiedDividends)}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.form1099DivInts.reduce((s, f) => s + (f.section199ADividends ?? 0), 0))}</td>
                <td className="py-1.5 px-2 text-right">{fmt(input.form1099DivInts.reduce((s, f) => s + (f.taxExemptInterest ?? 0), 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule D Capital Gains */}
      <Card title={`Schedule D \u2014 Capital Gains ($${totalCapitalGains.toLocaleString()})`}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Short-Term (${capitalGainsST.toLocaleString()})</h3>
            <table className="w-full text-sm">
              <tbody>
                <WaterfallRow label="Net Short-Term" amount={capitalGainsST} bold />
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Long-Term (${capitalGainsLT.toLocaleString()})</h3>
            <table className="w-full text-sm">
              <tbody>
                <WaterfallRow label="Net Long-Term" amount={capitalGainsLT} bold />
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Form 8606 Backdoor Roth */}
      {input.backdoorRothData && input.backdoorRothData.length > 0 && (
        <Card title="Form 8606 \u2014 Backdoor Roth">
          <div className="grid grid-cols-2 gap-6">
            {input.backdoorRothData.map((b, i) => (
              <div key={i}>
                <h3 className="font-medium text-gray-700 mb-2">
                  {b.spouse === 'taxpayer' ? input.taxpayer.firstName : input.spouse?.firstName}
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <WaterfallRow label="Contribution" amount={b.traditionalIRAContribution} />
                    <WaterfallRow label="Prior year basis" amount={b.priorYearBasis} />
                    <WaterfallRow label="Conversion amount" amount={b.rothConversionAmount} />
                    <WaterfallRow label="Taxable portion" amount={0} color="green" />
                    <WaterfallRow label="Ending basis" amount={b.traditionalIRAContribution} bold />
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payments */}
      <Card title="Payments">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Federal</h3>
            <table className="w-full text-sm">
              <tbody>
                {input.w2s.map((w, i) => (
                  <WaterfallRow key={i} label={`${w.employer} withholding`} amount={w.federalWithheld} />
                ))}
                {input.priorYearCarryovers.priorYearOverpaymentApplied > 0 && (
                  <WaterfallRow label="Prior year overpayment" amount={input.priorYearCarryovers.priorYearOverpaymentApplied} />
                )}
                {(input.estimatedPayments.federal.q1 + input.estimatedPayments.federal.q2 + input.estimatedPayments.federal.q3 + input.estimatedPayments.federal.q4) > 0 && (
                  <WaterfallRow label="Estimated payments" amount={input.estimatedPayments.federal.q1 + input.estimatedPayments.federal.q2 + input.estimatedPayments.federal.q3 + input.estimatedPayments.federal.q4} />
                )}
                <WaterfallRow label="Total Payments" amount={fed.totalPayments} bold />
                <Spacer />
                <WaterfallRow label="Balance Due" amount={fed.balanceDue} bold color="red" />
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">California</h3>
            <table className="w-full text-sm">
              <tbody>
                {input.w2s.map((w, i) => (
                  <WaterfallRow key={i} label={`${w.employer} state W/H`} amount={w.stateWithheld} />
                ))}
                <WaterfallRow label="Total Payments" amount={ca.caTotalPayments} bold />
                <Spacer />
                <WaterfallRow label="Balance Due" amount={ca.caBalanceDue} bold color="red" />
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
