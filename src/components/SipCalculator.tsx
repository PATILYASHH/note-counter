import React, { useMemo, useState } from 'react';
import { Calculator, Copy, Info, TrendingUp, Save } from 'lucide-react';

interface SipCalculatorProps {
  currency: string;
  currencySymbol: string;
  currencyName: string;
  currencyFlag?: string;
}

type Mode = 'sip' | 'lumpsum';

const round2 = (n: number) => Math.round(n * 100) / 100;

const SipCalculator: React.FC<SipCalculatorProps> = ({
  currency,
  currencySymbol,
  currencyName,
  currencyFlag,
}) => {
  const [mode, setMode] = useState<Mode>('sip');
  const [amount, setAmount] = useState<string>('5000');
  const [rate, setRate] = useState<string>('12');
  const [years, setYears] = useState<string>('10');
  const [compounding, setCompounding] = useState<'annually' | 'half-yearly' | 'quarterly' | 'monthly'>('annually');
  const [savedFlash, setSavedFlash] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const t = parseFloat(years);

    if (!isFinite(P) || !isFinite(annualRate) || !isFinite(t) || P <= 0 || t <= 0) {
      return { valid: false, invested: 0, returns: 0, futureValue: 0, schedule: [] };
    }

    if (mode === 'sip') {
      const months = Math.round(t * 12);
      const r = annualRate / 12 / 100;
      let futureValue: number;
      if (r === 0) {
        futureValue = P * months;
      } else {
        futureValue = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
      }
      const invested = P * months;
      const returns = futureValue - invested;

      const schedule: Array<{ year: number; invested: number; value: number; returns: number }> = [];
      for (let y = 1; y <= Math.min(Math.ceil(t), 50); y++) {
        const m = y * 12;
        const v = r === 0 ? P * m : P * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
        const inv = P * m;
        schedule.push({ year: y, invested: inv, value: v, returns: v - inv });
      }
      return { valid: true, invested, returns, futureValue, schedule };
    }

    // Lump sum compound interest
    const compoundingMap = { 'annually': 1, 'half-yearly': 2, 'quarterly': 4, 'monthly': 12 };
    const n = compoundingMap[compounding];
    const r = annualRate / 100;
    const futureValue = P * Math.pow(1 + r / n, n * t);
    const returns = futureValue - P;

    const schedule: Array<{ year: number; invested: number; value: number; returns: number }> = [];
    for (let y = 1; y <= Math.min(Math.ceil(t), 50); y++) {
      const v = P * Math.pow(1 + r / n, n * y);
      schedule.push({ year: y, invested: P, value: v, returns: v - P });
    }
    return { valid: true, invested: P, returns, futureValue, schedule };
  }, [amount, rate, years, mode, compounding]);

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const investedShare =
    result.valid && result.futureValue > 0 ? (result.invested / result.futureValue) * 100 : 0;
  const returnsShare = 100 - investedShare;

  const summaryText = result.valid
    ? mode === 'sip'
      ? `SIP ${fmt(parseFloat(amount))}/mo for ${years} yr @ ${rate}% → ${fmt(round2(result.futureValue))} (invested ${fmt(round2(result.invested))}, returns ${fmt(round2(result.returns))})`
      : `Lump sum ${fmt(parseFloat(amount))} @ ${rate}% (${compounding}) for ${years} yr → ${fmt(round2(result.futureValue))} (returns ${fmt(round2(result.returns))})`
    : '';

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const saveToHistory = () => {
    if (!result.valid) return;
    try {
      const existing = JSON.parse(localStorage.getItem('sipHistory') || '[]');
      const entry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        currency,
        currencySymbol,
        mode,
        amount: parseFloat(amount),
        annualRate: parseFloat(rate),
        years: parseFloat(years),
        compounding: mode === 'lumpsum' ? compounding : null,
        invested: round2(result.invested),
        returns: round2(result.returns),
        futureValue: round2(result.futureValue),
      };
      localStorage.setItem('sipHistory', JSON.stringify([entry, ...existing].slice(0, 100)));
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
              <TrendingUp size={20} className="text-brand-600" />
              {mode === 'sip' ? 'SIP Calculator' : 'Compound Interest Calculator'}
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {currencyFlag} {currencyName} ({currencySymbol})
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-ink-100 rounded-lg mb-4">
          <button
            onClick={() => setMode('sip')}
            className={`py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              mode === 'sip'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Monthly SIP
          </button>
          <button
            onClick={() => setMode('lumpsum')}
            className={`py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              mode === 'lumpsum'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Lump Sum
          </button>
        </div>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            {mode === 'sip' ? 'Monthly investment' : 'Initial investment (principal)'}
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

        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Expected annual return rate
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
        </label>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Time period (years)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="any"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
          />
        </label>

        {mode === 'lumpsum' && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
              Compounding frequency
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1.5">
              {(['annually', 'half-yearly', 'quarterly', 'monthly'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCompounding(c)}
                  className={`px-2 py-1.5 rounded-md text-xs font-semibold border transition-all capitalize ${
                    compounding === c
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-ink-700 border-ink-200 hover:border-brand-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-800">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            {mode === 'sip' ? (
              <>
                FV = P × ((1+r)<sup>n</sup>−1) / r × (1+r), where P is monthly investment, r is monthly rate, n is number of months. Estimates assume a constant return rate; actual market returns vary.
              </>
            ) : (
              <>
                A = P × (1 + r/n)<sup>n×t</sup>, where P is principal, r is annual rate, n is compounding periods per year, t is years.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="nc-card-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <Calculator size={20} className="text-emerald-600" />
            Projection
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
          <div className="nc-stat bg-brand-50 border-brand-200/60">
            <div className="nc-stat-label text-brand-700/80">
              Future value after {years || 0} year{parseFloat(years) === 1 ? '' : 's'}
            </div>
            <div className="nc-stat-value text-brand-700 truncate">
              {fmt(round2(result.futureValue))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="nc-stat bg-ink-50 border-ink-200">
              <div className="nc-stat-label">
                {mode === 'sip' ? 'Total invested' : 'Principal'}
              </div>
              <div className="nc-stat-value text-ink-900 truncate">
                {fmt(round2(result.invested))}
              </div>
            </div>
            <div className="nc-stat bg-emerald-50 border-emerald-200/60">
              <div className="nc-stat-label text-emerald-700/80">Estimated returns</div>
              <div className="nc-stat-value text-emerald-700 truncate">
                {fmt(round2(result.returns))}
              </div>
            </div>
          </div>

          {/* Invested vs Returns bar */}
          {result.valid && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink-600 mb-1.5">
                <span>Invested {investedShare.toFixed(1)}%</span>
                <span>Returns {returnsShare.toFixed(1)}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-ink-100">
                <div className="bg-brand-500" style={{ width: `${investedShare}%` }} />
                <div className="bg-emerald-500" style={{ width: `${returnsShare}%` }} />
              </div>
            </div>
          )}
        </div>

        {result.valid && result.schedule.length > 0 && (
          <div className="mt-5 pt-5 border-t border-ink-200">
            <div className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Year-by-year growth
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-ink-200">
              <table className="w-full text-xs">
                <thead className="bg-ink-50 sticky top-0">
                  <tr className="text-left">
                    <th className="px-2 py-2 font-semibold text-ink-700">Year</th>
                    <th className="px-2 py-2 font-semibold text-ink-700 text-right">Invested</th>
                    <th className="px-2 py-2 font-semibold text-ink-700 text-right">Returns</th>
                    <th className="px-2 py-2 font-semibold text-ink-700 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="border-t border-ink-100 hover:bg-ink-50/60">
                      <td className="px-2 py-1.5 font-semibold text-ink-700">{row.year}</td>
                      <td className="px-2 py-1.5 text-right text-ink-900">
                        {fmt(round2(row.invested))}
                      </td>
                      <td className="px-2 py-1.5 text-right text-emerald-700">
                        {fmt(round2(row.returns))}
                      </td>
                      <td className="px-2 py-1.5 text-right text-brand-700 font-semibold">
                        {fmt(round2(row.value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-ink-500 mt-2">
              Estimates only. Real-world returns vary year-to-year, are taxed, and may be negative in down markets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SipCalculator;
