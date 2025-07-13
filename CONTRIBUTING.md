# Contributing to Note Counter

Thank you for considering contributing to Note Counter! We welcome contributions from developers of all skill levels. This document provides guidelines for contributing to our open-source money counting application.

## 🚀 Recent Updates (v10.5.0)

We've recently implemented several major features:
- **PDF Export**: Professional PDF report generation with watermarks
- **Smart Analytics**: Automatic country detection for usage insights
- **Enhanced Documentation**: Updated privacy policies and user guides

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- A modern web browser for testing

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/note-counter.git
   cd note-counter
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## 🤝 Contributing Guidelines

### Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines
3. **Test thoroughly** on different devices and browsers
4. **Update documentation** if needed
5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add PDF export functionality"
   ```

6. **Push to your fork** and create a Pull Request

### Commit Message Convention

We follow conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🎨 Code Style

### TypeScript/React Guidelines

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Maintain component modularity
- Include proper error handling

### Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF library
- **Storage**: localStorage for client-side persistence
- **Analytics**: IP-based geolocation (ipapi.co)

### File Structure

```
src/
├── components/         # Reusable React components
├── lib/               # Utility functions and configurations
├── pages/             # Page components
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test all currency calculations (INR, USD, EUR, GBP, AED)
- [ ] Verify PDF export functionality
- [ ] Test responsive design on mobile devices
- [ ] Check keyboard shortcuts functionality
- [ ] Validate privacy mode (hide/show amounts)
- [ ] Test data export/import features
- [ ] Verify analytics collection compliance

### Cross-Browser Testing

Please test your changes on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Documentation

### Documentation Files to Update

When making changes, ensure you update relevant documentation:

- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- Component JSDoc comments
- Privacy policy (if data handling changes)
- User guides and help sections

### Documentation Standards

- Use clear, concise language
- Include code examples where relevant
- Update version numbers consistently
- Maintain changelog with all significant changes

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Steps to reproduce** the issue
2. **Expected behavior** vs actual behavior
3. **Browser and device** information
4. **Screenshots or screen recordings** if applicable
5. **Console errors** (if any)

### Issue Templates

Use our GitHub issue templates for:
- Bug reports
- Feature requests
- Documentation improvements
- Security vulnerabilities

## 💡 Feature Requests

We welcome feature suggestions! When proposing new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with implementation details
4. **Consider impact** on privacy and performance
5. **Provide use cases** and user stories

### Current Feature Roadmap

- Enhanced currency management
- Advanced reporting features
- Improved accessibility
- Mobile app development
- API integration options

## 🔒 Security Considerations

### Privacy-First Development

- All data processing must happen locally
- No personal information collection without explicit consent
- Transparent documentation of any external API usage
- Regular security audits of dependencies

### Reporting Security Issues

For security vulnerabilities, please email: security@notecounter.shop

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes and changelog
- Project documentation
- Annual contributor appreciation

## 📞 Getting Help

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bugs and feature requests
- **Email**: contact@notecounter.shop
- **Discord**: [Join our community](https://discord.gg/notecounter)

## 📄 License

By contributing to Note Counter, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for helping make Note Counter better for everyone!** 🎉

For more information, visit [notecounter.shop](https://notecounter.shop) or check our [documentation](https://github.com/PATILYASHH/note-counter).
