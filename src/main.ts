import './style.css';
import countriesData from './data/countries.json';

interface Country {
  name: string;
  iso2: string;
  iso3: string;
  phone: string;
  continent: string;
  subregion: string;
  flag: string;
  capital: string;
  population: number;
}

const rawCountries = (countriesData as any).default || countriesData;
const countries = (Array.isArray(rawCountries) ? rawCountries : []) as Country[];

// State
let state = {
  search: '',
  continent: 'all',
  sortBy: 'name',
  view: 'dictionary' // 'dictionary' | 'map'
};

// Elements
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const continentFilter = document.getElementById('continent-filter') as HTMLSelectElement;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
const viewToggle = document.getElementById('view-toggle') as HTMLButtonElement;
const countryList = document.getElementById('country-list') as HTMLDivElement;
const azIndex = document.getElementById('az-index') as HTMLElement;
const dictionaryView = document.getElementById('dictionary-view') as HTMLDivElement;
const mapView = document.getElementById('map-view') as HTMLDivElement;
const mapContainer = document.getElementById('map-container') as HTMLDivElement;
const mapTooltip = document.getElementById('map-tooltip') as HTMLDivElement;
const toast = document.getElementById('toast') as HTMLDivElement;

let mapLoaded = false;

// Initialization
function init() {
  console.log('CountryInfo Hub: Initializing...');
  console.log('Data source:', countries.length, 'entries');
  
  if (countries.length === 0) {
    console.warn('Warning: No country data loaded. Check countries.json format.');
  }

  render();
  setupEventListeners();
  setupScrollListener();
}

function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (state.view !== 'dictionary' || state.sortBy !== 'name') return;

    const sections = document.querySelectorAll('.country-group');
    let current = '';

    sections.forEach((section) => {
      const sectionTop = (section as HTMLElement).offsetTop;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.id.replace('group-', '');
      }
    });

    document.querySelectorAll('.az-index a').forEach((a) => {
      a.classList.remove('active');
      if (a.textContent === current) {
        a.classList.add('active');
      }
    });
  });
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    state.search = (e.target as HTMLInputElement).value.toLowerCase();
    render();
  });

  continentFilter.addEventListener('change', (e) => {
    state.continent = (e.target as HTMLSelectElement).value;
    render();
  });

  sortSelect.addEventListener('change', (e) => {
    state.sortBy = (e.target as HTMLSelectElement).value;
    render();
  });

  viewToggle.addEventListener('click', () => {
    state.view = state.view === 'dictionary' ? 'map' : 'dictionary';
    updateView();
    if (state.view === 'map' && !mapLoaded) {
      initMap();
    }
  });
}

function initMap() {
  console.log('Map: Loading SVG...');
  fetch('/world-map.svg')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(svgText => {
      mapContainer.insertAdjacentHTML('afterbegin', svgText);
      const svg = mapContainer.querySelector('svg');
      if (svg) {
        svg.id = 'world-map';
        setupMapInteractions(svg);
        mapLoaded = true;
        console.log('Map: Loaded successfully');
      }
    })
    .catch(err => {
      console.error('Map: Error loading:', err);
      mapContainer.innerHTML = `<p style="padding: 2rem; color: red;">Error loading map: ${err.message}</p>`;
    });
}

