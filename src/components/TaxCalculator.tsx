import React, { useMemo, useState } from 'react';
import { Calculator, Copy, Info, Receipt, Save } from 'lucide-react';

type Mode = 'add' | 'remove';

interface TaxRegime {
  /** Region label shown to user */
  label: string;
  /** Name of the tax (GST, VAT, Sales Tax, etc.) */
  taxName: string;
  /** Common rate presets in percent */
  presets: number[];
  /** Whether to split into CGST/SGST (India only) */
  splitCgstSgst?: boolean;
  /** Optional contextual tip */
  hint?: string;
}

const REGIMES: Record<string, TaxRegime> = {
  INR: {
    label: 'India',
    taxName: 'GST',
    presets: [0, 3, 5, 12, 18, 28],
    splitCgstSgst: true,
    hint: 'Intra-state: split equally into CGST + SGST. Inter-state: full IGST.',
  },
  USD: {
    label: 'United States',
    taxName: 'Sales Tax',
    presets: [0, 4, 6, 7.25, 8.875, 10],
    hint: 'US sales tax varies by state and city. Pick a preset or enter your local rate.',
  },
  EUR: {
    label: 'European Union',
    taxName: 'VAT',
    presets: [0, 7, 10, 19, 20, 21],
    hint: 'VAT rates vary by EU member state — common standard rates shown.',
  },
  GBP: {
    label: 'United Kingdom',
    taxName: 'VAT',
    presets: [0, 5, 20],
    hint: 'UK VAT: 0% (zero-rated), 5% (reduced), 20% (standard).',
  },
  AED: {
    label: 'United Arab Emirates',
    taxName: 'VAT',
    presets: [0, 5],
    hint: 'UAE applies a flat 5% VAT on most taxable goods and services.',
  },
};

const DEFAULT_REGIME: TaxRegime = {
  label: 'Generic',
  taxName: 'Tax',
  presets: [0, 5, 10, 15, 20],
  hint: 'No region-specific rules — enter the tax rate for your jurisdiction.',
};

