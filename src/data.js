export const WEATHER_ICONS = {
  0: { icon: "☀️", label: "Clear Sky" },
  1: { icon: "🌤️", label: "Mainly Clear" },
  2: { icon: "⛅", label: "Partly Cloudy" },
  3: { icon: "☁️", label: "Overcast" },
  45: { icon: "🌫️", label: "Fog" },
  48: { icon: "🌫️", label: "Rime Fog" },
  51: { icon: "🌦️", label: "Light Drizzle" },
  61: { icon: "🌧️", label: "Rain" },
  63: { icon: "🌧️", label: "Moderate Rain" },
  65: { icon: "🌧️", label: "Heavy Rain" },
  71: { icon: "🌨️", label: "Light Snow" },
  73: { icon: "🌨️", label: "Moderate Snow" },
  75: { icon: "❄️", label: "Heavy Snow" },
  80: { icon: "🌦️", label: "Rain Showers" },
  85: { icon: "🌨️", label: "Snow Showers" },
  95: { icon: "⛈️", label: "Thunderstorm" },
  99: { icon: "⛈️", label: "Severe Thunderstorm" },
};

export function getWeatherIcon(code) {
  return WEATHER_ICONS[code] || WEATHER_ICONS[Math.floor(code / 10) * 10] || { icon: "🌡️", label: "Unknown" };
}

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const DEMO_EVENTS = [
  { id: 1, type: "storm", icon: "⛈️", name: "Thunderstorm Cell", severity: "SEVERE", distance: 8.2, direction: "NW", eta: "~2h 15m", location: "Morrison, CO", detail: "Moving SE at 28mph", speed: 28, precipProb: 85 },
  { id: 2, type: "rain", icon: "🌧️", name: "Heavy Rain Band", severity: "MODERATE", distance: 14.7, direction: "W", eta: "~3h 40m", location: "Lakewood, CO", detail: "Stationary", speed: 0, precipProb: 92 },
  { id: 3, type: "wind", icon: "💨", name: "High Wind Advisory", severity: "ADVISORY", distance: 3.1, direction: "N", eta: "Active now", location: "Westminster, CO", detail: "Gusts 45mph", speed: 45, precipProb: 10 },
  { id: 4, type: "fog", icon: "🌫️", name: "Dense Fog Patch", severity: "MILD", distance: 19.3, direction: "S", eta: "Dissipating by 11AM", location: "Englewood, CO", detail: "Visibility <0.25mi", speed: 0, precipProb: 5 },
];

export const EVENT_FILTERS = ["ALL EVENTS", "🌧 RAIN", "⛈ STORMS", "❄ SNOW", "💨 WIND", "🌫 FOG"];
export const RADIUS_OPTIONS = ["25mi", "50mi", "100mi", "250mi", "Any"];

export const DEFAULT_LOCATION = { name: "Denver, CO", lat: 39.7392, lon: -104.9903 };