function setupMapInteractions(svg: SVGSVGElement) {
  svg.addEventListener('mousemove', (e) => {
    const target = e.target as SVGElement;
    const countryElement = target.closest('[id]');
    
    if (countryElement && countryElement.id && countryElement.id.length === 2) {
      const iso2 = countryElement.id.toUpperCase();
      const country = countries.find(c => c.iso2 === iso2);
      
      if (country) {
        mapTooltip.innerHTML = `
          <h4>${country.flag} ${country.name}</h4>
          <p><strong>Prefix:</strong> ${country.phone}</p>
          <p><strong>ISO:</strong> ${country.iso2} / ${country.iso3}</p>
        `;
        mapTooltip.classList.add('show');
        
        const containerRect = mapContainer.getBoundingClientRect();
        let x = e.clientX - containerRect.left + 15;
        let y = e.clientY - containerRect.top + 15;
        
        if (x + 160 > containerRect.width) x -= 180;
        if (y + 100 > containerRect.height) y -= 110;
        
        mapTooltip.style.left = `${x}px`;
        mapTooltip.style.top = `${y}px`;
      }
    } else {
      mapTooltip.classList.remove('show');
    }
  });

  svg.addEventListener('mouseleave', () => {
    mapTooltip.classList.remove('show');
  });

  svg.addEventListener('click', (e) => {
    const target = e.target as SVGElement;
    const countryElement = target.closest('[id]');
    
    if (countryElement && countryElement.id && countryElement.id.length === 2) {
      const iso2 = countryElement.id.toUpperCase();
      const country = countries.find(c => c.iso2 === iso2);
      if (country) {
        state.view = 'dictionary';
        state.search = country.name.toLowerCase();
        searchInput.value = country.name;
        updateView();
        render();
        
        setTimeout(() => {
          const targetSection = document.getElementById(`group-${country.name[0].toUpperCase()}`);
          if (targetSection) {
            const headerOffset = 140;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  });
}

function updateView() {
  if (state.view === 'dictionary') {
    dictionaryView.classList.add('active');
    mapView.classList.remove('active');
    azIndex.style.display = 'flex';
    viewToggle.textContent = 'Switch to Map';
  } else {
    dictionaryView.classList.remove('active');
    mapView.classList.add('active');
    azIndex.style.display = 'none';
    viewToggle.textContent = 'Switch to List';
  }
}

function getFilteredCountries() {
  return countries
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(state.search) || 
                            c.iso2.toLowerCase().includes(state.search) || 
                            c.iso3.toLowerCase().includes(state.search) ||
                            c.phone.includes(state.search);
      const matchesContinent = state.continent === 'all' || c.continent === state.continent;
      return matchesSearch && matchesContinent;
    })
    .sort((a, b) => {
      if (state.sortBy === 'name') return a.name.localeCompare(b.name);
      if (state.sortBy === 'population') return (b.population || 0) - (a.population || 0);
      if (state.sortBy === 'phone') return a.phone.localeCompare(b.phone);
      return 0;
    });
}

function render() {
  const filtered = getFilteredCountries();
  renderList(filtered);
  renderAZIndex(filtered);
}

function renderList(filtered: Country[]) {
  countryList.innerHTML = '';
  
  if (filtered.length === 0) {
    countryList.innerHTML = '<p class="no-results">No countries found matching your criteria.</p>';
    return;
  }

  let currentLetter = '';
  let groupElement: HTMLElement | null = null;

  filtered.forEach(country => {
    const firstLetter = (country.name && country.name[0]) ? country.name[0].toUpperCase() : '?';
    
    if (state.sortBy === 'name' && firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      groupElement = document.createElement('section');
      groupElement.className = 'country-group';
      groupElement.id = `group-${currentLetter}`;
      groupElement.innerHTML = `<h2 class="group-letter">${currentLetter}</h2>`;
      countryList.appendChild(groupElement);
    }

    const item = document.createElement('div');
    item.className = 'country-item';
    item.innerHTML = `
      <div class="country-flag">${country.flag || '🏳️'}</div>
      <div class="country-info">
        <h3>${country.name}</h3>
        <div class="country-details">
          <div class="detail-item">
            <span class="detail-label">ISO Alpha-2</span>
            <span class="detail-value">${country.iso2} <button class="copy-btn" data-copy="${country.iso2}">📋</button></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ISO Alpha-3</span>
            <span class="detail-value">${country.iso3} <button class="copy-btn" data-copy="${country.iso3}">📋</button></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone Prefix</span>
            <span class="detail-value">${country.phone} <button class="copy-btn" data-copy="${country.phone}">📋</button></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Capital</span>
            <span class="detail-value">${country.capital}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Population</span>
            <span class="detail-value">${country.population ? country.population.toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>
      <div class="country-continent">
        <span class="detail-label">Continent</span>
        <span class="detail-value">${country.continent}</span>
      </div>
    `;

    if (state.sortBy === 'name' && groupElement) {
      groupElement.appendChild(item);
    } else {
      countryList.appendChild(item);
    }
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = (e.currentTarget as HTMLButtonElement).dataset.copy;
      if (text) copyToClipboard(text);
    });
  });
}

function renderAZIndex(filtered: Country[]) {
  azIndex.innerHTML = '';
  if (state.sortBy !== 'name') return;

  const letters = Array.from(new Set(filtered.map(c => (c.name && c.name[0]) ? c.name[0].toUpperCase() : ''))).filter(l => l !== '').sort();
  
  letters.forEach(letter => {
    const link = document.createElement('a');
    link.href = `#group-${letter}`;
    link.textContent = letter;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(`group-${letter}`);
      if (target) {
        const headerOffset = 140;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
    azIndex.appendChild(link);
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied: ${text}`);
  }).catch(err => {
    console.error('Clipboard error:', err);
  });
}

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

init();
