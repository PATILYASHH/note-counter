import React, { useState, useEffect } from 'react';
import { IndianRupee, Trash2, Save, Clock, Calculator, DollarSign, Euro, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

interface HistoryEntry {
  id: string;
  date: string;
  totalAmount: number;
  totalCount: number;
  denominationCounts: Record<number, number>;
  note?: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
}

interface CalculatorHistory {
  expression: string;
  result: string;
  timestamp: string;
}

interface HistoryTabProps {
  hideAmounts: boolean;
  selectedCurrency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
}

type HistoryType = 'money' | 'calculator';

const HistoryTab: React.FC<HistoryTabProps> = ({ hideAmounts, selectedCurrency }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [calculatorHistory, setCalculatorHistory] = useState<CalculatorHistory[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [note, setNote] = useState('');
  const [activeHistoryType, setActiveHistoryType] = useState<HistoryType>('money');

  // Load histories from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`countNoteHistory_${selectedCurrency}`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedCalcHistory = localStorage.getItem('calculatorHistory');
    if (savedCalcHistory) {
      setCalculatorHistory(JSON.parse(savedCalcHistory));
    }
  }, [selectedCurrency]);

  const formatAmount = (amount: number) => {
    if (hideAmounts) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  // Save current counts to history
  const saveCurrentToHistory = () => {
    const currentCounts = localStorage.getItem(`denominationCounts_${selectedCurrency}`);
    if (!currentCounts) return;
    
    const counts = JSON.parse(currentCounts);
    
    // Calculate totals
    const totalAmount = Object.entries(counts).reduce(
      (sum, [denomination, count]) => sum + (Number(denomination) * Number(count)), 
      0
    );
    
    const totalCount = Object.values(counts).reduce(
      (sum: number, count) => sum + Number(count), 
      0
    );
    
    // Create new history entry
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      totalAmount,
      totalCount,
      denominationCounts: counts,
      currency: selectedCurrency,
      note: note.trim() || undefined
    };
    
    // Update history
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem(`countNoteHistory_${selectedCurrency}`, JSON.stringify(updatedHistory));
    
    // Reset note
    setNote('');
  };

  // Delete history entry
  const deleteHistoryEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this history entry?')) {
      const updatedHistory = history.filter(entry => entry.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem(`countNoteHistory_${selectedCurrency}`, JSON.stringify(updatedHistory));
      
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    }
  };

  // Clear calculator history
  const clearCalculatorHistory = () => {
    if (window.confirm('Are you sure you want to clear all calculator history?')) {
      setCalculatorHistory([]);
      localStorage.removeItem('calculatorHistory');
    }
  };

  // Clear all history
  const clearAllHistory = () => {
    if (activeHistoryType === 'money') {
      if (window.confirm('Are you sure you want to clear all money counting history? This cannot be undone.')) {
        setHistory([]);
        setSelectedEntry(null);
        localStorage.removeItem(`countNoteHistory_${selectedCurrency}`);
      }
    } else {
      clearCalculatorHistory();
    }
  };

  // Load history entry to current counter
  const loadHistoryEntry = (entry: HistoryEntry) => {
    if (window.confirm('This will replace your current counts. Continue?')) {
      localStorage.setItem(`denominationCounts_${selectedCurrency}`, JSON.stringify(entry.denominationCounts));
      window.location.reload(); // Reload to update the counter
    }
  };

  // View details of a history entry
  const viewHistoryDetails = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
  };

  // Format denomination for display
  const formatDenomination = (value: number, count: number) => {
    const type = value <= 2 ? 'coin' : 'note';
    const CurrencyIcon = selectedCurrency === 'INR' ? IndianRupee : selectedCurrency === 'USD' ? DollarSign : Euro;
    return (
      <div key={value} className="flex justify-between py-1 border-b border-gray-200">
        <div className="flex items-center">
          <CurrencyIcon size={14} className="mr-1" />
          <span className="font-medium">{value}</span> {type}
        </div>
        <div>× {count}</div>
      </div>
    );
  };

  // Export history entry as PDF
  const exportToPDF = async (entry: HistoryEntry) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add watermark (lighter approach)
      pdf.setTextColor(230, 230, 230);
      pdf.setFontSize(40);
      pdf.text('notecounter.shop', pageWidth / 2, pageHeight / 2, { 
        align: 'center', 
        angle: 45 
      });
      
      // Reset color for main content
      pdf.setTextColor(0, 0, 0);
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Note Counter - Transaction Report', 20, 25);
      
      // Logo/Branding
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by notecounter.shop', pageWidth - 20, 20, { align: 'right' });
      
      // Transaction details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Details', 20, 45);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      let yPos = 55;
      
      // Date and Time
      pdf.text(`Date & Time: ${entry.date}`, 20, yPos);
      yPos += 8;
      
      // Currency
      pdf.text(`Currency: ${entry.currency}`, 20, yPos);
      yPos += 8;
      
      // Note if exists
      if (entry.note) {
        pdf.text(`Note: ${entry.note}`, 20, yPos);
        yPos += 8;
      }
      
      // Totals box
      yPos += 5;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPos, pageWidth - 40, 25, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Amount: ${formatAmount(entry.totalAmount)}`, 25, yPos + 8);
      pdf.text(`Total Count: ${entry.totalCount} items`, 25, yPos + 18);
      
      yPos += 35;
      
      // Denomination breakdown
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Denomination Breakdown', 20, yPos);
      yPos += 10;
      
      // Table header
      pdf.setFillColor(70, 70, 200);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(20, yPos, pageWidth - 40, 8, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Denomination', 25, yPos + 5);
      pdf.text('Type', pageWidth / 2, yPos + 5);
      pdf.text('Count', pageWidth - 60, yPos + 5);
      pdf.text('Amount', pageWidth - 25, yPos + 5, { align: 'right' });
      
      yPos += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Denomination rows
      Object.entries(entry.denominationCounts)
        .filter(([_, count]) => Number(count) > 0)
        .sort(([a], [b]) => Number(b) - Number(a))
        .forEach(([denom, count], index) => {
          const value = Number(denom);
          const itemCount = Number(count);
          const type = value <= 2 ? 'Coin' : 'Note';
          const amount = value * itemCount;
          
          // Alternate row colors
          if (index % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(20, yPos, pageWidth - 40, 6, 'F');
          }
          
          pdf.text(`${entry.currency} ${value}`, 25, yPos + 4);
          pdf.text(type, pageWidth / 2, yPos + 4);
          pdf.text(itemCount.toString(), pageWidth - 60, yPos + 4);
          pdf.text(formatAmount(amount), pageWidth - 25, yPos + 4, { align: 'right' });
          
          yPos += 6;
          
          // Check for page break
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
            
            // Add watermark to new page
            pdf.setTextColor(230, 230, 230);
            pdf.setFontSize(40);
            pdf.text('notecounter.shop', pageWidth / 2, pageHeight / 2, { 
              align: 'center', 
              angle: 45 
            });
            pdf.setTextColor(0, 0, 0);
          }
        });
      
      // Footer
      yPos = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by Note Counter - Free Online Money Counter', pageWidth / 2, yPos, { align: 'center' });
      pdf.text('Visit: https://notecounter.shop', pageWidth / 2, yPos + 5, { align: 'center' });
      pdf.text(`Report generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos + 10, { align: 'center' });
      
      // Save the PDF
      const fileName = `transaction-${entry.currency}-${entry.id}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const CurrencyIcon = selectedCurrency === 'INR' ? IndianRupee : selectedCurrency === 'USD' ? DollarSign : Euro;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left Column - History List */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button
                className={`py-2 px-4 rounded-md font-medium ${
                  activeHistoryType === 'money'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveHistoryType('money')}
              >
                <div className="flex items-center">
                  <CurrencyIcon className="mr-2" size={18} />
                  Money History
                </div>
              </button>
              <button
                className={`py-2 px-4 rounded-md font-medium ${
                  activeHistoryType === 'calculator'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveHistoryType('calculator')}
              >
                <div className="flex items-center">
                  <Calculator className="mr-2" size={18} />
                  Calculator History
                </div>
              </button>
            </div>
            {((activeHistoryType === 'money' && history.length > 0) ||
              (activeHistoryType === 'calculator' && calculatorHistory.length > 0)) && (
              <button 
                onClick={clearAllHistory}
                className="text-red-500 hover:text-red-700 text-sm flex items-center"
              >
                <Trash2 size={16} className="mr-1" />
                Clear All
              </button>
            )}
          </div>

          {activeHistoryType === 'money' && (
            <>
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note (optional)"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={saveCurrentToHistory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    Save Current
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No money counting history entries yet</p>
                  <p className="text-sm mt-2">Save your current count to see it here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {history.map((entry) => (
                    <div 
                      key={entry.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => viewHistoryDetails(entry)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{entry.date}</div>
                          {entry.note && (
                            <div className="text-gray-600 text-sm mt-1">{entry.note}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600 flex items-center justify-end">
                            <CurrencyIcon size={16} className="mr-1" />
                            {formatAmount(entry.totalAmount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.totalCount} items
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToPDF(entry);
                            }}
                            className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center"
                            title="Export as PDF"
                          >
                            <FileDown size={12} className="mr-1" />
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeHistoryType === 'calculator' && (
            <>
              {calculatorHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No calculator history yet</p>
                  <p className="text-sm mt-2">Use the calculator to see your calculations here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {calculatorHistory.map((entry, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-3 transition-colors border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-600">
                            {entry.expression} = <span className="text-indigo-600">{entry.result}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {entry.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Right Column - Selected Entry Details */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          {activeHistoryType === 'money' && selectedEntry ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Entry Details</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Date & Time</div>
                  <div className="font-medium">{selectedEntry.date}</div>
                </div>
                
                {selectedEntry.note && (
                  <div>
                    <div className="text-sm text-gray-600">Note</div>
                    <div className="font-medium">{selectedEntry.note}</div>
                  </div>
                )}
                
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Count</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {selectedEntry.totalCount}
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-indigo-600 flex items-center">
                    <CurrencyIcon className="mr-1" size={20} />
                    {formatAmount(selectedEntry.totalAmount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Denomination Breakdown</div>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    {Object.entries(selectedEntry.denominationCounts)
                      .filter(([_, count]) => Number(count) > 0)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([denom, count]) => formatDenomination(Number(denom), Number(count)))
                    }
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button 
                    onClick={() => loadHistoryEntry(selectedEntry)}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Load to Counter
                  </button>
                  <button 
                    onClick={() => exportToPDF(selectedEntry)}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm flex items-center justify-center"
                  >
                    <FileDown size={16} className="mr-1" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => deleteHistoryEntry(selectedEntry.id)}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
              <div className="mb-4">
                <Clock size={48} className="opacity-30" />
              </div>
              <p className="text-center">
                {activeHistoryType === 'money' 
                  ? 'Select a money counting entry to view details'
                  : 'Calculator history details appear in the main panel'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;