import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../theme";

export default function StatusBar() {
  return (
    <View style={s.bar}>
      <Text style={s.text}>9:41</Text>
      <Text style={s.text}>▲ ▲ ▲ WiFi ▮▮▮</Text>
    </View>
  );
}

export function ScreenHeader({ title, right, onBack }) {
  return (
    <View style={s.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
      )}
      <Text style={s.headerTitle}>{title}</Text>
      {right && <Text style={s.headerRight}>{right}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  text: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: { paddingRight: 4 },
  backText: { fontSize: 24, color: COLORS.text, fontFamily: FONTS.mono },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.text,
  },
  headerRight: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.text2,
  },
});
