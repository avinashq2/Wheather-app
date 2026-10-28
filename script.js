const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const $ = id => document.getElementById(id);
const form = $('search-form'), input = $('city-input'), statusEl = $('status'), loader = $('loader');
const currentEl = $('current'), hourlyWrap = $('hourly-wrap'), hourlyEl = $('hourly');
const detailsEl = $('details'), forecastWrap = $('forecast-wrap'), forecastEl = $('forecast');
const recentEl = $('recent'), unitBtn = $('unit-btn'), locBtn = $('loc-btn');

let unit = 'celsius';
let lastPlace = null;

const CODES = {
  0: ['Clear sky', '☀️', '🌙'], 1: ['Mainly clear', '🌤️', '🌙'], 2: ['Partly cloudy', '⛅', '☁️'], 3: ['Overcast', '☁️', '☁️'],
  45: ['Fog', '🌫️', '🌫️'], 48: ['Fog', '🌫️', '🌫️'], 51: ['Light drizzle', '🌦️', '🌧️'], 53: ['Drizzle', '🌦️', '🌧️'], 55: ['Heavy drizzle', '🌧️', '🌧️'],
  61: ['Light rain', '🌧️', '🌧️'], 63: ['Rain', '🌧️', '🌧️'], 65: ['Heavy rain', '🌧️', '🌧️'], 71: ['Light snow', '🌨️', '🌨️'], 73: ['Snow', '🌨️', '🌨️'],
  75: ['Heavy snow', '❄️', '❄️'], 80: ['Rain showers', '🌦️', '🌧️'], 81: ['Rain showers', '🌧️', '🌧️'], 82: ['Violent showers', '⛈️', '⛈️'],
  95: ['Thunderstorm', '⛈️', '⛈️'], 96: ['Thunderstorm with hail', '⛈️', '⛈️'], 99: ['Thunderstorm with hail', '⛈️', '⛈️']
};
const info = (code, day = 1) => { const c = CODES[code] || ['Unknown', '🌡️', '🌡️']; return [c[0], day ? c[1] : c[2]]; };

function themeFor(code, isDay) {
  let t = 'clear';
  if (code >= 95) t = 'storm';
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) t = 'snow';
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) t = 'rain';
  else if (code === 45 || code === 48) t = 'fog';
  else if (code === 2 || code === 3) t = 'cloudy';
  return `theme-${t}-${isDay ? 'day' : 'night'}`;
}

function setStatus(msg, isError = false) { statusEl.textContent = msg; statusEl.className = isError ? 'error' : ''; }
function setLoading(on) {
  loader.classList.toggle('hidden', !on);
  if (on) [currentEl, hourlyWrap, detailsEl, forecastWrap].forEach(e => e.classList.add('hidden'));
}
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }

function getRecent() { try { return JSON.parse(localStorage.getItem('recentCities')) || []; } catch (e) { return []; } }
function saveRecent(name) {
  try { localStorage.setItem('recentCities', JSON.stringify([name, ...getRecent().filter(c => c.toLowerCase() !== name.toLowerCase())].slice(0, 5))); } catch (e) {}
  renderRecent();
}
function renderRecent() {
  recentEl.innerHTML = '';
  getRecent().forEach(city => {
    const b = el('button', city); b.type = 'button';
    b.addEventListener('click', () => { input.value = city; searchCity(city); });
    recentEl.appendChild(b);
  });
}

async function searchCity(city) {
  setStatus(''); setLoading(true);
  try {
    const res = await fetch(`${GEO}?name=${encodeURIComponent(city)}&count=1`);
    if (!res.ok) throw new Error('Could not search for that city.');
    const geo = await res.json();
    if (!geo.results || !geo.results.length) throw new Error(`City "${city}" not found. Check the spelling.`);
    const p = geo.results[0];
    await loadWeather({ name: p.name, country: p.country, latitude: p.latitude, longitude: p.longitude });
    saveRecent(p.name);
  } catch (err) { showError(err); }
}

function showError(err) {
  setLoading(false);
  setStatus(err instanceof TypeError ? 'Network error. Check your internet connection.' : err.message, true);
}

