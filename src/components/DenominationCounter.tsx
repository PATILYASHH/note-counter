import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Minus, DollarSign, Euro, PoundSterling, Coins } from 'lucide-react';

interface DenominationCounterProps {
  value: number;
  type: 'note' | 'coin';
  count: number;
  onCountChange: (count: number) => void;
  hideAmount: boolean;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
}

const DenominationCounter: React.FC<DenominationCounterProps> = ({
  value,
  type,
  count,
  onCountChange,
  hideAmount,
  currency
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(count.toString());

  // Sync inputValue with count prop whenever count changes from parent
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
    setInputValue(value);

    if (/[+\-]/.test(value)) {
      return;
    }

    const newValue = parseInt(value);
    if (!isNaN(newValue) && newValue >= 0) {
      onCountChange(newValue);
    } else if (value === '') {
      // Allow empty input while typing
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
      const finalValue = 0;
      onCountChange(finalValue);
      setInputValue(finalValue.toString());
      return;
    }
    
    const result = evaluateExpression(currentValue);
    onCountChange(result);
    setInputValue(result.toString());
  };

  const getBgColor = () => {
    if (type === 'coin') {
      return 'bg-yellow-100';
    }
    
    switch (value) {
      case 2000: return 'bg-pink-100';
      case 500: return 'bg-green-100';
      case 200: return 'bg-yellow-100';
      case 100: return 'bg-blue-100';
      case 50: return 'bg-purple-100';
      case 20: return 'bg-orange-100';
      case 10: return 'bg-red-100';
      case 5: return 'bg-teal-100';
      default: return 'bg-gray-100';
    }
  };

  const formatValue = (value: number) => {
    if (currency === 'USD' && value < 1) {
      return `${value * 100}¢`;
    }
    if (currency === 'GBP' && value < 1) {
      return `${value * 100}p`;
    }
    if (currency === 'AED' && value < 1) {
      return `${value * 100} fils`;
    }
    return value.toString();
  };

  const formatTotal = (amount: number) => {
    if (hideAmount) return '••••••';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'USD' || currency === 'GBP' || currency === 'AED' ? 2 : 0,
    }).format(amount);
  };

  const CurrencyIcon = currency === 'INR' ? IndianRupee : currency === 'USD' ? DollarSign : currency === 'EUR' ? Euro : currency === 'GBP' ? PoundSterling : Coins;

  return (
    <div className={`${getBgColor()} rounded-lg p-3 shadow-sm`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {((currency === 'USD' || currency === 'GBP' || currency === 'AED') ? value >= 1 : true) && <CurrencyIcon size={18} className="mr-1" />}
          <span className="font-bold text-lg">{formatValue(value)}</span>
          <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
        </div>
        <div className="text-sm font-medium">
          Total: {formatTotal(value * count)}
        </div>
      </div>
      
      <div className="flex items-center mt-2">
        <button
          onClick={handleDecrement}
          className="bg-white rounded-l-md p-2 border border-gray-300 hover:bg-gray-100 active:bg-gray-200"
          disabled={count === 0}
          aria-label={`Decrease ${value} ${type} count`}
        >
          <Minus size={16} className={count === 0 ? "text-gray-400" : "text-gray-700"} />
        </button>
        
        <input
          type="text"
          value={isFocused ? inputValue : count}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-center py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label={`${value} ${type} count`}
          placeholder="Enter count"
        />
        
        <button
          onClick={handleIncrement}
          className="bg-white rounded-r-md p-2 border border-gray-300 hover:bg-gray-100 active:bg-gray-200"
          aria-label={`Increase ${value} ${type} count`}
        >
          <Plus size={16} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default DenominationCounter;