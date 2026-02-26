import { useTaxStore } from '../store/taxStore';
import { CurrencyInput } from './CurrencyInput';
import type { Form1098, PropertyTaxPayment, CharitableDonation, VehicleRegistration } from '../types/inputs';

export function DeductionsForm() {
  const { input, setInput } = useTaxStore();

  // ─── Mortgage Interest (1098) ─────────────────────────────────
  const addMortgage = () => {
    const newEntry: Form1098 = {
      lender: '',
      mortgageInterest: 0,
      outstandingMortgagePrincipal: 0,
      mortgageOriginationDate: '',
      propertyAddress: '',
    };
    setInput({ form1098s: [...input.form1098s, newEntry] });
  };

  const updateMortgage = (index: number, field: keyof Form1098, value: number | string) => {
    const updated = [...input.form1098s];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ form1098s: updated });
  };

  // ─── Property Tax ─────────────────────────────────────────────
  const addPropertyTax = () => {
    const newEntry: PropertyTaxPayment = {
      jurisdiction: '',
      propertyAddress: '',
      amount: 0,
      datePaid: '2025-12-10',
    };
    setInput({ propertyTaxPayments: [...input.propertyTaxPayments, newEntry] });
  };

  const updatePropertyTax = (index: number, field: keyof PropertyTaxPayment, value: number | string) => {
    const updated = [...input.propertyTaxPayments];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ propertyTaxPayments: updated });
  };

  // ─── Charitable ───────────────────────────────────────────────
  const addCharitable = () => {
    const newEntry: CharitableDonation = {
      recipient: '', amount: 0, type: 'cash', date: '2025-12-31', acknowledgmentReceived: true,
    };
    setInput({ charitableDonations: [...input.charitableDonations, newEntry] });
  };

  const updateCharitable = (index: number, field: keyof CharitableDonation, value: number | string | boolean) => {
    const updated = [...input.charitableDonations];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ charitableDonations: updated });
  };

  // ─── VLF ──────────────────────────────────────────────────────
  const addVLF = () => {
    const newEntry: VehicleRegistration = { description: '', vlf: 0, totalFee: 0 };
    setInput({ vehicleRegistrations: [...input.vehicleRegistrations, newEntry] });
  };

  const updateVLF = (index: number, field: keyof VehicleRegistration, value: number | string) => {
    const updated = [...input.vehicleRegistrations];
    updated[index] = { ...updated[index], [field]: value };
    setInput({ vehicleRegistrations: updated });
  };

  return (
    <div className="space-y-6">
      {/* Mortgage */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Form 1098 - Mortgage Interest</h2>
          <button onClick={addMortgage} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add 1098
          </button>
        </div>
        {input.form1098s.map((m, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <input type="text" value={m.lender} onChange={(e) => updateMortgage(i, 'lender', e.target.value)}
              placeholder="Lender" className="font-medium text-gray-900 border-none p-0 focus:outline-none mb-2 block" />
            <div className="grid grid-cols-3 gap-2">
              <CurrencyInput label="Box 1: Mortgage interest" value={m.mortgageInterest} onChange={(v) => updateMortgage(i, 'mortgageInterest', v)} />
              <CurrencyInput label="Box 2: Outstanding principal" value={m.outstandingMortgagePrincipal} onChange={(v) => updateMortgage(i, 'outstandingMortgagePrincipal', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property address</label>
                <input type="text" value={m.propertyAddress} onChange={(e) => updateMortgage(i, 'propertyAddress', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Property Tax */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Property Tax</h2>
          <button onClick={addPropertyTax} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Property Tax
          </button>
        </div>
        {input.propertyTaxPayments.map((p, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <input type="text" value={p.jurisdiction} onChange={(e) => updatePropertyTax(i, 'jurisdiction', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              <CurrencyInput label="Amount paid" value={p.amount} onChange={(v) => updatePropertyTax(i, 'amount', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date paid</label>
                <input type="date" value={p.datePaid} onChange={(e) => updatePropertyTax(i, 'datePaid', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Charitable */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Charitable Donations</h2>
          <button onClick={addCharitable} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Donation
          </button>
        </div>
        {input.charitableDonations.map((d, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <input type="text" value={d.recipient} onChange={(e) => updateCharitable(i, 'recipient', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              <CurrencyInput label="Amount" value={d.amount} onChange={(v) => updateCharitable(i, 'amount', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={d.type} onChange={(e) => updateCharitable(i, 'type', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm">
                  <option value="cash">Cash</option>
                  <option value="noncash">Non-cash</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* VLF */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Registration (VLF)</h2>
          <button onClick={addVLF} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Vehicle
          </button>
        </div>
        {input.vehicleRegistrations.map((v, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={v.description} onChange={(e) => updateVLF(i, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              <CurrencyInput label="Vehicle License Fee" value={v.vlf} onChange={(val) => updateVLF(i, 'vlf', val)} hint="Deductible portion only" />
              <CurrencyInput label="Total fee" value={v.totalFee} onChange={(val) => updateVLF(i, 'totalFee', val)} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
