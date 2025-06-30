// localStorage Diagnostic and Recovery Script
// Run this in the browser console (F12) to check your data

console.log("=== Note Counter localStorage Diagnostic ===");

// Check all localStorage keys
const allKeys = Object.keys(localStorage);
console.log("All localStorage keys:", allKeys);

// Check for note counter related keys
const noteCounterKeys = allKeys.filter(key => 
  key.includes('denominationCounts_') || 
  key.includes('countNoteHistory_') || 
  key.includes('calculatorHistory') || 
  key.includes('selectedCurrency')
);

console.log("Note Counter related keys:", noteCounterKeys);

// Check each currency's data
const currencies = ['INR', 'USD', 'EUR'];
currencies.forEach(currency => {
  const countsKey = `denominationCounts_${currency}`;
  const historyKey = `countNoteHistory_${currency}`;
  
  const counts = localStorage.getItem(countsKey);
  const history = localStorage.getItem(historyKey);
  
  console.log(`\n=== ${currency} Data ===`);
  console.log(`Counts (${countsKey}):`, counts ? JSON.parse(counts) : 'No data');
  console.log(`History (${historyKey}):`, history ? JSON.parse(history) : 'No data');
});

// Check calculator history
const calcHistory = localStorage.getItem('calculatorHistory');
console.log("\n=== Calculator History ===");
console.log("Calculator History:", calcHistory ? JSON.parse(calcHistory) : 'No data');

// Check selected currency
const selectedCurrency = localStorage.getItem('selectedCurrency');
console.log("\n=== Settings ===");
console.log("Selected Currency:", selectedCurrency || 'Not set');

// Function to restore sample data if needed
window.restoreSampleData = function() {
  console.log("Restoring sample data...");
  
  // Sample data for INR
  const sampleINRCounts = {
    500: 2,
    200: 1,
    100: 3,
    50: 2,
    20: 5,
    10: 10,
    5: 5,
    2: 10,
    1: 20
  };
  
  localStorage.setItem('denominationCounts_INR', JSON.stringify(sampleINRCounts));
  localStorage.setItem('selectedCurrency', 'INR');
  
  console.log("Sample data restored! Refresh the page to see the changes.");
  console.log("Sample INR counts:", sampleINRCounts);
  
  return "Data restored successfully!";
};

console.log("\n=== Recovery Options ===");
console.log("If your data is missing, you can:");
console.log("1. Check if you're on the same currency (switch between INR/USD/EUR)");
console.log("2. Run restoreSampleData() to add sample data");
console.log("3. Check browser settings - localStorage might be disabled");

// Check if localStorage is working
try {
  localStorage.setItem('test', 'working');
  localStorage.removeItem('test');
  console.log("✓ localStorage is working properly");
} catch (e) {
  console.log("✗ localStorage is not working:", e.message);
}
