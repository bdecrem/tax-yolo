import { useTaxStore } from '../store/taxStore';
import { useComputation } from '../hooks/useComputation';
import { useRef } from 'react';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

interface DocItem {
  id: string;
  label: string;
  status: 'done' | 'missing' | 'partial' | 'na';
  note?: string;
}

function useDocumentStatus(): DocItem[] {
  const input = useTaxStore((s) => s.input);

  const hasW2s = input.w2s.length >= 2;
  const hasSomeW2s = input.w2s.length > 0;
  const has1099DivInts = input.form1099DivInts.length > 0;
  const has1099Bs = input.form1099Bs.length > 0;
  const hasCrypto = !!input.cryptoData && (input.cryptoData.shortTermGainLoss !== 0 || input.cryptoData.longTermGainLoss !== 0);
  const has1099Rs = input.form1099Rs.length >= 2;
  const hasMortgage = input.form1098s.length > 0;
  const hasPropertyTax = input.propertyTaxPayments.length > 0;
  const hasCharitable = input.charitableDonations.length > 0;
  const hasVLF = input.vehicleRegistrations.length > 0;
  const hasBackdoorRoth = input.backdoorRothData.length >= 2;
  const hasEstPayments = (
    input.estimatedPayments.federal.q1 + input.estimatedPayments.federal.q2 +
    input.estimatedPayments.federal.q3 + input.estimatedPayments.federal.q4 +
    input.estimatedPayments.california.q1 + input.estimatedPayments.california.q2 +
    input.estimatedPayments.california.q3 + input.estimatedPayments.california.q4
  ) > 0;

  return [
    { id: 'w2-tp', label: `W-2: ${input.taxpayer.firstName}`, status: hasSomeW2s ? (hasW2s ? 'done' : 'partial') : 'missing' },
    { id: 'w2-sp', label: `W-2: ${input.spouse?.firstName ?? 'Spouse'}`, status: hasW2s ? 'done' : 'missing' },
    { id: '1099-divint', label: '1099-INT/DIV', status: has1099DivInts ? 'done' : 'missing', note: has1099DivInts ? `${input.form1099DivInts.length} accounts` : undefined },
    { id: '1099b', label: '1099-B: Capital gains', status: has1099Bs ? 'done' : 'missing', note: has1099Bs ? `${input.form1099Bs.length} brokers` : undefined },
    { id: 'crypto', label: 'Crypto transactions', status: hasCrypto ? 'done' : (input.cryptoData ? 'done' : 'na') },
    { id: '1099r', label: '1099-R: Roth conversions', status: has1099Rs ? 'done' : 'missing' },
    { id: 'roth', label: 'Backdoor Roth details', status: hasBackdoorRoth ? 'done' : 'missing' },
    { id: '1098', label: '1098: Mortgage interest', status: hasMortgage ? 'done' : 'missing', note: hasMortgage ? `$${input.form1098s[0].mortgageInterest.toLocaleString()}` : undefined },
    { id: 'prop-tax', label: 'Property tax', status: hasPropertyTax ? 'done' : 'missing', note: hasPropertyTax ? `$${input.propertyTaxPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()} total` : undefined },
    { id: 'charitable', label: 'Charitable donations', status: hasCharitable ? 'done' : 'missing', note: hasCharitable ? `$${input.charitableDonations.reduce((s, d) => s + d.amount, 0).toLocaleString()} (${input.charitableDonations.length} donations)` : undefined },
    { id: 'vlf', label: 'Vehicle registration (VLF)', status: hasVLF ? 'done' : 'missing' },
    { id: 'est-pay', label: 'Estimated tax payments', status: hasEstPayments ? 'done' : 'na', note: hasEstPayments ? undefined : 'None entered' },
  ];
}

