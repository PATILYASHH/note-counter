import { useState, useEffect } from 'react';
import { IndianRupee, Menu, Github, Globe, History, Calculator, Save, Eye, EyeOff, X, Mail, Heart, DollarSign, MenuIcon, Crown, Cloud, Smartphone, Shield, FileText, Printer, Download, Upload, Euro, Keyboard } from 'lucide-react';
import DenominationCounter from './components/DenominationCounter';
import HistoryTab from './components/HistoryTab';
import SimpleCalculator from './components/SimpleCalculator';

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
  const [showCalculatorPad, setShowCalculatorPad] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState('about');
  const [suppressAlerts, setSuppressAlerts] = useState(() => {
    return localStorage.getItem('suppressAlerts') === 'true';
  });

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

  // Add comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+Y - Toggle suppress alerts
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        const newSuppressState = !suppressAlerts;
        setSuppressAlerts(newSuppressState);
        localStorage.setItem('suppressAlerts', newSuppressState.toString());
        if (!newSuppressState) {
          alert('Alerts enabled');
        }
        return;
      }

      // Ctrl+S - Save current counts
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+R - Reset all counts (with confirmation)
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        handleReset();
        return;
      }

      // Ctrl+H - Toggle hide amounts
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        setHideAmounts(prev => !prev);
        return;
      }

      // Ctrl+C - Open calculator
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        setShowCalculatorPad(prev => !prev);
        return;
      }

      // Ctrl+M - Toggle menu
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        setShowMenu(prev => !prev);
        return;
      }

      // Ctrl+1, Ctrl+2, Ctrl+3 - Switch currencies
      if (event.ctrlKey && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault();
        const currencyMap = { '1': 'INR', '2': 'USD', '3': 'EUR' };
        handleCurrencyChange(currencyMap[event.key as '1' | '2' | '3'] as Currency);
        return;
      }

      // Tab switching (Ctrl+T for History Tab)
      if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        setActiveTab(prev => prev === 'counter' ? 'history' : 'counter');
        return;
      }

      // Escape - Close modals and menus
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowMenu(false);
        setShowCalculatorPad(false);
        setShowProModal(false);
        setMobileMenuOpen(false);
        return;
      }

      // F1 - Show help (Open menu and switch to help tab)
      if (event.key === 'F1') {
        event.preventDefault();
        setShowMenu(true);
        setActiveMenuTab('help');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [suppressAlerts, selectedCurrency, activeTab]);

  // Custom alert function that respects suppress setting
  const showAlert = (message: string) => {
    if (!suppressAlerts) {
      alert(message);
    }
  };

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
      showAlert('No counts to save. Please add some denominations first.');
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
      
      showAlert('Summary saved successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
      showAlert('Error saving summary. Please try again.');
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
      
      showAlert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert('Error exporting data. Please try again.');
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
          showAlert('Error importing data. Please check the file format and try again.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleProUpgrade = () => {
    // For now, just show an alert. In a real app, this would redirect to payment
    showAlert('Pro features coming soon! This would redirect to the upgrade page.');
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

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveMenuTab('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenuTab === 'about'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveMenuTab('data')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenuTab === 'data'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setActiveMenuTab('pro')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenuTab === 'pro'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Pro
              </button>
              <button
                onClick={() => setActiveMenuTab('help')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenuTab === 'help'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Help
              </button>
              <button
                onClick={() => setActiveMenuTab('contact')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMenuTab === 'contact'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* About Tab */}
              {activeMenuTab === 'about' && (
                <div className="space-y-6">
                  {/* Developer Introduction Section */}
                  <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-indigo-200">
                        <img 
                          src="https://yashpatil.tech/assets/images/yash.png" 
                          alt="Yash Patil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.currentTarget;
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              target.style.display = 'none';
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hidden items-center justify-center text-white font-bold text-lg">
                          YP
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">About Developer</h3>
                        <p className="text-sm text-indigo-600">Created by Yash Patil</p>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-700 space-y-2">
                      <p>
                        👋 Hi! I'm <strong>Yash Patil</strong>, a Computer Science student currently in college from India 🇮🇳
                      </p>
                      <p>
                        💼 I'm actively doing freelancing and building useful tools like this Note Counter to help people with their daily tasks.
                      </p>
                      <p>
                        🎓 Passionate about creating user-friendly applications that solve real-world problems.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">CS Student</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Freelancer</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">India 🇮🇳</span>
                      </div>
                    </div>
                    
                    {/* More From Me Button */}
                    <div className="mt-4 pt-3 border-t border-indigo-200">
                      <button
                        onClick={() => {
                          // TODO: Replace with actual URL when ready
                          window.open('https://yashpatil.tech', '_blank');
                          setShowMenu(false);
                        }}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md flex items-center justify-center font-medium"
                      >
                        <Globe size={18} className="mr-2" />
                        More From Me
                      </button>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Explore my other projects and work
                      </p>
                    </div>
                  </section>
                </div>
              )}

              {/* Data Tab */}
              {activeMenuTab === 'data' && (
                <div className="space-y-6">
                  {/* Data Storage Warning */}
                  <section className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-yellow-800 font-bold text-sm">⚠️</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Data Storage Notice</h3>
                        <div className="text-sm text-yellow-700 space-y-2">
                          <p>
                            <strong>Local Storage:</strong> All your data is stored locally in your browser. This means:
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Your data stays private and secure on your device</li>
                            <li>No data is sent to external servers</li>
                            <li>Clearing browser data will delete your counts and history</li>
                            <li>Data won't sync across different devices or browsers</li>
                          </ul>
                          <p className="font-medium mt-2">
                            💡 <strong>Tip:</strong> Use the Export feature below to backup your data regularly!
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Data Management Section */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <FileText className="mr-2" size={20} />
                      Data Management
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <button
                        onClick={() => {
                          handleExportData();
                          setShowMenu(false);
                        }}
                        className="flex flex-col items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                      >
                        <Download size={20} className="mb-1" />
                        <span className="font-medium text-sm">Export Data</span>
                      </button>
                      <button
                        onClick={() => {
                          handleImportData();
                          setShowMenu(false);
                        }}
                        className="flex flex-col items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                      >
                        <Upload size={20} className="mb-1" />
                        <span className="font-medium text-sm">Import Data</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('This will clear ALL data including counts and history for ALL currencies. Are you absolutely sure?')) {
                            // Clear all currency data
                            ['INR', 'USD', 'EUR'].forEach(currency => {
                              localStorage.removeItem(`denominationCounts_${currency}`);
                              localStorage.removeItem(`countNoteHistory_${currency}`);
                            });
                            localStorage.removeItem('calculatorHistory');
                            localStorage.removeItem('selectedCurrency');
                            window.location.reload();
                          }
                          setShowMenu(false);
                        }}
                        className="flex flex-col items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X size={20} className="mb-1" />
                        <span className="font-medium text-sm">Reset All</span>
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">What's included in Export/Import:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ All currency counting data (INR, USD, EUR)</li>
                        <li>✅ Complete counting history for all currencies</li>
                        <li>✅ Calculator history</li>
                        <li>✅ App settings and preferences</li>
                        <li>✅ Timestamp information</li>
                      </ul>
                    </div>
                  </section>
                </div>
              )}

              {/* Pro Tab */}
              {activeMenuTab === 'pro' && (
                <div className="space-y-6">
                  {/* Pro Version Promotion */}
                  <section className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-3">
                        <Crown size={32} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Upgrade to Pro Counter</h3>
                      <div className="text-2xl font-bold text-orange-600 mb-1">$1/month</div>
                      <div className="text-sm text-gray-600">or $10/year (Save 17%)</div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <Cloud className="text-blue-500 mr-2 flex-shrink-0" size={16} />
                        <span><strong>Cloud Sync:</strong> Access your data from any device</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Shield className="text-green-500 mr-2 flex-shrink-0" size={16} />
                        <span><strong>Auto Backup:</strong> Never lose your data again</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Printer className="text-purple-500 mr-2 flex-shrink-0" size={16} />
                        <span><strong>PDF Export:</strong> Professional reports & printing</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Heart className="text-red-500 mr-2 flex-shrink-0" size={16} />
                        <span><strong>Support Developer:</strong> Help me create more tools</span>
                      </div>
                    </div>

                    <div className="bg-green-100 p-3 rounded-lg mb-4">
                      <div className="text-center">
                        <div className="text-green-700 font-semibold">🎉 Special Launch Offer</div>
                        <div className="text-sm text-green-600">7-day free trial + 30% off first year!</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowProModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center font-bold"
                    >
                      <Crown size={20} className="mr-2" />
                      Start Free Trial
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      No credit card required • Cancel anytime
                    </p>
                  </section>
                </div>
              )}

              {/* Help Tab */}
              {activeMenuTab === 'help' && (
                <div className="space-y-6">
                  {/* Keyboard Shortcuts Section */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">⌨️ Keyboard Shortcuts</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">🔥 Essential Shortcuts</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Save counts</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + S</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Reset all counts</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + R</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Toggle hide amounts</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + H</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Open calculator</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + C</kbd>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">🚀 Navigation Shortcuts</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Toggle menu</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + M</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Switch tab</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + T</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Show help</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F1</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Close modals</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Escape</kbd>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-200 mt-4 pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">💱 Currency Shortcuts</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">Switch to INR:</span>
                            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + 1</kbd>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">Switch to USD:</span>
                            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + 2</kbd>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">Switch to EUR:</span>
                            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + 3</kbd>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-200 mt-4 pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">⚙️ Advanced Shortcuts</h4>
                        <div className="text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Toggle alert notifications</span>
                            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + Y</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Documentation Section */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">📚 How to Use</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-base font-medium text-gray-700 mb-2">💱 Currency Support</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                          <li>Switch between INR (₹), USD ($), and EUR (€)</li>
                          <li>Each currency maintains separate data and history</li>
                          <li>Automatic formatting based on currency selection</li>
                          <li>Use <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + 1/2/3</kbd> for quick currency switching</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-base font-medium text-gray-700 mb-2">⚡ Quick Math Input</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                          <li>Type <code className="bg-gray-200 px-1 rounded text-xs">+13</code> to add 13 to current count</li>
                          <li>Type <code className="bg-gray-200 px-1 rounded text-xs">-5</code> to subtract 5 from current count</li>
                          <li>Press Enter or click outside to calculate automatically</li>
                          <li>Use <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + C</kbd> to open the calculator quickly</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-base font-medium text-gray-700 mb-2">🔥 Key Features</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                          <li>Hide amounts for privacy with eye icon or <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + H</kbd></li>
                          <li>Save counts to history with <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + S</kbd></li>
                          <li>Built-in calculator with number pad option</li>
                          <li>Send total amount directly to calculator</li>
                          <li>Export/Import data for backup and transfer</li>
                          <li>Reset all counts with <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + R</kbd></li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                        <h4 className="text-base font-medium text-gray-700 mb-2">💡 Pro Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                          <li>Press <kbd className="bg-gray-200 px-1 rounded text-xs">F1</kbd> anytime to access this help section</li>
                          <li>Use <kbd className="bg-gray-200 px-1 rounded text-xs">Escape</kbd> to quickly close any open dialogs</li>
                          <li>Switch between Counter and History tabs with <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + T</kbd></li>
                          <li>All keyboard shortcuts work globally except when typing in input fields</li>
                          <li>Disable notifications with <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + Y</kbd> for silent operation</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Contact Tab */}
              {activeMenuTab === 'contact' && (
                <div className="space-y-6">
                  {/* Contact & Feedback Section */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Get in Touch</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <a
                        href="mailto:patilyasshh@gmail.com"
                        className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Mail className="mr-3 flex-shrink-0" size={18} />
                        <div>
                          <div className="font-medium">Send Feedback</div>
                          <div className="text-xs text-blue-600">patilyasshh@gmail.com</div>
                        </div>
                      </a>
                      <a
                        href="https://yashpatil.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        <Globe className="mr-3 flex-shrink-0" size={18} />
                        <div>
                          <div className="font-medium">Visit Portfolio</div>
                          <div className="text-xs text-green-600">yashpatil.tech</div>
                        </div>
                      </a>
                    </div>
                    
                    {/* Contribute Section */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <Github className="mr-2" size={18} />
                        Contribute to the Project
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Help improve Note Counter! Your contributions are welcome - whether it's bug fixes, new features, or documentation improvements.
                      </p>
                      <a
                        href="https://github.com/PATILYASHH/note-counter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                      >
                        <Github className="mr-2" size={16} />
                        Contribute on GitHub
                      </a>
                    </div>
                    
                    {/* Support Section */}
                    <div className="text-center">
                      <h4 className="text-base font-semibold text-gray-800 mb-3">Support the Project</h4>
                      <a
                        href="https://github.com/sponsors/PATILYASHH"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors border border-pink-200"
                      >
                        <Heart className="mr-2" size={16} />
                        <span className="text-sm">Sponsor my work on GitHub</span>
                      </a>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  return (
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
                    className="ml-2 p-2 rounded-full hover:bg-indigo-700/50 transition-colors group relative"
                    title="Menu (Ctrl+M) • Press F1 for all shortcuts"
                  >
                    <MenuIcon size={20} />
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-indigo-700 rounded-full w-4 h-4 flex items-center justify-center">
                      <Keyboard size={10} />
                    </div>
                    
                    {/* Tooltip for keyboard shortcuts */}
                    <div className="absolute top-12 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Press F1 for all shortcuts
                    </div>
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

                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="showCalculatorPad"
                            checked={showCalculatorPad}
                            onChange={(e) => setShowCalculatorPad(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="showCalculatorPad" className="text-sm text-gray-600">
                            Show calculator number buttons
                          </label>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center mb-2">
                            <Calculator size={18} className="mr-2 text-indigo-600" />
                            <h3 className="text-lg font-medium text-gray-700">Calculator</h3>
                          </div>
                          <SimpleCalculator 
                            initialValue={sendToCalculator ? totalAmount.toString() : ''} 
                            showPad={showCalculatorPad}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <HistoryTab hideAmounts={hideAmounts} selectedCurrency={selectedCurrency} />
              )}
            </div>

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
            
            {/* Floating Help Button */}
            <button
              onClick={() => {
                setShowMenu(true);
                setActiveMenuTab('help');
              }}
              className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
              title="Keyboard Shortcuts & Help (F1)"
            >
              <Keyboard size={20} />
              <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                F1 - Help & Shortcuts
              </span>
            </button>
          </div>
  );
}

export default App;