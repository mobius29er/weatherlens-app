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

/** Convert a numeric score (0-100) to a qualitative label. */
export function confidenceLabel(score) {
  if (score == null) return "—";
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MODERATE";
  if (score >= 30) return "LOW";
  return "VERY LOW";
}

export const DEMO_EVENTS = [
  { id: 1, type: "storm", icon: "⛈️", name: "Thunderstorm Cell", severity: "SEVERE", distance: 8.2, direction: "NW", eta: "~2h 15m", location: "Morrison, CO", detail: "Moving SE at 28mph", speed: 28, precipProb: 85 },
  { id: 2, type: "rain", icon: "🌧️", name: "Heavy Rain Band", severity: "MODERATE", distance: 14.7, direction: "W", eta: "~3h 40m", location: "Lakewood, CO", detail: "Stationary", speed: 0, precipProb: 92 },
  { id: 3, type: "wind", icon: "💨", name: "High Wind Advisory", severity: "ADVISORY", distance: 3.1, direction: "N", eta: "Active now", location: "Westminster, CO", detail: "Gusts 45mph", speed: 45, precipProb: 10 },
  { id: 4, type: "fog", icon: "🌫️", name: "Dense Fog Patch", severity: "MILD", distance: 19.3, direction: "S", eta: "Dissipating by 11AM", location: "Englewood, CO", detail: "Visibility <0.25mi", speed: 0, precipProb: 5 },
];

export const EVENT_FILTERS = ["ALL EVENTS", "🌧 RAIN", "⛈ STORMS", "❄ SNOW", "💨 WIND", "🌫 FOG"];
export const RADIUS_OPTIONS = ["25mi", "50mi", "100mi", "250mi", "Any"];

export const DEFAULT_LOCATION = { name: "Denver, CO", lat: 39.7392, lon: -104.9903 };

// ── US state code helpers ──────────────────────────────────────────────
const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia",
  AS:"American Samoa",GU:"Guam",MH:"Marshall Islands",MP:"Northern Mariana Islands",
  PR:"Puerto Rico",VI:"US Virgin Islands",
};

// Neighboring states for ~250mi radius approximation
const NEIGHBORS = {
  AL:"FL,GA,MS,TN",AK:"",AZ:"CA,CO,NM,NV,UT",AR:"LA,MO,MS,OK,TN,TX",
  CA:"AZ,NV,OR",CO:"AZ,KS,NE,NM,OK,UT,WY",CT:"MA,NY,RI",DE:"MD,NJ,PA",
  FL:"AL,GA",GA:"AL,FL,NC,SC,TN",HI:"",ID:"MT,NV,OR,UT,WA,WY",
  IL:"IA,IN,KY,MO,WI",IN:"IL,KY,MI,OH",IA:"IL,MN,MO,NE,SD,WI",
  KS:"CO,MO,NE,OK",KY:"IL,IN,MO,OH,TN,VA,WV",LA:"AR,MS,TX",
  ME:"NH",MD:"DE,PA,VA,WV,DC",MA:"CT,NH,NY,RI,VT",MI:"IN,OH,WI",
  MN:"IA,ND,SD,WI",MS:"AL,AR,LA,TN",MO:"AR,IA,IL,KS,KY,NE,OK,TN",
  MT:"ID,ND,SD,WY",NE:"CO,IA,KS,MO,SD,WY",NV:"AZ,CA,ID,OR,UT",
  NH:"MA,ME,VT",NJ:"DE,NY,PA",NM:"AZ,CO,OK,TX,UT",NY:"CT,MA,NJ,PA,VT",
  NC:"GA,SC,TN,VA",ND:"MN,MT,SD",OH:"IN,KY,MI,PA,WV",OK:"AR,CO,KS,MO,NM,TX",
  OR:"CA,ID,NV,WA",PA:"DE,MD,NJ,NY,OH,WV",RI:"CT,MA",SC:"GA,NC",
  SD:"IA,MN,MT,NE,ND,WY",TN:"AL,AR,GA,KY,MO,MS,NC,VA",
  TX:"AR,LA,NM,OK",UT:"AZ,CO,ID,NM,NV,WY",VT:"MA,NH,NY",
  VA:"KY,MD,NC,TN,WV,DC",WA:"ID,OR",WV:"KY,MD,OH,PA,VA",
  WI:"IA,IL,MI,MN",WY:"CO,ID,MT,NE,SD,UT",DC:"MD,VA",
};

