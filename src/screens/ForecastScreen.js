import React, { useState, useCallback } from "react";
import {
  View, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Dimensions,
} from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";
import { getWeatherIcon, DAYS, MONTHS } from "../data";
import { geocodeCity, getHourlyForecast } from "../api";

const DURATION_OPTS = [3, 5, 7, 10, 14];

export default function ForecastScreen({ onNav }) {
  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Trip config
  const [startOffset, setStartOffset] = useState(0);
  const [duration, setDuration] = useState(7);

  // Forecast results
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // ── Search for places ──
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const places = await geocodeCity(query);
      setResults(places);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  // ── Pick a place and fetch forecast ──
  const selectPlace = useCallback(async (place) => {
    setSelectedPlace(place);
    setResults(null);
    setQuery(`${place.name}, ${place.region || place.country}`);
    setLoading(true);
    try {
      const data = await getHourlyForecast(place.lat, place.lon, 16);
      setTripData(data);
    } catch (e) {
      console.warn("Trip forecast error:", e);
      setTripData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Slice trip days from the forecast
  const tripDays = tripData?.daily?.slice(startOffset, startOffset + duration) || [];
  const tripHourly = tripData?.hourly || [];

  // Derive packing suggestions
  const packing = derivePacking(tripDays, tripHourly);
  const bestDays = findBestDays(tripDays);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <Text style={s.pageTitle}>🧳 TRIP PLANNER</Text>
        <Text style={s.subtitle}>Plan your weather for any destination</Text>

        {/* Destination search */}
        <Text style={s.label}>DESTINATION</Text>
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={(t) => { setQuery(t); if (t.length < 2) setResults(null); }}
            placeholder="Search city or place…"
            placeholderTextColor={COLORS.text2}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={s.searchBtnText}>{searching ? "…" : "🔍"}</Text>
          </TouchableOpacity>
        </View>

        {/* Search results dropdown */}
        {results && results.length > 0 && (
          <View style={s.dropdown}>
            {results.map((r, i) => (
              <TouchableOpacity key={i} style={s.dropItem} onPress={() => selectPlace(r)}>
                <Text style={s.dropName}>{r.name}</Text>
                <Text style={s.dropRegion}>{[r.region, r.country].filter(Boolean).join(", ")}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {results && results.length === 0 && !searching && (
          <Text style={s.noResults}>No places found. Try a different search.</Text>
        )}

        {/* Trip dates */}
        {selectedPlace && (
          <>
            <Text style={s.label}>DEPARTURE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.optScroll}>
              <View style={s.optRow}>
                {[0, 1, 2, 3, 5, 7, 10].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const lbl = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : `${DAYS[d.getDay()]} ${d.getDate()}`;
                  return (
                    <TouchableOpacity
                      key={offset}
                      style={[s.optPill, startOffset === offset && s.optPillActive]}
                      onPress={() => setStartOffset(offset)}
                    >
                      <Text style={[s.optText, startOffset === offset && s.optTextActive]}>{lbl}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={s.label}>DURATION</Text>
            <View style={s.optRow}>
              {DURATION_OPTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[s.optPill, duration === d && s.optPillActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[s.optText, duration === d && s.optTextActive]}>{d} days</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Loading */}
        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={s.loadingText}>Fetching forecast…</Text>
          </View>
        )}

        {/* Trip weather results */}
        {!loading && tripDays.length > 0 && (
          <>
            {/* Best days highlight */}
            {bestDays.length > 0 && (
              <View style={s.bestCard}>
                <Text style={s.bestIcon}>⭐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bestTitle}>BEST DAYS FOR OUTDOORS</Text>
                  <Text style={s.bestText}>{bestDays.join("  ·  ")}</Text>
                </View>
              </View>
            )}

            {/* Packing list */}
            {packing.length > 0 && (
              <>
                <Text style={s.label}>PACKING SUGGESTIONS</Text>
                <View style={s.packGrid}>
                  {packing.map((item, i) => (
                    <View key={i} style={s.packItem}>
                      <Text style={s.packIcon}>{item.icon}</Text>
                      <Text style={s.packName}>{item.name}</Text>
                      <Text style={s.packWhy}>{item.reason}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Day-by-day forecast */}
            <Text style={s.label}>DAY-BY-DAY FORECAST</Text>
            {tripDays.map((day) => {
              const d = new Date(day.date + "T12:00:00");
              const dayLabel = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
              const dayHours = tripHourly.filter((h) => h.time.startsWith(day.date));
              const temps = dayHours.map((h) => h.tempF).filter(Boolean);
              const highT = temps.length ? Math.round(Math.max(...temps)) : null;
              const lowT = temps.length ? Math.round(Math.min(...temps)) : null;
              const maxPrecip = Math.max(...dayHours.map((h) => h.precipProb ?? 0), 0);
              const avgWind = dayHours.length
                ? Math.round(dayHours.reduce((sum, h) => sum + (h.windMph || 0), 0) / dayHours.length)
                : null;
              const codes = dayHours.map((h) => h.code).filter((c) => c != null);
              const dominantCode = codes.length ? mode(codes) : null;
              const wi = getWeatherIcon(dominantCode);

              const rainHours = dayHours.filter((h) => (h.precipProb ?? 0) >= 30);
              let rainNote = null;
              if (rainHours.length > 0) {
                const fromH = new Date(rainHours[0].time).getHours();
                const toH = new Date(rainHours[rainHours.length - 1].time).getHours() + 1;
                const fmtH = (h) => h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
                rainNote = `🌧 ${fmtH(fromH)}–${fmtH(toH % 24)} (up to ${maxPrecip}%)`;
              }

              const score = outdoorScore(day, dayHours);
              const scoreColor = score >= 70 ? COLORS.greenBright : score >= 40 ? COLORS.orange : COLORS.red;

              return (
                <View key={day.date} style={s.dayCard}>
                  <View style={s.dayTop}>
                    <Text style={s.dayIcon}>{wi.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.dayLabel}>{dayLabel}</Text>
                      <Text style={s.dayDesc}>{wi.label}</Text>
                    </View>
                    <View style={s.dayTemps}>
                      <Text style={s.dayHigh}>{highT ?? "—"}°</Text>
                      <Text style={s.dayLow}>{lowT ?? "—"}°</Text>
                    </View>
                  </View>

                  <View style={s.dayStats}>
                    <Text style={s.dayStat}>💧 {maxPrecip}%</Text>
                    <Text style={s.dayStat}>💨 {avgWind ?? "—"}mph</Text>
                    <Text style={s.dayStat}>☀️ UV {day.uvMax != null ? day.uvMax.toFixed(0) : "—"}</Text>
                    <View style={[s.scoreBadge, { backgroundColor: scoreColor }]}>
                      <Text style={s.scoreText}>{score}%</Text>
                    </View>
                  </View>

                  {rainNote && <Text style={s.rainNote}>{rainNote}</Text>}

                  {day.sunrise && (
                    <Text style={s.sunNote}>
                      🌅 {fmtTime(day.sunrise)}  ·  🌇 {fmtTime(day.sunset)}
                    </Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Empty state */}
        {!selectedPlace && !loading && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🗺️</Text>
            <Text style={s.emptyTitle}>WHERE TO?</Text>
            <Text style={s.emptyText}>
              Search for a destination to see the weather forecast, best outdoor days, and packing suggestions for your trip.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav active="forecast" onNav={onNav} />
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

function mode(arr) {
  const freq = {};
  arr.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function outdoorScore(day, hours) {
  if (!hours.length) return 50;
  const avgPrecip = hours.reduce((sum, h) => sum + (h.precipProb ?? 0), 0) / hours.length;
  const avgWind = hours.reduce((sum, h) => sum + (h.windMph ?? 0), 0) / hours.length;
  const avgCloud = hours.reduce((sum, h) => sum + (h.cloudPct ?? 50), 0) / hours.length;
  let score = 100;
  score -= avgPrecip * 0.8;
  score -= Math.max(0, avgWind - 10) * 1.5;
  score -= avgCloud * 0.15;
  if (day.uvMax > 10) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function findBestDays(days) {
  if (!days.length) return [];
  const scored = days.map((d) => {
    let score = 80;
    if (d.precipProbMax) score -= d.precipProbMax * 0.6;
    if (d.windMax > 15) score -= (d.windMax - 15) * 1.5;
    if (d.uvMax > 10) score -= 10;
    const dt = new Date(d.date + "T12:00:00");
    return { label: `${DAYS[dt.getDay()]} ${dt.getDate()}`, score: Math.round(score) };
  });
  const cutoff = Math.max(60, scored.reduce((a, b) => a + b.score, 0) / scored.length);
  return scored.filter((d) => d.score >= cutoff).map((d) => `${d.label} ⭐`);
}

function derivePacking(days, hourly) {
  if (!days.length) return [];
  const items = [];
  const allTemps = days.flatMap((d) =>
    hourly.filter((h) => h.time.startsWith(d.date)).map((h) => h.tempF)
  ).filter(Boolean);
  const minTemp = allTemps.length ? Math.min(...allTemps) : null;
  const maxTemp = allTemps.length ? Math.max(...allTemps) : null;
  const anyRain = days.some((d) => (d.precipProbMax ?? 0) >= 30);
  const heavyRain = days.some((d) => (d.precipProbMax ?? 0) >= 60);
  const anyWind = days.some((d) => (d.windMax ?? 0) >= 20);
  const highUV = days.some((d) => (d.uvMax ?? 0) >= 6);
  const veryHighUV = days.some((d) => (d.uvMax ?? 0) >= 8);
  const coldNights = minTemp != null && minTemp < 45;
  const hot = maxTemp != null && maxTemp > 85;

  if (anyRain) items.push({ icon: "☂️", name: "Umbrella", reason: heavyRain ? "Heavy rain expected" : "Rain chances on some days" });
  if (heavyRain) items.push({ icon: "🧥", name: "Rain jacket", reason: "Waterproof layer recommended" });
  if (highUV) items.push({ icon: "🧴", name: "Sunscreen", reason: veryHighUV ? "Very high UV — SPF 50+" : "UV index 6+ expected" });
  if (highUV) items.push({ icon: "🕶️", name: "Sunglasses", reason: "Strong sunlight expected" });
  if (coldNights) items.push({ icon: "🧣", name: "Warm layers", reason: `Temps as low as ${Math.round(minTemp)}°F` });
  if (hot) items.push({ icon: "💧", name: "Water bottle", reason: `Highs near ${Math.round(maxTemp)}°F — stay hydrated` });
  if (anyWind) items.push({ icon: "🧢", name: "Hat / windbreaker", reason: "Windy conditions expected" });
  if (maxTemp != null && minTemp != null && (maxTemp - minTemp) > 30) {
    items.push({ icon: "👕", name: "Layered clothing", reason: `${Math.round(maxTemp - minTemp)}°F temp swing` });
  }
  if (!anyRain && highUV) items.push({ icon: "👒", name: "Sun hat", reason: "Lots of sunshine expected" });

  return items;
}

// ── Styles ───────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  pageTitle: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: "900", letterSpacing: 2, color: COLORS.text, paddingTop: 4 },
  subtitle: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, marginBottom: 16 },

  label: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "800", letterSpacing: 1, color: COLORS.gold2, marginTop: 16, marginBottom: 8 },

  searchRow: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text },
  searchBtn: { width: 48, backgroundColor: COLORS.gold, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  searchBtnText: { fontSize: 20 },

  dropdown: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 8, marginTop: 4, overflow: "hidden" },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropName: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.text },
  dropRegion: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, marginTop: 2 },
  noResults: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, textAlign: "center", padding: 16 },

  optScroll: { marginBottom: 0 },
  optRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optPill: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 8 },
  optPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  optText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "600", color: COLORS.text2 },
  optTextActive: { color: COLORS.bg, fontWeight: "700" },

  loadingBox: { alignItems: "center", padding: 32, gap: 12 },
  loadingText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text2 },

  bestCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(200,168,50,0.1)", borderWidth: 1, borderColor: COLORS.gold, borderRadius: 10, padding: 14, marginTop: 16 },
  bestIcon: { fontSize: 28 },
  bestTitle: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "800", letterSpacing: 1, color: COLORS.gold2 },
  bestText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text, marginTop: 4 },

  dayCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 8 },
  dayTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  dayIcon: { fontSize: 32 },
  dayLabel: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "800", color: COLORS.text },
  dayDesc: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, marginTop: 2 },
  dayTemps: { alignItems: "flex-end" },
  dayHigh: { fontFamily: FONTS.mono, fontSize: 22, fontWeight: "700", color: COLORS.gold2 },
  dayLow: { fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text2 },

  dayStats: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  dayStat: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2 },
  scoreBadge: { marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  scoreText: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "800", color: COLORS.white },

  rainNote: { fontFamily: FONTS.mono, fontSize: 12, color: "#60a5fa", marginTop: 6 },
  sunNote: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2, marginTop: 4 },

  packGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  packItem: { width: "47%", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12 },
  packIcon: { fontSize: 24, marginBottom: 4 },
  packName: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", color: COLORS.text },
  packWhy: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2, marginTop: 3 },

  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: "900", letterSpacing: 2, color: COLORS.text },
  emptyText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text2, textAlign: "center", marginTop: 8, lineHeight: 20, maxWidth: 300 },
});
