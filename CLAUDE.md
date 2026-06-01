# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at localhost:5173
npm run build     # production build to dist/
npm run lint      # eslint check
npm run preview   # preview production build locally
```

For local end-to-end testing (including the Netlify function), install the Netlify CLI and run `netlify dev` instead of `npm run dev` — this wires up `/api/formula` to the local function.

## Architecture

**Single-page app** with no router, no state management library, no backend database.

```
src/App.jsx                   — root state, orchestrates all components
src/components/
  TableInput.jsx              — paste zone + grid preview (most complex component)
  FormatToggle.jsx            — Excel / Google Sheets selector
  QueryInput.jsx              — question textarea + submit
  FormulaOutput.jsx           — formula display + copy button
netlify/functions/formula.js  — serverless function, proxies DeepSeek API
```

All CSS lives in `src/App.css`. `src/index.css` is intentionally minimal — it only sets `color-scheme: light` to prevent dark-mode browser overrides on form elements.

## Key behaviours to understand

**TableInput clipboard parsing (`src/components/TableInput.jsx`):**
- Rejects pastes without tabs (plain text) with a user-facing error
- Stores `origLengths` (pre-padding row lengths) alongside the padded `cells` 2D array
- Google Sheets compresses merged empty cells to a single tab, so group-header rows (e.g. Q1/Q2/Q3/Q4) arrive with fewer columns than data rows. `getDisplayRow()` right-shifts these rows by the deficit at render time only — the raw TSV sent to the AI is unmodified
- `buildColspanCells()` collapses consecutive empty cells after a non-empty value into `colspan` — only applied to the first header row when `headerRows === 2`
- The "Header rows: 1 / 2" toggle is purely a display control; it does not change what is sent to the AI

**Netlify function (`netlify/functions/formula.js`):**
- Uses ES module syntax (`export default`) with Netlify's v2 function format
- Route is declared via `export const config = { path: "/api/formula" }`, matched by the `netlify.toml` redirect
- `DEEPSEEK_API_KEY` must be set as an environment variable in Netlify dashboard (not committed)
- System prompt assumes data starts at row 2 (row 1 = headers); for 2-header-row tables this assumption is baked in and may need updating

## Deployment

Push to `main` on GitHub triggers auto-deploy on Netlify. Build command and publish dir are in `netlify.toml`. The `DEEPSEEK_API_KEY` env var must be set in the Netlify site settings.
