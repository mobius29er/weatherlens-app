import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../theme";

const TABS = [
  { id: "home", icon: "🏠", label: "HOME" },
  { id: "forecast", icon: "📅", label: "FORECAST" },
  { id: "events", icon: "🔍", label: "EVENTS" },
  { id: "climate", icon: "📊", label: "CLIMATE" },
  { id: "settings", icon: "⚙", label: "SETTINGS" },
];

export default function BottomNav({ active, onNav }) {
  return (
    <View style={s.bar}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={s.tab}
          onPress={() => onNav(t.id)}
          activeOpacity={0.7}
        >
          <Text style={s.icon}>{t.icon}</Text>
          <Text style={[s.label, active === t.id && s.active]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20, // safe area
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  icon: { fontSize: 16 },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: COLORS.text2,
    textTransform: "uppercase",
  },
  active: { color: COLORS.gold },
});
