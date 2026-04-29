import React, { useMemo, useState } from 'react';
import { Calculator, Copy, Info, Landmark, Save } from 'lucide-react';

interface EMICalculatorProps {
  currency: string;
  currencySymbol: string;
  currencyName: string;
  currencyFlag?: string;
}

type TenureUnit = 'years' | 'months';

const round2 = (n: number) => Math.round(n * 100) / 100;

const EMICalculator: React.FC<EMICalculatorProps> = ({
  currency,
  currencySymbol,
  currencyName,
  currencyFlag,
}) => {
  const [principal, setPrincipal] = useState<string>('100000');
  const [rate, setRate] = useState<string>('9');
  const [tenure, setTenure] = useState<string>('5');
  const [unit, setUnit] = useState<TenureUnit>('years');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const t = parseFloat(tenure);

    if (!isFinite(P) || !isFinite(annualRate) || !isFinite(t) || P <= 0 || t <= 0) {
      return { valid: false, emi: 0, totalInterest: 0, totalPayment: 0, months: 0, monthlyRate: 0 };
    }

    const months = unit === 'years' ? Math.round(t * 12) : Math.round(t);
    const r = annualRate / 12 / 100;

    let emi: number;
    if (r === 0) {
      emi = P / months;
    } else {
      emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    return { valid: true, emi, totalInterest, totalPayment, months, monthlyRate: r };
  }, [principal, rate, tenure, unit]);

  const schedule = useMemo(() => {
    if (!result.valid) return [];
    const P = parseFloat(principal);
    const r = result.monthlyRate;
    const rows: Array<{
      month: number;
      principal: number;
      interest: number;
      balance: number;
    }> = [];
    let balance = P;
    for (let i = 1; i <= result.months; i++) {
      const interest = balance * r;
      const principalPaid = result.emi - interest;
      balance = Math.max(0, balance - principalPaid);
      rows.push({ month: i, principal: principalPaid, interest, balance });
    }
    return rows;
  }, [result, principal]);

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const principalShare = result.valid && result.totalPayment > 0
    ? (parseFloat(principal) / result.totalPayment) * 100
    : 0;
  const interestShare = 100 - principalShare;

  const summaryText = result.valid
    ? `EMI: ${fmt(round2(result.emi))} for ${result.months} months | Principal: ${fmt(parseFloat(principal))} | Interest: ${fmt(round2(result.totalInterest))} | Total: ${fmt(round2(result.totalPayment))}`
    : '';

  const [savedFlash, setSavedFlash] = useState(false);
  const saveToHistory = () => {
    if (!result.valid) return;
    try {
      const existing = JSON.parse(localStorage.getItem('emiHistory') || '[]');
      const entry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        currency,
        currencySymbol,
        principal: parseFloat(principal),
        annualRate: parseFloat(rate),
        months: result.months,
        emi: round2(result.emi),
        totalInterest: round2(result.totalInterest),
        totalPayment: round2(result.totalPayment),
      };
      localStorage.setItem('emiHistory', JSON.stringify([entry, ...existing].slice(0, 100)));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch {
      // ignore
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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
              <Landmark size={20} className="text-brand-600" />
              Loan EMI Calculator
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {currencyFlag} {currencyName} ({currencySymbol})
            </p>
          </div>
        </div>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Loan amount (principal)
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
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            />
          </div>
        </label>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Annual interest rate
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

        <div className="mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Loan tenure
          </span>
          <div className="grid grid-cols-[1fr_auto] gap-2 mt-1.5">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            />
            <div className="flex p-1 bg-ink-100 rounded-lg">
              <button
                onClick={() => setUnit('years')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  unit === 'years'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                Years
              </button>
              <button
                onClick={() => setUnit('months')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  unit === 'months'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                Months
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-800">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            EMI = P × r × (1 + r)<sup>n</sup> / ((1 + r)<sup>n</sup> − 1), where r is the monthly rate
            and n is the number of months.
          </span>
        </div>
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
          <div className="nc-stat bg-brand-50 border-brand-200/60">
            <div className="nc-stat-label text-brand-700/80">Monthly EMI</div>
            <div className="nc-stat-value text-brand-700 truncate">
              {fmt(round2(result.emi))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="nc-stat bg-ink-50 border-ink-200">
              <div className="nc-stat-label">Principal</div>
              <div className="nc-stat-value text-ink-900 truncate">
                {fmt(parseFloat(principal) || 0)}
              </div>
            </div>
            <div className="nc-stat bg-amber-50 border-amber-200/60">
              <div className="nc-stat-label text-amber-700/80">Total interest</div>
              <div className="nc-stat-value text-amber-700 truncate">
                {fmt(round2(result.totalInterest))}
              </div>
            </div>
          </div>

          <div className="nc-stat bg-emerald-50 border-emerald-200/60">
            <div className="nc-stat-label text-emerald-700/80">
              Total payment over {result.months} months
            </div>
            <div className="nc-stat-value text-emerald-700 truncate">
              {fmt(round2(result.totalPayment))}
            </div>
          </div>

          {/* Principal vs Interest bar */}
          {result.valid && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink-600 mb-1.5">
                <span>Principal {principalShare.toFixed(1)}%</span>
                <span>Interest {interestShare.toFixed(1)}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-ink-100">
                <div
                  className="bg-brand-500"
                  style={{ width: `${principalShare}%` }}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${interestShare}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {result.valid && (
          <div className="mt-5 pt-5 border-t border-ink-200">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              {showSchedule ? 'Hide' : 'Show'} amortization schedule
            </button>

            {showSchedule && (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-ink-200">
                <table className="w-full text-xs">
                  <thead className="bg-ink-50 sticky top-0">
                    <tr className="text-left">
                      <th className="px-2 py-2 font-semibold text-ink-700">#</th>
                      <th className="px-2 py-2 font-semibold text-ink-700 text-right">Principal</th>
                      <th className="px-2 py-2 font-semibold text-ink-700 text-right">Interest</th>
                      <th className="px-2 py-2 font-semibold text-ink-700 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.month} className="border-t border-ink-100 hover:bg-ink-50/60">
                        <td className="px-2 py-1.5 font-semibold text-ink-700">{row.month}</td>
                        <td className="px-2 py-1.5 text-right text-ink-900">
                          {fmt(round2(row.principal))}
                        </td>
                        <td className="px-2 py-1.5 text-right text-amber-700">
                          {fmt(round2(row.interest))}
                        </td>
                        <td className="px-2 py-1.5 text-right text-ink-700">
                          {fmt(round2(row.balance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EMICalculator;
