# Note Counter v12.0.0 — Free-Forever, No-Ads Relaunch

**Release date:** 2026-04-29
**Previous version:** 11.0.0

This release returns Note Counter to its open-source roots and turns it into a full **finance toolkit**, not just a money counter. The brief commercial / AdSense experiment is gone — the app is committed to being **free for everyone, with no ads and no tracking of user data, forever**.

---

## 🎯 Highlights

- 🆓 **Free forever, no ads, no tracking of user data** — AdSense, Plausible, cookie consent, and the Pro tier are all removed. The only telemetry left is anonymous, cookieless Vercel page-view counts.
- 🧾 **GST / Tax / VAT calculator** — currency-aware (CGST + SGST split for India, sales tax for US, VAT for EU/UK/UAE)
- 🏦 **Loan EMI calculator** — full amortization schedule, principal-vs-interest split
- 📈 **SIP / Compound Interest calculator** — Monthly SIP and Lump Sum modes with year-by-year growth table
- 💱 **Live Currency Converter** — real exchange rates (cached 24h in your browser)
- 💖 **Sponsor modal with UPI** — Indian users can pay directly via UPI (`yashpatil0305@ybl`); GitHub Sponsors retained for international
- ✉️ **In-app contact / feedback / bug / feature form** wired to Formspree
- ⭐ **Smart review prompt** — appears once, only on the 2nd visit after 20 seconds, never again
- 🎨 **Redesigned navigation bar** — segmented calculator tabs, currency chip with flag, mobile always-visible tab strip
- 🔒 **Privacy tab rewritten** to reflect the new no-ads, no-tracking commitment
- 📦 **Codebase cleanup** — removed Supabase, admin pages, blog scaffolding, and AI-codegen artifacts; added LICENSE, GitHub issue/PR templates, FUNDING.yml

---

## ✨ New features

### 1. Tax / GST / VAT calculator (`Tax` tab)
Currency-aware tax calculator that adapts to the active currency:

| Currency | Regime | Common rates | Special handling |
|---|---|---|---|
| INR | **GST** | 0, 3, 5, 12, 18, 28% | Splits into CGST + SGST automatically; toggle for inter-state IGST |
| USD | **Sales Tax** | 0, 4, 6, 7.25, 8.875, 10% | — |
| EUR | **VAT** | 0, 7, 10, 19, 20, 21% | — |
| GBP | **VAT** | 0, 5, 20% | — |
| AED | **VAT** | 0, 5% | — |
| Custom | Generic Tax | 0, 5, 10, 15, 20% | — |

Supports both **add-tax** (net → gross) and **remove-tax** (gross → net) modes. Save calculations to history.

### 2. Loan EMI calculator (`EMI` tab)
- Inputs: principal, annual rate, tenure (years/months toggle)
- Outputs: monthly EMI, total interest, total payment
- **Principal-vs-interest split bar** showing the % breakdown
- **Toggleable amortization schedule** with month-by-month principal/interest/balance breakdown
- 0% rate handled as straight-line repayment

### 3. SIP / Compound Interest calculator (`SIP` tab)
Two modes:
- **Monthly SIP** — `FV = P × ((1+r)^n − 1) / r × (1+r)`
- **Lump Sum** — `A = P × (1 + r/n)^(n×t)` with selectable compounding frequency (annually / half-yearly / quarterly / monthly)

Outputs include future value, total invested, estimated returns, an invested-vs-returns split bar, and a year-by-year growth table.

### 4. Currency Converter (`FX` tab)
- Live mid-market rates from **floatrates.com** (free, no key, no tracking)
- **24-hour localStorage cache** so most loads don't hit the network
- Manual refresh button with spinning indicator and "updated X min ago" timestamp
- Two-currency picker with swap button
- Shows the rate both directions: "1 INR = 0.012 USD · 1 USD = 83.12 INR"
- Graceful offline fallback to the last cached rates

### 5. History tab — now covers all calculators
The History tab now has **5 segments** (Money / Tax / EMI / SIP / Calculator), each with:
- A count badge showing the number of saved entries
- Per-entry copy-summary and delete actions
- "Clear all" works per-segment

Each calculator (Tax, EMI, SIP) has a **Save to history** button that records the inputs and outputs with currency context.

