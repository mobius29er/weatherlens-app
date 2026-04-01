import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONTS } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";
import { getWeatherIcon, DAYS, MONTHS } from "../data";

export default function ForecastScreen({ location, forecast, loading, onNav }) {
  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <ScreenHeader title="16-DAY FORECAST" right={location.name} onBack={() => onNav("home")} />

        {/* Source pills */}
        <View style={s.pills}>
          <Text style={s.srcLabel}>SOURCE:</Text>
          <View style={s.pill}><Text style={s.pillText}>NWS DAYS 1-7</Text></View>
          <View style={s.pill}><Text style={s.pillText}>OPEN-METEO DAYS 8-15</Text></View>
          <View style={[s.pill, s.pillLive]}><Text style={s.pillLiveText}>● LIVE</Text></View>
        </View>

        {loading && <ActivityIndicator size="small" color={COLORS.gold} style={{ padding: 24 }} />}

        {(forecast || []).slice(0, 16).map((day, i) => {
          const d = new Date(day.date + "T12:00:00");
          const dayLabel = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
          const wi = getWeatherIcon(day.conditions?.code);
          const isToday = i === 0;

          return (
            <View key={day.date} style={[s.card, isToday && s.cardToday]}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={s.dayRow}>
                    <Text style={s.dayText}>{dayLabel}</Text>
                    {isToday && <View style={s.badge}><Text style={s.badgeText}>TODAY</Text></View>}
                  </View>
                  <Text style={s.desc}>
                    {day.conditions?.description || wi.label}
                    {day.precipitation?.probabilityPct > 20 ? `, ${day.precipitation.probabilityPct}% precip` : ""}
                  </Text>
                </View>
                <Text style={s.icon}>{day.conditions?.emoji || wi.icon}</Text>
              </View>

              <View style={s.temps}>
                <Text style={s.high}>{Math.round(day.temperature?.highF)}°</Text>
                <Text style={s.low}>{Math.round(day.temperature?.lowF)}°</Text>
              </View>

              <View style={s.details}>
                <Text style={s.detail}>💧 {day.precipitation?.probabilityPct || 0}%</Text>
                <Text style={s.detail}>💨 {day.wind?.direction} {day.wind?.speedMph}mph</Text>
                <Text style={s.detail}>☀️ UV {day.uvIndex || "—"}</Text>
                <Text style={s.detail}>〰️ {day.humidityPct || "—"}%</Text>
              </View>
            </View>
          );
        })}

        {!forecast && !loading && (
          <Text style={s.noSignal}>No signal. Check your API key in Command Center.</Text>
        )}
      </ScrollView>

      <BottomNav active="forecast" onNav={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 16 },

  pills: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4, paddingBottom: 8, flexWrap: "wrap" },
  srcLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 0.5 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 4 },
  pillText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },
  pillLive: { borderColor: COLORS.greenBright },
  pillLiveText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.greenBright, fontWeight: "700" },

  card: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, backgroundColor: COLORS.surface, marginBottom: 8 },
  cardToday: { borderColor: COLORS.gold, backgroundColor: "rgba(200,168,50,0.05)" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dayText: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "800", letterSpacing: 0.5, color: COLORS.text },
  badge: { backgroundColor: COLORS.gold, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3 },
  badgeText: { fontFamily: FONTS.mono, fontSize: 8, fontWeight: "800", color: COLORS.bg },
  desc: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, marginTop: 2 },
  icon: { fontSize: 28 },

  temps: { flexDirection: "row", alignItems: "baseline", marginTop: 6 },
  high: { fontFamily: FONTS.mono, fontSize: 24, fontWeight: "700", color: COLORS.text },
  low: { fontFamily: FONTS.mono, fontSize: 16, color: COLORS.text2, marginLeft: 6 },

  details: { flexDirection: "row", gap: 10, marginTop: 6 },
  detail: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },

  noSignal: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text2, textAlign: "center", padding: 24, fontStyle: "italic" },
});
