import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { IndianRupee, Menu, Github, Globe, History, Calculator, Save, Eye, EyeOff, X, Mail, Heart, DollarSign, MenuIcon, Crown, Cloud, Smartphone, Shield, FileText, Printer, Download, Upload, Euro } from 'lucide-react';
// import { supabase, isSupabaseConfigured } from './lib/supabase';
import DenominationCounter from './components/DenominationCounter';
import HistoryTab from './components/HistoryTab';
import SimpleCalculator from './components/SimpleCalculator';
import Advertisement from './components/Advertisement';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Update the type definition to include EUR
type Currency = 'INR' | 'USD' | 'EUR';

const CURRENCY_DENOMINATIONS = {
  INR: [
    { value: 500, type: 'note' },
    { value: 200, type: 'note' },
    { value: 100, type: 'note' },
    { value: 50, type: 'note' },
    { value: 20, type: 'note' },
    { value: 10, type: 'note' },
    { value: 5, type: 'note' },
    { value: 2, type: 'coin' },
    { value: 1, type: 'coin' },
  ],
  USD: [
    { value: 100, type: 'note' },
    { value: 50, type: 'note' },
    { value: 20, type: 'note' },
    { value: 10, type: 'note' },
    { value: 5, type: 'note' },
    { value: 1, type: 'note' },
    { value: 0.25, type: 'coin' },
    { value: 0.10, type: 'coin' },
    { value: 0.05, type: 'coin' },
    { value: 0.01, type: 'coin' },
  ],
  EUR: [
    { value: 500, type: 'note' },
    { value: 200, type: 'note' },
    { value: 100, type: 'note' },
    { value: 50, type: 'note' },
    { value: 20, type: 'note' },
    { value: 10, type: 'note' },
    { value: 5, type: 'note' },
    { value: 2, type: 'coin' },
    { value: 1, type: 'coin' },
    { value: 0.50, type: 'coin' },
    { value: 0.20, type: 'coin' },
    { value: 0.10, type: 'coin' },
  ]
};

interface CountState {
  [key: number]: number;
}

