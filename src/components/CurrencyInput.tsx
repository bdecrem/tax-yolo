import { useState } from 'react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  className?: string;
}

export function CurrencyInput({ label, value, onChange, hint, className = '' }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState('');

  const displayValue = focused ? raw : (value === 0 ? '' : value.toLocaleString());

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onFocus={() => {
            setFocused(true);
            setRaw(value === 0 ? '' : String(value));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseFloat(raw.replace(/,/g, ''));
            if (!isNaN(parsed)) {
              onChange(Math.round(parsed));
            }
          }}
          onChange={(e) => setRaw(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
