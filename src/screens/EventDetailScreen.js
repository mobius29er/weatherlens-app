import React, { useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, Animated, Easing } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS, SEVERITY_COLORS } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function EventDetailScreen({ event, todayFc, onBack, onNav }) {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [sweep]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  if (!event) return null;

  const fc = todayFc || {};

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <ScreenHeader
          title="EVENT DETAIL"
          onBack={onBack}
          right={
            <View style={[s.sevBadge, { backgroundColor: SEVERITY_COLORS[event.severity] || COLORS.text2 }]}>
              <Text style={s.sevText}>{event.severity}</Text>
            </View>
          }
        />

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroIcon}>{event.icon}</Text>
          <Text style={s.heroName}>{event.name.toUpperCase()}</Text>
          <Text style={s.heroLoc}>{event.location}{event.detail ? ` · ${event.detail}` : ""}</Text>
        </View>

        {/* Stats grid — adapt to available data */}
        <View style={s.statsGrid}>
          {event.distance != null && (
            <View style={s.statCard}>
              <Text style={s.statVal}>{event.distance} mi</Text>
              <Text style={s.statLabel}>DISTANCE {event.direction || ""}</Text>
            </View>
          )}
          <View style={s.statCard}>
            <Text style={s.statVal}>{event.eta || "—"}</Text>
            <Text style={s.statLabel}>STATUS</Text>
          </View>
          {event.speed != null && (
            <View style={s.statCard}>
              <Text style={s.statVal}>{event.speed} mph</Text>
              <Text style={s.statLabel}>STORM SPEED</Text>
            </View>
          )}
          {event.urgency && (
            <View style={s.statCard}>
              <Text style={s.statVal}>{event.urgency}</Text>
              <Text style={s.statLabel}>URGENCY</Text>
            </View>
          )}
          {event.certainty && (
            <View style={s.statCard}>
              <Text style={s.statVal}>{event.certainty}</Text>
              <Text style={s.statLabel}>CERTAINTY</Text>
            </View>
          )}
          {event.precipProb != null && (
            <View style={s.statCard}>
              <Text style={s.statVal}>{event.precipProb}%</Text>
              <Text style={s.statLabel}>PRECIP PROB</Text>
            </View>
          )}
        </View>

        {/* Alert description (from NWS) */}
        {event.description && (
          <>
            <Text style={s.sectionLabel}>━━ ALERT DETAILS ━━</Text>
            <View style={s.dataCard}>
              <Text style={s.alertDesc}>{event.description}</Text>
            </View>
          </>
        )}

        {/* Radar */}
        <Text style={s.sectionLabel}>━━ RADAR POSITION ━━</Text>
        <View style={s.radar}>
          <View style={[s.ring, s.r1]} />
          <View style={[s.ring, s.r2]} />
          <View style={[s.ring, s.r3]} />
          <Animated.View style={[s.sweepLine, { transform: [{ rotate }] }]} />
          <Text style={s.radarYou}>◉</Text>
          <Text style={s.radarEvent}>⚡</Text>
        </View>
        <View style={s.legendRow}>
          <Text style={s.legendText}>◉ YOUR LOCATION</Text>
          <Text style={s.legendText}>  ·  </Text>
          <Text style={s.legendText}>⚡ STORM CELL</Text>
        </View>

        {/* Forecast data */}
        {fc.temperature && (
          <>
            <Text style={s.sectionLabel}>━━ FORECAST DATA · WEATHERLENS API ━━</Text>
            <View style={s.dataCard}>
              <View style={s.dataRow}>
                <Text style={s.dataLabel}>High Temp</Text>
                <Text style={s.dataVal}>{Math.round(fc.temperature?.highF || 0)}°F</Text>
              </View>
              {fc.precipitation?.amountIn != null && (
                <View style={[s.dataRow, s.dataRowBorder]}>
                  <Text style={s.dataLabel}>Precipitation</Text>
                  <Text style={s.dataVal}>{fc.precipitation.amountIn} in expected</Text>
                </View>
              )}
              {fc.wind?.speedMph != null && (
                <View style={[s.dataRow, s.dataRowBorder]}>
                  <Text style={s.dataLabel}>Wind</Text>
                  <Text style={s.dataVal}>{fc.wind.direction} {fc.wind.speedMph} mph</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav active="events" onNav={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  sevBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  sevText: { fontFamily: FONTS.mono, fontSize: 9, fontWeight: "800", letterSpacing: 0.5, color: COLORS.white },

  hero: { alignItems: "center", marginHorizontal: 12, padding: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroName: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: "900", letterSpacing: 2, color: COLORS.text },
  heroLoc: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, marginTop: 4, letterSpacing: 0.5 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  statCard: { width: "47%", alignItems: "center", padding: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface },
  statVal: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: "700", color: COLORS.gold2 },
  statLabel: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, letterSpacing: 0.5, marginTop: 2 },

  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: "700", letterSpacing: 1, color: COLORS.text2,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },

  radar: {
    width: 200, height: 200, borderRadius: 100, alignSelf: "center",
    backgroundColor: "rgba(74,138,74,0.08)", borderWidth: 1, borderColor: COLORS.green,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 1, borderColor: "rgba(74,138,74,0.25)" },
  r1: { width: "60%", height: "60%" },
  r2: { width: "85%", height: "85%" },
  r3: { width: "40%", height: "40%" },
  sweepLine: {
    position: "absolute", top: "50%", left: "50%",
    width: 100, height: 2, marginTop: -1, marginLeft: 0,
    backgroundColor: "rgba(74,138,74,0.7)",
    transformOrigin: "left center",
  },
  radarYou: { fontSize: 14, color: COLORS.greenBright },
  radarEvent: { position: "absolute", top: "28%", left: "62%", fontSize: 14 },

  legendRow: { flexDirection: "row", justifyContent: "center", paddingVertical: 4 },
  legendText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 0.5 },

  dataCard: { marginHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface },
  dataRow: { flexDirection: "row", justifyContent: "space-between", padding: 12 },
  dataRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  dataLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2 },
  dataVal: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", color: COLORS.gold2 },
  alertDesc: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text, lineHeight: 16, padding: 12 },
});
