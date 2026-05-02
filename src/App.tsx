import React, { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Menu, Github, Globe, History, Calculator, Save, Eye, EyeOff, X, Mail, Heart, DollarSign, MenuIcon, Smartphone, Shield, FileText, Download, Upload, Euro, PoundSterling, Coins, Keyboard, Copy, NotebookPen, Plus, Edit, Trash2, Zap, Receipt, Landmark, TrendingUp, ArrowLeftRight } from 'lucide-react';
import DenominationCounter from './components/DenominationCounter';
import HistoryTab from './components/HistoryTab';
import SimpleCalculator from './components/SimpleCalculator';
import TaxCalculator from './components/TaxCalculator';
import EMICalculator from './components/EMICalculator';
import SipCalculator from './components/SipCalculator';
import CurrencyConverter from './components/CurrencyConverter';
import FeedbackForm from './components/FeedbackForm';
import ReviewPrompt from './components/ReviewPrompt';
import BrandLogo, { BrandMark } from './components/BrandLogo';

// Declare global window property for Web Lock
declare global {
  interface Window {
    showWebLockSettings?: () => void;
  }
}

// Update the type definition to include GBP, AED and CUSTOM
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | string;

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
  ],
  GBP: [
    { value: 50, type: 'note' },
    { value: 20, type: 'note' },
    { value: 10, type: 'note' },
    { value: 5, type: 'note' },
    { value: 2, type: 'coin' },
    { value: 1, type: 'coin' },
    { value: 0.50, type: 'coin' },
    { value: 0.20, type: 'coin' },
    { value: 0.10, type: 'coin' },
    { value: 0.05, type: 'coin' },
    { value: 0.02, type: 'coin' },
    { value: 0.01, type: 'coin' },
  ],
  AED: [
    { value: 1000, type: 'note' },
    { value: 500, type: 'note' },
    { value: 200, type: 'note' },
    { value: 100, type: 'note' },
    { value: 50, type: 'note' },
    { value: 20, type: 'note' },
    { value: 10, type: 'note' },
    { value: 5, type: 'note' },
    { value: 1, type: 'coin' },
    { value: 0.50, type: 'coin' },
    { value: 0.25, type: 'coin' },
  ]
};

interface CountState {
  [key: number]: number;
}

interface CustomCurrency {
  code: string;
  name: string;
  symbol: string;
  denominations: Array<{ value: number; type: 'note' | 'coin' }>;
  flag?: string;
  createdAt: string;
}

interface SavedCounting {
  id: string;
  hash: string;
  date: string;
  totalAmount: number;
  totalCount: number;
  denominationCounts: Record<number, number>;
  currency: Currency;
  note?: string;
}

