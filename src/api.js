import Constants from "expo-constants";

const API_BASE = "https://www.weatherlens.dev/api/v1";
const API_KEY =
  Constants.expoConfig?.extra?.weatherlensApiKey ||
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_WEATHERLENS_API_KEY) ||
  "";

async function request(endpoint, params = {}) {
  if (!API_KEY) console.warn("WeatherLens API key not found — check .env.local");
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, v);
  });
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

export async function getForecast(lat, lon, days = 16) {
  return request("/forecast", { lat, lon, days });
}

export async function getClimate(lat, lon, date) {
  return request("/climate", { lat, lon, date });
}

export async function getAccuracy(lat, lon) {
  return request("/accuracy", { lat, lon });
}

export async function getHistorical(lat, lon, start, end) {
  return request("/historical", { lat, lon, start, end });
}

/**
 * Geocode a city name → array of {name, region, country, lat, lon}.
 */
export async function geocodeCity(query) {
  if (!query || query.trim().length < 2) return [];
  // Open-Meteo only accepts city names — strip state/country after comma
  const parts = query.trim().split(",").map((s) => s.trim());
  const cityName = parts[0];
  const hint = parts[1]?.toLowerCase() || "";
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const d = await res.json();
  let places = (d.results || []).map((r) => ({
    name: r.name,
    region: r.admin1 || "",
    country: r.country || "",
    lat: r.latitude,
    lon: r.longitude,
  }));
  // If user typed a state/country hint after the comma, prioritize matches
  if (hint) {
    const matches = places.filter((p) =>
      p.region.toLowerCase().startsWith(hint) ||
      p.region.toLowerCase().includes(hint) ||
      p.country.toLowerCase().startsWith(hint)
    );
    const rest = places.filter((p) => !matches.includes(p));
    places = [...matches, ...rest];
  }
  return places.slice(0, 5);
}

/**
 * Fetch hourly forecast + daily sunrise/sunset/UV from Open-Meteo (free, no key).
 * Returns { daily: [{date, sunrise, sunset, uvMax, precipIn, precipProbMax, windMax}], hourly: [{time, tempF, precipProb, precipIn, code, cloudPct, humidityPct, windMph}] }
 */
export async function getHourlyForecast(lat, lon, days = 16) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,weathercode,cloudcover,relativehumidity_2m,windspeed_10m` +
    `&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
  const d = await res.json();
  const daily = (d.daily?.time || []).map((t, i) => ({
    date: t,
    sunrise: d.daily.sunrise?.[i] || null,
    sunset: d.daily.sunset?.[i] || null,
    uvMax: d.daily.uv_index_max?.[i] ?? null,
    precipIn: d.daily.precipitation_sum?.[i] ?? null,
    precipProbMax: d.daily.precipitation_probability_max?.[i] ?? null,
    windMax: d.daily.windspeed_10m_max?.[i] ?? null,
    windDir: d.daily.winddirection_10m_dominant?.[i] ?? null,
  }));
  const hourly = (d.hourly?.time || []).map((t, i) => ({
    time: t,
    tempF: d.hourly.temperature_2m?.[i] ?? null,
    precipProb: d.hourly.precipitation_probability?.[i] ?? null,
    precipIn: d.hourly.precipitation?.[i] ?? null,
    code: d.hourly.weathercode?.[i] ?? null,
    cloudPct: d.hourly.cloudcover?.[i] ?? null,
    humidityPct: d.hourly.relativehumidity_2m?.[i] ?? null,
    windMph: d.hourly.windspeed_10m?.[i] ?? null,
  }));
  return { daily, hourly };
}

/**
 * Fetch active NWS alerts.
 * @param {object} opts
 * @param {number} [opts.lat]  – latitude  (used for point query)
 * @param {number} [opts.lon]  – longitude (used for point query)
 * @param {string} [opts.area] – comma-separated state codes, e.g. "CO" or "CO,WY,NE"
 * If neither point nor area supplied, returns ALL active US alerts.
 */
export async function getNWSAlerts({ lat, lon, area } = {}) {
  let url = "https://api.weather.gov/alerts/active?status=actual";
  if (area) url += `&area=${area}`;
  else if (lat != null && lon != null) url += `&point=${lat},${lon}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherLens/1.0", Accept: "application/geo+json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []).map((f) => f.properties);
}
