import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Text from "./ScaledText";
import { COLORS, FONTS } from "../theme";

export default function StatusBar() {
  return <View style={s.spacer} />;
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
  spacer: {
    paddingTop: 8,
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