/** Try to extract a 2-letter US state code from a location name like "Denver, CO". */
export function extractStateCode(locationName) {
  if (!locationName) return null;
  // Try ", XX" pattern at end
  const m = locationName.match(/,\s*([A-Z]{2})\s*$/i);
  if (m) {
    const code = m[1].toUpperCase();
    if (STATE_NAMES[code]) return code;
  }
  // Try full state name match
  const upper = locationName.toUpperCase().trim();
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    if (upper === name.toUpperCase() || upper.endsWith(name.toUpperCase())) return code;
  }
  // Try standalone 2-letter code
  if (upper.length === 2 && STATE_NAMES[upper]) return upper;
  return null;
}

/** Get NWS area string for a given state code and radius index. */
export function getAreaForRadius(stateCode, radiusIndex) {
  // 0 = 25mi (point), 1 = 50mi (state), 2 = 100mi (state), 3 = 250mi (state+neighbors), 4 = Any (nationwide)
  if (radiusIndex === 4) return null;            // nationwide — no area filter
  if (radiusIndex === 0) return stateCode || null; // small radius — use point in caller, but fall back to state
  if (radiusIndex >= 3 && stateCode) {
    const neighbors = NEIGHBORS[stateCode] || "";
    return neighbors ? `${stateCode},${neighbors}` : stateCode;
  }
  return stateCode || null;                       // 50mi/100mi → state
}

// Compute monthly avg high/low/precip from historical daily data
export function computeMonthlyAverages(data) {
  const buckets = {};
  data.forEach((d) => {
    const m = new Date(d.date + "T12:00:00").getMonth();
    if (!buckets[m]) buckets[m] = { highs: [], lows: [], precip: [] };
    if (d.temperature?.highF != null) buckets[m].highs.push(d.temperature.highF);
    if (d.temperature?.lowF != null) buckets[m].lows.push(d.temperature.lowF);
    if (d.precipitation?.amountIn != null) buckets[m].precip.push(d.precipitation.amountIn);
  });
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return Array.from({ length: 12 }, (_, i) => {
    const b = buckets[i];
    if (!b || !b.highs.length) return null;
    return {
      avgHighF: Math.round(avg(b.highs)),
      avgLowF: Math.round(avg(b.lows)),
      avgPrecipIn: +(avg(b.precip).toFixed(3)),
      samples: b.highs.length,
    };
  });
}

// Map NWS alert event name → type + icon
const ALERT_TYPE_MAP = [
  { pattern: /tornado/i, type: "storm", icon: "🌪️" },
  { pattern: /thunderstorm|lightning/i, type: "storm", icon: "⛈️" },
  { pattern: /hurricane|tropical/i, type: "storm", icon: "🌀" },
  { pattern: /flood|flash/i, type: "rain", icon: "🌊" },
  { pattern: /rain|shower/i, type: "rain", icon: "🌧️" },
  { pattern: /snow|blizzard|ice|sleet|freezing|winter/i, type: "snow", icon: "❄️" },
  { pattern: /wind|gust/i, type: "wind", icon: "💨" },
  { pattern: /fog|visibility/i, type: "fog", icon: "🌫️" },
  { pattern: /heat|excessive/i, type: "heat", icon: "🔥" },
  { pattern: /fire/i, type: "fire", icon: "🔥" },
];

const NWS_SEVERITY_MAP = {
  Minor: "MILD",
  Moderate: "MODERATE",
  Severe: "SEVERE",
  Extreme: "EXTREME",
  Unknown: "ADVISORY",
};

export function mapNWSAlert(alert, index) {
  const match = ALERT_TYPE_MAP.find((m) => m.pattern.test(alert.event)) || { type: "other", icon: "⚠️" };
  const now = Date.now();
  const onset = alert.onset ? new Date(alert.onset).getTime() : null;
  const expires = alert.expires ? new Date(alert.expires).getTime() : null;
  let eta = "Active";
  if (onset && onset > now) {
    const hrs = Math.round((onset - now) / 3600000);
    eta = hrs > 0 ? `Starts in ~${hrs}h` : "Imminent";
  } else if (expires && expires > now) {
    const hrs = Math.round((expires - now) / 3600000);
    eta = hrs > 0 ? `Expires in ~${hrs}h` : "Ending soon";
  }
  return {
    id: index + 1,
    type: match.type,
    icon: match.icon,
    name: alert.event,
    severity: NWS_SEVERITY_MAP[alert.severity] || "ADVISORY",
    distance: null,
    direction: null,
    eta,
    location: (alert.areaDesc || "").split(";")[0].trim().slice(0, 40),
    detail: alert.headline || alert.event,
    speed: null,
    precipProb: null,
    description: alert.description,
    urgency: alert.urgency,
    certainty: alert.certainty,
  };
}
