# Changelog

All notable changes to the Note Counter project will be documented in this file.

## [10.8.0] - 2025-01-06

### 🌍 Major Feature Release: Custom Currency Creator

### ✨ Added
- **Custom Currency Creator**: Revolutionary currency creation system
  - **Unlimited Custom Currencies**: Create as many custom currency systems as needed
  - **Full Customization**: Set currency code (3 letters), name, symbol, and flag emoji
  - **Flexible Denominations**: Add both notes and coins with any values you need
  - **Smart Validation**: Prevents duplicate codes and ensures data integrity
  - **Persistent Storage**: Custom currencies saved locally with full data integrity
  - **Seamless Integration**: Use custom currencies exactly like built-in ones

### 🎯 Enhanced User Experience
- **Focus-Persistent Inputs**: No more clicking repeatedly - smooth typing experience in all forms
  - **React.memo Optimization**: Optimized DenominationValueInput component with React.memo
  - **Reduced Re-renders**: Better performance with smart state management
  - **Smooth Interactions**: Enhanced user interface responsiveness

### 🎛️ Currency Management System
- **Enable/Disable Currencies**: Show only the currencies you need in the dropdown
- **Currency Preferences**: Persistent settings for currency visibility
- **Real-Time Switching**: Switch between built-in and custom currencies seamlessly
- **Enhanced Dropdown**: Improved currency selection with management controls

### ⚡ Performance Improvements
- **React Performance**: Optimized components for faster, more responsive interface
- **Better Validation**: Enhanced error handling and user feedback
- **Smart State Management**: Improved data flow and component updates
- **Enhanced UX**: Better visual feedback and loading states

### 📚 Documentation Updates
- **README.md**: Comprehensive v10.8.0 documentation with custom currency guides
- **Quick Start Guide**: Updated with custom currency creation instructions
- **Use Cases**: Expanded scenarios covering gaming, education, and business applications
- **Release Notes**: Complete feature overview for v10.8.0

---

## [10.7.0] - 2025-07-30

### 🔐 Major Security Release: Web Lock System

### ✨ Added
- **Web Lock Security System**: Comprehensive protection for financial data
  - **PIN Protection**: Customizable 4-8 digit PIN codes for quick access
  - **Password Security**: Advanced password protection with complex character support
  - **Session Management**: Intelligent session handling with automatic lock/unlock features
  - **Settings Integration**: Professional toggle switches seamlessly integrated into Settings tab
  - **Enhanced Data Protection**: Complete security with modal interfaces and secure storage
  - **⚡ Quick Lock Shortcut**: Press **Shift+L** anywhere in the app for instant locking
  - **Professional Security**: Perfect for businesses handling sensitive financial data

### ⌨️ Keyboard Shortcuts Enhanced
- **Shift+L**: New instant lock shortcut for immediate app protection
- **Enhanced Help Documentation**: Updated help section with security shortcuts
- **Accessibility Features**: Keyboard-first design for power users

### 📚 Documentation Updates
- **README.md**: Comprehensive Web Lock documentation with keyboard shortcuts
- **Help Tab**: Updated keyboard shortcuts section with Shift+L instant lock feature
- **WEB_LOCK_DOCUMENTATION.md**: Complete security system documentation
- **Update Popup**: Professional modal announcing v10.7.0 Web Lock features

### 🛠️ Technical Improvements
- **Security Architecture**: Professional lock screen with PIN/password authentication
- **Instant Lock System**: Global keyboard listener for Shift+L shortcut functionality
- **Session Storage**: Secure browser session management for lock/unlock states
- **Modal System**: Advanced popup system for settings and lock interfaces

---

## [10.6.0] - 2025-07-13

### 🎉 Major Feature Release: Hash Reference System

### ✨ Added
- **Hash Reference System**: Revolutionary new way to track and reference saved countings
  - **Simple Hash Generation**: Each saved counting gets an easy-to-remember hash (#1, #2, #3)
  - **Interactive Note References**: Type hash numbers in notes to create clickable reference links
  - **Hash Popup Interface**: Click any hash reference to view counting details with load/download options
  - **History Integration**: All transaction history now displays hash references for easy identification
  - **Cross-Reference Support**: Reference previous countings in new session notes seamlessly

### 🔧 Enhanced
- **Note Rendering System**: Smart detection and rendering of hash references in notes
  - Automatic conversion of #number patterns to clickable links
  - Real-time hash validation and reference lookup
  - Smooth popup interface for hash interactions
- **Data Export/Import**: Hash references preserved in all backup and restore operations
- **History Management**: Enhanced history display with prominent hash badges
- **User Experience**: Intuitive copy-to-clipboard functionality for hash references

### 📚 Documentation Updates
- **README.md**: Comprehensive documentation of hash reference system across all feature sections
- **Help Tab**: Dedicated "Hash References (New!)" section with usage examples
- **About Tab**: New "Key Features" section highlighting v10.6.0 hash functionality
- **Blog Tab**: "Latest Updates" section announcing Version 10.6.0 release
- **Data Tab**: Enhanced "Saved Countings" section with hash display and management

### 🛠️ Technical Improvements
- **Hash Generation**: Robust incremental numbering system for consistent hash creation
- **Regex Processing**: Advanced pattern matching for hash detection in notes (/#\d+/g)
- **State Management**: Enhanced React state handling for hash-related data
- **UI Components**: New HashPopup component with full counting details display

### 🎨 User Interface
- **Hash Badges**: Distinctive blue badges for hash display throughout the application
- **Clickable References**: Hover effects and cursor changes for interactive hash links
- **Modal System**: Professional popup interface for hash detail viewing
- **Copy Functionality**: One-click hash copying with user feedback alerts

---

## [10.5.0] - 2025-07-13

### ✨ Added
- **PDF Export Feature**: Generate professional PDF reports of any transaction from history
  - Includes complete denomination breakdowns, totals, notes, and timestamps
  - Features "notecounter.shop" watermark for branding
  - Available in both list view and detail view of transactions
  - Professional formatting with proper table layouts

### 🔧 Enhanced
- **Automatic Country Detection**: Complete automation of analytics data collection
  - Removed user confirmation dialogs for seamless experience
  - Automatic IP-based country detection using ipapi.co service
  - One-time submission per device using localStorage tracking
  - Silent background processing without user interruption

### 📚 Documentation Updates
- **Privacy Policy**: Comprehensive updates reflecting automatic data collection practices
  - Added sections on automatic location detection
  - Updated data processing and user rights information
  - Enhanced GDPR compliance documentation
- **README.md**: Added PDF export feature to key features sections
- **Meta Tags**: Updated index.html to reflect new data collection practices

### 🛠️ Technical Improvements
- **Dependencies**: Added jsPDF and html2canvas for PDF generation
- **TypeScript**: Enhanced type safety for PDF export functionality
- **UI/UX**: Integrated PDF export buttons seamlessly into history interface

### 🔒 Privacy & Security
- **Transparency**: All changes documented in updated privacy policy
- **Local Storage**: PDF generation happens entirely in browser
- **Open Source**: All code changes visible in public repository

---

## Previous Versions

### [10.4.x] - Previous Features
- Multi-currency support (INR, USD, EUR, GBP, AED)
- Advanced calculator system with expression evaluation
- Comprehensive history management
- Progressive Web App capabilities
- Keyboard shortcuts and accessibility features
- Privacy-first design with local storage only
- Open source transparency

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## Support

For questions or support, please visit our [Contact Page](https://notecounter.shop/contact.html) or open an issue on GitHub.
