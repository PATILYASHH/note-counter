import React, { useState, useEffect } from 'react';
import { IndianRupee, Trash2, Save, Clock, Calculator, DollarSign, Euro, FileDown, Receipt, Landmark, Copy, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';

interface HistoryEntry {
  id: string;
  date: string;
  totalAmount: number;
  totalCount: number;
  denominationCounts: Record<number, number>;
  note?: string;
  currency: string;
  hash?: string;
}

interface CalculatorHistory {
  expression: string;
  result: string;
  timestamp: string;
}

interface TaxHistoryEntry {
  id: string;
  timestamp: string;
  currency: string;
  currencySymbol: string;
  taxName: string;
  rate: number;
  mode: 'add' | 'remove';
  net: number;
  tax: number;
  gross: number;
  splitCgstSgst?: boolean;
}

interface EmiHistoryEntry {
  id: string;
  timestamp: string;
  currency: string;
  currencySymbol: string;
  principal: number;
  annualRate: number;
  months: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

interface SipHistoryEntry {
  id: string;
  timestamp: string;
  currency: string;
  currencySymbol: string;
  mode: 'sip' | 'lumpsum';
  amount: number;
  annualRate: number;
  years: number;
  compounding: string | null;
  invested: number;
  returns: number;
  futureValue: number;
}

interface HistoryTabProps {
  hideAmounts: boolean;
  selectedCurrency: string;
}

type HistoryType = 'money' | 'tax' | 'emi' | 'sip' | 'calculator';

const HistoryTab: React.FC<HistoryTabProps> = ({ hideAmounts, selectedCurrency }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [calculatorHistory, setCalculatorHistory] = useState<CalculatorHistory[]>([]);
  const [taxHistory, setTaxHistory] = useState<TaxHistoryEntry[]>([]);
  const [emiHistory, setEmiHistory] = useState<EmiHistoryEntry[]>([]);
  const [sipHistory, setSipHistory] = useState<SipHistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [note, setNote] = useState('');
  const [activeHistoryType, setActiveHistoryType] = useState<HistoryType>('money');

  // Load histories from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`countNoteHistory_${selectedCurrency}`);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);

    const savedCalcHistory = localStorage.getItem('calculatorHistory');
    setCalculatorHistory(savedCalcHistory ? JSON.parse(savedCalcHistory) : []);

    const savedTaxHistory = localStorage.getItem('taxHistory');
    setTaxHistory(savedTaxHistory ? JSON.parse(savedTaxHistory) : []);

    const savedEmiHistory = localStorage.getItem('emiHistory');
    setEmiHistory(savedEmiHistory ? JSON.parse(savedEmiHistory) : []);

    const savedSipHistory = localStorage.getItem('sipHistory');
    setSipHistory(savedSipHistory ? JSON.parse(savedSipHistory) : []);
  }, [selectedCurrency]);

  const fmtMoney = (amount: number, symbol: string) => {
    if (hideAmounts) return '••••••';
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const deleteTaxEntry = (id: string) => {
    if (!window.confirm('Delete this tax entry?')) return;
    const updated = taxHistory.filter((e) => e.id !== id);
    setTaxHistory(updated);
    localStorage.setItem('taxHistory', JSON.stringify(updated));
  };

  const deleteEmiEntry = (id: string) => {
    if (!window.confirm('Delete this EMI entry?')) return;
    const updated = emiHistory.filter((e) => e.id !== id);
    setEmiHistory(updated);
    localStorage.setItem('emiHistory', JSON.stringify(updated));
  };

  const deleteSipEntry = (id: string) => {
    if (!window.confirm('Delete this SIP entry?')) return;
    const updated = sipHistory.filter((e) => e.id !== id);
    setSipHistory(updated);
    localStorage.setItem('sipHistory', JSON.stringify(updated));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

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
    } else if (activeHistoryType === 'tax') {
      if (window.confirm('Clear all tax / GST history?')) {
        setTaxHistory([]);
        localStorage.removeItem('taxHistory');
      }
    } else if (activeHistoryType === 'emi') {
      if (window.confirm('Clear all EMI history?')) {
        setEmiHistory([]);
        localStorage.removeItem('emiHistory');
      }
    } else if (activeHistoryType === 'sip') {
      if (window.confirm('Clear all SIP / Compound interest history?')) {
        setSipHistory([]);
        localStorage.removeItem('sipHistory');
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
        const symbol = currencySymbols[entry.currency as keyof typeof currencySymbols] || entry.currency;
        pdf.text(`${symbol} ${value}`, colPositions[0] + 2, yPos + 5.5);
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
        <div className="nc-card-lg p-4 sm:p-5 h-full">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="inline-flex items-center bg-ink-100 p-1 rounded-lg flex-wrap">
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeHistoryType === 'money'
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                onClick={() => setActiveHistoryType('money')}
              >
                <CurrencyIcon size={15} />
                Money
                {history.length > 0 && (
                  <span className="text-[10px] bg-ink-200 text-ink-700 rounded-full px-1.5 py-0.5 tabular-nums">
                    {history.length}
                  </span>
                )}
              </button>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeHistoryType === 'tax'
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                onClick={() => setActiveHistoryType('tax')}
              >
                <Receipt size={15} />
                Tax
                {taxHistory.length > 0 && (
                  <span className="text-[10px] bg-ink-200 text-ink-700 rounded-full px-1.5 py-0.5 tabular-nums">
                    {taxHistory.length}
                  </span>
                )}
              </button>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeHistoryType === 'emi'
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                onClick={() => setActiveHistoryType('emi')}
              >
                <Landmark size={15} />
                EMI
                {emiHistory.length > 0 && (
                  <span className="text-[10px] bg-ink-200 text-ink-700 rounded-full px-1.5 py-0.5 tabular-nums">
                    {emiHistory.length}
                  </span>
                )}
              </button>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeHistoryType === 'sip'
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                onClick={() => setActiveHistoryType('sip')}
              >
                <TrendingUp size={15} />
                SIP
                {sipHistory.length > 0 && (
                  <span className="text-[10px] bg-ink-200 text-ink-700 rounded-full px-1.5 py-0.5 tabular-nums">
                    {sipHistory.length}
                  </span>
                )}
              </button>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  activeHistoryType === 'calculator'
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                onClick={() => setActiveHistoryType('calculator')}
              >
                <Calculator size={15} />
                Calc
              </button>
            </div>
            {((activeHistoryType === 'money' && history.length > 0) ||
              (activeHistoryType === 'tax' && taxHistory.length > 0) ||
              (activeHistoryType === 'emi' && emiHistory.length > 0) ||
              (activeHistoryType === 'sip' && sipHistory.length > 0) ||
              (activeHistoryType === 'calculator' && calculatorHistory.length > 0)) && (
              <button
                onClick={clearAllHistory}
                className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>

          {activeHistoryType === 'money' && (
            <>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="nc-input flex-1"
                />
                <button onClick={saveCurrentToHistory} className="nc-btn-primary">
                  <Save size={16} />
                  Save current
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <Clock size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-ink-700">No history yet</p>
                  <p className="text-sm mt-1">Save your current count to see it here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-xl2 border p-3 cursor-pointer transition-all ${
                        selectedEntry?.id === entry.id
                          ? 'border-brand-300 bg-brand-50 shadow-card'
                          : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                      }`}
                      onClick={() => viewHistoryDetails(entry)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-sm text-ink-900">{entry.date}</div>
                            {entry.hash && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded text-[11px] font-mono font-semibold">
                                {entry.hash}
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <div className="text-ink-600 text-sm mt-1 truncate">{entry.note}</div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-brand-700 tabular-nums flex items-center justify-end">
                            <CurrencyIcon size={14} className="mr-1" />
                            {formatAmount(entry.totalAmount)}
                          </div>
                          <div className="text-xs text-ink-500 tabular-nums">
                            {entry.totalCount} items
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToPDF(entry);
                            }}
                            className="mt-2 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                            title="Export as PDF"
                          >
                            <FileDown size={11} />
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

          {activeHistoryType === 'tax' && (
            <>
              {taxHistory.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <Receipt size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-ink-700">No tax / GST history yet</p>
                  <p className="text-sm mt-1">Use the Tax tab and tap Save to record calculations here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {taxHistory.map((entry) => {
                    const summary = `${entry.taxName} @ ${entry.rate}% on ${fmtMoney(entry.net, entry.currencySymbol)} = ${fmtMoney(entry.tax, entry.currencySymbol)} | Total: ${fmtMoney(entry.gross, entry.currencySymbol)}`;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl2 border border-ink-200 p-3 hover:border-ink-300 hover:bg-ink-50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-bold">
                                <Receipt size={11} />
                                {entry.taxName} {entry.rate}%
                              </span>
                              <span className="text-[11px] font-mono uppercase text-ink-500">
                                {entry.currency} · {entry.mode === 'add' ? 'Add' : 'Remove'}
                              </span>
                            </div>
                            <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-ink-500">Net</div>
                                <div className="font-semibold text-ink-900 tabular-nums truncate">
                                  {fmtMoney(entry.net, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-amber-700/80">{entry.splitCgstSgst ? 'CGST+SGST' : 'Tax'}</div>
                                <div className="font-semibold text-amber-700 tabular-nums truncate">
                                  {fmtMoney(entry.tax, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-brand-700/80">Gross</div>
                                <div className="font-bold text-brand-700 tabular-nums truncate">
                                  {fmtMoney(entry.gross, entry.currencySymbol)}
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-ink-500 mt-1.5">{entry.timestamp}</div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => copyText(summary)}
                              className="p-1.5 rounded text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Copy summary"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => deleteTaxEntry(entry.id)}
                              className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeHistoryType === 'emi' && (
            <>
              {emiHistory.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <Landmark size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-ink-700">No EMI history yet</p>
                  <p className="text-sm mt-1">Use the EMI tab and tap Save to record loans here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {emiHistory.map((entry) => {
                    const tenure =
                      entry.months % 12 === 0
                        ? `${entry.months / 12} yr`
                        : `${entry.months} mo`;
                    const summary = `EMI ${fmtMoney(entry.emi, entry.currencySymbol)}/mo for ${tenure} | Principal ${fmtMoney(entry.principal, entry.currencySymbol)} @ ${entry.annualRate}% | Total ${fmtMoney(entry.totalPayment, entry.currencySymbol)}`;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl2 border border-ink-200 p-3 hover:border-ink-300 hover:bg-ink-50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                                <Landmark size={11} />
                                EMI {fmtMoney(entry.emi, entry.currencySymbol)}/mo
                              </span>
                              <span className="text-[11px] font-mono uppercase text-ink-500">
                                {entry.currency} · {entry.annualRate}% · {tenure}
                              </span>
                            </div>
                            <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-ink-500">Principal</div>
                                <div className="font-semibold text-ink-900 tabular-nums truncate">
                                  {fmtMoney(entry.principal, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-amber-700/80">Interest</div>
                                <div className="font-semibold text-amber-700 tabular-nums truncate">
                                  {fmtMoney(entry.totalInterest, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-brand-700/80">Total</div>
                                <div className="font-bold text-brand-700 tabular-nums truncate">
                                  {fmtMoney(entry.totalPayment, entry.currencySymbol)}
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-ink-500 mt-1.5">{entry.timestamp}</div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => copyText(summary)}
                              className="p-1.5 rounded text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Copy summary"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => deleteEmiEntry(entry.id)}
                              className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeHistoryType === 'sip' && (
            <>
              {sipHistory.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <TrendingUp size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-ink-700">No SIP / Compound interest history yet</p>
                  <p className="text-sm mt-1">Use the SIP tab and tap Save to record projections here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {sipHistory.map((entry) => {
                    const summary =
                      entry.mode === 'sip'
                        ? `SIP ${fmtMoney(entry.amount, entry.currencySymbol)}/mo × ${entry.years} yr @ ${entry.annualRate}% → ${fmtMoney(entry.futureValue, entry.currencySymbol)}`
                        : `Lump sum ${fmtMoney(entry.amount, entry.currencySymbol)} @ ${entry.annualRate}% (${entry.compounding ?? ''}) × ${entry.years} yr → ${fmtMoney(entry.futureValue, entry.currencySymbol)}`;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl2 border border-ink-200 p-3 hover:border-ink-300 hover:bg-ink-50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-800 rounded text-xs font-bold">
                                <TrendingUp size={11} />
                                {entry.mode === 'sip' ? 'SIP' : 'Lump sum'} · {entry.annualRate}%
                              </span>
                              <span className="text-[11px] font-mono uppercase text-ink-500">
                                {entry.currency} ·{' '}
                                {entry.mode === 'sip'
                                  ? `${fmtMoney(entry.amount, entry.currencySymbol)}/mo`
                                  : `${fmtMoney(entry.amount, entry.currencySymbol)} once`}{' '}
                                · {entry.years} yr
                              </span>
                            </div>
                            <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-ink-500">Invested</div>
                                <div className="font-semibold text-ink-900 tabular-nums truncate">
                                  {fmtMoney(entry.invested, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-emerald-700/80">Returns</div>
                                <div className="font-semibold text-emerald-700 tabular-nums truncate">
                                  {fmtMoney(entry.returns, entry.currencySymbol)}
                                </div>
                              </div>
                              <div>
                                <div className="text-brand-700/80">Future value</div>
                                <div className="font-bold text-brand-700 tabular-nums truncate">
                                  {fmtMoney(entry.futureValue, entry.currencySymbol)}
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-ink-500 mt-1.5">{entry.timestamp}</div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => copyText(summary)}
                              className="p-1.5 rounded text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Copy summary"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => deleteSipEntry(entry.id)}
                              className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeHistoryType === 'calculator' && (
            <>
              {calculatorHistory.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <Calculator size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-ink-700">No calculator history yet</p>
                  <p className="text-sm mt-1">Use the calculator to see your calculations here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {calculatorHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="rounded-xl2 border border-ink-200 p-3 hover:bg-ink-50 transition-colors"
                    >
                      <div className="font-mono text-sm text-ink-700 tabular-nums">
                        {entry.expression} <span className="text-ink-400">=</span>{' '}
                        <span className="text-brand-700 font-bold">{entry.result}</span>
                      </div>
                      <div className="text-xs text-ink-500 mt-1">{entry.timestamp}</div>
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
        <div className="nc-card-lg p-4 sm:p-5 h-full md:sticky md:top-20">
          {activeHistoryType === 'money' && selectedEntry ? (
            <>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-4">Entry details</h2>

              <div className="space-y-4">
                <div>
                  <div className="nc-stat-label">Date &amp; time</div>
                  <div className="font-semibold text-ink-800 mt-1">{selectedEntry.date}</div>
                </div>

                {selectedEntry.hash && (
                  <div>
                    <div className="nc-stat-label">Reference hash</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-1 bg-brand-100 text-brand-700 rounded font-mono text-sm font-semibold">
                        {selectedEntry.hash}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEntry.hash!);
                          alert('Hash copied to clipboard!');
                        }}
                        className="text-xs text-ink-500 hover:text-ink-800 underline-offset-2 hover:underline"
                        title="Copy hash"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {selectedEntry.note && (
                  <div>
                    <div className="nc-stat-label">Note</div>
                    <div className="font-medium text-ink-800 mt-1">{selectedEntry.note}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="nc-stat bg-ink-50 border-ink-200">
                    <div className="nc-stat-label">Items</div>
                    <div className="nc-stat-value text-ink-900">{selectedEntry.totalCount}</div>
                  </div>
                  <div className="nc-stat bg-brand-50 border-brand-200/60">
                    <div className="nc-stat-label text-brand-700/80">Amount</div>
                    <div className="nc-stat-value text-brand-700 truncate">
                      {formatAmount(selectedEntry.totalAmount)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="nc-stat-label mb-2">Denomination breakdown</div>
                  <div className="max-h-[220px] overflow-y-auto pr-1 rounded-lg border border-ink-200 divide-y divide-ink-100">
                    {Object.entries(selectedEntry.denominationCounts)
                      .filter(([_, count]) => Number(count) > 0)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([denom, count]) => (
                        <div key={denom} className="flex justify-between items-center px-3 py-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <CurrencyIcon size={13} className="text-ink-400" />
                            <span className="font-semibold tabular-nums">{denom}</span>
                            <span className="text-ink-400 text-xs uppercase tracking-wide">
                              {Number(denom) <= 2 ? 'coin' : 'note'}
                            </span>
                          </div>
                          <span className="text-ink-700 tabular-nums">× {count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => loadHistoryEntry(selectedEntry)}
                    className="nc-btn-primary text-xs"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => exportToPDF(selectedEntry)}
                    className="nc-btn-success text-xs"
                  >
                    <FileDown size={14} />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteHistoryEntry(selectedEntry.id)}
                    className="nc-btn-danger text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-ink-500 py-12">
              <Clock size={48} className="opacity-30 mb-3" />
              <p className="text-center text-sm">
                {activeHistoryType === 'money'
                  ? 'Select an entry to view details'
                  : activeHistoryType === 'tax'
                  ? 'Tax / GST records appear in the main panel'
                  : activeHistoryType === 'emi'
                  ? 'EMI records appear in the main panel'
                  : activeHistoryType === 'sip'
                  ? 'SIP / Compound interest records appear in the main panel'
                  : 'Calculator history details appear in the main panel'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;