# Contributing to Note Counter

Thanks for taking the time to contribute! Note Counter is a free, open-source finance toolkit, and improvements of any size are welcome — bug fixes, new currencies, new calculators, docs, accessibility, translations.

## Project values

Before opening a PR, please make sure your change respects the project's commitments:

1. **Free forever, no ads.** No advertising scripts, sponsored content, or paywalled features.
2. **No tracking of user data.** No new analytics providers beyond the existing anonymous Vercel Analytics page-view counter. No cookies, no fingerprinting, no behavioural profiling.
3. **Local-first.** Counts, history, GST/EMI records, notes, and custom currencies stay in the user's browser (`localStorage`). No new server calls without a very clear reason.
4. **Open source under MIT.** All contributions are accepted under the same license.

If your change adds an external network request, a new dependency, or any kind of telemetry, call it out explicitly in the PR description.

## Getting started

### Prerequisites
- Node.js 18 or newer
- npm
- A modern browser (Chrome, Firefox, Safari, Edge)

### Setup
```bash
git clone https://github.com/PATILYASHH/note-counter.git
cd note-counter
npm install
npm run dev
```
The dev server runs at <http://localhost:5173>.

### Useful scripts
| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## How to propose a change

1. **Open an issue first** for non-trivial changes (new feature, bigger refactor, new dependency). For obvious bug fixes you can skip straight to a PR.
2. **Fork** the repo and create a branch off `main`:
   ```bash
   git checkout -b feature/short-description
   ```
3. **Code the change.** Keep PRs focused — one logical change per PR.
4. **Run the build** locally before pushing:
   ```bash
   npm run build
   ```
5. **Open a PR** against `main`. Fill in the PR template. Link the issue if there is one.

## Code style

- **TypeScript + React function components.** No class components.
- **Tailwind CSS** for styling. Reuse the existing `nc-*` utility classes in `src/index.css` where they fit.
- **Lucide icons** (`lucide-react`) for all icons. Don't add a second icon set.
- **Keep `src/App.tsx` reasonable.** New self-contained features (like `TaxCalculator`, `EMICalculator`) belong in their own component file under `src/components/`.
- **No comments on obvious code.** Only add a comment when *why* is non-obvious.
- **Inline JSX modals, not sub-components.** Modals defined as components inside `App` get remounted on every render and lose state — see `menuModalElement`, `customCurrencyModalElement`, and `sponsorModalElement` for the pattern to follow.

## Project layout

```
note-counter/
├── public/                   # Static assets served as-is (favicons, manifest, html docs, sw.js)
├── src/
│   ├── components/           # React components
│   │   ├── BrandLogo.tsx
│   │   ├── CalculatorTab.tsx
│   │   ├── DenominationCounter.tsx
│   │   ├── EMICalculator.tsx
│   │   ├── HistoryTab.tsx
│   │   ├── SimpleCalculator.tsx
│   │   ├── TaxCalculator.tsx
│   │   └── TransferSummary.tsx
│   ├── App.tsx               # Top-level app shell, navbar, modals
│   ├── main.tsx              # Entry point, service worker registration
│   ├── index.css             # Tailwind + nc-* utility classes
│   └── vite-env.d.ts
├── index.html                # HTML entry, SEO meta, Vercel Analytics
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Where data is stored

All user data is stored in `localStorage` under these keys:

| Key | What |
|---|---|
| `denominationCounts_<CURRENCY>` | Active counts per currency |
| `countNoteHistory_<CURRENCY>` | Saved counting sessions per currency |
| `taxHistory` | Saved tax / GST calculations (cross-currency) |
| `emiHistory` | Saved EMI calculations (cross-currency) |
| `calculatorHistory` | Built-in calculator history |
| `quickNotes` | Notepad entries |
| `customCurrencies` | User-created currencies |
| `selectedCurrency`, `showCalculator`, etc. | Preferences |

If you change the shape of any of these, make the change backward-compatible (parse old shape into new shape) — users may have data from older versions.

## Reporting bugs / requesting features

Open an issue using the templates at <https://github.com/PATILYASHH/note-counter/issues/new/choose>.

For **questions** (not bugs), please use Discussions instead so issues stay focused on actionable work.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
