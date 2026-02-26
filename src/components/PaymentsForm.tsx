import { useTaxStore } from '../store/taxStore';
import { CurrencyInput } from './CurrencyInput';

export function PaymentsForm() {
  const { input, setInput } = useTaxStore();

  const updateFedEst = (q: 'q1' | 'q2' | 'q3' | 'q4', value: number) => {
    setInput({
      estimatedPayments: {
        ...input.estimatedPayments,
        federal: { ...input.estimatedPayments.federal, [q]: value },
      },
    });
  };

  const updateCAEst = (q: 'q1' | 'q2' | 'q3' | 'q4', value: number) => {
    setInput({
      estimatedPayments: {
        ...input.estimatedPayments,
        california: { ...input.estimatedPayments.california, [q]: value },
      },
    });
  };

  const updateCarryover = (field: string, value: number) => {
    setInput({
      priorYearCarryovers: { ...input.priorYearCarryovers, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Federal Estimated Payments */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Federal Estimated Tax Payments</h2>
        <div className="grid grid-cols-4 gap-3">
          <CurrencyInput label="Q1 (Apr 15, 2025)" value={input.estimatedPayments.federal.q1} onChange={(v) => updateFedEst('q1', v)} />
          <CurrencyInput label="Q2 (Jun 15, 2025)" value={input.estimatedPayments.federal.q2} onChange={(v) => updateFedEst('q2', v)} />
          <CurrencyInput label="Q3 (Sep 15, 2025)" value={input.estimatedPayments.federal.q3} onChange={(v) => updateFedEst('q3', v)} />
          <CurrencyInput label="Q4 (Jan 15, 2026)" value={input.estimatedPayments.federal.q4} onChange={(v) => updateFedEst('q4', v)} />
        </div>
      </div>

      {/* California Estimated Payments */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">California Estimated Tax Payments</h2>
        <div className="grid grid-cols-4 gap-3">
          <CurrencyInput label="Q1 (Apr 15, 2025)" value={input.estimatedPayments.california.q1} onChange={(v) => updateCAEst('q1', v)} />
          <CurrencyInput label="Q2 (Jun 15, 2025)" value={input.estimatedPayments.california.q2} onChange={(v) => updateCAEst('q2', v)} />
          <CurrencyInput label="Q3 (Sep 15, 2025)" value={input.estimatedPayments.california.q3} onChange={(v) => updateCAEst('q3', v)} />
          <CurrencyInput label="Q4 (Jan 15, 2026)" value={input.estimatedPayments.california.q4} onChange={(v) => updateCAEst('q4', v)} />
        </div>
      </div>

      {/* Prior Year Carryovers */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prior Year Carryovers</h2>
        <div className="grid grid-cols-3 gap-3">
          <CurrencyInput label="Prior year overpayment applied" value={input.priorYearCarryovers.priorYearOverpaymentApplied} onChange={(v) => updateCarryover('priorYearOverpaymentApplied', v)} />
          <CurrencyInput label="Capital loss carryover (ST)" value={Math.abs(input.priorYearCarryovers.capitalLossCarryover.shortTerm)} onChange={(v) => {
            setInput({
              priorYearCarryovers: {
                ...input.priorYearCarryovers,
                capitalLossCarryover: { ...input.priorYearCarryovers.capitalLossCarryover, shortTerm: -v },
              },
            });
          }} hint="Enter as positive (will be treated as loss)" />
          <CurrencyInput label="Capital loss carryover (LT)" value={Math.abs(input.priorYearCarryovers.capitalLossCarryover.longTerm)} onChange={(v) => {
            setInput({
              priorYearCarryovers: {
                ...input.priorYearCarryovers,
                capitalLossCarryover: { ...input.priorYearCarryovers.capitalLossCarryover, longTerm: -v },
              },
            });
          }} hint="Enter as positive (will be treated as loss)" />
          <CurrencyInput label="Foreign tax credit carryover" value={input.priorYearCarryovers.foreignTaxCreditCarryover} onChange={(v) => updateCarryover('foreignTaxCreditCarryover', v)} />
        </div>
      </div>

      {/* Withholding summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Withholding Summary (from W-2s / 1099s)</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Federal withholding (W-2): ${input.w2s.reduce((s, w) => s + w.federalWithheld, 0).toLocaleString()}</p>
          <p>State withholding (W-2): ${input.w2s.reduce((s, w) => s + w.stateWithheld, 0).toLocaleString()}</p>
          <p>Federal estimated payments: ${(input.estimatedPayments.federal.q1 + input.estimatedPayments.federal.q2 + input.estimatedPayments.federal.q3 + input.estimatedPayments.federal.q4).toLocaleString()}</p>
          <p>California estimated payments: ${(input.estimatedPayments.california.q1 + input.estimatedPayments.california.q2 + input.estimatedPayments.california.q3 + input.estimatedPayments.california.q4).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
