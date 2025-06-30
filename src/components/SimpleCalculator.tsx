import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Trash2 } from 'lucide-react';

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: string;
}

interface SimpleCalculatorProps {
  initialValue?: string;
  showPad?: boolean;
}

const SimpleCalculator: React.FC<SimpleCalculatorProps> = ({ initialValue = '0', showPad = false }) => {
  const [display, setDisplay] = useState(initialValue);
  const [expression, setExpression] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('calculatorHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setDisplay(initialValue);
      setExpression('');
      setHasCalculated(false);
    }
  }, [initialValue]);

  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validInput = /^[0-9+\-*/().%\s]*$/;
    
    if (validInput.test(value) || value === '') {
      setDisplay(value);
      setHasCalculated(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEqualsClick();
    }
  };

  const handleOperatorClick = (operator: string) => {
    if (hasCalculated) {
      setExpression(display + ' ' + operator + ' ');
      setHasCalculated(false);
    } else {
      setDisplay(display + operator);
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setExpression('');
    setHasCalculated(false);
  };

  const handleBackspaceClick = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEqualsClick = () => {
    try {
      const fullExpression = display;
      // Using Function constructor to safely evaluate the expression
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + fullExpression.replace(/×/g, '*').replace(/÷/g, '/'))();
      const resultString = String(result);
      
      setExpression(fullExpression + ' = ');
      setDisplay(resultString);
      setHasCalculated(true);

      // Add to history
      const newHistoryEntry: CalculationHistory = {
        expression: fullExpression,
        result: resultString,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    } catch (error) {
      setDisplay('Error');
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear calculator history?')) {
      setHistory([]);
      localStorage.removeItem('calculatorHistory');
    }
  };

  const useHistoryResult = (result: string) => {
    setDisplay(result);
    setExpression('');
    setHasCalculated(false);
    setShowHistory(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-gray-600 text-xs h-4 overflow-x-auto whitespace-nowrap">
            {expression}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100 transition-colors"
            title="Toggle History"
          >
            <History size={14} />
          </button>
        </div>
        <input
          type="text"
          value={display}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-white p-2 text-right text-sm sm:text-lg font-bold rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0"
        />
      </div>

      {showHistory && history.length > 0 && (
        <div className="mb-2 bg-white rounded-lg p-2 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">History</span>
            <button
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Clear History"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                className="text-sm p-1 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => useHistoryResult(entry.result)}
              >
                <div className="text-gray-600">{entry.expression} = {entry.result}</div>
                <div className="text-xs text-gray-400">{entry.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operators in two attractive rows */}
      <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
        {/* First row of operators */}
        <div className="flex gap-1 sm:gap-2">
          <button 
            onClick={handleClearClick}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            C
          </button>
          <button 
            onClick={handleBackspaceClick}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-gray-500 hover:to-gray-600 active:from-gray-600 active:to-gray-700 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={() => handleOperatorClick('%')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 active:from-purple-700 active:to-purple-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            %
          </button>
          <button 
            onClick={() => handleOperatorClick('/')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            ÷
          </button>
        </div>
        
        {/* Second row of operators */}
        <div className="flex gap-1 sm:gap-2">
          <button 
            onClick={() => handleOperatorClick('*')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            ×
          </button>
          <button 
            onClick={() => handleOperatorClick('-')}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            −
          </button>
          <button 
            onClick={() => handleOperatorClick('+')}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            +
          </button>
          <button 
            onClick={handleEqualsClick}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg font-bold hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            =
          </button>
        </div>
      </div>

      {/* Numbers in a 4x3 grid - conditionally rendered */}
      {showPad && (
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {/* Numbers row 1 */}
          {[7, 8, 9].map(num => (
            <button 
              key={num}
              onClick={() => setDisplay(display === '0' ? String(num) : display + num)}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
            >
              {num}
            </button>
          ))}
          {/* Empty space for alignment */}
          <div></div>
          
          {/* Numbers row 2 */}
          {[4, 5, 6].map(num => (
            <button 
              key={num}
              onClick={() => setDisplay(display === '0' ? String(num) : display + num)}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
            >
              {num}
            </button>
          ))}
          {/* Empty space for alignment */}
          <div></div>
          
          {/* Numbers row 3 */}
          {[1, 2, 3].map(num => (
            <button 
              key={num}
              onClick={() => setDisplay(display === '0' ? String(num) : display + num)}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
            >
              {num}
            </button>
          ))}
          {/* Empty space for alignment */}
          <div></div>
          
          {/* Bottom row - 0 and decimal point */}
          <button 
            onClick={() => setDisplay(display === '0' ? '0' : display + '0')}
            className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg col-span-2"
          >
            0
          </button>
          <button 
            onClick={() => setDisplay(display.includes('.') ? display : display + '.')}
            className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg font-bold hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 transition-all shadow-sm sm:shadow-md transform hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
          >
            .
          </button>
          {/* Empty space for alignment */}
          <div></div>
        </div>
      )}
      
    </div>
  );
};

export default SimpleCalculator;