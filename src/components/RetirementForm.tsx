import { useTaxStore } from '../store/taxStore';
import { CurrencyInput } from './CurrencyInput';
import type { Form1099R, BackdoorRothData } from '../types/inputs';

export function RetirementForm() {
  const { input, setInput } = useTaxStore();

  // ─── 1099-R ───────────────────────────────────────────────────
  const add1099R = (payer: string) => {
    const newEntry: Form1099R = {
      payer, grossDistribution: 0, taxableAmount: 0,
      taxableAmountNotDetermined: false, federalTaxWithheld: 0,
      distributionCode: '02', iraSepSimple: true, totalDistribution: true,
    };
    setInput({ form1099Rs: [...input.form1099Rs, newEntry] });
  };

  const update1099R = (index: number, field: keyof Form1099R, value: number | string | boolean) => {
    const updated = [...input.form1099Rs];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ form1099Rs: updated });
  };

  // ─── Backdoor Roth ────────────────────────────────────────────
  const addBackdoorRoth = (spouse: 'taxpayer' | 'spouse') => {
    const newEntry: BackdoorRothData = {
      spouse,
      traditionalIRAContribution: 8000,
      rothConversionAmount: 0,
      priorYearBasis: spouse === 'taxpayer' ? input.priorYearCarryovers.form8606Basis.taxpayer : input.priorYearCarryovers.form8606Basis.spouse,
      yearEndTraditionalIRABalance: 0,
      yearEndSEPIRABalance: 0,
      yearEndSIMPLEIRABalance: 0,
    };
    setInput({ backdoorRothData: [...input.backdoorRothData, newEntry] });
  };

  const updateRoth = (index: number, field: keyof BackdoorRothData, value: number | string) => {
    const updated = [...input.backdoorRothData];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ backdoorRothData: updated });
  };

  const tpName = input.taxpayer.firstName;
  const spName = input.spouse?.firstName ?? 'Spouse';

  return (
    <div className="space-y-6">
      {/* 1099-R */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Form 1099-R - Retirement Distributions</h2>
          <div className="flex gap-2">
            <button onClick={() => add1099R(`Vanguard - ${tpName}`)} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              + {tpName} 1099-R
            </button>
            <button onClick={() => add1099R(`Vanguard - ${spName}`)} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              + {spName} 1099-R
            </button>
          </div>
        </div>
        {input.form1099Rs.map((r, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <div className="font-medium text-gray-900 mb-2">{r.payer}</div>
            <div className="grid grid-cols-4 gap-2">
              <CurrencyInput label="Box 1: Gross distribution" value={r.grossDistribution} onChange={(v) => update1099R(i, 'grossDistribution', v)} />
              <CurrencyInput label="Box 2a: Taxable amount" value={r.taxableAmount} onChange={(v) => update1099R(i, 'taxableAmount', v)} hint="Should be $0 if clean backdoor" />
              <CurrencyInput label="Box 4: Fed withheld" value={r.federalTaxWithheld} onChange={(v) => update1099R(i, 'federalTaxWithheld', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Box 7: Distribution code</label>
                <input type="text" value={r.distributionCode} onChange={(e) => update1099R(i, 'distributionCode', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <p className="text-xs text-gray-400 mt-0.5">02 = Roth conversion</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Backdoor Roth */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Backdoor Roth IRA (Form 8606)</h2>
          <div className="flex gap-2">
            <button onClick={() => addBackdoorRoth('taxpayer')} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              + {tpName}
            </button>
            <button onClick={() => addBackdoorRoth('spouse')} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              + {spName}
            </button>
          </div>
        </div>
        {input.backdoorRothData.map((r, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <div className="font-medium text-gray-900 mb-2">{r.spouse === 'taxpayer' ? `${tpName} (Taxpayer)` : `${spName} (Spouse)`}</div>
            <div className="grid grid-cols-3 gap-2">
              <CurrencyInput label="Traditional IRA contribution" value={r.traditionalIRAContribution} onChange={(v) => updateRoth(i, 'traditionalIRAContribution', v)} hint="2025 limit: $8,000 (50+)" />
              <CurrencyInput label="Roth conversion amount" value={r.rothConversionAmount} onChange={(v) => updateRoth(i, 'rothConversionAmount', v)} />
              <CurrencyInput label="Prior year basis (line 2)" value={r.priorYearBasis} onChange={(v) => updateRoth(i, 'priorYearBasis', v)} hint="Carryover from prior year Form 8606" />
              <CurrencyInput label="Year-end trad IRA balance" value={r.yearEndTraditionalIRABalance} onChange={(v) => updateRoth(i, 'yearEndTraditionalIRABalance', v)} hint="Should be $0 for clean backdoor" />
              <CurrencyInput label="Year-end SEP-IRA balance" value={r.yearEndSEPIRABalance} onChange={(v) => updateRoth(i, 'yearEndSEPIRABalance', v)} hint="PRO-RATA WARNING if > $0!" />
              <CurrencyInput label="Year-end SIMPLE IRA balance" value={r.yearEndSIMPLEIRABalance} onChange={(v) => updateRoth(i, 'yearEndSIMPLEIRABalance', v)} />
            </div>
            {(r.yearEndSEPIRABalance > 0 || r.yearEndSIMPLEIRABalance > 0) && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                WARNING: Non-zero SEP/SIMPLE IRA balance triggers the pro-rata rule. The backdoor Roth conversion will be partially taxable.
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