interface TaxCalculatorProps {
  currency: string;
  currencySymbol: string;
  currencyName: string;
  currencyFlag?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  currency,
  currencySymbol,
  currencyName,
  currencyFlag,
}) => {
  const regime = REGIMES[currency] ?? DEFAULT_REGIME;

  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>(String(regime.presets[Math.min(2, regime.presets.length - 1)] ?? 0));
  const [mode, setMode] = useState<Mode>('add');
  const [interState, setInterState] = useState<boolean>(false);

  // When the currency switches, re-pick a sensible default rate for the new regime.
  React.useEffect(() => {
    setRate(String(regime.presets[Math.min(2, regime.presets.length - 1)] ?? 0));
  }, [currency]); // eslint-disable-line react-hooks/exhaustive-deps

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (!isFinite(a) || !isFinite(r)) {
      return { net: 0, tax: 0, gross: 0, valid: false };
    }
    if (mode === 'add') {
      const tax = (a * r) / 100;
      return { net: a, tax, gross: a + tax, valid: true };
    }
    // remove: amount is gross (tax-inclusive), back out the net
    const net = a / (1 + r / 100);
    return { net, tax: a - net, gross: a, valid: true };
  }, [amount, rate, mode]);

  const showSplit = regime.splitCgstSgst && !interState;
  const halfTax = result.tax / 2;

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard failures silently
    }
  };

  const summaryText = `${regime.taxName} @ ${rate}% on ${fmt(result.net)} = ${fmt(
    result.tax,
  )} | Total: ${fmt(result.gross)}`;

  const [savedFlash, setSavedFlash] = useState(false);
  const saveToHistory = () => {
    if (!result.valid) return;
    try {
      const existing = JSON.parse(localStorage.getItem('taxHistory') || '[]');
      const entry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        currency,
        currencySymbol,
        taxName: regime.taxName,
        rate: parseFloat(rate) || 0,
        mode,
        net: round2(result.net),
        tax: round2(result.tax),
        gross: round2(result.gross),
        splitCgstSgst: !!showSplit,
      };
      localStorage.setItem('taxHistory', JSON.stringify([entry, ...existing].slice(0, 100)));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
      {/* Inputs */}
      <div className="nc-card-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <Receipt size={20} className="text-brand-600" />
              {regime.taxName} Calculator
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {currencyFlag} {regime.label} • {currencyName} ({currencySymbol})
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-ink-100 rounded-lg mb-4">
          <button
            onClick={() => setMode('add')}
            className={`py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              mode === 'add'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Add {regime.taxName}
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              mode === 'remove'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Remove {regime.taxName}
          </button>
        </div>

        {/* Amount input */}
        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            {mode === 'add' ? 'Net amount (before tax)' : 'Gross amount (tax included)'}
          </span>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">
              {currencySymbol}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            />
          </div>
        </label>

        {/* Rate input + presets */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            {regime.taxName} rate
          </span>
          <div className="relative mt-1.5">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">
              %
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {regime.presets.map((p) => (
              <button
                key={p}
                onClick={() => setRate(String(p))}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  parseFloat(rate) === p
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        {/* India-only: inter-state toggle */}
        {regime.splitCgstSgst && (
          <label className="flex items-center gap-2 mb-1 text-sm text-ink-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={interState}
              onChange={(e) => setInterState(e.target.checked)}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
            />
            Inter-state transaction (use IGST instead of CGST + SGST)
          </label>
        )}

        {regime.hint && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-800">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>{regime.hint}</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="nc-card-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <Calculator size={20} className="text-emerald-600" />
            Breakdown
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={saveToHistory}
              disabled={!result.valid}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                savedFlash
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              title="Save to history"
            >
              <Save size={14} />
              {savedFlash ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => copy(summaryText)}
              disabled={!result.valid}
              className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40"
              title="Copy summary"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="nc-stat bg-ink-50 border-ink-200">
            <div className="nc-stat-label">Net amount (excl. {regime.taxName})</div>
            <div className="nc-stat-value text-ink-900 truncate">{fmt(round2(result.net))}</div>
          </div>

          {showSplit ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="nc-stat bg-amber-50 border-amber-200/60">
                <div className="nc-stat-label text-amber-700/80">CGST ({(parseFloat(rate) || 0) / 2}%)</div>
                <div className="nc-stat-value text-amber-700 truncate">
                  {fmt(round2(halfTax))}
                </div>
              </div>
              <div className="nc-stat bg-amber-50 border-amber-200/60">
                <div className="nc-stat-label text-amber-700/80">SGST ({(parseFloat(rate) || 0) / 2}%)</div>
                <div className="nc-stat-value text-amber-700 truncate">
                  {fmt(round2(halfTax))}
                </div>
              </div>
            </div>
          ) : (
            <div className="nc-stat bg-amber-50 border-amber-200/60">
              <div className="nc-stat-label text-amber-700/80">
                {regime.splitCgstSgst ? 'IGST' : regime.taxName} ({rate || 0}%)
              </div>
              <div className="nc-stat-value text-amber-700 truncate">
                {fmt(round2(result.tax))}
              </div>
            </div>
          )}

          <div className="nc-stat bg-brand-50 border-brand-200/60">
            <div className="nc-stat-label text-brand-700/80">
              Gross total (incl. {regime.taxName})
            </div>
            <div className="nc-stat-value text-brand-700 truncate">
              {fmt(round2(result.gross))}
            </div>
          </div>
        </div>

        {/* Quick reference card */}
        <div className="mt-5 pt-5 border-t border-ink-200">
          <div className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
            Formulas used
          </div>
          <div className="space-y-1.5 text-xs text-ink-600 font-mono">
            {mode === 'add' ? (
              <>
                <div>tax = net × rate / 100</div>
                <div>gross = net + tax</div>
              </>
            ) : (
              <>
                <div>net = gross / (1 + rate / 100)</div>
                <div>tax = gross − net</div>
              </>
            )}
            {showSplit && <div>CGST = SGST = tax / 2</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
