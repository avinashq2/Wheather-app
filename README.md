# Weather App

**Internship Task 2: Interactive JavaScript App (DOM Manipulation + API)**
Submitted by: Avinash Kumar | Roll No: 50613302724 | B.Tech CSE 5B, 3rd Year | HMRITM
Organization: Alfido Tech (2-month summer internship)

- **Live demo:** https://YOUR-USERNAME.github.io/weather-app/
- **Source code:** https://github.com/YOUR-USERNAME/weather-app

## 1. Overview
A responsive weather app. The user searches a city and the page shows the current weather and a 5-day forecast. All content is built and updated dynamically with JavaScript DOM manipulation.

## 2. Features
- City search (form submit / Enter key) and "use my location" (GPS) button
- Current temperature, weather icon, description and today's high / low
- Dynamic background theme that changes with the weather (clear, cloudy, rain, storm, snow, fog) and day / night
- Local date and time of the searched city
- Next 24 hours hourly forecast (horizontal scroll)
- Detail tiles: feels like, humidity, wind, pressure, visibility, UV index, sunrise, sunset
- 5-day forecast (max / min temperature)
- Switch between °C and °F
- Recent searches (saved with localStorage); last searched city loads automatically
- Glassmorphism UI with smooth animations and a loading spinner
- Error handling for wrong city names, denied location permission and network failure
- Fully responsive (mobile, tablet, desktop)

## 3. Tech Stack
HTML5, CSS3 (Flexbox, Grid, media queries), JavaScript ES6 (Fetch API, async/await, DOM manipulation).

## 4. API Used
**Open-Meteo** (free, no API key required)
- Geocoding API: `https://geocoding-api.open-meteo.com/v1/search` (city name to latitude/longitude)
- Forecast API: `https://api.open-meteo.com/v1/forecast` (current weather and daily forecast)

## 5. How It Works
1. User enters a city and submits the form.
2. The Geocoding API returns the city's coordinates.
3. The Forecast API is called with those coordinates.
4. The JSON response is rendered into the page using `createElement`, `textContent` and `appendChild`.
5. Errors (city not found, no internet) are shown in a status message.

## 6. Project Structure
```
weather-app/
  index.html   page structure
  style.css    styling and responsive layout
  script.js    API calls and DOM logic
  README.md    documentation
```

## 7. Run Locally
Open `index.html` in a browser (internet connection needed for the API).

## 8. Screenshots
Add the screenshots in a `screenshots/` folder:
1. Home screen  2. Weather result  3. Error state (city not found)  4. Mobile view

## 9. Learnings
Working with async/await and the Fetch API, handling loading and error states, DOM manipulation, and deploying on GitHub Pages.
