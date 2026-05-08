# CountryInfo Hub - Documentation

This project is a lightweight, one-stop hub for global country information, including ISO codes, phone prefixes, locales, flags, and more.

## Tech Stack
- **TypeScript**: Application logic and state management.
- **Vite**: Build tool and development server.
- **Vanilla CSS**: Custom, responsive styling.
- **REST Countries Data**: Bundled static JSON dataset.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (installed with Node.js)

### Installation
1.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Application
To start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Once started, open your browser and navigate to the local URL provided (usually `http://localhost:5173`).

---

## Building for Production

To create an optimized production build:
```bash
npm run build
```
This will generate a `dist/` directory containing the minified HTML, CSS, and JavaScript assets, along with the world map SVG.

### Previewing the Production Build
To preview the production build locally before deploying:
```bash
npm run preview
```

---

## Project Structure
- `index.html`: The main entry point and UI skeleton.
- `src/main.ts`: Core application logic, event handlers, and rendering functions.
- `src/style.css`: All application styles, including responsive design and animations.
- `src/data/countries.json`: The processed dataset of 250 countries.
- `public/world-map.svg`: The interactive SVG map asset.

---

## Features
- **Dictionary View**: Alphabetical country list with a persistent A-Z quick-jump sidebar.
- **Interactive Map**: SVG visualization with hover tooltips and click-to-search functionality.
- **Search & Filter**: Real-time filtering by country name, ISO codes, or phone prefixes.
- **Sorting**: Dynamically re-sort by Name, Population, or Phone Prefix.
- **Clipboard**: Quick-copy buttons for all crucial codes.
