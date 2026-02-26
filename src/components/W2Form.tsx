import { useTaxStore } from '../store/taxStore';
import { CurrencyInput } from './CurrencyInput';
import type { W2Data } from '../types/inputs';

const emptyW2 = (employer: string = ''): W2Data => ({
  employer, ein: '',
  wages: 0, federalWithheld: 0,
  socialSecurityWages: 0, socialSecurityTax: 0,
  medicareWages: 0, medicareTax: 0,
  stateWages: 0, stateWithheld: 0,
});

function W2Entry({ index, data }: { index: number; data: W2Data }) {
  const setInput = useTaxStore((s) => s.setInput);
  const w2s = useTaxStore((s) => s.input.w2s);

  const update = (field: keyof W2Data, value: number | string) => {
    const updated = [...w2s];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ w2s: updated });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <input
            type="text"
            value={data.employer}
            onChange={(e) => update('employer', e.target.value)}
            placeholder="Employer name"
            className="text-lg font-semibold text-gray-900 border-none p-0 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <CurrencyInput label="Box 1: Wages" value={data.wages} onChange={(v) => update('wages', v)} />
        <CurrencyInput label="Box 2: Fed withheld" value={data.federalWithheld} onChange={(v) => update('federalWithheld', v)} />
        <CurrencyInput label="Box 3: SS wages" value={data.socialSecurityWages} onChange={(v) => update('socialSecurityWages', v)} />
        <CurrencyInput label="Box 4: SS tax" value={data.socialSecurityTax} onChange={(v) => update('socialSecurityTax', v)} />
        <CurrencyInput label="Box 5: Medicare wages" value={data.medicareWages} onChange={(v) => update('medicareWages', v)} />
        <CurrencyInput label="Box 6: Medicare tax" value={data.medicareTax} onChange={(v) => update('medicareTax', v)} />
        <CurrencyInput label="Box 16: State wages" value={data.stateWages} onChange={(v) => update('stateWages', v)} />
        <CurrencyInput label="Box 17: State withheld" value={data.stateWithheld} onChange={(v) => update('stateWithheld', v)} />
      </div>
    </div>
  );
}

export function W2Form() {
  const { input, setInput } = useTaxStore();

  const addW2 = (employer: string) => {
    setInput({ w2s: [...input.w2s, emptyW2(employer)] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">W-2 Wage & Tax Statements</h2>
        <div className="flex gap-2">
          <button onClick={() => addW2('')} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add W-2
          </button>
        </div>
      </div>

      {input.w2s.length === 0 && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
          No W-2s entered yet. Click a button above to add one.
        </div>
      )}

      {input.w2s.map((w2, i) => (
        <W2Entry key={i} index={i} data={w2} />
      ))}
    </div>
  );
}
