# AI Development Guide - CountryInfo Hub

This document is intended for AI agents (like Gemini, Copilot, or others) working on this codebase. It outlines the architectural patterns, design constraints, and critical logic flows.

## Tech Stack & Architecture
- **Vanilla TypeScript**: No frameworks (React/Vue/Angular). Use direct DOM manipulation.
- **Vite**: Used for bundling and the dev server. Configuration is in `vite.config.ts` (if present) and `tsconfig.json`.
- **Single Source of Truth**: `src/data/countries.json` contains all processed country data.

## UI/UX: Neubrutalism Design System
The project follows a **Neubrutalist** aesthetic. Adhere to these rules for all UI updates:
- **Borders**: Always use `3px solid #000` for main elements.
- **Shadows**: Use "hard" offset shadows (no blur). Standard is `5px 5px 0px 0px #000`.
- **Colors**: 
  - Primary: `#ffea00` (Yellow)
  - Secondary: `#ff00ff` (Pink)
  - Accent: `#00ff99` (Mint Green)
- **Typography**: Bold, uppercase, high-impact (Public Sans).

## Critical Logic Flows

### 1. Data Rendering (`src/main.ts`)
The `render()` function is the main entry point for updating the UI. It filters and sorts data based on the global `state` object.
- **Filtering**: Matches by name, ISO2, ISO3, and phone prefix.
- **A-Z Index**: Only rendered when sorting is set to "name". It uses `scrollIntoView` with a header offset calculation.

### 2. Map Interactivity
The interactive world map uses an SVG (`public/world-map.svg`) where path/group IDs match ISO-2 country codes.
- **Targeting**: Always use `.closest('[id]')` to find the country ID, as countries may consist of multiple paths inside a group.
- **Sync**: Clicking a country on the map MUST update `state.search`, switch the view to `dictionary`, and trigger a scroll to the list item.

### 3. Data Processing
Data is sourced from the REST Countries API. If updates to the dataset are needed, reference the `process_data_v2.js` logic (previously used) to ensure fields like `population`, `idd` (phone), and `cca2` (iso2) are mapped correctly to the flat structure in `countries.json`.

## Guidelines for Changes
- **Styling**: Do not use utility classes (like Tailwind). Write semantic CSS in `src/style.css`.
- **State**: Keep the `state` object flat and simple.
- **Performance**: Ensure search filtering remains performant by avoiding unnecessary DOM re-renders of the entire list if only a small part changes (though for ~250 items, full re-render is currently acceptable).
- **Responsiveness**: Always test the `az-index` behavior on mobile viewports (where it switches to a horizontal scrollable bar).
