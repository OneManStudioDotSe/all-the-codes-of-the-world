# CountryInfo Hub

A lightweight, one-stop hub for global country information — ISO codes, phone prefixes, flags, capitals, populations, and an interactive world map.

## Tech Stack

- **Vanilla JavaScript** — no frameworks, no build tools, no npm
- **Plain CSS** — custom responsive styling
- **No build step** — files are served as-is

## Project Structure

```text
index.html          — HTML shell
style.css           — All styles
main.js             — All application logic + inlined country data
favicon.svg         — Favicon
world-map.svg       — Interactive SVG map (loaded on demand)
data/
  countries.json    — Country data source (not loaded at runtime)
```

## Running Locally

Open `index.html` via any static HTTP server. Examples:

```bash
# Python
python3 -m http.server

# Node (no install needed)
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Deploying to MAMP

Copy the files to your MAMP document root:

```bash
cp -r . /Applications/MAMP/htdocs/all-the-codes-of-the-world
```

Then open `http://localhost:8888/all-the-codes-of-the-world/`.

Note: the `data/` folder is not required at runtime — country data is inlined directly in `main.js`.

## Features

- **Dictionary View** — alphabetical country list with a persistent A-Z quick-jump sidebar
- **Interactive Map** — SVG world map with hover tooltips and click-to-search
- **Search & Filter** — real-time filtering by name, ISO codes, or phone prefix
- **Sorting** — by Name, Population, or Phone Prefix
- **Clipboard** — one-click copy for ISO codes and phone prefixes
