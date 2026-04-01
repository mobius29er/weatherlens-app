const API_BASE = "https://weatherlens.dev/api/v1";

// Pre-configured demo key — get your own at https://weatherlens.dev/pricing
let API_KEY = "wl_live_b8c13d25938c41fe956ab4d7c453a782";

export function setApiKey(key) {
  API_KEY = key;
}

export function getApiKey() {
  return API_KEY;
}

async function request(endpoint, params = {}) {
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
