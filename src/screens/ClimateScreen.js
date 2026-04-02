import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";
import { MONTHS } from "../data";

export default function ClimateScreen({ location, climate, monthlyClimate, todayTemp, onNav }) {
  const now = new Date();
  const cl = climate || null;
  const curMonth = now.getMonth();
  const curMonthData = monthlyClimate?.[curMonth];

  // Use climate API data if available, otherwise fall back to historical monthly
  const displayHighF = cl?.temperature?.highF ?? curMonthData?.avgHighF;
  const displayLowF = cl?.temperature?.lowF ?? curMonthData?.avgLowF;
  const displayPrecip = cl?.precipitation?.avgInchesPerDay ?? curMonthData?.avgPrecipIn;

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <ScreenHeader title="CLIMATE NORMALS" right={location.name} onBack={() => onNav("home")} />

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>{MONTHS[now.getMonth()]} {now.getDate()} · {cl ? "CLIMATE NORMAL" : "HISTORICAL AVERAGE"}</Text>
          <View style={s.heroNums}>
            <View style={s.heroCol}>
              <Text style={s.big}>{displayHighF != null ? Math.round(displayHighF) + "°" : "—"}</Text>
              <Text style={s.heroSmall}>AVG HIGH</Text>
            </View>
            <View style={s.heroCol}>
              <Text style={s.big}>{displayLowF != null ? Math.round(displayLowF) + "°" : "—"}</Text>
              <Text style={s.heroSmall}>AVG LOW</Text>
            </View>
            <View style={s.heroCol}>
              <Text style={s.big}>{displayPrecip != null ? displayPrecip.toFixed(2) + '"' : "—"}</Text>
              <Text style={s.heroSmall}>AVG PRECIP</Text>
            </View>
          </View>
          {displayHighF != null && todayTemp != null && (
            <View style={s.deltaBadge}>
              <Text style={s.deltaText}>
                {todayTemp >= displayHighF ? "↑" : "↓"} Today is {todayTemp >= displayHighF ? "+" : ""}{Math.round(todayTemp - displayHighF)}°F {todayTemp >= displayHighF ? "above" : "below"} normal
              </Text>
            </View>
          )}
        </View>

        {/* Chart */}
        <Text style={s.sectionLabel}>━━ MONTHLY TEMPERATURE PROFILE ━━</Text>
        <View style={s.chart}>
          <Text style={s.chartLabel}>AVG HIGH / LOW BY MONTH (°F) · OBSERVED DATA</Text>
          <View style={s.bars}>
            {MONTHS.map((m, i) => {
              const md = monthlyClimate?.[i];
              const avgH = md ? md.avgHighF * 0.8 : 0;
              const avgL = md ? md.avgLowF * 0.6 : 0;
              const isCurrent = i === curMonth;
              return (
                <View key={m} style={s.barGroup}>
                  <View style={s.barCols}>
                    {md ? (
                      <>
                        <View style={[s.bar, s.barHigh, { height: Math.max(avgH, 4) }]} />
                        <View style={[s.bar, s.barLow, { height: Math.max(avgL, 4) }]} />
                        {isCurrent && <View style={[s.bar, s.barNow, { height: Math.max(avgH + 5, 4) }]} />}
                      </>
                    ) : (
                      <View style={[s.bar, { height: 4, backgroundColor: COLORS.border }]} />
                    )}
                  </View>
                  <Text style={s.barLabel}>{m.charAt(0)}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.dot, s.dotHigh]} /><Text style={s.legendText}>Avg High</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, s.dotLow]} /><Text style={s.legendText}>Avg Low</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, s.dotNow]} /><Text style={s.legendText}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <Text style={s.sectionLabel}>━━ CLIMATE DETAILS · {MONTHS[now.getMonth()]} {now.getDate()} ━━</Text>
        <View style={s.detailCard}>
          <DetailRow label="Avg Precip" value={displayPrecip != null ? `${displayPrecip.toFixed(3)} in` : "—"} />
          <DetailRow label="Avg Precip Hours" value={cl?.precipitation?.avgHoursPerDay != null ? `${cl.precipitation.avgHoursPerDay.toFixed(1)} hrs` : "—"} border />
          <DetailRow label="Avg Wind" value={cl?.wind?.avgMph != null ? `${cl.wind.avgMph.toFixed(1)} mph` : "—"} border />
          <DetailRow label="Avg Humidity" value={cl?.humidityPct != null ? `${cl.humidityPct}%` : "—"} border />
          <DetailRow label="Avg UV Index" value={cl?.uvIndex != null ? `${cl.uvIndex.toFixed(1)}` : "—"} border />
          <DetailRow label="Data Source" value={cl ? "Climate API" : monthlyClimate ? "Historical Obs" : "—"} valueStyle={s.sourceLink} border />
          {curMonthData && <DetailRow label="Samples" value={`${curMonthData.samples} days`} border />}
        </View>
      </ScrollView>

      <BottomNav active="climate" onNav={onNav} />
    </View>
  );
}

function DetailRow({ label, value, valueStyle, border }) {
  return (
    <View style={[s.detailRow, border && s.detailBorder]}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={[s.detailVal, valueStyle]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  hero: { marginHorizontal: 12, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, alignItems: "center" },
  heroLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 1, marginBottom: 12 },
  heroNums: { flexDirection: "row", gap: 24 },
  heroCol: { alignItems: "center" },
  big: { fontFamily: FONTS.mono, fontSize: 28, fontWeight: "700", color: COLORS.text },
  heroSmall: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, letterSpacing: 0.5, marginTop: 2 },
  deltaBadge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14, backgroundColor: "rgba(74,138,74,0.2)" },
  deltaText: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "600", color: COLORS.greenBright },

  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: "700", letterSpacing: 1, color: COLORS.text2,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },

  chart: { marginHorizontal: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface },
  chartLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 0.5, marginBottom: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 2, paddingHorizontal: 4 },
  barGroup: { flex: 1, alignItems: "center" },
  barCols: { flexDirection: "row", alignItems: "flex-end", gap: 1 },
  bar: { flex: 1, minWidth: 4, borderTopLeftRadius: 2, borderTopRightRadius: 2, minHeight: 4 },
  barHigh: { backgroundColor: COLORS.orange },
  barLow: { backgroundColor: COLORS.gold },
  barNow: { backgroundColor: COLORS.text2 },
  barLabel: { fontFamily: FONTS.mono, fontSize: 7, color: COLORS.text2, marginTop: 4 },

  legend: { flexDirection: "row", gap: 12, marginTop: 10, paddingLeft: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  dotHigh: { backgroundColor: COLORS.orange },
  dotLow: { backgroundColor: COLORS.gold },
  dotNow: { backgroundColor: COLORS.text2 },
  legendText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },

  detailCard: { marginHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface },
  detailRow: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  detailBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  detailLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2 },
  detailVal: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", color: COLORS.text },
  sourceLink: { color: COLORS.greenBright },
});
