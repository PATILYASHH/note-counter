import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ArrowLeftRight, Copy, Globe, Info, RefreshCw } from 'lucide-react';

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

interface CurrencyConverterProps {
  selectedCurrency: string;
  availableCurrencies: CurrencyOption[];
}

interface FxRatesCache {
  base: string;            // always 'USD' in our cache
  rates: Record<string, number>; // code (uppercase) -> rate per 1 USD
  fetchedAt: number;       // epoch ms
  source: string;
}

// 24h cache TTL — most users won't hit the network at all
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'fxRatesCacheV1';
const RATES_URL = 'https://www.floatrates.com/daily/usd.json';

const round2 = (n: number) => Math.round(n * 100) / 100;
const round4 = (n: number) => Math.round(n * 10000) / 10000;

const loadCache = (): FxRatesCache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxRatesCache;
    if (!parsed?.rates || !parsed?.base || !parsed?.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveCache = (cache: FxRatesCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

const formatRelativeTime = (ms: number) => {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
};

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  selectedCurrency,
  availableCurrencies,
}) => {
  const [fromCode, setFromCode] = useState<string>(selectedCurrency);
  const [toCode, setToCode] = useState<string>(() => {
    if (selectedCurrency === 'USD') return 'INR';
    return 'USD';
  });
  const [amountInput, setAmountInput] = useState<string>('100');
  const [cache, setCache] = useState<FxRatesCache | null>(() => loadCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchRates = useCallback(async (force = false) => {
    const existing = loadCache();
    if (!force && existing && Date.now() - existing.fetchedAt < CACHE_TTL_MS) {
      setCache(existing);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RATES_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Record<string, { code: string; rate: number }>;
      const rates: Record<string, number> = { USD: 1 };
      for (const k of Object.keys(data)) {
        const entry = data[k];
        if (entry?.code && typeof entry.rate === 'number') {
          rates[entry.code.toUpperCase()] = entry.rate;
        }
      }
      const next: FxRatesCache = {
        base: 'USD',
        rates,
        fetchedAt: Date.now(),
        source: 'floatrates.com (daily)',
      };
      saveCache(next);
      setCache(next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load rates';
      setError(msg);
      // fall back to existing stale cache silently if available
      if (existing) setCache(existing);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — only hits the network if cache is missing or stale
  useEffect(() => {
    fetchRates(false);
  }, [fetchRates]);

  // Convert via USD-pegged rates
  const convertedRate = useMemo(() => {
    if (!cache) return null;
    const fromRate = cache.rates[fromCode.toUpperCase()];
    const toRate = cache.rates[toCode.toUpperCase()];
    if (!fromRate || !toRate) return null;
    // 1 unit of `from` = (1 / fromRate) USD = (1 / fromRate) * toRate units of `to`
    return toRate / fromRate;
  }, [cache, fromCode, toCode]);

  const amount = parseFloat(amountInput);
  const converted = useMemo(() => {
    if (!isFinite(amount) || convertedRate === null) return null;
    return amount * convertedRate;
  }, [amount, convertedRate]);

  const fromInfo = availableCurrencies.find((c) => c.code === fromCode);
  const toInfo = availableCurrencies.find((c) => c.code === toCode);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const fmt = (n: number, symbol: string) =>
    `${symbol}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const supportedFrom = cache && fromInfo && cache.rates[fromCode.toUpperCase()];
  const supportedTo = cache && toInfo && cache.rates[toCode.toUpperCase()];
  const unsupportedNote =
    cache && (!supportedFrom || !supportedTo)
      ? `Live rates not available for ${!supportedFrom ? fromCode : toCode}. Try a different currency or use a custom rate elsewhere.`
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
      {/* Inputs */}
      <div className="nc-card-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <Globe size={20} className="text-brand-600" />
              Currency Converter
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Live exchange rates · cached 24h · {cache?.source ?? 'loading…'}
            </p>
          </div>
          <button
            onClick={() => fetchRates(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            title="Refresh rates now"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Updating…' : 'Refresh'}
          </button>
        </div>

        {/* Amount */}
        <label className="block mb-4">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Amount
          </span>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">
              {fromInfo?.symbol ?? fromCode}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            />
          </div>
        </label>

        {/* From / To row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 mb-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">From</span>
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag ?? ''} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={swap}
            className="mb-1 p-2.5 rounded-lg border border-ink-200 bg-white hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors"
            title="Swap currencies"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight size={16} />
          </button>
          <label className="block">
            <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">To</span>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base font-semibold"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag ?? ''} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-3">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Couldn't fetch live rates ({error}). {cache ? 'Showing the last cached rates.' : 'No cached rates available — connect and try Refresh.'}
            </span>
          </div>
        )}

        {unsupportedNote && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-3">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>{unsupportedNote}</span>
          </div>
        )}

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-800">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Rates are fetched once from <a href="https://www.floatrates.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">floatrates.com</a> and cached in your browser for 24 hours. The fetch sends only a public GET — no user data, no cookies, no tracking.
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="nc-card-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight size={20} className="text-emerald-600" />
            Converted
          </h3>
          {converted !== null && (
            <button
              onClick={() =>
                copy(
                  `${fmt(amount, fromInfo?.symbol ?? '')} ${fromCode} = ${fmt(round2(converted), toInfo?.symbol ?? '')} ${toCode}`,
                )
              }
              className={`p-2 rounded-lg transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-ink-500 hover:text-brand-600 hover:bg-brand-50'
              }`}
              title="Copy result"
            >
              <Copy size={16} />
            </button>
          )}
        </div>

        {converted !== null ? (
          <div className="space-y-3">
            <div className="nc-stat bg-ink-50 border-ink-200">
              <div className="nc-stat-label">You give</div>
              <div className="nc-stat-value text-ink-900 truncate">
                {fmt(isFinite(amount) ? amount : 0, fromInfo?.symbol ?? '')} {fromCode}
              </div>
            </div>
            <div className="nc-stat bg-brand-50 border-brand-200/60">
              <div className="nc-stat-label text-brand-700/80">You receive</div>
              <div className="nc-stat-value text-brand-700 truncate">
                {fmt(round2(converted), toInfo?.symbol ?? '')} {toCode}
              </div>
            </div>
            <div className="nc-stat bg-emerald-50 border-emerald-200/60">
              <div className="nc-stat-label text-emerald-700/80">Exchange rate</div>
              <div className="text-base font-bold text-emerald-800 mt-1 tabular-nums">
                1 {fromCode} = {convertedRate !== null ? round4(convertedRate).toLocaleString() : '—'} {toCode}
              </div>
              {convertedRate !== null && convertedRate > 0 && (
                <div className="text-xs text-emerald-700/80 mt-0.5 tabular-nums">
                  1 {toCode} = {round4(1 / convertedRate).toLocaleString()} {fromCode}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-ink-500">
            <Globe size={48} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium text-ink-700">
              {loading ? 'Loading exchange rates…' : 'Enter an amount to convert'}
            </p>
          </div>
        )}

        {cache && (
          <div className="mt-5 pt-5 border-t border-ink-200 text-xs text-ink-500">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span>
                Rates updated <strong className="text-ink-700">{formatRelativeTime(cache.fetchedAt)}</strong>
              </span>
              <span className="font-mono text-[10px]">
                {new Date(cache.fetchedAt).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-ink-400 mt-1.5 leading-relaxed">
              Mid-market rates for reference only. Banks and money-changers add a margin — your actual rate will differ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
