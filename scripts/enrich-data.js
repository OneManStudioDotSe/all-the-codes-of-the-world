#!/usr/bin/env node
// Enriches country data from two APIs:
//   1. RestCountries v3.1 — tld, currency_code, languages, language_codes (ISO 639-3), capital_coords
//   2. SimpleLocalize CDN  — locale_codes, language_codes_639_1, currency_name, currency_symbol
// Outputs: data/countries.json and scripts/countries-inline.js (for main.js line 1)

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'countries.json');
const INLINE_FILE = path.join(__dirname, 'countries-inline.js');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function unique(arr) {
  return [...new Set(arr)];
}

async function main() {
  console.log('Reading existing country data...');
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`  ${existing.length} countries loaded`);

  // --- Source 1: RestCountries ---
  console.log('Fetching from RestCountries API...');
  const rcData = await fetch('https://restcountries.com/v3.1/all?fields=cca2,tld,currencies,languages,capitalInfo');
  console.log(`  ${rcData.length} entries received`);

  const rcByIso2 = {};
  for (const r of rcData) {
    if (r.cca2) rcByIso2[r.cca2.toUpperCase()] = r;
  }

  // --- Source 2: SimpleLocalize ---
  console.log('Fetching from SimpleLocalize API...');
  const slData = await fetch('https://cdn.simplelocalize.io/public/v1/locales');
  console.log(`  ${slData.length} locale entries received`);

  // Group SimpleLocalize entries by country ISO2 code
  const slByIso2 = {};
  for (const entry of slData) {
    const code = entry.country?.code?.toUpperCase();
    if (!code) continue;
    if (!slByIso2[code]) slByIso2[code] = [];
    slByIso2[code].push(entry);
  }

  let rcMatched = 0, rcUnmatched = 0, slMatched = 0, slUnmatched = 0;

  const enriched = existing.map(country => {
    const iso2 = country.iso2?.toUpperCase();
    const rc = rcByIso2[iso2];
    const slEntries = slByIso2[iso2] || [];

    // RestCountries fields
    let tld = 'N/A', currency_code = 'N/A', languages = [], language_codes = [], capital_coords = null;
    if (rc) {
      rcMatched++;
      tld = Array.isArray(rc.tld) && rc.tld.length ? rc.tld[0] : 'N/A';
      currency_code = rc.currencies && Object.keys(rc.currencies).length
        ? Object.keys(rc.currencies)[0] : 'N/A';
      languages = rc.languages ? Object.values(rc.languages) : [];
      language_codes = rc.languages ? Object.keys(rc.languages) : [];
      capital_coords = rc.capitalInfo?.latlng?.length === 2
        ? { lat: rc.capitalInfo.latlng[0], lng: rc.capitalInfo.latlng[1] }
        : null;
    } else {
      rcUnmatched++;
    }

    // SimpleLocalize fields
    let locale_codes = [], language_codes_639_1 = [], currency_name = 'N/A', currency_symbol = 'N/A';
    if (slEntries.length > 0) {
      slMatched++;
      locale_codes = unique(slEntries.map(e => e.locale).filter(Boolean));
      const firstCountry = slEntries[0].country;
      currency_name = firstCountry.currency || 'N/A';
      currency_symbol = firstCountry.currency_symbol || 'N/A';
      // Collect ISO 639-1 codes from all languages listed for this country
      const allLangs = firstCountry.languages || [];
      language_codes_639_1 = unique(allLangs.map(l => l.iso_639_1).filter(Boolean));
    } else {
      slUnmatched++;
    }

    return {
      ...country,
      tld, currency_code, currency_name, currency_symbol,
      languages, language_codes, language_codes_639_1,
      locale_codes, capital_coords,
    };
  });

  console.log(`  RestCountries — Matched: ${rcMatched}, Unmatched: ${rcUnmatched}`);
  console.log(`  SimpleLocalize — Matched: ${slMatched}, Unmatched: ${slUnmatched}`);

  fs.writeFileSync(DATA_FILE, JSON.stringify(enriched, null, 2));
  console.log(`Wrote enriched data to ${DATA_FILE}`);

  const inline = `const countries = ${JSON.stringify(enriched)};\n`;
  fs.writeFileSync(INLINE_FILE, inline);
  console.log(`Wrote inline snippet to ${INLINE_FILE}`);
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
