import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../theme";
import StatusBar from "../components/Header";
import BottomNav from "../components/BottomNav";
import { getWeatherIcon, MONTHS } from "../data";

export default function HomeScreen({ location, forecast, climate, onNav }) {
  const now = new Date();

  const todayFc = forecast?.[0] || {
    temperature: { highF: 81, lowF: 58, avgF: 74 },
    precipitation: { probabilityPct: 15 },
    wind: { speedMph: 12, direction: "NW" },
    conditions: { code: 2, description: "Partly Cloudy", emoji: "⛅" },
    uvIndex: 6,
    humidityPct: 42,
  };

  const temp = todayFc.temperature?.avgF || Math.round((todayFc.temperature?.highF + todayFc.temperature?.lowF) / 2);
  const desc = todayFc.conditions?.description || "Partly Cloudy";
  const emoji = todayFc.conditions?.emoji || getWeatherIcon(todayFc.conditions?.code || 2).icon;
  const cl = climate || { temperature: { highF: 68, lowF: 40 } };

  const hourlyTemps = [temp, temp + 4, temp + 7, temp + 2, temp - 9];
  const hourlyIcons = [emoji, "⛅", "☀️", "⛅", "🌙"];
  const hourlyPcts = [todayFc.precipitation?.probabilityPct || 15, 5, 10, 5, 3];
  const hourlyLabels = ["NOW", "12PM", "3PM", "6PM", "9PM"];

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
            <Text style={s.tempNum}>{Math.round(temp)}</Text>
            <Text style={s.tempUnit}>°F</Text>
          </View>
          <Text style={s.condition}>{desc}</Text>
          <Text style={s.hilo}>
            H: {Math.round(todayFc.temperature?.highF)}°  L: {Math.round(todayFc.temperature?.lowF)}°
          </Text>
        </View>

        {/* Quick stats */}
        <View style={s.statsGrid}>
          <View style={s.stat}><Text style={s.statIcon}>💧</Text><Text style={s.statVal}>{todayFc.precipitation?.probabilityPct || 15}%</Text><Text style={s.statLabel}>PRECIP</Text></View>
          <View style={s.stat}><Text style={s.statIcon}>💨</Text><Text style={s.statVal}>{todayFc.wind?.speedMph || 12}mph</Text><Text style={s.statLabel}>WIND {todayFc.wind?.direction || "NW"}</Text></View>
          <View style={s.stat}><Text style={s.statIcon}>☀️</Text><Text style={s.statVal}>UV {todayFc.uvIndex || 6}</Text><Text style={s.statLabel}>HIGH</Text></View>
          <View style={s.stat}><Text style={s.statIcon}>〰️</Text><Text style={s.statVal}>{todayFc.humidityPct || 42}%</Text><Text style={s.statLabel}>HUMIDITY</Text></View>
        </View>

        <Text style={s.sourceBadge}>◆ {todayFc.source === "weatherlens" ? "WEATHERLENS BLENDED" : "NWS SOURCE"} ACTIVE</Text>

        {/* Hourly */}
        <Text style={s.sectionLabel}>HOURLY TRANSMISSION</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hourlyRow}>
          {hourlyLabels.map((t, i) => (
            <View key={t} style={[s.hourlyCard, i === 0 && s.hourlyActive]}>
              <Text style={s.hourlyTime}>{t}</Text>
              <Text style={s.hourlyIcon}>{hourlyIcons[i]}</Text>
              <Text style={s.hourlyTemp}>{Math.round(hourlyTemps[i])}°</Text>
              <Text style={s.hourlyPct}>{hourlyPcts[i]}%</Text>
            </View>
          ))}
        </ScrollView>

        {/* Accuracy */}
        <Text style={s.sectionLabel}>FORECAST ACCURACY</Text>
        <View style={s.accRow}>
          <View style={s.accCard}><Text style={[s.accNum, s.accGreen]}>94.2%</Text><Text style={s.accLabel}>TEMP ±2°F</Text></View>
          <View style={s.accCard}><Text style={[s.accNum, s.accGreen]}>87.6%</Text><Text style={s.accLabel}>CONDITION</Text></View>
          <View style={s.accCard}><Text style={[s.accNum, s.accGreen]}>91.0%</Text><Text style={s.accLabel}>PRECIP</Text></View>
        </View>

        {/* Climate banner */}
        <View style={s.climateBanner}>
          <Text style={s.climateIcon}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.climateLabel}>CLIMATE NORMAL · {MONTHS[now.getMonth()]} {now.getDate()}</Text>
            <Text style={s.climateData}>
              Avg High {Math.round(cl.temperature?.highF || 68)}°F · Avg Low {Math.round(cl.temperature?.lowF || 40)}°F
            </Text>
          </View>
          <Text style={s.climateDelta}>+{Math.round(temp - (cl.temperature?.highF || 68))}°</Text>
        </View>
      </ScrollView>

      <BottomNav active="home" onNav={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  locBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 4 },
  locName: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.text },
  locCoords: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, marginTop: 2 },
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
  statVal: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "700", color: COLORS.text },
  statLabel: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, textTransform: "uppercase" },

  sourceBadge: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.greenBright, textAlign: "right", paddingHorizontal: 16, paddingVertical: 4, letterSpacing: 0.5 },

  sectionLabel: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", letterSpacing: 1, color: COLORS.text, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

  hourlyRow: { paddingHorizontal: 12 },
  hourlyCard: { width: 68, alignItems: "center", gap: 4, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginHorizontal: 3 },
  hourlyActive: { borderColor: COLORS.gold, backgroundColor: "rgba(200,168,50,0.08)" },
  hourlyTime: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "700", color: COLORS.text2 },
  hourlyIcon: { fontSize: 20 },
  hourlyTemp: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "600", color: COLORS.gold2 },
  hourlyPct: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },

  accRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  accCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 8, alignItems: "center" },
  accNum: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: "700" },
  accGreen: { color: COLORS.greenBright },
  accLabel: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, letterSpacing: 0.5, marginTop: 2 },

  climateBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, padding: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 },
  climateIcon: { fontSize: 24 },
  climateLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 0.5 },
  climateData: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text, marginTop: 2 },
  climateDelta: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", color: COLORS.greenBright },
});
