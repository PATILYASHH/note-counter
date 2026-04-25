import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Minus, DollarSign, Euro, PoundSterling, Coins } from 'lucide-react';

interface DenominationCounterProps {
  value: number;
  type: 'note' | 'coin';
  count: number;
  onCountChange: (count: number) => void;
  hideAmount: boolean;
  currency: string;
  currencySymbol?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const DenominationCounter: React.FC<DenominationCounterProps> = ({
  value,
  type,
  count,
  onCountChange,
  hideAmount,
  currency,
  currencySymbol,
  inputRef,
  onInputKeyDown
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(count.toString());

  useEffect(() => {
    if (!isFocused) {
      setInputValue(count.toString());
    }
  }, [count, isFocused]);

  const handleIncrement = () => {
    const newCount = count + 1;
    onCountChange(newCount);
    setInputValue(newCount.toString());
  };

  const handleDecrement = () => {
    if (count > 0) {
      const newCount = count - 1;
      onCountChange(newCount);
      setInputValue(newCount.toString());
    }
  };

  const evaluateExpression = (expression: string): number => {
    expression = expression.replace(/\s/g, '');

    if (expression.startsWith('+') || expression.startsWith('-')) {
      expression = count + expression;
    }

    try {
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expression)();
      return Math.floor(Math.abs(result));
    } catch (error) {
      return count;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value !== '' && !/^[0-9+\-]*$/.test(value)) {
      return;
    }

    setInputValue(value);

    if (/[+\-]/.test(value)) {
      return;
    }

    const newValue = parseInt(value);
    if (!isNaN(newValue) && newValue >= 0) {
      onCountChange(newValue);
    } else if (value === '') {
      onCountChange(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const result = evaluateExpression(inputValue);
      onCountChange(result);
      setInputValue(result.toString());
      e.currentTarget.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const currentValue = e.target.value.trim();

    if (!currentValue) {
      onCountChange(0);
      setInputValue('0');
      return;
    }

    const result = evaluateExpression(currentValue);
    onCountChange(result);
    setInputValue(result.toString());
  };

  // Tinted left accent bar — keeps color cues but tones the card down
  const getAccent = () => {
    if (type === 'coin') return 'bg-amber-400';
    switch (value) {
      case 2000: return 'bg-pink-500';
      case 500:  return 'bg-emerald-500';
      case 200:  return 'bg-yellow-500';
      case 100:  return 'bg-blue-500';
      case 50:   return 'bg-violet-500';
      case 20:   return 'bg-orange-500';
      case 10:   return 'bg-rose-500';
      case 5:    return 'bg-teal-500';
      default:   return 'bg-ink-400';
    }
  };

  const formatValue = (value: number) => {
    if (currency === 'USD' && value < 1) return `${Math.round(value * 100)}¢`;
    if (currency === 'GBP' && value < 1) return `${Math.round(value * 100)}p`;
    if (currency === 'AED' && value < 1) return `${Math.round(value * 100)} fils`;
    return value.toString();
  };

  const formatTotal = (amount: number) => {
    if (hideAmount) return '••••••';
    try {
      const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
      if (validCurrencies.includes(currency)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits:
            currency === 'USD' || currency === 'GBP' || currency === 'AED' ? 2 : 0,
        }).format(amount);
      }
    } catch (error) {
      // fall through to custom currency formatting
    }
    const symbol = currencySymbol || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const CurrencyIcon =
    currency === 'INR' ? IndianRupee :
    currency === 'USD' ? DollarSign :
    currency === 'EUR' ? Euro :
    currency === 'GBP' ? PoundSterling :
    Coins;

  const showIcon =
    (currency === 'USD' || currency === 'GBP' || currency === 'AED') ? value >= 1 : true;

  const isActive = count > 0;

  return (
    <div className={`nc-denom relative overflow-hidden ${isActive ? 'ring-1 ring-brand-200/70 shadow-card' : ''}`}>
      {/* Accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getAccent()}`} aria-hidden="true" />

      <div className="pl-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center min-w-0">
            {showIcon && <CurrencyIcon size={16} className="mr-1 text-ink-500 flex-shrink-0" />}
            <span className="font-bold text-base text-ink-900 tabular-nums">{formatValue(value)}</span>
            <span className="ml-2 text-[11px] uppercase tracking-wider text-ink-400 font-medium">
              {type}
            </span>
          </div>
          <div className="text-sm font-semibold text-ink-700 tabular-nums truncate">
            {formatTotal(value * count)}
          </div>
        </div>

        <div className="flex items-stretch mt-2.5 rounded-lg overflow-hidden border border-ink-200">
          <button
            onClick={handleDecrement}
            className="nc-denom-step rounded-l-lg border-0 border-r"
            disabled={count === 0}
            aria-label={`Decrease ${value} ${type} count`}
            type="button"
          >
            <Minus size={16} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9+\-]*"
            value={isFocused ? inputValue : count}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (onInputKeyDown) {
                const prev = e.currentTarget.value;
                onInputKeyDown(e);
                if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                  setTimeout(() => {
                    if (typeof count === 'number') {
                      setInputValue(
                        e.key === 'ArrowUp'
                          ? (Number(prev) + 1).toString()
                          : Math.max(0, Number(prev) - 1).toString()
                      );
                    }
                  }, 0);
                  return;
                }
              }
              handleKeyDown(e);
            }}
            className="nc-denom-input border-0"
            aria-label={`${value} ${type} count`}
            placeholder="0"
            ref={inputRef}
          />

          <button
            onClick={handleIncrement}
            className="nc-denom-step rounded-r-lg border-0 border-l"
            aria-label={`Increase ${value} ${type} count`}
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DenominationCounter;