function App() {
  // Refs for denomination input fields
  const denominationRefs = React.useRef<Record<number, HTMLInputElement | null>>({});

  // Handle keyboard navigation between denomination fields
  const handleDenominationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    denomValue: number,
    column: 'left' | 'right',
    index: number
  ) => {
    // Ctrl+Up/Down: increment/decrement value
    if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        handleCountChange(denomValue, (counts[denomValue] || 0) + 1);
      } else if (e.key === 'ArrowDown') {
        handleCountChange(denomValue, Math.max(0, (counts[denomValue] || 0) - 1));
      }
      return;
    }
    // Shift+Arrow: navigation
    if (!e.shiftKey) return;
    const leftDenoms = leftColumnDenominations.map((d: { value: number }) => d.value);
    const rightDenoms = rightColumnDenominations.map((d: { value: number }) => d.value);
    let targetValue: number | null = null;
    if (e.key === 'ArrowDown') {
      // Move to next denomination in the same column
      const colDenoms = column === 'left' ? leftDenoms : rightDenoms;
      const nextIdx = index + 1;
      if (nextIdx < colDenoms.length) {
        targetValue = colDenoms[nextIdx];
      }
    } else if (e.key === 'ArrowUp') {
      // Move to previous denomination in the same column
      const colDenoms = column === 'left' ? leftDenoms : rightDenoms;
      const prevIdx = index - 1;
      if (prevIdx >= 0) {
        targetValue = colDenoms[prevIdx];
      }
    } else if (e.key === 'ArrowRight') {
      // Move to same index in right column
      if (column === 'left' && rightDenoms[index] !== undefined) {
        targetValue = rightDenoms[index];
      }
    } else if (e.key === 'ArrowLeft') {
      // Move to same index in left column
      if (column === 'right' && leftDenoms[index] !== undefined) {
        targetValue = leftDenoms[index];
      }
    }
    if (targetValue !== null) {
      e.preventDefault();
      setTimeout(() => {
        denominationRefs.current[targetValue]?.focus();
        denominationRefs.current[targetValue]?.select();
      }, 0);
    }
  };
  // Update the state type to include EUR
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('currency')?.toUpperCase();
    if (fromQuery === 'INR' || fromQuery === 'USD' || fromQuery === 'EUR' || fromQuery === 'GBP' || fromQuery === 'AED') {
      return fromQuery as Currency;
    }
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return (savedCurrency === 'INR' || savedCurrency === 'USD' || savedCurrency === 'EUR' || savedCurrency === 'GBP' || savedCurrency === 'AED') ? savedCurrency as Currency : 'USD';
  });

  const [activeTab, setActiveTab] = useState<'counter' | 'history' | 'tax' | 'emi' | 'sip' | 'fx'>('counter');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sendToCalculator, setSendToCalculator] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorAmount, setSponsorAmount] = useState<string>('500');
  const [sponsorCopied, setSponsorCopied] = useState(false);
  const [showCalculatorPad, setShowCalculatorPad] = useState(() => {
    return localStorage.getItem('showCalculatorPad') === 'true';
  });
  const [showCalculator, setShowCalculator] = useState(() => {
    return localStorage.getItem('showCalculator') !== 'false'; // Default to true
  });
  const [showAmountInText, setShowAmountInText] = useState(() => {
    const saved = localStorage.getItem('showAmountInText');
    return saved ? saved === 'true' : true; // Default to true if not set
  });
  const [activeMenuTab, setActiveMenuTab] = useState('about');
  const [suppressAlerts, setSuppressAlerts] = useState(() => {
    return localStorage.getItem('suppressAlerts') === 'true';
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Notepad state
  interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }

  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    if (savedNotes) {
      try {
        return JSON.parse(savedNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
        return [];
      }
    }
    return [];
  });
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [confettiBatches, setConfettiBatches] = useState<number[]>([]);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [rockets, setRockets] = useState<number[]>([]);

  // Hash popup state
  const [showHashPopup, setShowHashPopup] = useState(false);
  const [selectedCountingHash, setSelectedCountingHash] = useState<string | null>(null);
  const [savedCountings, setSavedCountings] = useState<SavedCounting[]>(() => {
    const saved = localStorage.getItem('savedCountings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing saved countings:', error);
        return [];
      }
    }
    return [];
  });

  // Currency management state
  const [enabledCurrencies, setEnabledCurrencies] = useState<Record<Currency, boolean>>(() => {
    const saved = localStorage.getItem('enabledCurrencies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing enabled currencies:', error);
      }
    }
    // Default: all currencies enabled
    return {
      INR: true,
      USD: true,
      EUR: true,
      GBP: true,
      AED: true
    };
  });

  // Custom currencies state
  const [customCurrencies, setCustomCurrencies] = useState<CustomCurrency[]>(() => {
    const saved = localStorage.getItem('customCurrencies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing custom currencies:', error);
        return [];
      }
    }
    return [];
  });

  // Custom currency creation state
  const [showCustomCurrencyModal, setShowCustomCurrencyModal] = useState(false);
  const [customCurrencyForm, setCustomCurrencyForm] = useState({
    code: '',
    name: '',
    symbol: '',
    flag: '',
    denominations: [] as Array<{ id: string; value: number; type: 'note' | 'coin' }>
  });

  // Get all available denominations for a currency (including custom)
  const getCurrencyDenominations = (currency: Currency) => {
    // Check if it's a built-in currency
    if (CURRENCY_DENOMINATIONS[currency as keyof typeof CURRENCY_DENOMINATIONS]) {
      return CURRENCY_DENOMINATIONS[currency as keyof typeof CURRENCY_DENOMINATIONS];
    }
    
    // Check if it's a custom currency
    const customCurrency = customCurrencies.find(c => c.code === currency);
    if (customCurrency) {
      return customCurrency.denominations;
    }
    
    // Fallback to INR if currency not found
    return CURRENCY_DENOMINATIONS.INR;
  };

  // Get all currencies (built-in + custom)
  const getAllCurrencies = (): Currency[] => {
    const builtInCurrencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
    const customCurrencyCodes = customCurrencies.map(c => c.code);
    return [...builtInCurrencies, ...customCurrencyCodes];
  };

  // Get available currencies (only enabled ones)
  const getAvailableCurrencies = (): Currency[] => {
    const allCurrencies = getAllCurrencies();
    return allCurrencies.filter(currency => {
      // For built-in currencies, check the enabledCurrencies object
      if (enabledCurrencies[currency] !== undefined) {
        return enabledCurrencies[currency];
      }
      // For custom currencies, they are enabled by default (we can add a toggle later if needed)
      return customCurrencies.some(c => c.code === currency);
    });
  };

  // Handle currency toggle
  const handleCurrencyToggle = (currency: Currency, enabled: boolean) => {
    const availableCurrencies = getAvailableCurrencies();
    
    // Prevent disabling all currencies
    if (!enabled && availableCurrencies.length === 1 && availableCurrencies[0] === currency) {
      showAlert('At least one currency must be enabled');
      return;
    }

    const newEnabledCurrencies = {
      ...enabledCurrencies,
      [currency]: enabled
    };

    setEnabledCurrencies(newEnabledCurrencies);
    localStorage.setItem('enabledCurrencies', JSON.stringify(newEnabledCurrencies));

    // If the currently selected currency is being disabled, switch to the first available currency
    if (!enabled && selectedCurrency === currency) {
      const remainingCurrencies = Object.entries(newEnabledCurrencies)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([curr, _]) => curr as Currency);
      
      if (remainingCurrencies.length > 0) {
        handleCurrencyChange(remainingCurrencies[0]);
      }
    }
  };

  // Initialize counts based on selected currency
  const initializeCounts = (currency: Currency): CountState => {
    const initialCounts: CountState = {};
    getCurrencyDenominations(currency).forEach(denom => {
      initialCounts[denom.value] = 0;
    });
    return initialCounts;
  };

  // Custom currency management functions
  const handleCreateCustomCurrency = () => {
    if (!customCurrencyForm.code || !customCurrencyForm.name || !customCurrencyForm.symbol) {
      showAlert('Please fill in all required fields (code, name, symbol)');
      return;
    }

    if (customCurrencyForm.code.length !== 3) {
      showAlert('Currency code must be exactly 3 characters');
      return;
    }

    if (getAllCurrencies().includes(customCurrencyForm.code.toUpperCase())) {
      showAlert('A currency with this code already exists');
      return;
    }

    if (customCurrencyForm.denominations.length === 0) {
      showAlert('Please add at least one denomination');
      return;
    }

    const newCustomCurrency: CustomCurrency = {
      code: customCurrencyForm.code.toUpperCase(),
      name: customCurrencyForm.name,
      symbol: customCurrencyForm.symbol,
      flag: customCurrencyForm.flag || '🏴',
      denominations: customCurrencyForm.denominations.map(({ value, type }) => ({ value, type })).sort((a, b) => b.value - a.value),
      createdAt: new Date().toISOString()
    };

    const updatedCustomCurrencies = [...customCurrencies, newCustomCurrency];
    setCustomCurrencies(updatedCustomCurrencies);
    localStorage.setItem('customCurrencies', JSON.stringify(updatedCustomCurrencies));

    // Reset form
    setCustomCurrencyForm({
      code: '',
      name: '',
      symbol: '',
      flag: '',
      denominations: []
    });

    setShowCustomCurrencyModal(false);
    showAlert(`Custom currency "${newCustomCurrency.name}" created successfully!`);
  };

  const handleDeleteCustomCurrency = (currencyCode: string) => {
    if (selectedCurrency === currencyCode) {
      showAlert('Cannot delete the currently selected currency');
      return;
    }

    const updatedCustomCurrencies = customCurrencies.filter(c => c.code !== currencyCode);
    setCustomCurrencies(updatedCustomCurrencies);
    localStorage.setItem('customCurrencies', JSON.stringify(updatedCustomCurrencies));
    showAlert('Custom currency deleted successfully');
  };

  const addDenomination = useCallback(() => {
    setCustomCurrencyForm(prev => ({
      ...prev,
      denominations: [...prev.denominations, { id: Date.now().toString() + Math.random(), value: 0, type: 'note' }]
    }));
  }, []);

  const updateDenomination = useCallback((id: string, field: 'value' | 'type', value: number | 'note' | 'coin') => {
    setCustomCurrencyForm(prev => {
      const currentDenom = prev.denominations.find(d => d.id === id);
      if (currentDenom && currentDenom[field] === value) {
        // No change needed, return same reference to prevent re-render
        return prev;
      }
      return {
        ...prev,
        denominations: prev.denominations.map((denom) => 
          denom.id === id ? { ...denom, [field]: value } : denom
        )
      };
    });
  }, []);

  const removeDenomination = useCallback((id: string) => {
    setCustomCurrencyForm(prev => ({
      ...prev,
      denominations: prev.denominations.filter((denom) => denom.id !== id)
    }));
  }, []);

  // Simple input component to handle denomination value changes without losing focus
  const DenominationValueInput = React.memo(({ 
    id, 
    value, 
    onUpdate 
  }: { 
    id: string; 
    value: number; 
    onUpdate: (id: string, value: number) => void; 
  }) => {
    const [localValue, setLocalValue] = useState(value === 0 ? '' : value.toString());
    
    // Update local value when prop changes from outside
    useEffect(() => {
      const newVal = value === 0 ? '' : value.toString();
      if (newVal !== localValue) {
        setLocalValue(newVal);
      }
    }, [value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      
      // Allow empty string, numbers, and decimal points
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        const numValue = inputValue === '' ? 0 : parseFloat(inputValue) || 0;
        onUpdate(id, numValue);
      }
    }, [id, onUpdate]);

    return (
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="e.g., 100"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    );
  });

  // Get currency information for both built-in and custom currencies
  const getCurrencyInfo = (currency: Currency) => {
    const builtInCurrencyInfo = {
      INR: { name: 'Indian Rupee', symbol: '₹', icon: IndianRupee, flag: '🇮🇳' },
      USD: { name: 'US Dollar', symbol: '$', icon: DollarSign, flag: '🇺🇸' },
      EUR: { name: 'Euro', symbol: '€', icon: Euro, flag: '🇪🇺' },
      GBP: { name: 'British Pound', symbol: '£', icon: PoundSterling, flag: '🇬🇧' },
      AED: { name: 'UAE Dirham', symbol: 'د.إ', icon: Coins, flag: '🇦🇪' }
    };

    // Check if it's a built-in currency
    if (builtInCurrencyInfo[currency as keyof typeof builtInCurrencyInfo]) {
      return builtInCurrencyInfo[currency as keyof typeof builtInCurrencyInfo];
    }

    // Check if it's a custom currency
    const customCurrency = customCurrencies.find(c => c.code === currency);
    if (customCurrency) {
      return {
        name: customCurrency.name,
        symbol: customCurrency.symbol,
        icon: Coins, // Default icon for custom currencies
        flag: customCurrency.flag || '🏴'
      };
    }

    // Fallback
    return { name: currency, symbol: currency, icon: Coins, flag: '🏴' };
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

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('showCalculatorPad', showCalculatorPad.toString());
  }, [showCalculatorPad]);

  useEffect(() => {
    localStorage.setItem('showCalculator', showCalculator.toString());
  }, [showCalculator]);

  useEffect(() => {
    localStorage.setItem('showAmountInText', showAmountInText.toString());
  }, [showAmountInText]);

  // PWA Install functionality
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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
        if (showCalculator) {
          setShowCalculatorPad(prev => !prev);
        }
        return;
      }

      // Ctrl+M - Toggle menu
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        setShowMenu(prev => !prev);
        return;
      }

      // Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+4, Ctrl+5 - Switch currencies
      if (event.ctrlKey && ['1', '2', '3', '4', '5'].includes(event.key)) {
        event.preventDefault();
        const currencyMap = { '1': 'INR', '2': 'USD', '3': 'EUR', '4': 'GBP', '5': 'AED' };
        handleCurrencyChange(currencyMap[event.key as '1' | '2' | '3' | '4' | '5'] as Currency);
        return;
      }

      // Tab switching (Ctrl+T for History Tab)
      if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        setActiveTab(prev => prev === 'counter' ? 'history' : 'counter');
        return;
      }

      // Shift+N - Toggle Notepad
      if (event.shiftKey && event.key === 'N') {
        event.preventDefault();
        toggleNotepad();
        return;
      }

      // Escape - Close modals and menus
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowMenu(false);
        setShowCalculatorPad(false);
        setMobileMenuOpen(false);
        setShowNotepad(false);
        setShowSponsorModal(false);
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
  }, [suppressAlerts, selectedCurrency, activeTab, showCalculator, showNotepad]);

  // Custom alert function that respects suppress setting
  const showAlert = (message: string) => {
    if (!suppressAlerts) {
      alert(message);
    }
  };

  // Hash utility functions
  const generateHash = (): string => {
    // Simple incremental hash generation
    const nextNumber = savedCountings.length + 1;
    return `#${nextNumber}`;
  };

  const saveCounting = (countingData: Omit<SavedCounting, 'hash'>) => {
    const hash = generateHash();
    const savedCounting: SavedCounting = {
      ...countingData,
      hash
    };
    
    const updatedCountings = [savedCounting, ...savedCountings];
    setSavedCountings(updatedCountings);
    localStorage.setItem('savedCountings', JSON.stringify(updatedCountings));
    
    return hash;
  };

  const findCountingByHash = (hash: string): SavedCounting | undefined => {
    return savedCountings.find(counting => counting.hash === hash);
  };

  const loadCountingFromHash = (hash: string) => {
    const counting = findCountingByHash(hash);
    if (counting) {
      // Switch to the correct currency if needed
      if (counting.currency !== selectedCurrency) {
        handleCurrencyChange(counting.currency);
      }
      
      // Load the counts
      setCounts(counting.denominationCounts);
      showAlert(`Counting loaded from ${hash}`);
    } else {
      showAlert('Counting not found for the provided hash.');
    }
  };

  const downloadCountingData = (hash: string) => {
    const counting = findCountingByHash(hash);
    if (counting) {
      const dataStr = JSON.stringify(counting, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `counting-${hash}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderNoteWithHashes = (content: string) => {
    // Replace hash mentions with clickable elements - now matches #1, #2, etc.
    const hashRegex = /#\d+/g;
    const parts = content.split(hashRegex);
    const hashes = content.match(hashRegex) || [];
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {hashes[index] && (
          <span
            onClick={() => {
              setSelectedCountingHash(hashes[index]);
              setShowHashPopup(true);
            }}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md cursor-pointer hover:bg-blue-200 transition-colors text-sm font-mono mx-1"
            title={`Click to view counting details for ${hashes[index]}`}
          >
            {hashes[index]}
          </span>
        )}
      </React.Fragment>
    ));
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

  // PWA Install handler
  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      showAlert('Installation not available at this time. Try adding this page to your home screen manually.');
      return;
    }

    try {
      const result = await deferredPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        showAlert('App installation started! Check your home screen.');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
      showAlert('Installation failed. Please try again.');
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
      // Create counting data for hash storage
      const countingData = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        totalAmount,
        totalCount,
        denominationCounts: { ...counts },
        currency: selectedCurrency
      };

      // Generate hash and save to hash storage
      const hash = saveCounting(countingData);
      
      // Also save to history for backward compatibility
      const savedHistory = localStorage.getItem(`countNoteHistory_${selectedCurrency}`) || '[]';
      const history = JSON.parse(savedHistory);
      
      const newEntry = {
        ...countingData,
        hash // Include hash in history entry
      };
      
      const updatedHistory = [newEntry, ...history];
      localStorage.setItem(`countNoteHistory_${selectedCurrency}`, JSON.stringify(updatedHistory));
      
      showAlert(`Summary saved successfully! Hash: ${hash}\n\nYou can reference this counting in notes using ${hash}`);
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
        version: '2.1',
        exportDate: new Date().toISOString(),
        currencies: getAllCurrencies().reduce((acc, currency) => {
          const counts = localStorage.getItem(`denominationCounts_${currency}`);
          const history = localStorage.getItem(`countNoteHistory_${currency}`);
          
          acc[currency] = {
            currentCounts: counts ? JSON.parse(counts) : {},
            history: history ? JSON.parse(history) : []
          };
          
          return acc;
        }, {} as any),
        customCurrencies: customCurrencies,
        settings: {
          selectedCurrency: localStorage.getItem('selectedCurrency') || 'INR',
          enabledCurrencies: localStorage.getItem('enabledCurrencies') ? JSON.parse(localStorage.getItem('enabledCurrencies')!) : null,
          showCalculatorPad: localStorage.getItem('showCalculatorPad'),
          showCalculator: localStorage.getItem('showCalculator'),
          showAmountInText: localStorage.getItem('showAmountInText'),
          suppressAlerts: localStorage.getItem('suppressAlerts')
        },
        savedCountings: localStorage.getItem('savedCountings') ? JSON.parse(localStorage.getItem('savedCountings')!) : [],
        quickNotes: localStorage.getItem('quickNotes') ? JSON.parse(localStorage.getItem('quickNotes')!) : [],
        calculatorHistory: localStorage.getItem('calculatorHistory') ? JSON.parse(localStorage.getItem('calculatorHistory')!) : []
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
            // Import custom currencies first
            if (importData.customCurrencies) {
              localStorage.setItem('customCurrencies', JSON.stringify(importData.customCurrencies));
            }
            
            // Import data for each currency
            Object.entries(importData.currencies).forEach(([currency, data]: [string, any]) => {
              if (data.currentCounts) {
                localStorage.setItem(`denominationCounts_${currency}`, JSON.stringify(data.currentCounts));
              }
              if (data.history) {
                localStorage.setItem(`countNoteHistory_${currency}`, JSON.stringify(data.history));
              }
            });
            
            // Import calculator history
            if (importData.calculatorHistory) {
              localStorage.setItem('calculatorHistory', JSON.stringify(importData.calculatorHistory));
            }
            
            // Import saved countings
            if (importData.savedCountings) {
              localStorage.setItem('savedCountings', JSON.stringify(importData.savedCountings));
            }
            
            // Import quick notes
            if (importData.quickNotes) {
              localStorage.setItem('quickNotes', JSON.stringify(importData.quickNotes));
            }
            
            // Import settings
            if (importData.settings) {
              if (importData.settings.selectedCurrency) {
                localStorage.setItem('selectedCurrency', importData.settings.selectedCurrency);
              }
              if (importData.settings.enabledCurrencies) {
                localStorage.setItem('enabledCurrencies', JSON.stringify(importData.settings.enabledCurrencies));
              }
              if (importData.settings.showCalculatorPad !== undefined) {
                localStorage.setItem('showCalculatorPad', importData.settings.showCalculatorPad);
              }
              if (importData.settings.showCalculator !== undefined) {
                localStorage.setItem('showCalculator', importData.settings.showCalculator);
              }
              if (importData.settings.showAmountInText !== undefined) {
                localStorage.setItem('showAmountInText', importData.settings.showAmountInText);
              }
              if (importData.settings.suppressAlerts !== undefined) {
                localStorage.setItem('suppressAlerts', importData.settings.suppressAlerts);
              }
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

  // Notepad functions
  const saveNotesToLocalStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentNote(newNote);
    setNoteTitle(newNote.title);
    setNoteContent(newNote.content);
    setIsEditingNote(true);
  };

  const saveCurrentNote = () => {
    if (!currentNote) return;

    const updatedNote: Note = {
      ...currentNote,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = notes.findIndex(note => note.id === currentNote.id);
    let updatedNotes: Note[];

    if (existingIndex >= 0) {
      updatedNotes = [...notes];
      updatedNotes[existingIndex] = updatedNote;
    } else {
      updatedNotes = [updatedNote, ...notes];
    }

    saveNotesToLocalStorage(updatedNotes);
    setCurrentNote(updatedNote);
    setIsEditingNote(false);
    showAlert('Note saved successfully!');
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsEditingNote(false);
  };

  const deleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveNotesToLocalStorage(updatedNotes);
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setNoteTitle('');
        setNoteContent('');
        setIsEditingNote(false);
      }
      
      showAlert('Note deleted successfully!');
    }
  };

  const toggleNotepad = () => {
    setShowNotepad(!showNotepad);
  };

  const leftColumnDenominations = getCurrencyDenominations(selectedCurrency).slice(0, Math.ceil(getCurrencyDenominations(selectedCurrency).length / 2));
  const rightColumnDenominations = getCurrencyDenominations(selectedCurrency).slice(Math.ceil(getCurrencyDenominations(selectedCurrency).length / 2));

  const formatAmount = (amount: number) => {
    if (hideAmounts) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  // Function to convert numbers to text format
  const numberToText = (num: number): string => {
    if (hideAmounts) return '••••••';
    
    // Handle decimal numbers by rounding to nearest whole number
    const wholeNum = Math.round(num);
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred';
        n %= 100;
        if (n > 0) result += ' ';
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += ' ';
      } else if (n >= 10) {
        result += teens[n - 10];
        return result;
      }
      if (n > 0) {
        result += ones[n];
      }
      return result;
    };

    if (wholeNum === 0) return 'Zero';
    
    let result = '';
    
    // Use Indian numbering system for INR
    if (selectedCurrency === 'INR') {
      const crore = Math.floor(wholeNum / 10000000); // 1 Crore = 10,000,000
      const lakh = Math.floor((wholeNum % 10000000) / 100000); // 1 Lakh = 100,000
      const thousand = Math.floor((wholeNum % 100000) / 1000);
      const remainder = wholeNum % 1000;

      if (crore > 0) {
        result += convertHundreds(crore) + ' Crore';
        if (lakh > 0 || thousand > 0 || remainder > 0) result += ' ';
      }
      if (lakh > 0) {
        result += convertHundreds(lakh) + ' Lakh';
        if (thousand > 0 || remainder > 0) result += ' ';
      }
      if (thousand > 0) {
        result += convertHundreds(thousand) + ' Thousand';
        if (remainder > 0) result += ' ';
      }
      if (remainder > 0) {
        result += convertHundreds(remainder);
      }
    } else {
      // Use Western numbering system for USD and EUR
      const billion = Math.floor(wholeNum / 1000000000);
      const million = Math.floor((wholeNum % 1000000000) / 1000000);
      const thousand = Math.floor((wholeNum % 1000000) / 1000);
      const remainder = wholeNum % 1000;

      if (billion > 0) {
        result += convertHundreds(billion) + ' Billion';
        if (million > 0 || thousand > 0 || remainder > 0) result += ' ';
      }
      if (million > 0) {
        result += convertHundreds(million) + ' Million';
        if (thousand > 0 || remainder > 0) result += ' ';
      }
      if (thousand > 0) {
        result += convertHundreds(thousand) + ' Thousand';
        if (remainder > 0) result += ' ';
      }
      if (remainder > 0) {
        result += convertHundreds(remainder);
      }
    }

    // Add currency name based on original number (not rounded)
    const currencyInfo = getCurrencyInfo(selectedCurrency);
    const currencyName = currencyInfo.name.toLowerCase();
    const pluralName = num === 1 ? currencyName : currencyName + 's';

    return result + ' ' + pluralName;
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Amount copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      showAlert('Failed to copy to clipboard');
    }
  };

  const CurrencyIcon = getCurrencyInfo(selectedCurrency).icon;

  const HashPopup = () => {
    if (!selectedCountingHash) return null;

    const counting = findCountingByHash(selectedCountingHash);

    if (!counting) {
      return (
        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="nc-card-lg max-w-md w-full p-6 animate-slide-up">
            <div className="text-center">
              <h3 className="text-lg font-bold text-ink-900 mb-2">Counting not found</h3>
              <p className="text-ink-500 mb-5 text-sm">
                The counting for hash <span className="font-mono font-semibold">{selectedCountingHash}</span> could not be found.
              </p>
              <button
                onClick={() => {
                  setShowHashPopup(false);
                  setSelectedCountingHash(null);
                }}
                className="nc-btn-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="nc-card-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-mono text-sm font-semibold">
                    {counting.hash}
                  </span>
                  <h3 className="text-lg font-bold text-ink-900">Counting details</h3>
                </div>
                <p className="text-ink-500 text-sm mt-1">Created {counting.date}</p>
              </div>
              <button
                onClick={() => {
                  setShowHashPopup(false);
                  setSelectedCountingHash(null);
                }}
                className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="nc-stat bg-emerald-50 border-emerald-200/60">
                <div className="nc-stat-label text-emerald-700/80">Total amount</div>
                <div className="nc-stat-value text-emerald-700 truncate">
                  {getCurrencyInfo(counting.currency).symbol}{counting.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="nc-stat bg-brand-50 border-brand-200/60">
                <div className="nc-stat-label text-brand-700/80">Total count</div>
                <div className="nc-stat-value text-brand-700">{counting.totalCount.toLocaleString()}</div>
              </div>
            </div>

            {/* Denomination Breakdown */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Denomination Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(counting.denominationCounts)
                  .filter(([_, count]) => count > 0)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([denomination, count]) => (
                    <div key={denomination} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-medium">
                        {getCurrencyInfo(counting.currency).symbol}{Number(denomination).toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        {count} × = {getCurrencyInfo(counting.currency).symbol}{(Number(denomination) * count).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  loadCountingFromHash(counting.hash);
                  setShowHashPopup(false);
                  setSelectedCountingHash(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md flex items-center justify-center font-medium"
              >
                <Upload className="mr-2" size={18} />
                Load into Counter
              </button>
              <button
                onClick={() => {
                  downloadCountingData(counting.hash);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md flex items-center justify-center font-medium"
              >
                <Download className="mr-2" size={18} />
                Download Data
              </button>
            </div>

            {/* Copy Hash Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(counting.hash);
                    showAlert('Hash copied to clipboard!');
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center mx-auto"
                >
                  <Copy className="mr-1" size={14} />
                  Copy hash to clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MENU_TABS: Array<{ id: string; label: string }> = [
    { id: 'about',         label: 'About' },
    { id: 'customization', label: 'Settings' },
    { id: 'currencies',    label: 'Currencies' },
    { id: 'data',          label: 'Data' },
    { id: 'help',          label: 'Help' },
    { id: 'contact',       label: 'Contact' },
    { id: 'privacy',       label: 'Privacy' },
  ];

  const menuModalElement = showMenu ? (
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
        <div className="bg-white rounded-xl2 shadow-card-lg max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-ink-200/70 animate-slide-up">
          {/* Sticky modal header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-ink-200 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMark size={32} title="Note Counter" />
              <div className="leading-tight min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-ink-900 tracking-tight">Menu</h2>
                <p className="text-[11px] text-ink-500">Settings, currencies, data &amp; help</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sticky tab bar */}
          <div className="px-3 sm:px-4 pt-3 pb-3 border-b border-ink-200 bg-ink-50/60">
            <div className="flex flex-wrap gap-1.5">
              {MENU_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveMenuTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeMenuTab === t.id
                      ? 'bg-ink-900 text-white shadow-card'
                      : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300 hover:text-ink-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto px-4 sm:px-6 py-5 flex-1">

            {/* Tab Content */}
            <div className="space-y-6">
              {/* About Tab */}
              {activeMenuTab === 'about' && (
                <div className="space-y-6">
                  {/* Free-forever pledge */}
                  <section className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Heart size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-emerald-900 tracking-tight">
                          100% free forever — no ads, no tracking of your data
                        </h3>
                        <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
                          Note Counter is open-source under the MIT license and will always be free. There are no
                          advertisements, no premium tier, and your counts, history, notes and custom currencies stay
                          on your device — nothing about your amounts is sent anywhere. Anonymous page-view
                          counts are kept by Vercel Insights so I can see roughly how many people use the site;
                          that's the only analytics.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Developer Introduction Section */}
                  <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-indigo-200">
                        <img 
                          src="https://yashpatil.vercel.app/assets/images/yash.png" 
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
                          window.open('https://yashpatil.vercel.app', '_blank');
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

                  {/* Key Features Section */}
                  <section className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center mr-3">
                        <Zap className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Key Features</h3>
                        <p className="text-sm text-green-600">What makes Note Counter special</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Shield className="text-indigo-500 mr-2" size={16} />
                          <h4 className="font-semibold text-gray-800 text-sm">Web Lock Security</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Protect your financial data with PIN/password authentication and session management
                        </p>
                        <div className="text-xs text-gray-500">
                          ✨ <strong>Enhanced in v11.0:</strong> Professional service with improved security and privacy compliance
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Calculator className="text-blue-500 mr-2" size={16} />
                          <h4 className="font-semibold text-gray-800 text-sm">Built-in Calculator</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Advanced calculator with memory functions and quick access shortcuts
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <History className="text-purple-500 mr-2" size={16} />
                          <h4 className="font-semibold text-gray-800 text-sm">Transaction History</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Track all your counting sessions with detailed history and notes
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Download className="text-orange-500 mr-2" size={16} />
                          <h4 className="font-semibold text-gray-800 text-sm">Export & Import</h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          Backup your data or share countings with CSV/JSON export options
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Privacy & Security Section */}
                  <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">🔒</span>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Privacy & Security</h3>
                        <p className="text-sm text-blue-600">Your Data, Your Control</p>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base text-gray-700 space-y-2">
                      <p>
                        🔒 <strong>Privacy First:</strong> All your counting data stays on your device. We never access your actual counting numbers.
                      </p>
                      <p>
                        🛡️ <strong>Secure:</strong> Built-in Web Lock system protects your data with PIN authentication.
                      </p>
                      <p>
                        ✅ <strong>Compliant:</strong> GDPR, CCPA, and COPPA compliant. Transparent data practices.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Local Storage</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">PIN Protected</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">GDPR Ready</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-blue-200">
                      <a
                        href="/privacy-policy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nc-btn-ghost"
                      >
                        <Shield size={16} />
                        Privacy Policy
                      </a>
                      <a
                        href="/about.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nc-btn-ghost"
                      >
                        About Page
                      </a>
                      <a
                        href="/contact.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nc-btn-ghost"
                      >
                        <Mail size={16} />
                        Contact
                      </a>
                    </div>
                  </section>

                  {/* PWA Install Section */}
                  {!isInstalled && (
                    <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                          <Smartphone size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Install as App</h3>
                          <p className="text-sm text-purple-600">Get the full app experience</p>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 space-y-2">
                        <p>
                          📱 <strong>Install as App:</strong> Add Note Counter to your home screen for quick access and offline use.
                        </p>
                        <p>
                          ⚡ <strong>Faster Performance:</strong> App loads instantly and works without internet connection.
                        </p>
                        <p>
                          🔔 <strong>Native Experience:</strong> Full-screen app without browser bars for better focus.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Offline Ready</span>
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">Fast Loading</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Native Feel</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-purple-200">
                        {showInstallPrompt ? (
                          <button
                            onClick={handleInstallPWA}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center font-medium"
                          >
                            <Download size={18} className="mr-2" />
                            Install App Now
                          </button>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                              To install, use your browser's "Add to Home Screen" option or look for the install icon in the address bar.
                            </p>
                            <div className="text-xs text-gray-500">
                              Available on Chrome, Edge, Firefox, and Safari
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Customization Tab */}
              {activeMenuTab === 'customization' && (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <Calculator className="mr-2" size={20} />
                      Calculator Settings
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Show/Hide Calculator */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-700">Show Calculator</h4>
                            <p className="text-sm text-gray-600">Display the calculator section in the summary panel</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={showCalculator}
                              onChange={(e) => setShowCalculator(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Show/Hide Calculator Keypad */}
                      <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 transition-opacity ${
                        !showCalculator ? 'opacity-50' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-700">Show Calculator Keypad</h4>
                            <p className="text-sm text-gray-600">Display number buttons below the calculator input</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={showCalculatorPad}
                              onChange={(e) => setShowCalculatorPad(e.target.checked)}
                              disabled={!showCalculator}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>
                      </div>

                      {/* Information Box */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">ℹ</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-blue-800 mb-1">Calculator Features</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Basic arithmetic operations (+, -, ×, ÷)</li>
                              <li>• Memory functions (M+, M-, MR, MC)</li>
                              <li>• Quick access with Ctrl+C shortcut</li>
                              <li>• Can use total amount as initial value</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <FileText className="mr-2" size={20} />
                      Display Settings
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Show Amount in Text */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-700">Show Amount in Text Format</h4>
                            <p className="text-sm text-gray-600">Display total amount in words (e.g., "One Thousand Dollars"). Enabled by default - disable if you prefer numbers only.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={showAmountInText}
                              onChange={(e) => setShowAmountInText(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Information Box for Text Format */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">💡</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-green-800 mb-1">Text Format Features (Default Enabled)</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Converts numbers to written words</li>
                              <li>• Includes currency name (Dollars, Rupees, Euros)</li>
                              <li>• One-click copy to clipboard</li>
                              <li>• Useful for writing checks or formal documents</li>
                              <li>• Toggle off if you prefer numerical format only</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <Eye className="mr-2" size={20} />
                      Privacy Settings
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Suppress Alerts */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-700">Suppress Alert Notifications</h4>
                            <p className="text-sm text-gray-600">Disable popup notifications for saves and other actions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={suppressAlerts}
                              onChange={(e) => {
                                setSuppressAlerts(e.target.checked);
                                localStorage.setItem('suppressAlerts', e.target.checked.toString());
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <Shield className="mr-2" size={20} />
                      Web Lock Settings
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Web Lock Controls */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-base font-medium text-gray-700">Web Lock Protection</h4>
                            <p className="text-sm text-gray-600">Secure your Note Counter with PIN or Password protection</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (typeof window.showWebLockSettings === 'function') {
                              window.showWebLockSettings();
                            } else {
                              alert('Web Lock system is loading. Please try again in a moment.');
                            }
                          }}
                          className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                        >
                          <Shield size={18} className="mr-2" />
                          <span className="font-medium text-sm">Configure Web Lock</span>
                        </button>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          <p>• Set up PIN (4 digits) or Password protection</p>
                          <p>• Lock is active until browser session ends</p>
                          <p>• All data remains private and local</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <Keyboard className="mr-2" size={20} />
                      Quick Actions
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setHideAmounts(!hideAmounts);
                          setShowMenu(false);
                        }}
                        className="flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                      >
                        {hideAmounts ? <Eye size={18} className="mr-2" /> : <EyeOff size={18} className="mr-2" />}
                        <span className="font-medium text-sm">
                          {hideAmounts ? 'Show Amounts' : 'Hide Amounts'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowCalculatorPad(!showCalculatorPad);
                          setShowMenu(false);
                        }}
                        className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors shadow-md ${
                          showCalculator 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!showCalculator}
                      >
                        <Calculator size={18} className="mr-2" />
                        <span className="font-medium text-sm">Toggle Keypad</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAmountInText(!showAmountInText);
                          setShowMenu(false);
                        }}
                        className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                      >
                        <FileText size={18} className="mr-2" />
                        <span className="font-medium text-sm">Toggle Text Format</span>
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* Currencies Tab */}
              {activeMenuTab === 'currencies' && (
                <div className="space-y-6">
                  {/* Introduction Section */}
                  <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-3">
                      <Globe className="mr-3 text-indigo-600" size={24} />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Currency Management</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Customize your currency experience by enabling only the currencies you need. This will simplify the interface and make currency selection faster.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Smart Interface</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Data Preserved</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Easy Toggle</span>
                    </div>
                  </section>

                  {/* Current Selection */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Currently Selected Currency
                    </h3>
                    <div className="bg-white p-4 rounded-lg border-2 border-indigo-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CurrencyIcon size={24} className="mr-3 text-indigo-600" />
                          <div>
                            <div className="font-semibold text-gray-800 text-lg">
                              {getCurrencyInfo(selectedCurrency).name} ({getCurrencyInfo(selectedCurrency).symbol})
                            </div>
                            <div className="text-sm text-gray-600">Active currency for counting</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          Active
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Available Currencies */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <Coins className="mr-2" size={20} />
                      Available Currencies
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">
                          Enable or disable currencies to customize your interface. Disabled currencies won't appear in the currency selector dropdown.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {/* Built-in Currencies */}
                          {Object.entries(enabledCurrencies).map(([currency, enabled]) => {
                            const currencyInfo = getCurrencyInfo(currency);
                            const IconComponent = currencyInfo.icon;
                            const isSelected = selectedCurrency === currency;
                            
                            return (
                              <div 
                                key={currency} 
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                  enabled 
                                    ? isSelected 
                                      ? 'bg-indigo-50 border-indigo-300' 
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="mr-3 text-2xl">{currencyInfo.flag}</div>
                                  <IconComponent size={20} className="mr-3 text-gray-600" />
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium text-gray-800">{currencyInfo.name}</span>
                                      <span className="text-gray-500 ml-2 text-sm">({currencyInfo.symbol})</span>
                                      {isSelected && (
                                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {enabled ? 'Available in selector' : 'Hidden from selector'}
                                    </div>
                                  </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={enabled}
                                    onChange={(e) => handleCurrencyToggle(currency as Currency, e.target.checked)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                              </div>
                            );
                          })}
                          
                          {/* Custom Currencies */}
                          {customCurrencies.map((currency) => {
                            const isSelected = selectedCurrency === currency.code;
                            
                            return (
                              <div 
                                key={currency.code} 
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                  isSelected 
                                    ? 'bg-purple-50 border-purple-300' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="mr-3 text-2xl">{currency.flag}</div>
                                  <Coins size={20} className="mr-3 text-gray-600" />
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium text-gray-800">{currency.name}</span>
                                      <span className="text-gray-500 ml-2 text-sm">({currency.symbol})</span>
                                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        Custom
                                      </span>
                                      {isSelected && (
                                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {currency.denominations.length} denominations • Created {new Date(currency.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleCurrencyChange(currency.code)}
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors text-sm"
                                  >
                                    Select
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCustomCurrency(currency.code)}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-indigo-600">
                            {getAvailableCurrencies().length}
                          </div>
                          <div className="text-xs text-gray-600">Available</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {customCurrencies.length}
                          </div>
                          <div className="text-xs text-gray-600">Custom</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {getAllCurrencies().length}
                          </div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            1
                          </div>
                          <div className="text-xs text-gray-600">Active</div>
                        </div>
                      </div>

                      {/* Information Box */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">💡</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Important Notes</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• <strong>Data Safety:</strong> Disabling a currency preserves all your counting data</li>
                              <li>• <strong>Minimum Requirement:</strong> At least one currency must remain enabled</li>
                              <li>• <strong>Interface Impact:</strong> Disabled currencies won't appear in dropdown selectors</li>
                              <li>• <strong>Easy Recovery:</strong> Re-enabling a currency restores all previous functionality</li>
                              <li>• <strong>Keyboard Shortcuts:</strong> Use Ctrl+1/2/3/4/5 to quickly switch between enabled currencies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Custom Currency Creation */}
                  <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                          <Plus className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-purple-800">Create Custom Currency</h3>
                          <p className="text-purple-600 text-sm">Design your own currency with custom denominations!</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCustomCurrencyModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Create Currency
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            What You Can Create
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Design currency with custom symbol and name</li>
                            <li>• Set custom denominations and values</li>
                            <li>• Add flag/emoji for visual identification</li>
                            <li>• Support for notes and coins</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                            Fully Integrated
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Works with all existing features</li>
                            <li>• Full history and export support</li>
                            <li>• Saved locally for privacy</li>
                            <li>• Easy to manage and modify</li>
                          </ul>
                        </div>
                      </div>
                      
                      {customCurrencies.length > 0 && (
                        <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
                          <div className="text-center">
                            <h4 className="font-semibold text-purple-800 mb-1">You have created {customCurrencies.length} custom currenc{customCurrencies.length === 1 ? 'y' : 'ies'}!</h4>
                            <p className="text-sm text-purple-600">
                              Your custom currencies are shown in the Available Currencies section above.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {customCurrencies.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-2">No custom currencies created yet</p>
                          <p className="text-sm text-gray-400">Click "Create Currency" to get started!</p>
                        </div>
                      )}
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
                            <strong>Local Storage:</strong> Your counting data is stored locally in your browser. This means:
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Your counting numbers and history stay on your device</li>
                            <li>We use Google AdSense which collects analytics and cookie data</li>
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

                  {/* Saved Countings with Hashes */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="mr-2">#️⃣</span>
                      Saved Countings
                    </h3>
                    {savedCountings.length === 0 ? (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600 mb-2">No saved countings yet</p>
                        <p className="text-sm text-gray-500">
                          Save a counting from the main counter to generate a hash that you can reference in notes
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {savedCountings.slice(0, 10).map((counting) => (
                          <div key={counting.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-mono text-xs mr-2">
                                    {counting.hash}
                                  </span>
                                  <span className="text-sm text-gray-600">{counting.currency}</span>
                                </div>
                                <div className="text-sm text-gray-800">
                                  <span className="font-medium">
                                    {counting.currency === 'INR' ? '₹' : counting.currency === 'USD' ? '$' : counting.currency === 'EUR' ? '€' : counting.currency === 'GBP' ? '£' : 'د.إ'}
                                    {counting.totalAmount.toLocaleString()}
                                  </span>
                                  <span className="text-gray-500 ml-2">({counting.totalCount} items)</span>
                                </div>
                                <div className="text-xs text-gray-500">{counting.date}</div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(counting.hash);
                                    showAlert('Hash copied to clipboard!');
                                  }}
                                  className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                                  title="Copy hash"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCountingHash(counting.hash);
                                    setShowHashPopup(true);
                                    setShowMenu(false);
                                  }}
                                  className="p-1 text-green-500 hover:bg-green-100 rounded transition-colors"
                                  title="View details"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {savedCountings.length > 10 && (
                          <div className="text-center py-2">
                            <span className="text-sm text-gray-500">
                              Showing 10 of {savedCountings.length} saved countings
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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
                            ['INR', 'USD', 'EUR', 'GBP', 'AED'].forEach(currency => {
                              localStorage.removeItem(`denominationCounts_${currency}`);
                              localStorage.removeItem(`countNoteHistory_${currency}`);
                            });
                            localStorage.removeItem('calculatorHistory');
                            localStorage.removeItem('selectedCurrency');
                            localStorage.removeItem('savedCountings');
                            localStorage.removeItem('quickNotes');
                            localStorage.removeItem('enabledCurrencies');
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
                        <li>✅ All currency counting data (INR, USD, EUR, GBP, AED)</li>
                        <li>✅ Complete counting history for all currencies</li>
                        <li>✅ Saved countings with hashes</li>
                        <li>✅ Quick notes and notepad content</li>
                        <li>✅ Calculator history</li>
                        <li>✅ App settings and preferences</li>
                        <li>✅ Timestamp information</li>
                      </ul>
                    </div>
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
                              <span className={`text-gray-600 ${!showCalculator ? 'line-through opacity-50' : ''}`}>Toggle calculator keypad</span>
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
                              <span className="text-gray-600">Quick notepad</span>
                              <kbd className="px-2 py-1 bg-purple-200 rounded text-xs font-mono">Shift + N</kbd>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-orange-600 font-medium">🔐 Instant lock app</span>
                              <kbd className="px-2 py-1 bg-orange-200 rounded text-xs font-mono font-bold">Shift + L</kbd>
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

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="text-base font-medium text-gray-700 mb-2">#️⃣ Hash References (New!)</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                          <li>Every saved counting gets a simple hash (e.g., <code className="bg-blue-100 text-blue-800 px-1 rounded text-xs">#1</code>, <code className="bg-blue-100 text-blue-800 px-1 rounded text-xs">#2</code>, <code className="bg-blue-100 text-blue-800 px-1 rounded text-xs">#3</code>)</li>
                          <li>Reference saved countings in notes by typing their hash</li>
                          <li>Click on hash references in notes to view counting details</li>
                          <li>Copy hash to clipboard and load counting data with one click</li>
                          <li>Find all your saved hashes in the Data tab and History</li>
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
                  {/* Inline feedback / contact / bug / feature form */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1">Get in touch</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Found a bug, have an idea, or just want to say hi? Send a message right from here — feedback, bug reports, and feature requests all land in the developer's inbox.
                    </p>
                    <FeedbackForm compact />
                  </section>

                  {/* Quick links */}
                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href="https://github.com/PATILYASHH/note-counter/issues/new/choose"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Github className="mr-3 flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Open a GitHub issue</div>
                        <div className="text-xs text-gray-500 truncate">For technical bug reports</div>
                      </div>
                    </a>
                    <a
                      href="mailto:patilyasshh@gmail.com"
                      className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Mail className="mr-3 flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Email directly</div>
                        <div className="text-xs text-blue-600 truncate">patilyasshh@gmail.com</div>
                      </div>
                    </a>
                    <a
                      href="https://yashpatil.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                    >
                      <Globe className="mr-3 flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Developer portfolio</div>
                        <div className="text-xs text-green-600 truncate">yashpatil.vercel.app</div>
                      </div>
                    </a>
                  </section>

                  {/* Support Section */}
                  <section className="rounded-xl2 border border-rose-200/70 bg-gradient-to-br from-rose-50 to-amber-50 p-5 text-center">
                    <Heart size={28} className="mx-auto text-rose-500 mb-2" />
                    <h4 className="text-base font-bold text-ink-900 mb-1">Support development</h4>
                    <p className="text-sm text-ink-600 mb-4">
                      Note Counter is free &amp; open-source. If it saves you time, please consider sponsoring — UPI for India, GitHub for international.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => { setShowMenu(false); setShowSponsorModal(true); }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-card transition-colors"
                      >
                        <Heart size={16} />
                        Sponsor (UPI / GitHub)
                      </button>
                      <a
                        href="https://github.com/PATILYASHH/note-counter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 transition-colors"
                      >
                        <Github size={16} />
                        Star on GitHub
                      </a>
                    </div>
                  </section>
                </div>
              )}

              {/* Privacy Tab */}
              {activeMenuTab === 'privacy' && (
                <div className="space-y-6">
                  {/* Privacy Header */}
                  <section className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                        <Shield size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Privacy at a glance</h3>
                        <p className="text-sm text-emerald-700">Free forever · No ads · No tracking of your data</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Note Counter is a free, open-source project. There are no advertisements, no AdSense, no third-party trackers, and no cookies set by this site. Your counts, history, GST/EMI records, notes and custom currencies live <strong>only in your browser</strong> — nothing about the amounts you enter is sent anywhere. The only telemetry is anonymous, cookieless page-view counts via Vercel Analytics so the developer can see roughly how many people visit the site. Full detail in the <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-800">Privacy Policy</a>.
                    </p>
                  </section>

                  {/* What stays on your device */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="text-emerald-500 mr-2">✅</span>
                      Stored only on your device (browser localStorage)
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="text-sm font-medium text-blue-800">Counts &amp; saved sessions</div>
                            <div className="text-xs text-blue-600">Active denomination counts and saved counting history</div>
                          </div>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded whitespace-nowrap">Your device</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="text-sm font-medium text-blue-800">Tax &amp; EMI history</div>
                            <div className="text-xs text-blue-600">Saved GST / VAT and Loan EMI calculations</div>
                          </div>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded whitespace-nowrap">Your device</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="text-sm font-medium text-blue-800">Notes &amp; custom currencies</div>
                            <div className="text-xs text-blue-600">Quick notepad entries and custom currency definitions</div>
                          </div>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded whitespace-nowrap">Your device</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="text-sm font-medium text-blue-800">Preferences &amp; Web Lock</div>
                            <div className="text-xs text-blue-600">Currency choice, hide-amount toggle, optional PIN/password (stored hashed)</div>
                          </div>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded whitespace-nowrap">Your device</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* What does NOT happen */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="text-rose-500 mr-2">🚫</span>
                      What this site does <em>not</em> do
                    </h3>
                    <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 space-y-2 text-sm text-rose-900">
                      <div>• <strong>No advertisements.</strong> No AdSense, no sponsored content, no banner ads.</div>
                      <div>• <strong>No accounts or sign-up.</strong> No email collection, no newsletter.</div>
                      <div>• <strong>No third-party trackers.</strong> No Google Analytics, no Facebook Pixel, no Mixpanel, no Plausible.</div>
                      <div>• <strong>No cookies set</strong> by Note Counter. There's no cookie banner because there's nothing to consent to.</div>
                      <div>• <strong>No premium tier.</strong> Every feature is free, forever.</div>
                    </div>
                  </section>

                  {/* What IS sent over the network */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="mr-2">📡</span>
                      What is sent over the network
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-900 space-y-3">
                      <div>
                        <div className="font-bold mb-1">1. Vercel Analytics — page-view counts</div>
                        <p className="leading-relaxed">
                          Anonymous, cookieless page-view counts. Records URL path, referrer, country, browser, OS, and device type. No cookies, no behaviour profile, no cross-site tracking. The developer uses this only to see how many people visit overall.
                          <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="block text-amber-800 underline hover:text-amber-900 text-xs mt-1">Vercel's analytics privacy policy →</a>
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-200/70">
                        <div className="font-bold mb-1">2. Currency Converter — exchange rates</div>
                        <p className="leading-relaxed">
                          When you open the FX tab, the app fetches mid-market exchange rates from <a href="https://www.floatrates.com" target="_blank" rel="noopener noreferrer" className="underline">floatrates.com</a> via a public GET request. The response is cached in your browser for 24 hours, so subsequent visits don't hit the network. The request sends no user data, no cookies, no amounts you've entered.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-200/70">
                        <div className="font-bold mb-1">3. Feedback / Contact form — only when you click Send</div>
                        <p className="leading-relaxed">
                          If you fill out the Contact form (Menu → Contact, or <code className="bg-amber-100 px-1 rounded">/contact.html</code>) and click <strong>Send</strong>, your submission is delivered to the developer's inbox via <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">Formspree</a>. The submission contains exactly what you typed (name, email, subject, message, category) plus minor triage metadata (app version, current page URL, browser user-agent, timestamp). Nothing is sent until you press Send. See <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline">Formspree's privacy policy</a>.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Privacy Controls */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="mr-2">🛡️</span>
                      Your controls
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Hide amounts</div>
                        <div className="text-xs text-yellow-700">Toggle the eye icon in the navbar (Ctrl+H)</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Export data</div>
                        <div className="text-xs text-yellow-700">JSON export from the Data tab</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Clear data</div>
                        <div className="text-xs text-yellow-700">"Clear all" in History or your browser's site-data settings</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Web Lock</div>
                        <div className="text-xs text-yellow-700">Optional PIN/password gate, stored hashed in your browser</div>
                      </div>
                    </div>
                  </section>

                  {/* Open source */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="mr-2">🐙</span>
                      Open source — verify it yourself
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-3">
                        Released under the <strong>MIT License</strong>. The full source code is on GitHub — you can read it, fork it, run your own copy, or audit exactly what data leaves your browser.
                      </p>
                      <a
                        href="https://github.com/PATILYASHH/note-counter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
                      >
                        <Github size={18} className="mr-2" />
                        github.com/PATILYASHH/note-counter
                      </a>
                    </div>
                  </section>

                  {/* Legal documents */}
                  <section className="text-center">
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Full legal documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <button
                        onClick={() => window.open('/privacy-policy.html', '_blank')}
                        className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md font-medium"
                      >
                        <FileText size={18} className="mr-2" />
                        Privacy Policy
                      </button>
                      <button
                        onClick={() => window.open('/disclaimer.html', '_blank')}
                        className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Disclaimer
                      </button>
                      <button
                        onClick={() => window.open('/terms.html', '_blank')}
                        className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Terms of Service
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      All documents open in a new tab • Last updated: April 29, 2026
                    </p>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null;

  // Sponsor Modal — UPI quick-pay + GitHub Sponsors
  const UPI_ID = 'yashpatil0305@ybl';
  const UPI_PAYEE_NAME = 'Yash Patil';
  const sponsorAmountNum = Math.max(0, parseFloat(sponsorAmount) || 0);
  const upiPayLink =
    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
    `&pn=${encodeURIComponent(UPI_PAYEE_NAME)}` +
    (sponsorAmountNum > 0 ? `&am=${sponsorAmountNum}` : '') +
    `&cu=INR&tn=${encodeURIComponent('Note Counter sponsor')}`;
  const sponsorPresets = [100, 500, 1000, 2000, 5000];

  const sponsorModalElement = showSponsorModal ? (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl2 shadow-card-lg max-w-lg w-full max-h-[92vh] overflow-y-auto animate-slide-up border border-ink-200/70">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-card">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-ink-900 tracking-tight">Support Note Counter</h2>
                <p className="text-xs text-ink-500 mt-0.5">Help keep this free, ad-free, and open source</p>
              </div>
            </div>
            <button
              onClick={() => setShowSponsorModal(false)}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* UPI section (India) */}
          <section className="mb-5 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🇮🇳</span>
                <h3 className="text-sm font-bold text-emerald-900">Pay with UPI</h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80 bg-emerald-100 px-2 py-0.5 rounded">
                Instant · 0% fee
              </span>
            </div>
            <p className="text-xs text-emerald-900/80 mb-3">
              Works with PhonePe, Google Pay, Paytm, BHIM and any other UPI app. No account, no sign-up.
            </p>

            {/* Amount picker */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80 mb-1.5">
                Amount (₹)
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sponsorPresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSponsorAmount(String(p))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      sponsorAmountNum === p
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 font-semibold">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={sponsorAmount}
                  onChange={(e) => setSponsorAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-emerald-200 bg-white text-emerald-900 font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>

            {/* UPI ID display + copy */}
            <div className="mb-3 p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">UPI ID</div>
                <div className="text-sm font-mono font-bold text-emerald-900 truncate">{UPI_ID}</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(UPI_ID);
                    setSponsorCopied(true);
                    setTimeout(() => setSponsorCopied(false), 1500);
                  } catch {
                    // ignore
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex-shrink-0 ${
                  sponsorCopied
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Copy size={12} />
                {sponsorCopied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <a
              href={upiPayLink}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              <Heart size={15} />
              Open UPI app to pay {sponsorAmountNum > 0 ? `₹${sponsorAmountNum}` : ''}
            </a>
            <p className="text-[10px] text-emerald-800/70 mt-2 leading-relaxed">
              On mobile this opens your default UPI app with the amount pre-filled. On desktop, copy the UPI ID and pay
              from your phone, or scan it via your UPI app's "pay to UPI ID" option.
            </p>
          </section>

          {/* GitHub Sponsors */}
          <section className="mb-3 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🌍</span>
              <h3 className="text-sm font-bold text-rose-900">GitHub Sponsors (international)</h3>
            </div>
            <p className="text-xs text-rose-900/80 mb-3">
              Card payments worldwide via GitHub. Requires a free GitHub account. Recurring or one-time.
            </p>
            <a
              href="https://github.com/sponsors/PATILYASHH"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              <Github size={15} />
              Sponsor on GitHub
            </a>
          </section>

          {/* Star on GitHub fallback */}
          <p className="text-center text-xs text-ink-500">
            Don't want to send money?{' '}
            <a
              href="https://github.com/PATILYASHH/note-counter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 font-semibold underline"
            >
              Star the repo
            </a>{' '}
            — that helps too. ⭐
          </p>
        </div>
      </div>
    </div>
  ) : null;

  // Custom Currency Creation Modal
  const customCurrencyModalElement = showCustomCurrencyModal ? (
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="nc-card-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-card">
                  <Plus className="text-white" size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">Create custom currency</h2>
                  <p className="text-xs text-ink-500 mt-0.5">Define your own code, symbol, and denominations</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomCurrencyModal(false)}
                className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Code * <span className="text-gray-500">(3 characters)</span>
                  </label>
                  <input
                    type="text"
                    value={customCurrencyForm.code}
                    onChange={(e) => setCustomCurrencyForm(prev => ({ ...prev, code: e.target.value.toUpperCase().slice(0, 3) }))}
                    placeholder="e.g., XYZ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Name *
                  </label>
                  <input
                    type="text"
                    value={customCurrencyForm.name}
                    onChange={(e) => setCustomCurrencyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., MyCoins"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Symbol *
                  </label>
                  <input
                    type="text"
                    value={customCurrencyForm.symbol}
                    onChange={(e) => setCustomCurrencyForm(prev => ({ ...prev, symbol: e.target.value }))}
                    placeholder="e.g., ♦ or MC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag/Emoji <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customCurrencyForm.flag}
                    onChange={(e) => setCustomCurrencyForm(prev => ({ ...prev, flag: e.target.value }))}
                    placeholder="🏴 or any emoji"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Denominations Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Denominations</h3>
                  <button
                    onClick={addDenomination}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Denomination
                  </button>
                </div>

                {customCurrencyForm.denominations.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No denominations added yet</p>
                    <p className="text-sm text-gray-400">Add denominations to define your currency values</p>
                  </div>
                )}

                <div className="space-y-3">
                  {customCurrencyForm.denominations.map((denom) => (
                    <div key={denom.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        <DenominationValueInput
                          id={denom.id}
                          value={denom.value}
                          onUpdate={(id, value) => updateDenomination(id, 'value', value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={denom.type}
                          onChange={(e) => updateDenomination(denom.id, 'type', e.target.value as 'note' | 'coin')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="note">Note</option>
                          <option value="coin">Coin</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeDenomination(denom.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {customCurrencyForm.code && customCurrencyForm.name && customCurrencyForm.symbol && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Preview</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{customCurrencyForm.flag || '🏴'}</span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {customCurrencyForm.name} ({customCurrencyForm.symbol})
                      </div>
                      <div className="text-sm text-gray-600">
                        Code: {customCurrencyForm.code} • {customCurrencyForm.denominations.length} denominations
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomCurrencyModal(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomCurrency}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Currency
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
            <header className="sticky top-0 z-30 bg-ink-900 text-white shadow-card-md backdrop-blur supports-[backdrop-filter]:bg-ink-900/95">
              <div className="container mx-auto flex justify-between items-center gap-3 px-4 h-16 md:h-[60px]">
                <h1 className="flex items-center min-w-0">
                  <button
                    type="button"
                    aria-label="Note Counter — home"
                    className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      const batchId = Date.now();
                      setConfettiBatches(prev => [...prev, batchId]);
                      setTimeout(() => {
                        setConfettiBatches(prev => prev.filter(id => id !== batchId));
                      }, 5000);

                      const newClickCount = logoClickCount + 1;
                      setLogoClickCount(newClickCount);

                      if (logoClickTimer) clearTimeout(logoClickTimer);

                      if (newClickCount === 3) {
                        const rocketId = Date.now();
                        setRockets(prev => [...prev, rocketId]);
                        setTimeout(() => {
                          setRockets(prev => prev.filter(id => id !== rocketId));
                        }, 2000);
                        setLogoClickCount(0);
                      } else {
                        const timer = setTimeout(() => setLogoClickCount(0), 1000);
                        setLogoClickTimer(timer);
                      }
                    }}
                  >
                    <BrandMark size={36} title="Note Counter" />
                    <span className="hidden sm:flex flex-col leading-none text-left">
                      <span className="text-base font-extrabold tracking-tight">
                        Note <span className="text-amber-400">Counter</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-ink-300 mt-1">
                        v11 · open source
                      </span>
                    </span>
                  </button>
                </h1>

                {/* Mobile right side */}
                <div className="md:hidden flex items-center gap-1">
                  <button
                    onClick={() => setShowSponsorModal(true)}
                    aria-label="Sponsor"
                    className="nc-icon-btn text-rose-300 hover:text-rose-200"
                    title="Sponsor (UPI / GitHub)"
                  >
                    <Heart size={18} />
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="nc-icon-btn"
                    aria-label="Open menu"
                  >
                    <Menu size={22} />
                  </button>
                </div>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Segmented calculator tabs */}
                  <nav className="nc-segment" aria-label="Calculator views">
                    <button
                      className={`nc-segment-btn ${activeTab === 'counter' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('counter')}
                      title="Money counter"
                    >
                      <CurrencyIcon size={15} />
                      <span className="hidden lg:inline">Counter</span>
                    </button>
                    <button
                      className={`nc-segment-btn ${activeTab === 'tax' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('tax')}
                      title={selectedCurrency === 'INR' ? 'GST calculator' : 'Tax / VAT calculator'}
                    >
                      <Receipt size={15} />
                      <span className="hidden lg:inline">{selectedCurrency === 'INR' ? 'GST' : 'Tax'}</span>
                    </button>
                    <button
                      className={`nc-segment-btn ${activeTab === 'emi' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('emi')}
                      title="Loan EMI calculator"
                    >
                      <Landmark size={15} />
                      <span className="hidden lg:inline">EMI</span>
                    </button>
                    <button
                      className={`nc-segment-btn ${activeTab === 'sip' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('sip')}
                      title="SIP / Compound interest calculator"
                    >
                      <TrendingUp size={15} />
                      <span className="hidden lg:inline">SIP</span>
                    </button>
                    <button
                      className={`nc-segment-btn ${activeTab === 'fx' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('fx')}
                      title="Currency converter (live rates)"
                    >
                      <ArrowLeftRight size={15} />
                      <span className="hidden lg:inline">FX</span>
                    </button>
                    <button
                      className={`nc-segment-btn ${activeTab === 'history' ? 'nc-segment-btn-active' : ''}`}
                      onClick={() => setActiveTab('history')}
                      title="Saved counting history"
                    >
                      <History size={15} />
                      <span className="hidden lg:inline">History</span>
                    </button>
                  </nav>

                  <div className="w-px h-6 bg-white/15 mx-0.5" aria-hidden="true" />

                  {/* Currency picker chip */}
                  <label className="nc-currency-chip" title="Active currency (Ctrl+1..5)">
                    <span className="text-base leading-none" aria-hidden="true">
                      {getCurrencyInfo(selectedCurrency).flag}
                    </span>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                      className="bg-transparent border-0 text-sm font-semibold cursor-pointer focus:outline-none pr-1"
                      aria-label="Select currency"
                    >
                      {getAvailableCurrencies().map(currency => {
                        const currencyInfo = getCurrencyInfo(currency);
                        return (
                          <option key={currency} value={currency} className="bg-ink-900">
                            {currency} ({currencyInfo.symbol})
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  {/* Quick utilities */}
                  <button
                    onClick={() => setHideAmounts(!hideAmounts)}
                    className="nc-icon-btn"
                    title={hideAmounts ? 'Show amounts (Ctrl+H)' : 'Hide amounts (Ctrl+H)'}
                    aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
                  >
                    {hideAmounts ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={toggleNotepad}
                    className="nc-icon-btn relative"
                    title="Quick Notepad (Shift+N)"
                    aria-label="Open notepad"
                  >
                    <NotebookPen size={18} />
                    {notes.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold px-0.5 ring-2 ring-ink-900">
                        {notes.length > 9 ? '9+' : notes.length}
                      </span>
                    )}
                  </button>

                  <div className="w-px h-6 bg-white/15 mx-0.5" aria-hidden="true" />

                  {/* External + menu */}
                  <button
                    onClick={() => setShowSponsorModal(true)}
                    className="nc-icon-btn text-rose-300 hover:text-rose-200"
                    title="Sponsor (UPI / GitHub)"
                    aria-label="Sponsor"
                  >
                    <Heart size={17} />
                  </button>
                  <a
                    href="https://github.com/PATILYASHH/note-counter"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Star on GitHub"
                    className="nc-icon-btn"
                    title="Star on GitHub"
                  >
                    <Github size={18} />
                  </a>
                  <button
                    onClick={() => setShowMenu(true)}
                    className="nc-icon-btn relative"
                    title="Menu (Ctrl+M) • F1 for shortcuts"
                    aria-label="Open menu"
                  >
                    <MenuIcon size={20} />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                  </button>
                </div>
              </div>
              <div className="nc-header-accent" aria-hidden="true" />

              {/* Mobile: always-visible segmented tabs + currency chip */}
              <div className="md:hidden bg-ink-900/95 border-t border-white/5 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <label className="nc-currency-chip flex-shrink-0" title="Active currency">
                  <span className="text-base leading-none" aria-hidden="true">
                    {getCurrencyInfo(selectedCurrency).flag}
                  </span>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                    className="bg-transparent border-0 text-xs font-semibold cursor-pointer focus:outline-none pr-1"
                    aria-label="Select currency"
                  >
                    {getAvailableCurrencies().map(currency => {
                      const currencyInfo = getCurrencyInfo(currency);
                      return (
                        <option key={currency} value={currency} className="bg-ink-900">
                          {currency} ({currencyInfo.symbol})
                        </option>
                      );
                    })}
                  </select>
                </label>
                <nav className="nc-segment flex-shrink-0" aria-label="Calculator views">
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'counter' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('counter')}
                  >
                    <CurrencyIcon size={14} />
                    <span className="text-xs">Counter</span>
                  </button>
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'tax' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('tax')}
                  >
                    <Receipt size={14} />
                    <span className="text-xs">{selectedCurrency === 'INR' ? 'GST' : 'Tax'}</span>
                  </button>
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'emi' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('emi')}
                  >
                    <Landmark size={14} />
                    <span className="text-xs">EMI</span>
                  </button>
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'sip' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('sip')}
                  >
                    <TrendingUp size={14} />
                    <span className="text-xs">SIP</span>
                  </button>
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'fx' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('fx')}
                  >
                    <ArrowLeftRight size={14} />
                    <span className="text-xs">FX</span>
                  </button>
                  <button
                    className={`nc-segment-btn justify-center ${activeTab === 'history' ? 'nc-segment-btn-active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    <History size={14} />
                    <span className="text-xs">Saved</span>
                  </button>
                </nav>
              </div>
            </header>

            {mobileMenuOpen && (
              <div className="md:hidden bg-ink-900 text-white border-t border-white/10 animate-slide-up">
                <div className="container mx-auto p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setHideAmounts(!hideAmounts); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10 transition-all"
                    >
                      {hideAmounts ? <EyeOff size={16} /> : <Eye size={16} />}
                      {hideAmounts ? 'Show amounts' : 'Hide amounts'}
                    </button>
                    <button
                      onClick={() => { toggleNotepad(); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10 transition-all relative"
                    >
                      <NotebookPen size={16} />
                      Notepad
                      {notes.length > 0 && (
                        <span className="bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1">
                          {notes.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => { setShowMenu(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10"
                  >
                    <MenuIcon size={16} />
                    Settings & shortcuts
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setShowSponsorModal(true); }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold bg-rose-500/15 text-rose-200 border border-rose-400/20 hover:bg-rose-500/25 transition-colors"
                    >
                      <Heart size={16} />
                      Sponsor
                    </button>
                    <a
                      href="https://github.com/PATILYASHH/note-counter"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold bg-white/5 text-white hover:bg-white/10 transition-colors"
                    >
                      <Github size={16} />
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Takes remaining space */}
            <div className="flex-1 flex flex-col">
              {menuModalElement}
              {customCurrencyModalElement}
              {sponsorModalElement}
              <ReviewPrompt />
              {showHashPopup && <HashPopup />}
              {showNotepad && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center">
                      <NotebookPen className="mr-3 text-purple-600" size={24} />
                      <h2 className="text-xl font-bold text-gray-800">Quick Notepad</h2>
                      <span className="ml-2 text-sm text-gray-500">({notes.length} notes)</span>
                    </div>
                    <button
                      onClick={() => setShowNotepad(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Notes List Sidebar */}
                    <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                      <div className="p-3 border-b border-gray-200">
                        <button
                          onClick={createNewNote}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <Plus className="mr-2" size={16} />
                          New Note
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {notes.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <NotebookPen size={48} className="mx-auto mb-2 text-gray-300" />
                            <p>No notes yet</p>
                            <p className="text-sm">Create your first note!</p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {notes.map((note) => (
                              <div
                                key={note.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                  currentNote?.id === note.id
                                    ? 'bg-purple-100 border-purple-300'
                                    : 'bg-white border-transparent hover:bg-gray-100'
                                }`}
                                onClick={() => selectNote(note)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium text-gray-800 truncate flex-1">{note.title}</h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNote(note.id);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                                    title="Delete note"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {renderNoteWithHashes(note.content || 'No content')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(note.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note Editor */}
                    <div className="flex-1 flex flex-col">
                      {currentNote ? (
                        <>
                          {/* Note Header */}
                          <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className="text-lg font-semibold text-gray-800 border-none outline-none bg-transparent flex-1"
                                placeholder="Note title..."
                                disabled={!isEditingNote}
                              />
                              <div className="flex items-center space-x-2 ml-4">
                                {isEditingNote ? (
                                  <>
                                    <button
                                      onClick={saveCurrentNote}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
                                    >
                                      <Save className="mr-1" size={14} />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIsEditingNote(false);
                                        setNoteTitle(currentNote.title);
                                        setNoteContent(currentNote.content);
                                      }}
                                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setIsEditingNote(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
                                  >
                                    <Edit className="mr-1" size={14} />
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(currentNote.createdAt).toLocaleString()} | 
                              Updated: {new Date(currentNote.updatedAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Note Content */}
                          <div className="flex-1 p-4">
                            {isEditingNote ? (
                              <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="Start writing your note... (Reference saved countings using their hash, e.g., #1, #2, #3)"
                                disabled={!isEditingNote}
                              />
                            ) : (
                              <div className="w-full h-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50 overflow-y-auto whitespace-pre-wrap">
                                {noteContent ? renderNoteWithHashes(noteContent) : (
                                  <span className="text-gray-500 italic">No content</span>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                          <div className="text-center text-gray-500">
                            <NotebookPen size={64} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">Select a note to view</h3>
                            <p className="text-sm">Choose a note from the sidebar or create a new one</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>💡 Tip: Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + N</kbd> to quickly open/close</span>
                        <span>� Reference saved countings using their hash (e.g., #1, #2, #3)</span>
                        <span>�📱 All notes saved locally on your device</span>
                      </div>
                      <div className="text-xs">
                        Note Counter • Quick Notepad
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="container mx-auto p-3 sm:p-4 flex-1">
              {activeTab === 'counter' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  {/* Denominations — left column */}
                  <div className="md:col-span-1">
                    <div className="nc-card-lg p-4 sm:p-5 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-ink-900 tracking-tight">Count Your Money</h2>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {getCurrencyInfo(selectedCurrency).flag} {getCurrencyInfo(selectedCurrency).name}
                          </p>
                        </div>
                        <button
                          onClick={() => setHideAmounts(!hideAmounts)}
                          className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title={hideAmounts ? "Show amounts (Ctrl+H)" : "Hide amounts (Ctrl+H)"}
                          aria-label={hideAmounts ? "Show amounts" : "Hide amounts"}
                        >
                          {hideAmounts ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {leftColumnDenominations.map((denom, idx) => (
                          <DenominationCounter
                            key={denom.value}
                            value={denom.value}
                            type={denom.type as 'note' | 'coin'}
                            count={counts[denom.value] || 0}
                            onCountChange={(count) => handleCountChange(denom.value, count)}
                            hideAmount={hideAmounts}
                            currency={selectedCurrency}
                            currencySymbol={getCurrencyInfo(selectedCurrency).symbol}
                            inputRef={el => denominationRefs.current[denom.value] = el}
                            onInputKeyDown={e => handleDenominationKeyDown(e, denom.value, 'left', idx)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Denominations — right column */}
                  <div className="md:col-span-1">
                    <div className="nc-card-lg p-4 sm:p-5 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-ink-900 tracking-tight invisible md:visible">Continued</h2>
                        <span className="nc-chip bg-ink-100 text-ink-600">
                          {getCurrencyDenominations(selectedCurrency).length} denominations
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {rightColumnDenominations.map((denom, idx) => (
                          <DenominationCounter
                            key={denom.value}
                            value={denom.value}
                            type={denom.type as 'note' | 'coin'}
                            count={counts[denom.value] || 0}
                            onCountChange={(count) => handleCountChange(denom.value, count)}
                            hideAmount={hideAmounts}
                            currency={selectedCurrency}
                            currencySymbol={getCurrencyInfo(selectedCurrency).symbol}
                            inputRef={el => denominationRefs.current[denom.value] = el}
                            onInputKeyDown={e => handleDenominationKeyDown(e, denom.value, 'right', idx)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-1">
                    <div className="nc-card-lg p-4 sm:p-5 h-full md:sticky md:top-20">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-ink-900 tracking-tight">Summary</h2>
                        <button
                          onClick={() => setShowSponsorModal(true)}
                          className="nc-sponsor"
                          title="Support development (UPI / GitHub)"
                        >
                          <Heart size={14} />
                          Sponsor
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="nc-stat bg-ink-50 border-ink-200">
                          <div className="nc-stat-label">Total Count</div>
                          <div className="nc-stat-value text-ink-900">{totalCount}</div>
                        </div>
                        <div className="nc-stat bg-brand-50 border-brand-200/60">
                          <div className="nc-stat-label text-brand-700/80">Total Amount</div>
                          <div className="nc-stat-value text-brand-700 truncate">
                            {formatAmount(totalAmount)}
                          </div>
                        </div>
                      </div>

                      {showAmountInText && (
                        <div className="nc-stat bg-emerald-50 border-emerald-200/60 mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="nc-stat-label text-emerald-700/80">Amount in Words</div>
                            <button
                              onClick={() => copyToClipboard(numberToText(totalAmount))}
                              className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Copy to clipboard"
                              aria-label="Copy amount in words"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-emerald-800 leading-snug">
                            {numberToText(totalAmount)}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handleReset}
                          className="nc-btn-ghost flex-1"
                          title="Reset all counts (Ctrl+R)"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleSave}
                          className="nc-btn-success flex-1"
                          title="Save current count (Ctrl+S)"
                        >
                          <Save size={16} />
                          Save
                        </button>
                      </div>

                      {showCalculator && (
                        <div className="mt-5 pt-5 border-t border-ink-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calculator size={16} className="text-brand-600" />
                              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider">Calculator</h3>
                            </div>
                            <label className="inline-flex items-center gap-1.5 text-xs text-ink-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                id="sendToCalculator"
                                checked={sendToCalculator}
                                onChange={(e) => setSendToCalculator(e.target.checked)}
                                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
                              />
                              Use total
                            </label>
                          </div>
                          <SimpleCalculator
                            initialValue={sendToCalculator ? totalAmount.toString() : ''}
                            showPad={showCalculatorPad}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'tax' ? (
                <TaxCalculator
                  currency={selectedCurrency}
                  currencySymbol={getCurrencyInfo(selectedCurrency).symbol}
                  currencyName={getCurrencyInfo(selectedCurrency).name}
                  currencyFlag={getCurrencyInfo(selectedCurrency).flag}
                />
              ) : activeTab === 'emi' ? (
                <EMICalculator
                  currency={selectedCurrency}
                  currencySymbol={getCurrencyInfo(selectedCurrency).symbol}
                  currencyName={getCurrencyInfo(selectedCurrency).name}
                  currencyFlag={getCurrencyInfo(selectedCurrency).flag}
                />
              ) : activeTab === 'sip' ? (
                <SipCalculator
                  currency={selectedCurrency}
                  currencySymbol={getCurrencyInfo(selectedCurrency).symbol}
                  currencyName={getCurrencyInfo(selectedCurrency).name}
                  currencyFlag={getCurrencyInfo(selectedCurrency).flag}
                />
              ) : activeTab === 'fx' ? (
                <CurrencyConverter
                  selectedCurrency={selectedCurrency}
                  availableCurrencies={getAvailableCurrencies().map((code) => {
                    const info = getCurrencyInfo(code);
                    return {
                      code,
                      name: info.name,
                      symbol: info.symbol,
                      flag: info.flag,
                    };
                  })}
                />
              ) : (
                <div className="animate-fade-in">
                  <HistoryTab hideAmounts={hideAmounts} selectedCurrency={selectedCurrency} />
                </div>
              )}
            </div>
            
            {/* End of Main Content */}
            </div>

            <footer className="bg-ink-900 text-ink-300 mt-auto border-t border-white/5">
              <div className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  {/* Brand + sponsor */}
                  <div>
                    <div className="mb-3">
                      <BrandLogo size={36} tone="dark" title="Note Counter" />
                    </div>
                    <p className="text-sm text-ink-400 leading-relaxed mb-4">
                      Free and open-source money counter. Count notes and coins fast for INR, USD, EUR, GBP, AED or any custom currency.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowSponsorModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-500/15 text-rose-200 border border-rose-400/20 hover:bg-rose-500/25 transition-colors"
                      >
                        <Heart size={14} />
                        Sponsor (UPI / GitHub)
                      </button>
                      <a
                        href="https://github.com/PATILYASHH/note-counter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <Github size={14} />
                        Star on GitHub
                      </a>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">Project</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/about.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About</a></li>
                      <li><a href="/blog.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
                      <li><a href="/contact.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
                      <li><a href="https://github.com/PATILYASHH/note-counter/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Report an issue</a></li>
                    </ul>
                  </div>

                  {/* Legal */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">Legal</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy policy</a></li>
                      <li><a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of service</a></li>
                      <li><a href="/disclaimer.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Disclaimer</a></li>
                      <li><a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MIT License</a></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
                  <p>© {new Date().getFullYear()} Yash Patil · Note Counter v11.0 · Open source under MIT</p>
                  <p className="flex items-center gap-1">
                    Made with <Heart size={12} className="text-rose-400" /> in India
                  </p>
                </div>
              </div>
            </footer>
            
            {/* Floating Help Button - Hidden on mobile */}
            <button
              onClick={() => {
                setShowMenu(true);
                setActiveMenuTab('help');
              }}
              className="hidden md:block fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
              title="Keyboard Shortcuts & Help (F1)"
            >
              <Keyboard size={20} />
              <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                F1 - Help & Shortcuts
              </span>
            </button>

            {/* Falling Confetti */}
            {confettiBatches.map((batchId) => (
              <div key={batchId} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                {[...Array(100)].map((_, i) => (
                  <div
                    key={`confetti-${batchId}-${i}`}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-20px',
                      width: `${Math.random() * 12 + 6}px`,
                      height: `${Math.random() * 16 + 8}px`,
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A8E6CF', '#FF85A2', '#9B59B6', '#3498DB', '#E74C3C', '#F39C12', '#E91E63', '#00BCD4'][Math.floor(Math.random() * 12)],
                      animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
                      animationDelay: `${Math.random() * 0.3}s`,
                      borderRadius: '2px',
                      opacity: 0.9
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Diagonal Rockets */}
            {rockets.map((rocketId) => (
              <div key={rocketId} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                {/* Rocket from bottom-right to top-left */}
                <div
                  className="absolute text-6xl"
                  style={{
                    right: '0',
                    bottom: '0',
                    animation: 'rocket-diagonal-right 2s ease-out forwards'
                  }}
                >
                  🚀
                </div>
                
                {/* Smoke trail for right rocket */}
                {[...Array(15)].map((_, i) => (
                  <div
                    key={`smoke-right-${i}`}
                    className="absolute text-3xl opacity-70"
                    style={{
                      right: '0',
                      bottom: '0',
                      animation: `rocket-diagonal-right 2s ease-out forwards`,
                      animationDelay: `${i * 0.1}s`,
                      filter: 'blur(2px)'
                    }}
                  >
                    💨
                  </div>
                ))}
                
                {/* Rocket from bottom-left to top-right */}
                <div
                  className="absolute text-6xl"
                  style={{
                    left: '0',
                    bottom: '0',
                    animation: 'rocket-diagonal-left 2s ease-out forwards',
                    transform: 'scaleX(-1)'
                  }}
                >
                  🚀
                </div>

                {/* Smoke trail for left rocket */}
                {[...Array(15)].map((_, i) => (
                  <div
                    key={`smoke-left-${i}`}
                    className="absolute text-3xl opacity-70"
                    style={{
                      left: '0',
                      bottom: '0',
                      animation: `rocket-diagonal-left 2s ease-out forwards`,
                      animationDelay: `${i * 0.1}s`,
                      transform: 'scaleX(-1)',
                      filter: 'blur(2px)'
                    }}
                  >
                    💨
                  </div>
                ))}

                {/* Explosion effects at the end */}
                <div
                  className="absolute text-5xl"
                  style={{
                    left: '100%',
                    top: '0',
                    animation: 'explosion-appear 2s ease-out forwards'
                  }}
                >
                  💥
                </div>
                <div
                  className="absolute text-5xl"
                  style={{
                    right: '100%',
                    top: '0',
                    animation: 'explosion-appear 2s ease-out forwards'
                  }}
                >
                  💥
                </div>
              </div>
            ))}
    </div>
  );
}

export default App;