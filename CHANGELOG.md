# Changelog

All notable changes to the Note Counter project will be documented in this file.

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
