import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";
import StatusBar from "../components/Header";
import BottomNav from "../components/BottomNav";
import { getWeatherIcon, MONTHS, DAYS, confidenceLabel } from "../data";

const SCREEN_W = Dimensions.get("window").width;
const CHART_H = 140;
const BAR_W = Math.max(22, Math.floor((SCREEN_W - 48) / 24));

export default function HomeScreen({ location, forecast, climate, accuracy, todayTemp, todayIcon, hourlyData, loading, onNav }) {
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(0); // index into forecast array
  const stripRef = useRef(null);

  const todayFc = forecast?.[0] || null;
  const selFc = forecast?.[selectedDay] || todayFc;

  const temp = selectedDay === 0 ? (todayTemp || todayFc?.temperature?.avgF || "--") : (selFc?.temperature?.avgF || "--");
  const desc = selFc?.conditions?.description || selFc?.conditions?.forecast?.split(".")[0] || todayIcon?.label || "—";
  const emoji = selFc?.conditions?.emoji || (selFc?.conditions?.code != null ? getWeatherIcon(selFc.conditions.code).icon : (todayIcon?.icon || "🌡️"));
  const cl = climate || null;

  // Real accuracy data from WeatherLens API
  const currentMonth = String(now.getMonth() + 1);
  const wlAcc = accuracy?.accuracy?.[currentMonth]?.weatherlens?.["1day"];
  const overallScore = wlAcc?.overallScore ?? accuracy?.summary?.weightedOverallScore;

  // Extract daily extras (sunrise/sunset/UV) and hourly data for selected day
  const selDate = selFc?.date || "";
  const dailyExtras = useMemo(() => {
    if (!hourlyData?.daily) return null;
    return hourlyData.daily.find((d) => d.date === selDate) || null;
  }, [hourlyData, selDate]);

  const dayHourly = useMemo(() => {
    if (!hourlyData?.hourly || !selDate) return [];
    return hourlyData.hourly.filter((h) => h.time.startsWith(selDate));
  }, [hourlyData, selDate]);

  // Scroll strip to selected day
  useEffect(() => {
    if (stripRef.current && selectedDay > 2) {
      stripRef.current.scrollTo({ x: (selectedDay - 2) * 68, animated: true });
    }
  }, [selectedDay]);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />

        {/* Location bar */}
        <View style={s.locBar}>
          <View>
            <Text style={s.locName}>◉ {location.name}</Text>
            <Text style={s.locCoords}>{location.lat.toFixed(4)}°N, {Math.abs(location.lon).toFixed(4)}°W</Text>
          </View>
          <TouchableOpacity style={s.gearBtn} onPress={() => onNav("settings")}>
            <Text style={s.gearText}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Hero weather */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>{emoji}</Text>
          <View style={s.tempRow}>
            <Text style={s.tempNum}>{typeof temp === "number" ? Math.round(temp) : temp}</Text>
            <Text style={s.tempUnit}>°F</Text>
          </View>
          <Text style={s.condition}>{desc}</Text>
          {selFc && (
            <Text style={s.hilo}>
              H: {Math.round(selFc.temperature?.highF)}°  L: {Math.round(selFc.temperature?.lowF)}°
            </Text>
          )}
        </View>

        {/* Quick stats */}
        {selFc && (
          <View style={s.statsGrid}>
            <View style={s.stat}><Text style={s.statIcon}>💧</Text><Text style={s.statVal}>{dailyExtras?.precipProbMax ?? selFc.precipitation?.probabilityPct ?? "—"}%</Text><Text style={s.statLabel}>PRECIP</Text></View>
            <View style={s.stat}><Text style={s.statIcon}>💨</Text><Text style={s.statVal}>{dailyExtras?.windMax ?? selFc.wind?.speedMph ?? "—"}mph</Text><Text style={s.statLabel}>WIND {selFc.wind?.direction || ""}</Text></View>
            <View style={s.stat}><Text style={s.statIcon}>☀️</Text><Text style={s.statVal}>UV {dailyExtras?.uvMax != null ? dailyExtras.uvMax.toFixed(0) : (selFc.uvIndex ?? "—")}</Text><Text style={s.statLabel}>INDEX</Text></View>
            <View style={s.stat}><Text style={s.statIcon}>〰️</Text><Text style={s.statVal}>{selFc.humidityPct ?? "—"}%</Text><Text style={s.statLabel}>HUMIDITY</Text></View>
          </View>
        )}

        {selFc?.source && (
          <Text style={s.sourceBadge}>◆ {selFc.source === "weatherlens" ? "WEATHERLENS BLENDED" : "NWS SOURCE"} ACTIVE</Text>
        )}

        {/* 16-day forecast strip */}
        <TouchableOpacity onPress={() => onNav("forecast")} activeOpacity={0.7}>
          <Text style={s.sectionLabel}>16-DAY FORECAST  ›</Text>
        </TouchableOpacity>
        <ScrollView ref={stripRef} horizontal showsHorizontalScrollIndicator={false} style={s.hourlyRow}>
          {(forecast || []).slice(0, 16).map((day, i) => {
            const d = new Date(day.date + "T12:00:00");
            const label = i === 0 ? "TODAY" : DAYS[d.getDay()];
            const dateNum = d.getDate();
            const icon = day.conditions?.emoji || getWeatherIcon(day.conditions?.code).icon;
            const isSelected = i === selectedDay;
            return (
              <TouchableOpacity
                key={day.date}
                style={[s.dayCard, isSelected && s.dayCardSelected]}
                onPress={() => setSelectedDay(i)}
                activeOpacity={0.7}
              >
                <Text style={s.dayCardTime}>{label}</Text>
                <Text style={s.dayCardDate}>{dateNum}</Text>
                <Text style={s.dayCardIcon}>{icon}</Text>
                <Text style={s.dayCardTemp}>{Math.round(day.temperature?.highF)}°</Text>
                <Text style={s.dayCardLow}>{Math.round(day.temperature?.lowF)}°</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── DAY DETAIL PANEL ── */}
        {selFc && (
          <View style={s.detailPanel}>
            <Text style={s.detailTitle}>
              {selectedDay === 0 ? "TODAY" : new Date(selFc.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}
            </Text>

            {/* Forecast text */}
            {selFc.conditions?.forecast && (
              <Text style={s.detailForecast}>{selFc.conditions.forecast}</Text>
            )}

            {/* Sunrise / Sunset row */}
            {dailyExtras && (
              <View style={s.sunRow}>
                <View style={s.sunItem}>
                  <Text style={s.sunIcon}>🌅</Text>
                  <Text style={s.sunLabel}>SUNRISE</Text>
                  <Text style={s.sunTime}>{formatTime(dailyExtras.sunrise)}</Text>
                </View>
                <View style={s.sunDivider} />
                <View style={s.sunItem}>
                  <Text style={s.sunIcon}>🌇</Text>
                  <Text style={s.sunLabel}>SUNSET</Text>
                  <Text style={s.sunTime}>{formatTime(dailyExtras.sunset)}</Text>
                </View>
                {dailyExtras.sunrise && dailyExtras.sunset && (
                  <>
                    <View style={s.sunDivider} />
                    <View style={s.sunItem}>
                      <Text style={s.sunIcon}>☀️</Text>
                      <Text style={s.sunLabel}>DAYLIGHT</Text>
                      <Text style={s.sunTime}>{daylightHours(dailyExtras.sunrise, dailyExtras.sunset)}</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Extra conditions */}
            {dailyExtras && (
              <View style={s.extrasGrid}>
                <View style={s.extraItem}>
                  <Text style={s.extraVal}>☀️ {dailyExtras.uvMax != null ? dailyExtras.uvMax.toFixed(1) : "—"}</Text>
                  <Text style={s.extraLabel}>UV INDEX</Text>
                </View>
                <View style={s.extraItem}>
                  <Text style={s.extraVal}>🌧️ {dailyExtras.precipIn != null ? dailyExtras.precipIn.toFixed(2) + '"' : "—"}</Text>
                  <Text style={s.extraLabel}>PRECIP</Text>
                </View>
                <View style={s.extraItem}>
                  <Text style={s.extraVal}>💨 {dailyExtras.windMax != null ? Math.round(dailyExtras.windMax) + "mph" : "—"}</Text>
                  <Text style={s.extraLabel}>WIND MAX</Text>
                </View>
                <View style={s.extraItem}>
                  <Text style={s.extraVal}>🧭 {dailyExtras.windDir != null ? degToCompass(dailyExtras.windDir) : "—"}</Text>
                  <Text style={s.extraLabel}>WIND DIR</Text>
                </View>
              </View>
            )}

            {/* Hourly temperature + precipitation chart */}
            {dayHourly.length > 0 && (
              <>
                <Text style={s.chartTitle}>HOURLY FORECAST</Text>
                <HourlyChart hours={dayHourly} />

                {/* Rain timing */}
                <RainTiming hours={dayHourly} />
              </>
            )}
          </View>
        )}

        {/* Accuracy — real data from API */}
        <Text style={s.sectionLabel}>FORECAST ACCURACY</Text>
        <View style={s.accRow}>
          <View style={s.accCard}>
            <Text style={[s.accNum, s.accGreen]}>{overallScore != null ? overallScore.toFixed(1) + "%" : "—"}</Text>
            <Text style={s.accLabel}>OVERALL</Text>
          </View>
          <View style={s.accCard}>
            <Text style={[s.accNum, s.accGreen]}>{wlAcc?.conditionMatchPct != null ? wlAcc.conditionMatchPct.toFixed(1) + "%" : "—"}</Text>
            <Text style={s.accLabel}>CONDITION</Text>
          </View>
          <View style={s.accCard}>
            <Text style={[s.accNum, s.accGreen]}>{wlAcc?.avgTempErrorF != null ? "±" + wlAcc.avgTempErrorF.toFixed(1) + "°F" : "—"}</Text>
            <Text style={s.accLabel}>TEMP ERR</Text>
          </View>
        </View>

        {/* Climate banner */}
        {cl ? (
          <View style={s.climateBanner}>
            <Text style={s.climateIcon}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.climateLabel}>CLIMATE NORMAL · {MONTHS[now.getMonth()]} {now.getDate()}</Text>
              <Text style={s.climateData}>
                Avg High {Math.round(cl.temperature?.highF)}°F · Avg Low {Math.round(cl.temperature?.lowF)}°F
              </Text>
            </View>
            {typeof temp === "number" && (
              <Text style={s.climateDelta}>{temp >= (cl.temperature?.highF || 0) ? "+" : ""}{Math.round(temp - (cl.temperature?.highF || 0))}°</Text>
            )}
          </View>
        ) : todayFc && (
          <View style={s.climateBanner}>
            <Text style={s.climateIcon}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.climateLabel}>TODAY · {MONTHS[now.getMonth()]} {now.getDate()}</Text>
              <Text style={s.climateData}>
                Accuracy: {overallScore != null ? confidenceLabel(overallScore) : "—"} · Source: {todayFc.source || "multi"}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav active="home" onNav={onNav} />
    </View>
  );
}

// ── Helper functions ──────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function daylightHours(rise, set) {
  if (!rise || !set) return "—";
  const diff = (new Date(set) - new Date(rise)) / 3600000;
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
  return `${h}h ${m}m`;
}

function degToCompass(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ── Hourly Chart Component (pure RN, no library) ─────────────────────

function HourlyChart({ hours }) {
  const temps = hours.map((h) => h.tempF).filter((t) => t != null);
  const precips = hours.map((h) => h.precipProb ?? 0);
  const minT = Math.min(...temps) - 2;
  const maxT = Math.max(...temps) + 2;
  const range = maxT - minT || 1;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chartScroll}>
      <View style={s.chartContainer}>
        {/* Temp line rendered as bars + dots */}
        <View style={s.chartBars}>
          {hours.map((h, i) => {
            const t = h.tempF ?? minT;
            const pct = (t - minT) / range;
            const precipPct = (h.precipProb ?? 0) / 100;
            const hr = new Date(h.time).getHours();
            const showLabel = hr % 3 === 0;
            return (
              <View key={i} style={s.chartCol}>
                {/* Temp dot */}
                <View style={[s.chartDotArea, { height: CHART_H }]}>
                  <View style={{ flex: 1 - pct }} />
                  <Text style={s.chartTempLabel}>{Math.round(t)}°</Text>
                  <View style={[s.chartDot, precipPct > 0.3 && s.chartDotRain]} />
                  <View style={{ flex: pct }} />
                </View>
                {/* Precip bar */}
                <View style={s.precipBarBg}>
                  <View style={[s.precipBarFill, { height: `${Math.round(precipPct * 100)}%` }]} />
                </View>
                {precipPct > 0 && (
                  <Text style={s.precipLabel}>{h.precipProb}%</Text>
                )}
                {/* Hour label */}
                {showLabel && (
                  <Text style={s.chartHour}>{hr === 0 ? "12a" : hr < 12 ? `${hr}a` : hr === 12 ? "12p" : `${hr - 12}p`}</Text>
                )}
                {!showLabel && <Text style={s.chartHour}> </Text>}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Rain Timing Component ─────────────────────────────────────────────

function RainTiming({ hours }) {
  const rainy = hours.filter((h) => (h.precipProb ?? 0) >= 30);
  if (rainy.length === 0) {
    return (
      <View style={s.rainCard}>
        <Text style={s.rainIcon}>☀️</Text>
        <Text style={s.rainText}>No significant rain expected today</Text>
      </View>
    );
  }
  // Find contiguous rain windows
  const windows = [];
  let start = null;
  let maxProb = 0;
  hours.forEach((h, i) => {
    const prob = h.precipProb ?? 0;
    if (prob >= 30) {
      if (start === null) start = i;
      maxProb = Math.max(maxProb, prob);
    } else if (start !== null) {
      windows.push({ start, end: i - 1, maxProb });
      start = null;
      maxProb = 0;
    }
  });
  if (start !== null) windows.push({ start, end: hours.length - 1, maxProb });

  return (
    <View style={s.rainCard}>
      <Text style={s.rainIcon}>🌧️</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.rainTitle}>RAIN EXPECTED</Text>
        {windows.map((w, i) => {
          const fromH = new Date(hours[w.start].time).getHours();
          const toH = new Date(hours[w.end].time).getHours() + 1;
          const fmtH = (h) => h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
          return (
            <Text key={i} style={s.rainWindow}>
              {fmtH(fromH)} – {fmtH(toH % 24)}  ·  up to {w.maxProb}% chance
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  locBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 4 },
  locName: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.text },
  locCoords: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2, marginTop: 2 },
  gearBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border2, alignItems: "center", justifyContent: "center" },
  gearText: { fontSize: 14, color: COLORS.text },

  hero: { alignItems: "center", paddingVertical: 12 },
  heroEmoji: { fontSize: 56 },
  tempRow: { flexDirection: "row", alignItems: "flex-start" },
  tempNum: { fontFamily: FONTS.mono, fontSize: 64, fontWeight: "300", color: COLORS.text, lineHeight: 68 },
  tempUnit: { fontFamily: FONTS.mono, fontSize: 24, color: COLORS.text, marginTop: 8 },
  condition: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "600", color: COLORS.text },
  hilo: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, marginTop: 4 },

  statsGrid: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginVertical: 8, paddingVertical: 10, paddingHorizontal: 16 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statIcon: { fontSize: 16 },
  statVal: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.text },
  statLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, textTransform: "uppercase" },

  sourceBadge: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.greenBright, textAlign: "right", paddingHorizontal: 16, paddingVertical: 4, letterSpacing: 0.5 },

  sectionLabel: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: COLORS.text, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

  hourlyRow: { paddingHorizontal: 12 },
  dayCard: { width: 66, alignItems: "center", gap: 3, paddingVertical: 10, paddingHorizontal: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginHorizontal: 3 },
  dayCardSelected: { borderColor: COLORS.gold, backgroundColor: "rgba(200,168,50,0.12)", borderWidth: 2 },
  dayCardTime: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", color: COLORS.text2 },
  dayCardDate: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2 },
  dayCardIcon: { fontSize: 22 },
  dayCardTemp: { fontFamily: FONTS.mono, fontSize: 15, fontWeight: "700", color: COLORS.gold2 },
  dayCardLow: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2 },

  // ── Day detail panel ──
  detailPanel: { marginHorizontal: 12, marginTop: 10, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  detailTitle: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "900", letterSpacing: 1.5, color: COLORS.gold2, marginBottom: 8 },
  detailForecast: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text, lineHeight: 20, marginBottom: 12 },

  sunRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface2, borderRadius: 8, padding: 12, marginBottom: 12 },
  sunItem: { flex: 1, alignItems: "center" },
  sunIcon: { fontSize: 24, marginBottom: 4 },
  sunLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, letterSpacing: 0.5, fontWeight: "600" },
  sunTime: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  sunDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  extrasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  extraItem: { width: "47%", backgroundColor: COLORS.surface2, borderRadius: 6, padding: 10 },
  extraVal: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.text },
  extraLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, letterSpacing: 0.5, marginTop: 3 },

  chartTitle: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: COLORS.text2, marginBottom: 8, marginTop: 6 },
  chartScroll: { marginBottom: 10 },
  chartContainer: { paddingRight: 12 },
  chartBars: { flexDirection: "row" },
  chartCol: { width: BAR_W, alignItems: "center", marginHorizontal: 2 },
  chartDotArea: { width: "100%", alignItems: "center" },
  chartTempLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "600", color: COLORS.text },
  chartDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  chartDotRain: { backgroundColor: "#60a5fa" },
  precipBarBg: { width: 12, height: 28, backgroundColor: COLORS.surface2, borderRadius: 3, overflow: "hidden", justifyContent: "flex-end", marginTop: 4 },
  precipBarFill: { width: "100%", backgroundColor: "#60a5fa", borderRadius: 3 },
  precipLabel: { fontFamily: FONTS.mono, fontSize: 9, fontWeight: "600", color: "#60a5fa" },
  chartHour: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "600", color: COLORS.text2, marginTop: 3 },

  rainCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.surface2, borderRadius: 8, padding: 12, marginTop: 6 },
  rainIcon: { fontSize: 26 },
  rainTitle: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "800", letterSpacing: 0.5, color: COLORS.text },
  rainText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text2 },
  rainWindow: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, marginTop: 3 },

  accRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  accCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, alignItems: "center" },
  accNum: { fontFamily: FONTS.mono, fontSize: 20, fontWeight: "700" },
  accGreen: { color: COLORS.greenBright },
  accLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, letterSpacing: 0.5, marginTop: 2 },

  climateBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, padding: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 },
  climateIcon: { fontSize: 24 },
  climateLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2, letterSpacing: 0.5 },
  climateData: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text, marginTop: 2 },
  climateDelta: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", color: COLORS.greenBright },
});
