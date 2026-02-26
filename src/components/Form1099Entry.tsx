import { useTaxStore } from '../store/taxStore';
import { CurrencyInput } from './CurrencyInput';
import type { Form1099DivInt, Form1099BSummary } from '../types/inputs';

const empty1099DivInt = (payer: string = ''): Form1099DivInt => ({ payer });

const emptyBrokerSummary = (broker: string = ''): Form1099BSummary => ({
  broker, entries: [],
  shortTermBasisReported: 0, shortTermBasisNotReported: 0, shortTermNotOn1099B: 0,
  longTermBasisReported: 0, longTermBasisNotReported: 0, longTermNotOn1099B: 0,
});

function DivIntEntry({ index, data }: { index: number; data: Form1099DivInt }) {
  const setInput = useTaxStore((s) => s.setInput);
  const forms = useTaxStore((s) => s.input.form1099DivInts);

  const update = (field: keyof Form1099DivInt, value: number | string) => {
    const updated = [...forms];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ form1099DivInts: updated });
  };

  const remove = () => {
    setInput({ form1099DivInts: forms.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <input
          type="text" value={data.payer}
          onChange={(e) => update('payer', e.target.value)}
          placeholder="Payer name" className="font-medium text-gray-900 border-none p-0 focus:outline-none"
        />
        <button onClick={remove} className="text-xs text-red-500 hover:text-red-700">Remove</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <CurrencyInput label="Interest (Box 1)" value={data.interestIncome ?? 0} onChange={(v) => update('interestIncome', v)} />
        <CurrencyInput label="Tax-exempt interest" value={data.taxExemptInterest ?? 0} onChange={(v) => update('taxExemptInterest', v)} />
        <CurrencyInput label="Ordinary dividends (1a)" value={data.ordinaryDividends ?? 0} onChange={(v) => update('ordinaryDividends', v)} />
        <CurrencyInput label="Qualified dividends (1b)" value={data.qualifiedDividends ?? 0} onChange={(v) => update('qualifiedDividends', v)} />
        <CurrencyInput label="Capital gain dist (2a)" value={data.totalCapitalGainDistributions ?? 0} onChange={(v) => update('totalCapitalGainDistributions', v)} />
        <CurrencyInput label="Sec 199A dividends (5)" value={data.section199ADividends ?? 0} onChange={(v) => update('section199ADividends', v)} />
        <CurrencyInput label="Foreign tax paid (7)" value={data.foreignTaxPaid ?? 0} onChange={(v) => update('foreignTaxPaid', v)} />
        <CurrencyInput label="Fed tax withheld (4)" value={data.federalTaxWithheld ?? 0} onChange={(v) => update('federalTaxWithheld', v)} />
      </div>
    </div>
  );
}

function BrokerEntry({ index, data }: { index: number; data: Form1099BSummary }) {
  const setInput = useTaxStore((s) => s.setInput);
  const forms = useTaxStore((s) => s.input.form1099Bs);

  const update = (field: keyof Form1099BSummary, value: number | string) => {
    const updated = [...forms];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ form1099Bs: updated });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <input
        type="text" value={data.broker}
        onChange={(e) => update('broker', e.target.value)}
        placeholder="Broker name" className="font-medium text-gray-900 border-none p-0 focus:outline-none mb-3 block"
      />
      <p className="text-xs text-gray-500 mb-2">Enter net gain/loss totals by Form 8949 box</p>
      <div className="grid grid-cols-3 gap-2">
        <CurrencyInput label="Box A (ST, basis reported)" value={data.shortTermBasisReported} onChange={(v) => update('shortTermBasisReported', v)} />
        <CurrencyInput label="Box B (ST, basis not reported)" value={data.shortTermBasisNotReported} onChange={(v) => update('shortTermBasisNotReported', v)} />
        <CurrencyInput label="Box C (ST, not on 1099-B)" value={data.shortTermNotOn1099B} onChange={(v) => update('shortTermNotOn1099B', v)} />
        <CurrencyInput label="Box D (LT, basis reported)" value={data.longTermBasisReported} onChange={(v) => update('longTermBasisReported', v)} />
        <CurrencyInput label="Box E (LT, basis not reported)" value={data.longTermBasisNotReported} onChange={(v) => update('longTermBasisNotReported', v)} />
        <CurrencyInput label="Box F (LT, not on 1099-B)" value={data.longTermNotOn1099B} onChange={(v) => update('longTermNotOn1099B', v)} />
      </div>
    </div>
  );
}

export function Form1099Page() {
  const { input, setInput } = useTaxStore();

  return (
    <div className="space-y-6">
      {/* 1099-INT/DIV Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">1099-INT / 1099-DIV</h2>
          <button
            onClick={() => setInput({ form1099DivInts: [...input.form1099DivInts, empty1099DivInt()] })}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add 1099
          </button>
        </div>
        {input.form1099DivInts.map((f, i) => <DivIntEntry key={i} index={i} data={f} />)}
      </div>

      {/* 1099-B / Schedule D Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">1099-B / Capital Gains</h2>
          <button
            onClick={() => setInput({ form1099Bs: [...input.form1099Bs, emptyBrokerSummary()] })}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Broker
          </button>
        </div>
        {input.form1099Bs.map((b, i) => <BrokerEntry key={i} index={i} data={b} />)}
      </div>
    </div>
  );
}
