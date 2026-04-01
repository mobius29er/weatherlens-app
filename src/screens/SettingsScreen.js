import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Linking } from "react-native";
import { COLORS, FONTS } from "../theme";
import StatusBar, { ScreenHeader } from "../components/Header";
import BottomNav from "../components/BottomNav";
import Toggle from "../components/Toggle";
import { getApiKey, setApiKey } from "../api";

export default function SettingsScreen({ onNav }) {
  const [key, setKey] = useState(getApiKey());
  const [editing, setEditing] = useState(false);
  const [tempUnit, setTempUnit] = useState("F");
  const [forecastDays, setForecastDays] = useState(16);
  const [scanline, setScanline] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);
  const [dailyBrief, setDailyBrief] = useState(false);
  const [gps, setGps] = useState(false);

  const masked = key ? key.substring(0, 8) + "••••••••" + key.slice(-4) : "No key set";

  const saveKey = () => {
    setApiKey(key);
    setEditing(false);
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <ScreenHeader title="COMMAND CENTER" onBack={() => onNav("home")} />

        {/* API Key */}
        <Text style={s.sectionLabel}>━━ API KEY ━━</Text>
        <View style={s.card}>
          <Text style={s.label}>Your WeatherLens Key</Text>
          {editing ? (
            <View style={s.editRow}>
              <TextInput
                style={s.input}
                value={key}
                onChangeText={setKey}
                placeholder="wl_live_..."
                placeholderTextColor={COLORS.text2}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable style={s.smallBtn} onPress={saveKey}>
                <Text style={s.smallBtnText}>SAVE</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditing(true)}>
              <Text style={s.keyText}>{masked}</Text>
              <Text style={s.hint}>Tap to edit</Text>
            </Pressable>
          )}
        </View>

        {/* Usage */}
        <View style={s.card}>
          <View style={s.usageHeader}>
            <Text style={s.label}>Today's Usage</Text>
            <Text style={s.usageCount}>— / 5,000</Text>
          </View>
          <View style={s.usageBar}>
            <View style={[s.usageFill, { width: "0%" }]} />
          </View>
          <Text style={s.usageHint}>STARTER PLAN · 60 req/min</Text>
        </View>

        <Pressable style={s.getKeyBtn} onPress={() => Linking.openURL("https://weatherlens.dev/pricing")}>
          <Text style={s.getKeyText}>⚡ GET YOUR OWN API KEY →</Text>
        </Pressable>

        {/* Location */}
        <Text style={s.sectionLabel}>━━ LOCATION ━━</Text>
        <View style={s.card}>
          <SettingRow label="Use Device GPS" right={<Toggle value={gps} onChange={setGps} />} />
          <SettingRow label="Default Location" value="Denver, CO" border />
          <SettingRow label="Coordinates" value="39.74°N, 104.99°W" border />
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

  label: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "600", color: COLORS.text2, letterSpacing: 0.5 },
  keyText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.gold, marginTop: 6 },
  hint: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, marginTop: 4 },

  editRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  input: { flex: 1, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  smallBtn: { backgroundColor: COLORS.green, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, justifyContent: "center" },
  smallBtnText: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: "700", color: "#fff" },

  usageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, paddingBottom: 4 },
  usageCount: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "700", color: COLORS.text },
  usageBar: { height: 6, backgroundColor: COLORS.bg, borderRadius: 3, marginHorizontal: 10 },
  usageFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
  usageHint: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, padding: 10, paddingTop: 4 },

  getKeyBtn: { marginHorizontal: 12, marginVertical: 8, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 8, alignItems: "center" },
  getKeyText: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: "700", color: COLORS.gold, letterSpacing: 0.5 },

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