function App() {
  // Update the state type to include EUR
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return (savedCurrency === 'INR' || savedCurrency === 'USD' || savedCurrency === 'EUR') ? savedCurrency as Currency : 'INR';
  });

  const [activeTab, setActiveTab] = useState<'counter' | 'history'>('counter');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sendToCalculator, setSendToCalculator] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Initialize counts based on selected currency
  const initializeCounts = (currency: Currency): CountState => {
    const initialCounts: CountState = {};
    CURRENCY_DENOMINATIONS[currency].forEach(denom => {
      initialCounts[denom.value] = 0;
    });
    return initialCounts;
  };

  const [counts, setCounts] = useState<CountState>(() => {
    const savedCounts = localStorage.getItem(`denominationCounts_${selectedCurrency}`);
    if (savedCounts) {
      try {
        return JSON.parse(savedCounts);
      } catch (error) {
        console.error('Error parsing saved counts:', error);
        return initializeCounts(selectedCurrency);
      }
    }
    return initializeCounts(selectedCurrency);
  });

  // Save currency preference whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Load counts when currency changes
  useEffect(() => {
    const savedCounts = localStorage.getItem(`denominationCounts_${selectedCurrency}`);
    if (savedCounts) {
      try {
        setCounts(JSON.parse(savedCounts));
      } catch (error) {
        console.error('Error parsing saved counts:', error);
        setCounts(initializeCounts(selectedCurrency));
      }
    } else {
      setCounts(initializeCounts(selectedCurrency));
    }
  }, [selectedCurrency]);

  const totalAmount = Object.entries(counts).reduce(
    (sum, [denomination, count]) => sum + (Number(denomination) * count), 
    0
  );

  const totalCount = Object.values(counts).reduce(
    (sum, count) => sum + count, 
    0
  );

  // Save counts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`denominationCounts_${selectedCurrency}`, JSON.stringify(counts));
    } catch (error) {
      console.error('Error saving counts to localStorage:', error);
    }
  }, [counts, selectedCurrency]);

  const handleCountChange = (denomination: number, count: number) => {
    if (isNaN(count) || count < 0) return;
    setCounts(prev => ({
      ...prev,
      [denomination]: count
    }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all counts?')) {
      const resetCounts = initializeCounts(selectedCurrency);
      setCounts(resetCounts);
      
      // Also clear from localStorage immediately
      try {
        localStorage.setItem(`denominationCounts_${selectedCurrency}`, JSON.stringify(resetCounts));
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };

  const handleSave = () => {
    // Use current state instead of localStorage to avoid sync issues
    const totalAmount = Object.entries(counts).reduce(
      (sum, [denomination, count]) => sum + (Number(denomination) * Number(count)), 
      0
    );
    
    const totalCount = Object.values(counts).reduce(
      (sum, count) => sum + Number(count), 
      0
    );
    
    // Check if there's anything to save
    if (totalCount === 0) {
      alert('No counts to save. Please add some denominations first.');
      return;
    }
    
    try {
      const savedHistory = localStorage.getItem(`countNoteHistory_${selectedCurrency}`) || '[]';
      const history = JSON.parse(savedHistory);
      
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        totalAmount,
        totalCount,
        denominationCounts: { ...counts }, // Create a copy
        currency: selectedCurrency
      };
      
      const updatedHistory = [newEntry, ...history];
      localStorage.setItem(`countNoteHistory_${selectedCurrency}`, JSON.stringify(updatedHistory));
      
      alert('Summary saved successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Error saving summary. Please try again.');
    }
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    if (newCurrency !== selectedCurrency) {
      setSelectedCurrency(newCurrency);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        currencies: ['INR', 'USD', 'EUR'].reduce((acc, currency) => {
          const counts = localStorage.getItem(`denominationCounts_${currency}`);
          const history = localStorage.getItem(`countNoteHistory_${currency}`);
          const calcHistory = localStorage.getItem('calculatorHistory');
          
          acc[currency] = {
            currentCounts: counts ? JSON.parse(counts) : {},
            history: history ? JSON.parse(history) : []
          };
          
          if (currency === selectedCurrency && calcHistory) {
            acc[currency].calculatorHistory = JSON.parse(calcHistory);
          }
          
          return acc;
        }, {} as any),
        settings: {
          selectedCurrency: localStorage.getItem('selectedCurrency') || 'INR'
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `note-counter-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          
          if (!importData.version || !importData.currencies) {
            throw new Error('Invalid data format');
          }
          
          if (window.confirm('This will replace all your current data. Are you sure you want to continue?')) {
            // Import data for each currency
            Object.entries(importData.currencies).forEach(([currency, data]: [string, any]) => {
              if (data.currentCounts) {
                localStorage.setItem(`denominationCounts_${currency}`, JSON.stringify(data.currentCounts));
              }
              if (data.history) {
                localStorage.setItem(`countNoteHistory_${currency}`, JSON.stringify(data.history));
              }
              if (data.calculatorHistory) {
                localStorage.setItem('calculatorHistory', JSON.stringify(data.calculatorHistory));
              }
            });
            
            // Import settings
            if (importData.settings?.selectedCurrency) {
              localStorage.setItem('selectedCurrency', importData.settings.selectedCurrency);
              setSelectedCurrency(importData.settings.selectedCurrency);
            }
            
            // Reload the page to reflect changes
            window.location.reload();
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format and try again.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleProUpgrade = () => {
    // For now, just show an alert. In a real app, this would redirect to payment
    alert('Pro features coming soon! This would redirect to the upgrade page.');
    setShowProModal(false);
  };

  const leftColumnDenominations = CURRENCY_DENOMINATIONS[selectedCurrency].slice(0, Math.ceil(CURRENCY_DENOMINATIONS[selectedCurrency].length / 2));
  const rightColumnDenominations = CURRENCY_DENOMINATIONS[selectedCurrency].slice(Math.ceil(CURRENCY_DENOMINATIONS[selectedCurrency].length / 2));

  const formatAmount = (amount: number) => {
    if (hideAmounts) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const CurrencyIcon = selectedCurrency === 'INR' ? IndianRupee : selectedCurrency === 'USD' ? DollarSign : Euro;

  const ProModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Crown className="text-yellow-500 mr-3" size={32} />
              <h2 className="text-3xl font-bold text-gray-800">Upgrade to Pro Counter</h2>
            </div>
            <button
              onClick={() => setShowProModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-4">
              Unlock powerful features to take your money counting to the next level!
            </p>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">$1/months</div>
                <div className="text-gray-600">or $10/year</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Pro Features</h3>
                
                <div className="flex items-start space-x-3">
                  <Cloud className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-800">Free Cloud Storage</h4>
                    <p className="text-gray-600 text-sm">Unlimited cloud storage for all your counting data</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Smartphone className="text-green-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-800">Multi-Device Access</h4>
                    <p className="text-gray-600 text-sm">Access your data from any device, anywhere</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="text-purple-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-800">Daily Data Backup</h4>
                    <p className="text-gray-600 text-sm">Automatic daily backups ensure your data is never lost</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="text-red-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-800">PDF Export</h4>
                    <p className="text-gray-600 text-sm">Export your counting reports as professional PDFs</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Printer className="text-indigo-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-800">Print Reports</h4>
                    <p className="text-gray-600 text-sm">Print detailed reports directly from the app</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Benefits</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Priority customer support
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Advanced analytics and insights
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Custom branding options
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Team collaboration features
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      No ads or promotional content
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">7-Day Free Trial</h4>
                  <p className="text-blue-700 text-sm">
                    Try Pro risk-free! If you're not completely satisfied, get a full refund within 7 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleProUpgrade}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center mx-auto"
              >
                <Crown size={24} className="mr-2" />
                Comming Soon
              </button>
              <p className="text-gray-500 text-sm mt-2">
                Cancel anytime • Secure payment • Instant activation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MenuModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={() => setShowMenu(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Data Management Section */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Data Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleExportData();
                    setShowMenu(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                >
                  <Download size={18} className="mr-2" />
                  <span className="font-medium">Export Data</span>
                </button>
                <button
                  onClick={() => {
                    handleImportData();
                    setShowMenu(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                >
                  <Upload size={18} className="mr-2" />
                  <span className="font-medium">Import Data</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Export your data as a backup or import previously saved data. Includes all counting history, calculator history, and settings.
              </p>
            </section>

            {/* Documentation Section */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Documentation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Currency Support</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">
                    Note Counter supports multiple currencies:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 ml-2">
                    <li>Switch between INR and USD from the currency selector</li>
                    <li>Each currency maintains its own separate history</li>
                    <li>Automatic formatting based on currency selection</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Quick Math Input</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 ml-2">
                    <li>Type <code className="bg-gray-100 px-1 rounded text-xs sm:text-sm">+13</code> to add 13</li>
                    <li>Type <code className="bg-gray-100 px-1 rounded text-xs sm:text-sm">-5</code> to subtract 5</li>
                    <li>Press Enter or click outside to calculate</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 ml-2">
                    <li>Hide amounts for privacy</li>
                    <li>Save counts to history</li>
                    <li>Built-in calculator with history</li>
                    <li>Multiple currency support</li>
                    <li>Export/Import data for backup</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact & Feedback Section */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Contact & Feedback</h3>
              <div className="space-y-3">
                <a
                  href="mailto:patilyasshh@gmail.com"
                  className="flex items-center px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <Mail className="mr-2 flex-shrink-0" size={18} />
                  <span className="text-sm sm:text-base">Send Feedback</span>
                </a>
                <a
                  href="https://www.yashpatil.tech/more/contact.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <Globe className="mr-2 flex-shrink-0" size={18} />
                  <span className="text-sm sm:text-base">Contact Developer</span>
                </a>
              </div>
            </section>

            {/* Upgrade Section */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Upgrade</h3>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowProModal(true);
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md flex items-center justify-center font-medium"
              >
                <Crown size={20} className="mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">Become Pro Counter</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 shadow-lg">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold flex items-center">
                  <CurrencyIcon className="mr-2" size={20} />
                  <span className="hidden xs:inline">Note Counter</span>
                  <span className="xs:hidden">Counter</span>
                </h1>
                <div className="md:hidden">
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-indigo-700/50 transition-colors"
                  >
                    <Menu size={24} />
                  </button>
                </div>
                <div className="hidden md:flex space-x-4 items-center">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                    className="bg-white text-indigo-600 px-3 py-1 rounded-md font-medium"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <button
                    className={`py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === 'counter'
                        ? 'bg-white text-indigo-600'
                        : 'text-white hover:bg-indigo-700/50'
                    }`}
                    onClick={() => setActiveTab('counter')}
                  >
                    <div className="flex items-center">
                      <CurrencyIcon className="mr-2" size={18} />
                      Money Counter
                    </div>
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === 'history'
                        ? 'bg-white text-indigo-600'
                        : 'text-white hover:bg-indigo-700/50'
                    }`}
                    onClick={() => setActiveTab('history')}
                  >
                    <div className="flex items-center">
                      <History className="mr-2" size={18} />
                      History
                    </div>
                  </button>
                  <button
                    onClick={() => setShowMenu(true)}
                    className="ml-2 p-2 rounded-full hover:bg-indigo-700/50 transition-colors"
                    title="Menu"
                  >
                    <MenuIcon size={20} />
                  </button>
                </div>
              </div>
            </header>

            {mobileMenuOpen && (
              <div className="md:hidden bg-indigo-500 text-white">
                <div className="container mx-auto p-2">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => {
                      handleCurrencyChange(e.target.value as Currency);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mb-2 bg-white text-indigo-600 px-3 py-2 rounded-md font-medium"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <button
                    className={`w-full py-2 px-4 rounded-md font-medium mb-2 transition-all ${
                      activeTab === 'counter'
                        ? 'bg-white text-indigo-600'
                        : 'text-white hover:bg-indigo-700/50'
                    }`}
                    onClick={() => {
                      setActiveTab('counter');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <CurrencyIcon className="mr-2" size={18} />
                      Money Counter
                    </div>
                  </button>
                  <button
                    className={`w-full py-2 px-4 rounded-md font-medium mb-2 transition-all ${
                      activeTab === 'history'
                        ? 'bg-white text-indigo-600'
                        : 'text-white hover:bg-indigo-700/50'
                    }`}
                    onClick={() => {
                      setActiveTab('history');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <History className="mr-2" size={18} />
                      History
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-4 rounded-md font-medium mb-2 text-white hover:bg-indigo-700/50"
                  >
                    <div className="flex items-center justify-center">
                      <MenuIcon className="mr-2" size={18} />
                      Menu
                    </div>
                  </button>
                </div>
              </div>
            )}

            {showMenu && <MenuModal />}
            {showProModal && <ProModal />}

            <div className="container mx-auto p-4">
              {activeTab === 'counter' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-full border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Count Your Money</h2>
                        <button
                          onClick={() => setHideAmounts(!hideAmounts)}
                          className="text-gray-600 hover:text-indigo-600 transition-colors"
                          title={hideAmounts ? "Show amounts" : "Hide amounts"}
                        >
                          {hideAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {leftColumnDenominations.map((denom) => (
                          <DenominationCounter
                            key={denom.value}
                            value={denom.value}
                            type={denom.type as 'note' | 'coin'}
                            count={counts[denom.value] || 0}
                            onCountChange={(count) => handleCountChange(denom.value, count)}
                            hideAmount={hideAmounts}
                            currency={selectedCurrency}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-full border border-gray-200">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">&nbsp;</h2>
                      <div className="space-y-3">
                        {rightColumnDenominations.map((denom) => (
                          <DenominationCounter
                            key={denom.value}
                            value={denom.value}
                            type={denom.type as 'note' | 'coin'}
                            count={counts[denom.value] || 0}
                            onCountChange={(count) => handleCountChange(denom.value, count)}
                            hideAmount={hideAmounts}
                            currency={selectedCurrency}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-full border border-gray-200">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary</h2>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                          <h3 className="text-lg font-medium text-gray-700">Total Count</h3>
                          <p className="text-3xl font-bold text-indigo-600">
                            {totalCount}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                          <h3 className="text-lg font-medium text-gray-700">Total Amount</h3>
                          <p className="text-3xl font-bold text-indigo-600">
                            {formatAmount(totalAmount)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleReset}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-all shadow-md active:transform active:scale-95"
                          >
                            Reset All
                          </button>
                          <button 
                            onClick={handleSave}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-all shadow-md active:transform active:scale-95 flex items-center justify-center"
                          >
                            <Save size={18} className="mr-2" />
                            Save
                          </button>
                        </div>

                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="sendToCalculator"
                            checked={sendToCalculator}
                            onChange={(e) => setSendToCalculator(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="sendToCalculator" className="text-sm text-gray-600">
                            Use total amount in calculator
                          </label>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center mb-2">
                            <Calculator size={18} className="mr-2 text-indigo-600" />
                            <h3 className="text-lg font-medium text-gray-700">Calculator</h3>
                          </div>
                          <SimpleCalculator initialValue={sendToCalculator ? totalAmount.toString() : ''} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <HistoryTab hideAmounts={hideAmounts} selectedCurrency={selectedCurrency} />
              )}
            </div>

            <Advertisement />

            <footer className="bg-gray-800 text-white py-6">
              <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <a 
                    href="https://github.com/PATILYASHH" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <Github size={20} className="mr-2" />
                    <span>Yash Patil</span>
                  </a>
                  <a 
                    href="https://yashpatil.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <Globe size={20} className="mr-2" />
                    <span>yashpatil.tech</span>
                  </a>
                  <a 
                    href="https://github.com/sponsors/PATILYASHH" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <Heart size={20} className="mr-2" />
                    <span>Sponsor</span>
                  </a>
                  <span className="text-gray-400 text-sm">Version 10.2.1</span>
                </div>
              </div>
            </footer>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;