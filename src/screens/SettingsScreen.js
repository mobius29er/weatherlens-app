import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Linking, Platform } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS, TEXT_SCALE_OPTIONS, useTextScale } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";
import Toggle from "../components/Toggle";

export default function SettingsScreen({ onNav, subscription, location }) {
  const { preference, setPreference, fs } = useTextScale();
  const [tempUnit, setTempUnit] = useState("F");
  const [forecastDays, setForecastDays] = useState(16);
  const [scanline, setScanline] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);
  const [dailyBrief, setDailyBrief] = useState(false);
  const [gps, setGps] = useState(false);

  const planLabel = subscription?.plan === "annual" ? "Annual" : subscription?.plan === "lifetime" ? "Lifetime" : "Monthly";

  const openManageSub = () => {
    const url = Platform.select({
      ios: "https://apps.apple.com/account/subscriptions",
      android: "https://play.google.com/store/account/subscriptions",
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <ScreenHeader title="COMMAND CENTER" onBack={() => onNav("home")} />

        {/* Subscription */}
        <Text style={s.sectionLabel}>━━ YOUR PLAN ━━</Text>
        <View style={s.card}>
          <View style={s.planRow}>
            <View>
              <Text style={s.planName}>☢️ {planLabel || "Premium"}</Text>
              <Text style={s.planStatus}>Active</Text>
            </View>
            {subscription?.plan !== "lifetime" && (
              <Pressable style={s.manageBtn} onPress={openManageSub}>
                <Text style={s.manageBtnText}>MANAGE</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* WeatherLens API Promo */}
        <Text style={s.sectionLabel}>━━ FOR DEVELOPERS ━━</Text>
        <View style={s.promoCard}>
          <Text style={s.promoTitle}>⚡ WEATHERLENS API</Text>
          <Text style={s.promoTagline}>Build your own weather apps with our data</Text>
          <View style={s.promoBullets}>
            <Text style={s.promoBullet}>✦ 16-day blended forecasts (NWS + Open-Meteo)</Text>
            <Text style={s.promoBullet}>✦ Climate normals & accuracy metrics</Text>
            <Text style={s.promoBullet}>✦ Historical weather data</Text>
            <Text style={s.promoBullet}>✦ Free tier: 5,000 requests/day</Text>
          </View>
          <Pressable
            style={s.promoBtn}
            onPress={() => Linking.openURL("https://weatherlens.dev")}
          >
            <Text style={s.promoBtnText}>EXPLORE THE API →</Text>
          </Pressable>
        </View>

        {/* Location */}
        <Text style={s.sectionLabel}>━━ LOCATION ━━</Text>
        <View style={s.card}>
          <SettingRow label="Use Device GPS" right={<Toggle value={gps} onChange={setGps} />} />
          <SettingRow label="Default Location" value={location?.name || "Denver, CO"} border />
          <SettingRow label="Coordinates" value={location ? `${location.lat.toFixed(4)}°N, ${Math.abs(location.lon).toFixed(4)}°W` : "39.7392°N, 104.9903°W"} border />
        </View>

        {/* Display */}
        <Text style={s.sectionLabel}>━━ DISPLAY ━━</Text>
        <View style={s.card}>
          <View style={[s.settingRow]}>
            <Text style={s.settingLabel}>Temp Unit</Text>
            <View style={s.pills}>
              <Pressable
                style={[s.pill, tempUnit === "F" && s.pillActive]}
                onPress={() => setTempUnit("F")}
              >
                <Text style={[s.pillText, tempUnit === "F" && s.pillTextActive]}>°F</Text>
              </Pressable>
              <Pressable
                style={[s.pill, tempUnit === "C" && s.pillActive]}
                onPress={() => setTempUnit("C")}
              >
                <Text style={[s.pillText, tempUnit === "C" && s.pillTextActive]}>°C</Text>
              </Pressable>
            </View>
          </View>
          <View style={[s.settingRow, s.settingBorder]}>
            <Text style={s.settingLabel}>Forecast Range</Text>
            <View style={s.pills}>
              {[7, 14, 16].map((d) => (
                <Pressable
                  key={d}
                  style={[s.pill, forecastDays === d && s.pillActive]}
                  onPress={() => setForecastDays(d)}
                >
                  <Text style={[s.pillText, forecastDays === d && s.pillTextActive]}>{d}d</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <SettingRow label="Scanline Effect" right={<Toggle value={scanline} onChange={setScanline} />} border />
          <View style={[s.settingRow, s.settingBorder]}>
            <Text style={s.settingLabel}>Text Size</Text>
            <View style={s.pills}>
              {TEXT_SCALE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[s.pill, preference === opt.value && s.pillActive]}
                  onPress={() => setPreference(opt.value)}
                >
                  <Text style={[s.pillText, preference === opt.value && s.pillTextActive]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={[s.settingRow, s.settingBorder]}>
            <Text style={[s.settingLabel, { fontSize: fs(12) }]}>Aa — Preview text at current size</Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={s.sectionLabel}>━━ NOTIFICATIONS ━━</Text>
        <View style={s.card}>
          <SettingRow label="Weather Event Alerts" right={<Toggle value={eventAlerts} onChange={setEventAlerts} />} />
          <SettingRow label="Daily Briefing" right={<Toggle value={dailyBrief} onChange={setDailyBrief} />} border />
        </View>

        {/* About */}
        <Text style={s.sectionLabel}>━━ ABOUT ━━</Text>
        <View style={s.card}>
          <SettingRow label="Version" value="1.0.0-alpha" />
          <SettingRow label="API" value="weatherlens.dev/api/v1" border />
          <SettingRow label="Data Sources" value="NWS · Open-Meteo" border />
        </View>

        <Text style={s.footer}>WEATHERLENS · HYPERLOCAL WEATHER INTELLIGENCE</Text>
      </ScrollView>

      <BottomNav active="settings" onNav={onNav} />
    </View>
  );
}

function SettingRow({ label, value, right, border }) {
  return (
    <View style={[s.settingRow, border && s.settingBorder]}>
      <Text style={s.settingLabel}>{label}</Text>
      {right || <Text style={s.settingValue}>{value}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: "700", letterSpacing: 1, color: COLORS.text2,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },

  card: { marginHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface, marginBottom: 4 },

  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  planName: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "700", color: COLORS.gold, letterSpacing: 0.5 },
  planStatus: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.greenBright, marginTop: 2 },
  manageBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  manageBtnText: { fontFamily: FONTS.mono, fontSize: 9, fontWeight: "700", color: COLORS.text2, letterSpacing: 0.5 },

  promoCard: { marginHorizontal: 12, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 8, backgroundColor: COLORS.surface2, padding: 14, marginBottom: 4 },
  promoTitle: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "900", color: COLORS.gold, letterSpacing: 1, marginBottom: 4 },
  promoTagline: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text2, marginBottom: 10 },
  promoBullets: { marginBottom: 12 },
  promoBullet: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.text, lineHeight: 20 },
  promoBtn: { backgroundColor: COLORS.gold, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  promoBtnText: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", color: COLORS.bg, letterSpacing: 0.5 },

  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10 },
  settingBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  settingLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text },
  settingValue: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2 },

  pills: { flexDirection: "row", gap: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  pillText: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "600", color: COLORS.text2 },
  pillTextActive: { color: COLORS.bg },

  footer: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, textAlign: "center", marginVertical: 20, letterSpacing: 1 },
});