### 6. Sponsor modal with UPI (₹) + GitHub
The 💖 Heart button in the navbar now opens a unified sponsor modal:
- **🇮🇳 Pay with UPI** — amount picker (₹100/₹500/₹1000/₹2000/₹5000 + custom), copy UPI ID button, and "Open UPI app to pay ₹X" deep link (`upi://pay?pa=yashpatil0305@ybl&pn=Yash%20Patil&am=AMOUNT&cu=INR`). Works with PhonePe, Google Pay, Paytm, BHIM. Zero fees, no account required.
- **🌍 GitHub Sponsors** — retained for international users
- ⭐ "Star the repo" fallback for those who can't or don't want to send money

### 7. Contact / feedback / bug / feature form
A single reusable form (`FeedbackForm`) is wired into Menu → Contact and posts to Formspree (`https://formspree.io/f/mjgjnjgn`):
- 4-category picker: **Feedback / Bug report / Feature request / Other (Contact)**
- Adaptive placeholders (bug reports auto-suggest a "Steps to reproduce" template)
- Subject prefixes for inbox triage: `[Bug] ...`, `[Feature] ...`, `[Feedback] ...`, `[Contact] ...`
- Honeypot anti-spam field
- Triage metadata sent with each submission: app version, page URL, user-agent, ISO timestamp
- The standalone `/contact.html` page also posts to Formspree (its old `setTimeout`-simulated handler was replaced with a real fetch)

### 8. Review prompt (one-time)
A friendly review prompt that:
- **Triggers** on the user's 2nd visit, after 20 seconds — first-time visitors are not interrupted
- **Shows once per user** (uses `localStorage.reviewPromptStatus`)
- 5-star rating + optional feedback textarea
- All three outcomes are sent to Formspree:
  - **Submitted with stars** → `[Review ★★★★★] ...` to inbox
  - **Closed via X / "Not now"** → `[Review] Not interested in review` ping
  - **Tab closed without interaction** → no submission, may show again next visit
- Thank-you state echoes the user's stars and feedback back to them

---

## 🎨 UI / UX

- **Redesigned top navigation bar**:
  - Segmented pill group for the 6 calculator tabs (Counter / Tax / EMI / SIP / FX / History)
  - Currency chip with flag (e.g. 🇮🇳 INR (₹)) — active currency obvious at a glance
  - Quick utilities promoted to icon buttons: Hide-amounts (eye toggle), Notepad
  - Logical grouping with thin dividers and a gradient accent bar (brand → amber → emerald)
- **Mobile**: always-visible horizontally-scrollable tab strip below the brand row — switching calculators is now one tap
- **Modal blink fix**: `MenuModal` and `CustomCurrencyModal` were defined as components inside `App`'s body, which caused them to remount on every render (visible blink, lost focus, lost form state when adding a custom currency). They're now inline JSX values
- **In-app About-tab pledge banner** — clearly states the free-forever, no-ads, no-tracking commitment
- **In-app Privacy tab rewritten** — replaces the old "commercial service" / cookies-for-advertising copy with a clear three-item disclosure of network traffic (Vercel Analytics, Currency Converter API, Formspree submissions)

---

## 🔒 Privacy

Public privacy policy ([public/privacy-policy.html](public/privacy-policy.html)) was fully rewritten:
- Removed the old AdSense / Plausible / Supabase / ipapi data-sharing table and "commercial service" framing
- New short summary at the top
- GDPR / CCPA section reframed: **no personal data is collected**, so there's nothing to access/erase on our side
- Three numbered network-traffic disclosures: Vercel Analytics (page views), floatrates.com (FX rates, cached 24h), Formspree (only when you click Send on the contact/review form)

Other doc updates:
- **Terms of Service** — removed commercial-service / advertising language; reflects MIT-licensed free-forever project
- **About / Contact / Disclaimer / 404** — removed ad mentions, Pro tier, blog links
- **README** — rewritten top section with no-ads, no-tracking positioning
- **Hardcoded `legal@notecounter.shop` placeholder** replaced with the real `patilyasshh@gmail.com`

---

## 🗑️ Removed

### Source code
- `src/lib/supabase.ts` and the entire `src/lib/` folder (Supabase client used only by the now-deleted admin pages)
- `src/pages/AdminDashboard.tsx`, `src/pages/AdminLogin.tsx` and the `src/pages/` folder (admin UI for ad management)
- `src/components/Advertisement.tsx`
- `src/App.backup.tsx`

