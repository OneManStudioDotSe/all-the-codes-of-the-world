# AI Development Guide - CountryInfo Hub

This document is intended for AI agents working on this codebase. It outlines the architectural patterns, design constraints, and critical logic flows.

## Tech Stack & Architecture

- **Vanilla JavaScript** — no frameworks, no build tools, no npm. Direct DOM manipulation only.
- **Plain CSS** — all styles in `style.css` at the project root.
- **No build step** — files are served as-is. What you see is what runs in the browser.
- **Inlined data** — country data is embedded directly in `main.js` as a `const countries = [...]` array at the top of the file. There is no separate JSON file loaded at runtime.

## File Structure

```text
index.html        — HTML shell, links style.css and main.js
style.css         — All styles
main.js           — All application logic + inlined country data at the top
favicon.svg       — Favicon
world-map.svg     — SVG map, fetched on demand when map view is activated
data/
  countries.json  — Source of truth for country data (not loaded at runtime)
```

## Deployment

No build step. Copy the following files to any static HTTP server (e.g. MAMP `htdocs`):

- `index.html`
- `style.css`
- `main.js`
- `favicon.svg`
- `world-map.svg`

The `data/` folder is not needed at runtime (data is inlined in `main.js`).

## UI/UX: Neubrutalism Design System

The project follows a **Neubrutalist** aesthetic. Adhere to these rules for all UI updates:

- **Borders** — always use `3px solid #000` for main elements.
- **Shadows** — use "hard" offset shadows (no blur). Standard is `5px 5px 0px 0px #000`.
- **Colors**:
  - Primary: `#ffea00` (Yellow)
  - Secondary: `#ff00ff` (Pink)
  - Accent: `#00ff99` (Mint Green)
- **Typography** — bold, uppercase, high-impact (Public Sans via Google Fonts).
- Do **not** use utility classes (like Tailwind). Write semantic CSS in `style.css`.

## Critical Logic Flows

### 1. Data & Rendering

Country data lives at the very top of `main.js` as `const countries = [...]`. The `render()` function is the main entry point for updating the UI. It reads the global `state` object and calls `renderList()` and `renderAZIndex()`.

- **Filtering** — matches by name, ISO2, ISO3, and phone prefix.
- **A-Z Index** — only rendered when `state.sortBy === 'name'`. Scroll uses a 140px header offset.

### 2. Map Interactivity

The interactive world map is `world-map.svg`, fetched once via `fetch('world-map.svg')` when the user first switches to map view. SVG path/group IDs match ISO-2 country codes (lowercase).

- **Targeting** — always use `.closest('[id]')` to find the country element, as countries may have multiple paths inside a group.
- **Sync** — clicking a country switches to dictionary view, sets `state.search` to the country name, and scrolls to the correct letter group.

### 3. Updating Country Data

If the dataset needs updating, edit `data/countries.json` (the source file), then re-inline it into `main.js` by replacing the `const countries = [...]` line at the top. Each entry must have:

- `name`, `iso2`, `iso3`, `phone`, `continent`, `flag`, `capital`, `population`

## Guidelines for Changes

- **No imports/exports** — the file is not a module. Do not add `import` or `export` statements.
- **State** — keep the `state` object flat and simple.
- **All fetch paths are relative** — use `fetch('world-map.svg')` not `fetch('/world-map.svg')`. The app may be served from a subdirectory.
- **Responsiveness** — always consider the `az-index` behaviour on mobile (switches to a horizontal scrollable bar at the bottom).
