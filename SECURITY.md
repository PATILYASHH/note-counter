# Security Policy

## 🔒 Security Overview

Note Counter is designed with privacy and security as core principles. This document outlines our security practices, data handling policies, and how to report security vulnerabilities.

## 🛡️ Security Features

### Privacy-First Architecture
- **Local Processing**: All financial calculations happen entirely in your browser
- **No Server Storage**: We never store, transmit, or have access to your financial data
- **Zero Personal Data Collection**: No registration, accounts, or personal information required
- **Transparent Analytics**: Only anonymous country-level usage statistics collected (with full disclosure)

### Recent Security Updates (v10.5.0)
- **Enhanced Privacy Policy**: Updated to reflect automatic analytics collection
- **Transparent Data Practices**: Clear documentation of all data processing
- **PDF Generation Security**: All PDF exports generated locally without data transmission
- **Audit Trail**: Complete changelog of all privacy-related changes

## 📊 Data Collection Transparency

### What We Collect (Automatically)
- **Country Location**: IP-based country detection for usage analytics only
- **Visit Timestamp**: When the application is accessed
- **Browser Type**: Basic user agent information for compatibility

### What We DON'T Collect
- ❌ Personal identification information
- ❌ Financial data or transaction details
- ❌ Email addresses or contact information
- ❌ Browsing history or behavior tracking
- ❌ Device fingerprinting or unique identifiers

### Data Storage
- **Local Storage Only**: All user data (counts, history, preferences) stored locally
- **No Cookies**: We don't use tracking cookies or similar technologies
- **No Analytics Tools**: No Google Analytics, Facebook Pixel, or similar services
- **One-Time Collection**: Country detection occurs once per device

## 🔐 Security Measures

### Client-Side Security
- **HTTPS Encryption**: All connections secured with TLS
- **Content Security Policy**: Protection against XSS attacks
- **Input Validation**: All user inputs properly sanitized
- **Dependency Auditing**: Regular security audits of all dependencies

### Third-Party Services
We use minimal third-party services with strict privacy standards:

1. **ipapi.co** (Country Detection)
   - Purpose: Anonymous country-level analytics
   - Data Shared: IP address only (no personal data)
   - Privacy Policy: [ipapi.co/privacy](https://ipapi.co/privacy)

2. **Formspree.io** (Contact Forms)
   - Purpose: Processing contact form submissions
   - Data Shared: Only user-submitted contact information
   - Privacy Policy: [formspree.io/legal/privacy-policy](https://formspree.io/legal/privacy-policy)

### Open Source Transparency
- **Public Code**: Complete source code available on GitHub
- **Audit-Friendly**: All functionality can be independently verified
- **Community Review**: Security-conscious developers can inspect our code
- **No Hidden Functionality**: What you see in the code is exactly what runs

## 📋 Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 10.5.x  | ✅ Yes (Current)  |
| 10.4.x  | ✅ Yes            |
| 10.3.x  | ⚠️ Limited        |
| < 10.3  | ❌ No             |

## 🚨 Reporting Security Vulnerabilities

### How to Report
If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@notecounter.shop
2. **Subject**: "Security Vulnerability Report"
3. **Include**: Detailed description, steps to reproduce, and potential impact

### What to Include
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if known)
- Your contact information (optional)

### Our Commitment
- **Response Time**: We'll acknowledge receipt within 24 hours
- **Investigation**: Thorough investigation within 72 hours
- **Communication**: Regular updates throughout the process
- **Recognition**: Public acknowledgment (if desired)
- **Resolution**: Coordinated disclosure after fix deployment

## 🛠️ Security Best Practices for Users

### Browser Security
- Keep your browser updated to the latest version
- Use reputable browsers with security features enabled
- Be cautious of browser extensions that might access page data

### Data Protection
- **Backup Important Data**: Export your counting history regularly
- **Private Browsing**: Use incognito/private mode for sensitive counting
- **Clear Data**: Clear browser data if sharing device
- **Secure Networks**: Use trusted internet connections

### Privacy Controls
- **Privacy Mode**: Use the hide amounts feature for confidential counting
- **Local Clearing**: Clear localStorage if needed via browser settings
- **Access Control**: Don't leave the application open on shared devices

## 🔍 Security Auditing

### Regular Assessments
- **Dependency Scanning**: Automated vulnerability scanning of all packages
- **Code Review**: Manual security review of all code changes
- **Privacy Impact Assessment**: Regular evaluation of data practices
- **External Audits**: Periodic third-party security assessments

### Community Involvement
- **Bug Bounty**: Informal bug bounty program for security researchers
- **Open Source**: Public code repository enables community security review
- **Feedback Loop**: User reports help improve security continuously

## 📚 Security Resources

### Documentation
- [Privacy Policy](https://notecounter.shop/privacy-policy.html)
- [Terms of Service](https://notecounter.shop/terms.html)
- [Data Protection FAQ](https://notecounter.shop/contact.html#faq)

### External Resources
- [OWASP Web Application Security](https://owasp.org/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#security)

## 📞 Contact Information

### Security Team
- **Email**: security@notecounter.shop
- **Response Time**: 24-48 hours
- **Escalation**: GitHub Issues for public security discussions

### General Support
- **Website**: [notecounter.shop](https://notecounter.shop)
- **Contact Page**: [notecounter.shop/contact.html](https://notecounter.shop/contact.html)
- **GitHub**: [github.com/PATILYASHH/note-counter](https://github.com/PATILYASHH/note-counter)

---

## 🏆 Security Hall of Fame

We recognize security researchers who help improve our security:

*No vulnerabilities reported yet - be the first!*

---

**Last Updated**: July 13, 2025  
**Next Review**: October 13, 2025

Thank you for helping keep Note Counter secure for everyone! 🛡️