### Backend / build artifacts
- `supabase/` folder + 4 SQL migrations (backend schema for ad uploads)
- `scripts/validate-ads-txt.js` and `scripts/` folder
- `.bolt/` (bolt.new AI codegen artifacts)

### Public assets
- `public/cookie-consent.js`
- `public/ads.txt`, `Ads.txt`
- `public/blog/` directory + `public/blog.html`
- `public/check-localStorage.js`, `public/privacy-lock.js` (orphaned)
- `public/privacy-policy-OLD-OPENSOURCE.html.bak`

### Stale docs
- `RELEASE_NOTES_v10.8.0.md`, `RELEASE_NOTES_v11.0.0.md` (redundant with `CHANGELOG.md`)
- `WEB_LOCK_DOCUMENTATION.md` (dev-only doc, info now in source)
- `ADSENSE_COMPLIANCE_CHECKLIST.md`, `ADSENSE_FIX_GUIDE.md`, `COMMERCIAL_TRANSITION_SUMMARY.md`
- Stale duplicate root-level `about.html` / `contact.html` / `terms.html` / `disclaimer.html` (canonical copies live in `public/`)
- `.env.example` (only had Supabase keys)

### Dependencies
- `@supabase/supabase-js`
- `react-router-dom` (no routing — single page)
- `html2canvas` direct dep (still pulled in as a transitive dep of `jspdf` only when PDF export is invoked)
- `@vercel/analytics` (the script tag in `index.html` does the work, no React SDK needed)

### In-app
- `ProModal` component (~130 lines), `showProModal` state, `handleProUpgrade` handler, "Pro" tab and "Blog" tab in the menu modal
- Removed `Crown`, `Cloud`, `Printer` lucide imports
- AdSense `<script>` tag and Plausible script in `index.html`

---

## 🏗️ Project structure / OSS hygiene

Added proper open-source structure:
- **[LICENSE](LICENSE)** — MIT license text
- **[.github/FUNDING.yml](.github/FUNDING.yml)** — GitHub Sponsor button on the repo
- **[.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)** — structured bug reports
- **[.github/ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)** — structured feature requests
- **[.github/ISSUE_TEMPLATE/config.yml](.github/ISSUE_TEMPLATE/config.yml)** — redirects questions to Discussions, sponsoring to GitHub Sponsors
- **[.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)** — PR checklist with no-ads / no-tracking guard
- **[CONTRIBUTING.md](CONTRIBUTING.md)** rewritten — project values (free-forever, no-ads, local-first, MIT), setup, code style, project layout, localStorage keys reference

Tightened `.gitignore`: adds `*.tsbuildinfo`, `Thumbs.db`, `.netlify`, `.env.local`, `.env.*.local`, `.bolt/`, `.aider*`.

`package.json` gained proper OSS metadata: `license`, `author`, `homepage`, `repository`, `bugs`.

---

## 🔧 Technical notes

- Fixed `NodeJS.Timeout` reference in `App.tsx` that broke after removing Supabase's transitive `@types/node` dep (now uses `ReturnType<typeof setTimeout>`)
- All new modals (Sponsor, Review prompt) follow the inline-JSX pattern instead of being defined as inner components, so they don't suffer the remount-on-render bug
- New localStorage keys: `taxHistory`, `emiHistory`, `sipHistory`, `fxRatesCacheV1`, `reviewPromptStatus`, `reviewPromptVisitCount`

---

## 💖 Support development

If Note Counter saves you time, please consider sponsoring:

- **🇮🇳 UPI**: `yashpatil0305@ybl` (instant, 0% fee, no account needed)
- **🌍 GitHub Sponsors**: <https://github.com/sponsors/PATILYASHH>
- **⭐ Star the repo**: <https://github.com/PATILYASHH/note-counter>

---

## 📝 Migration notes

If you're updating from v11.0.0:
- No data migration needed — all existing localStorage keys (`countNoteHistory_<CURRENCY>`, `selectedCurrency`, `customCurrencies`, etc.) are preserved
- The Web Lock PIN/password is preserved
- New keys are created lazily as users interact with the new features

---

**Full changelog:** see [CHANGELOG.md](CHANGELOG.md)
