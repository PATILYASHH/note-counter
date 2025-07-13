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
  hash?: string;
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
      
      // Enhanced color scheme
      const colors = {
        primary: [79, 70, 229] as [number, number, number], // Indigo
        secondary: [99, 102, 241] as [number, number, number], // Light indigo
        accent: [236, 72, 153] as [number, number, number], // Pink
        success: [34, 197, 94] as [number, number, number], // Green
        warning: [251, 191, 36] as [number, number, number], // Yellow
        text: [17, 24, 39] as [number, number, number], // Dark gray
        lightText: [107, 114, 128] as [number, number, number], // Medium gray
        background: [248, 250, 252] as [number, number, number], // Light gray
        white: [255, 255, 255] as [number, number, number]
      };

      // Add professional background watermark
      pdf.setTextColor(240, 240, 245);
      pdf.setFontSize(60);
      pdf.text('NOTE COUNTER', pageWidth / 2, pageHeight / 2, { 
        align: 'center', 
        angle: 45 
      });
      
      // Header section with gradient-like effect
      pdf.setFillColor(...colors.primary);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Header content
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRANSACTION REPORT', 20, 18);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Money Counter Solution', 20, 26);
      pdf.text('notecounter.shop', pageWidth - 20, 18, { align: 'right' });
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth - 20, 26, { align: 'right' });
      
      // Transaction info card
      let yPos = 50;
      pdf.setFillColor(...colors.background);
      pdf.setDrawColor(...colors.primary);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'FD');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Information', 25, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Two-column layout for transaction details
      const leftCol = 25;
      const rightCol = pageWidth / 2 + 10;
      let rowY = yPos + 18;
      
      // Left column
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date & Time:', leftCol, rowY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(entry.date, leftCol + 25, rowY);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Currency:', leftCol, rowY + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(entry.currency, leftCol + 25, rowY + 6);
      
      // Right column
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction ID:', rightCol, rowY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${entry.id.slice(-8).toUpperCase()}`, rightCol + 30, rowY);
      
      if (entry.note) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Note:', rightCol, rowY + 6);
        pdf.setFont('helvetica', 'normal');
        // Wrap long notes
        const noteText = entry.note.length > 25 ? entry.note.substring(0, 25) + '...' : entry.note;
        pdf.text(noteText, rightCol + 15, rowY + 6);
      }
      
      yPos += 45;
      
      // Summary cards section
      const cardWidth = (pageWidth - 60) / 2;
      const cardHeight = 25;
      
      // Total Amount Card
      pdf.setFillColor(...colors.success);
      pdf.roundedRect(20, yPos, cardWidth, cardHeight, 3, 3, 'F');
      
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL AMOUNT', 25, yPos + 8);
      pdf.setFontSize(18);
      pdf.text(formatAmount(entry.totalAmount), 25, yPos + 18);
      
      // Total Count Card
      pdf.setFillColor(...colors.primary);
      pdf.roundedRect(30 + cardWidth, yPos, cardWidth, cardHeight, 3, 3, 'F');
      
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL ITEMS', 35 + cardWidth, yPos + 8);
      pdf.setFontSize(18);
      pdf.text(`${entry.totalCount} pieces`, 35 + cardWidth, yPos + 18);
      
      yPos += 40;
      
      // Denomination breakdown section
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('💰 Denomination Breakdown', 20, yPos);
      yPos += 15;
      
      // Enhanced table design
      const rowHeight = 8;
      const colPositions = [20, 60, 85, 110, 140];
      
      // Table header with gradient effect
      pdf.setFillColor(...colors.secondary);
      pdf.roundedRect(20, yPos, pageWidth - 40, rowHeight, 2, 2, 'F');
      
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Denomination', colPositions[0] + 2, yPos + 5.5);
      pdf.text('Type', colPositions[1] + 2, yPos + 5.5);
      pdf.text('Count', colPositions[2] + 2, yPos + 5.5);
      pdf.text('Unit Value', colPositions[3] + 2, yPos + 5.5);
      pdf.text('Total', colPositions[4] + 2, yPos + 5.5);
      
      yPos += rowHeight;
      
      // Table rows with enhanced styling
      let totalRowAmount = 0;
      const denomEntries = Object.entries(entry.denominationCounts)
        .filter(([_, count]) => Number(count) > 0)
        .sort(([a], [b]) => Number(b) - Number(a));
      
      denomEntries.forEach(([denom, count], index) => {
        const value = Number(denom);
        const itemCount = Number(count);
        const type = value <= 2 ? '🪙 Coin' : '💵 Note';
        const amount = value * itemCount;
        totalRowAmount += amount;
        
        // Alternating row colors with subtle styling
        if (index % 2 === 0) {
          pdf.setFillColor(252, 252, 254);
          pdf.rect(20, yPos, pageWidth - 40, rowHeight, 'F');
        }
        
        // Row border
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.1);
        pdf.line(20, yPos + rowHeight, pageWidth - 20, yPos + rowHeight);
        
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Currency symbol and denomination
        const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
        pdf.text(`${currencySymbols[entry.currency]} ${value}`, colPositions[0] + 2, yPos + 5.5);
        pdf.text(type, colPositions[1] + 2, yPos + 5.5);
        pdf.text(itemCount.toString(), colPositions[2] + 2, yPos + 5.5);
        pdf.text(formatAmount(value), colPositions[3] + 2, yPos + 5.5);
        
        // Highlighted amount
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.success);
        pdf.text(formatAmount(amount), colPositions[4] + 2, yPos + 5.5);
        
        yPos += rowHeight;
        
        // Check for page break
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = 20;
          
          // Add watermark to new page
          pdf.setTextColor(240, 240, 245);
          pdf.setFontSize(60);
          pdf.text('NOTE COUNTER', pageWidth / 2, pageHeight / 2, { 
            align: 'center', 
            angle: 45 
          });
        }
      });
      
      // Table footer with total
      yPos += 5;
      pdf.setFillColor(...colors.accent);
      pdf.roundedRect(20, yPos, pageWidth - 40, 10, 2, 2, 'F');
      
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRAND TOTAL:', colPositions[3] + 2, yPos + 6.5);
      pdf.text(formatAmount(totalRowAmount), colPositions[4] + 2, yPos + 6.5);
      
      yPos += 20;
      
      // Statistics section
      if (yPos < pageHeight - 60) {
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 Transaction Statistics', 20, yPos);
        yPos += 10;
        
        // Stats cards
        const statsData = [
          { label: 'Notes Count', value: denomEntries.filter(([denom]) => Number(denom) > 2).reduce((sum, [_, count]) => sum + Number(count), 0) },
          { label: 'Coins Count', value: denomEntries.filter(([denom]) => Number(denom) <= 2).reduce((sum, [_, count]) => sum + Number(count), 0) },
          { label: 'Denominations Used', value: denomEntries.length }
        ];
        
        const statsCardWidth = (pageWidth - 80) / 3;
        statsData.forEach((stat, index) => {
          const xPos = 20 + (statsCardWidth + 20) * index;
          
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(...colors.primary);
          pdf.roundedRect(xPos, yPos, statsCardWidth, 15, 2, 2, 'FD');
          
          pdf.setTextColor(...colors.text);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(stat.label, xPos + 3, yPos + 6);
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.primary);
          pdf.text(stat.value.toString(), xPos + 3, yPos + 12);
        });
      }
      
      // Enhanced footer
      const footerY = pageHeight - 25;
      pdf.setFillColor(...colors.primary);
      pdf.rect(0, footerY, pageWidth, 25, 'F');
      
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('🌟 Generated by Note Counter - Professional Money Counting Solution', pageWidth / 2, footerY + 8, { align: 'center' });
      pdf.text('🔗 Visit: https://notecounter.shop | 📧 Contact: support@notecounter.shop', pageWidth / 2, footerY + 14, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.text(`📅 Report generated on: ${new Date().toLocaleString()} | 🔒 Secure & Private`, pageWidth / 2, footerY + 20, { align: 'center' });
      
      // Save the PDF with enhanced filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `NoteCounter-${entry.currency}-Report-${timestamp}.pdf`;
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
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{entry.date}</div>
                            {entry.hash && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-mono">
                                {entry.hash}
                              </span>
                            )}
                          </div>
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
                
                {selectedEntry.hash && (
                  <div>
                    <div className="text-sm text-gray-600">Reference Hash</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-mono">
                        {selectedEntry.hash}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEntry.hash!);
                          alert('Hash copied to clipboard!');
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                        title="Copy hash"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
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