export function Dashboard() {
  const { input, importJSON, exportJSON, resetToSeed } = useTaxStore();
  const { compute, federalResult, californiaResult } = useComputation();
  const fileRef = useRef<HTMLInputElement>(null);

  const docs = useDocumentStatus();
  const doneCount = docs.filter(d => d.status === 'done' || d.status === 'na').length;
  const totalCount = docs.length;

  const hasEnoughToCompute = input.form1099DivInts.length > 0 || input.w2s.length > 0 || (input.cryptoData && input.cryptoData.longTermGainLoss !== 0);

  // Compute totals from 1099 data
  const totalOrdinaryDividends = input.form1099DivInts.reduce((s, f) => s + (f.ordinaryDividends ?? 0), 0);
  const totalQualifiedDividends = input.form1099DivInts.reduce((s, f) => s + (f.qualifiedDividends ?? 0), 0);
  const totalInterestIncome = input.form1099DivInts.reduce((s, f) => s + (f.interestIncome ?? 0), 0);
  const totalTaxExemptInterest = input.form1099DivInts.reduce((s, f) => s + (f.taxExemptInterest ?? 0), 0);
  const totalExemptIntDividends = input.form1099DivInts.reduce((s, f) => s + (f.exemptInterestDividends ?? 0), 0);
  const totalSection199A = input.form1099DivInts.reduce((s, f) => s + (f.section199ADividends ?? 0), 0);

  const totalLTGain = input.form1099Bs.reduce((s, b) => s + b.longTermBasisReported + b.longTermBasisNotReported + b.longTermNotOn1099B, 0);
  const totalSTGain = input.form1099Bs.reduce((s, b) => s + b.shortTermBasisReported + b.shortTermBasisNotReported + b.shortTermNotOn1099B, 0);

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-yolo-2025-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importJSON(reader.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex gap-3 items-center">
        <button
          onClick={compute}
          disabled={!hasEnoughToCompute}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Compute Tax
        </button>
        <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50">
          Export JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-white border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50">
          Import JSON
        </button>
        <button onClick={resetToSeed} className="px-4 py-2 bg-white border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50">
          Reload Demo Data
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Documents Processed</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {doneCount} / {totalCount}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">document types imported</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Federal Tax</h3>
          {federalResult ? (
            <>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{fmt(federalResult.totalTax)}</p>
              <p className={`mt-1 text-sm ${federalResult.balanceDueOrRefund > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {federalResult.balanceDueOrRefund > 0
                  ? `${fmt(federalResult.balanceDueOrRefund)} due`
                  : `${fmt(Math.abs(federalResult.balanceDueOrRefund))} refund`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-2xl text-gray-300">--</p>
              <p className="mt-1 text-xs text-gray-400">Click Compute Tax</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">California Tax</h3>
          {californiaResult ? (
            <>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{fmt(californiaResult.totalTax)}</p>
              <p className={`mt-1 text-sm ${californiaResult.balanceDueOrRefund > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {californiaResult.balanceDueOrRefund > 0
                  ? `${fmt(californiaResult.balanceDueOrRefund)} due`
                  : `${fmt(Math.abs(californiaResult.balanceDueOrRefund))} refund`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-2xl text-gray-300">--</p>
              <p className="mt-1 text-xs text-gray-400">Click Compute Tax</p>
            </>
          )}
        </div>
      </div>

      {/* Imported data */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Imported Data</h2>
        <p className="text-sm text-gray-500 mb-4">Current tax return data</p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {/* 1099-DIV/INT */}
          {input.form1099DivInts.length > 0 && (
            <div className="col-span-2 mb-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">1099-INT / 1099-DIV ({input.form1099DivInts.length} accounts)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1 text-gray-500 font-medium">Account</th>
                    <th className="py-1 text-right text-gray-500 font-medium">Ordinary Div</th>
                    <th className="py-1 text-right text-gray-500 font-medium">Qualified Div</th>
                    <th className="py-1 text-right text-gray-500 font-medium">Interest</th>
                    <th className="py-1 text-right text-gray-500 font-medium">Tax-Exempt Int</th>
                  </tr>
                </thead>
                <tbody>
                  {input.form1099DivInts.map((f, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1 text-gray-700">{f.payer}</td>
                      <td className="py-1 text-right text-gray-600">{f.ordinaryDividends ? fmt(f.ordinaryDividends) : '-'}</td>
                      <td className="py-1 text-right text-gray-600">{f.qualifiedDividends ? fmt(f.qualifiedDividends) : '-'}</td>
                      <td className="py-1 text-right text-gray-600">{f.interestIncome ? fmt(f.interestIncome) : '-'}</td>
                      <td className="py-1 text-right text-gray-600">{(f.taxExemptInterest || f.exemptInterestDividends) ? fmt((f.taxExemptInterest ?? 0) + (f.exemptInterestDividends ?? 0)) : '-'}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-1 text-gray-800">Totals</td>
                    <td className="py-1 text-right text-gray-800">{fmt(totalOrdinaryDividends)}</td>
                    <td className="py-1 text-right text-gray-800">{fmt(totalQualifiedDividends)}</td>
                    <td className="py-1 text-right text-gray-800">{fmt(totalInterestIncome)}</td>
                    <td className="py-1 text-right text-gray-800">{fmt(totalTaxExemptInterest + totalExemptIntDividends)}</td>
                  </tr>
                </tbody>
              </table>
              {totalSection199A > 0 && (
                <p className="text-xs text-gray-500 mt-1 ml-1">Section 199A dividends: {fmt(totalSection199A)}</p>
              )}
            </div>
          )}

          {/* 1099-B Capital Gains */}
          {input.form1099Bs.length > 0 && (
            <div className="col-span-2 mb-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">1099-B Capital Gains ({input.form1099Bs.length} brokers)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1 text-gray-500 font-medium">Broker</th>
                    <th className="py-1 text-right text-gray-500 font-medium">Transactions</th>
                    <th className="py-1 text-right text-gray-500 font-medium">LT Gain/Loss</th>
                    <th className="py-1 text-right text-gray-500 font-medium">ST Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {input.form1099Bs.map((b, i) => {
                    const lt = b.longTermBasisReported + b.longTermBasisNotReported + b.longTermNotOn1099B;
                    const st = b.shortTermBasisReported + b.shortTermBasisNotReported + b.shortTermNotOn1099B;
                    return (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1 text-gray-700">{b.broker}</td>
                        <td className="py-1 text-right text-gray-600">{b.entries.length}</td>
                        <td className={`py-1 text-right ${lt >= 0 ? 'text-green-700' : 'text-red-600'}`}>{fmt(lt)}</td>
                        <td className={`py-1 text-right ${st >= 0 ? 'text-gray-600' : 'text-red-600'}`}>{st !== 0 ? fmt(st) : '-'}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-medium">
                    <td className="py-1 text-gray-800">Totals</td>
                    <td className="py-1 text-right text-gray-800">{input.form1099Bs.reduce((s, b) => s + b.entries.length, 0)}</td>
                    <td className={`py-1 text-right ${totalLTGain >= 0 ? 'text-green-700' : 'text-red-600'}`}>{fmt(totalLTGain)}</td>
                    <td className={`py-1 text-right ${totalSTGain >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{totalSTGain !== 0 ? fmt(totalSTGain) : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Crypto */}
          {input.cryptoData && (input.cryptoData.longTermGainLoss !== 0 || input.cryptoData.shortTermGainLoss !== 0) && (
            <div className="mb-1">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Crypto</h3>
              {input.cryptoData.entries.map((e, i) => (
                <p key={i} className="text-sm text-gray-600 ml-4">
                  {e.description}: {fmt(e.gainLoss)} {e.gainLoss >= 0 ? 'LTCG' : 'loss'}
                </p>
              ))}
            </div>
          )}

          {/* Property Tax */}
          {input.propertyTaxPayments.length > 0 && (
            <div className="mb-1">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Property Tax</h3>
              {input.propertyTaxPayments.map((p, i) => (
                <p key={i} className="text-sm text-gray-600 ml-4">
                  {p.datePaid}: {fmt(p.amount)}
                </p>
              ))}
              <p className="text-sm font-medium text-gray-800 ml-4">
                Total: {fmt(input.propertyTaxPayments.reduce((s, p) => s + p.amount, 0))}
              </p>
            </div>
          )}

          {/* Mortgage */}
          {input.form1098s.length > 0 && (
            <div className="mb-1">
              <h3 className="text-sm font-medium text-gray-700">Mortgage Interest</h3>
              <p className="text-sm text-gray-600 ml-4">{fmt(input.form1098s[0].mortgageInterest)} ({input.form1098s[0].lender})</p>
            </div>
          )}

          {/* Charitable */}
          {input.charitableDonations.length > 0 && (
            <div className="mb-1">
              <h3 className="text-sm font-medium text-gray-700">Charitable</h3>
              {input.charitableDonations.map((d, i) => (
                <p key={i} className="text-sm text-gray-600 ml-4">{fmt(d.amount)} - {d.recipient}</p>
              ))}
              <p className="text-sm font-medium text-gray-800 ml-4">
                Total: {fmt(input.charitableDonations.reduce((s, d) => s + d.amount, 0))}
              </p>
            </div>
          )}

          {/* Prior Year Carryovers */}
          <div className="mb-1">
            <h3 className="text-sm font-medium text-gray-700">Prior Year Carryovers</h3>
            <p className="text-sm text-gray-600 ml-4">Form 8606 basis: {fmt(input.priorYearCarryovers.form8606Basis.taxpayer)} ({input.taxpayer.firstName}), {fmt(input.priorYearCarryovers.form8606Basis.spouse)} ({input.spouse?.firstName ?? 'Spouse'})</p>
            <p className="text-sm text-gray-600 ml-4">FTC carryover: {fmt(input.priorYearCarryovers.foreignTaxCreditCarryover)}</p>
          </div>
        </div>
      </div>

      {/* Document checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Checklist</h2>
        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-medium ${
                doc.status === 'done'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : doc.status === 'na'
                  ? 'bg-gray-100 text-gray-500 border border-gray-300'
                  : doc.status === 'partial'
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {doc.status === 'done' ? '\u2713' : doc.status === 'na' ? '\u2014' : doc.status === 'partial' ? '~' : ''}
              </span>
              <div>
                <span className={doc.status === 'done' ? 'text-gray-900' : doc.status === 'na' ? 'text-gray-500 line-through' : doc.status === 'partial' ? 'text-amber-800' : 'text-gray-400'}>
                  {doc.label}
                </span>
                {doc.note && (
                  <span className="ml-2 text-xs text-gray-400">{doc.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YoY comparison if results available */}
      {federalResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500">Item</th>
                <th className="text-right py-2 text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['AGI', federalResult.income.agi],
                ['Fed Taxable Income', federalResult.deductions.taxableIncome],
                ['Fed Tax', federalResult.taxComputation.tax],
                ['NIIT', federalResult.form8960.niit],
                ['Total Fed Tax', federalResult.totalTax],
                ['CA Tax', californiaResult?.totalTax ?? 0],
              ].map(([label, amount]) => (
                <tr key={label as string} className="border-b last:border-b-0">
                  <td className="py-2">{label}</td>
                  <td className="text-right py-2">{fmt(amount as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