async function loadWeather(place) {
  const url = `${FORECAST}?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day,surface_pressure,visibility` +
    `&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
    `&timezone=auto&forecast_days=5&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service is not responding. Try again later.');
  lastPlace = place;
  render(place, await res.json());
  setLoading(false);
}

function render(place, data) {
  const sym = unit === 'celsius' ? '°C' : '°F';
  const c = data.current, d = data.daily, isDay = c.is_day === 1;
  const [desc, icon] = info(c.weather_code, isDay);
  document.body.className = themeFor(c.weather_code, isDay);

  const now = new Date().toLocaleString('en-US', { timeZone: data.timezone, weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  currentEl.innerHTML = '';
  [['h2', `${place.name}${place.country ? ', ' + place.country : ''}`], ['div', now, 'time'], ['div', icon, 'icon'],
   ['div', `${Math.round(c.temperature_2m)}${sym}`, 'temp'], ['div', desc, 'desc'],
   ['div', `H: ${Math.round(d.temperature_2m_max[0])}°  L: ${Math.round(d.temperature_2m_min[0])}°`, 'range']]
    .forEach(([t, x, cls]) => currentEl.appendChild(el(t, x, cls)));
  currentEl.classList.remove('hidden');

  hourlyEl.innerHTML = '';
  const start = Math.max(0, data.hourly.time.findIndex(t => t >= c.time.slice(0, 13) + ':00'));
  for (let i = start; i < start + 24 && i < data.hourly.time.length; i++) {
    const h = el('div', undefined, 'hour');
    h.append(el('div', data.hourly.time[i].slice(11, 16)), el('div', info(data.hourly.weather_code[i], data.hourly.is_day[i])[1], 'icon'),
      el('b', `${Math.round(data.hourly.temperature_2m[i])}°`));
    hourlyEl.appendChild(h);
  }
  hourlyWrap.classList.remove('hidden');

  detailsEl.innerHTML = '';
  const uv = d.uv_index_max[0];
  [['🌡️ Feels like', `${Math.round(c.apparent_temperature)}${sym}`], ['💧 Humidity', `${c.relative_humidity_2m}%`],
   ['💨 Wind', `${c.wind_speed_10m} km/h`], ['🧭 Pressure', `${Math.round(c.surface_pressure)} hPa`],
   ['👁️ Visibility', `${(c.visibility / 1000).toFixed(1)} km`], ['☀️ UV index', `${uv} (${uv < 3 ? 'Low' : uv < 6 ? 'Moderate' : uv < 8 ? 'High' : 'Very high'})`],
   ['🌅 Sunrise', d.sunrise[0].slice(11, 16)], ['🌇 Sunset', d.sunset[0].slice(11, 16)]]
    .forEach(([l, v]) => { const t = el('div', undefined, 'tile'); t.append(el('small', l), el('b', v)); detailsEl.appendChild(t); });
  detailsEl.classList.remove('hidden');

  forecastEl.innerHTML = '';
  d.time.forEach((date, i) => {
    const day = el('div', undefined, 'day');
    const name = i === 0 ? 'Today' : new Date(date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });
    const temps = el('div'); temps.append(el('b', `${Math.round(d.temperature_2m_max[i])}°`), ` / ${Math.round(d.temperature_2m_min[i])}°`);
    day.append(el('div', name), el('div', info(d.weather_code[i])[1], 'icon'), temps);
    forecastEl.appendChild(day);
  });
  forecastWrap.classList.remove('hidden');
  setStatus('');
}

form.addEventListener('submit', e => { e.preventDefault(); const c = input.value.trim(); if (c) searchCity(c); });

locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return setStatus('Geolocation is not supported by your browser.', true);
  setStatus(''); setLoading(true);
  navigator.geolocation.getCurrentPosition(
    pos => loadWeather({ name: 'My Location', country: '', latitude: pos.coords.latitude, longitude: pos.coords.longitude }).catch(showError),
    () => { setLoading(false); setStatus('Location permission denied. Search a city instead.', true); }
  );
});

unitBtn.addEventListener('click', () => {
  unit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
  unitBtn.textContent = unit === 'celsius' ? '°C' : '°F';
  if (lastPlace) { setLoading(true); loadWeather(lastPlace).catch(showError); }
});

renderRecent();
const saved = getRecent();
searchCity(saved.length ? saved[0] : 'Delhi');
