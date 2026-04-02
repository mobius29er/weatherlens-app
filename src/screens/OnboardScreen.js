import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";

export default function OnboardScreen({ onNext, onSkip }) {
  return (
    <View style={s.container}>
      <View style={s.art}>
        <Text style={s.character}>🔭</Text>
      </View>

      <Text style={s.title}>HYPERLOCAL FORECASTING</Text>
      <Text style={s.desc}>
        Drop a pin anywhere on Earth. WeatherLens blends NWS precision with
        Open-Meteo global coverage — up to 16 days out, ML-corrected for accuracy.
      </Text>

      <TouchableOpacity style={[s.btn, s.btnGold]} onPress={onNext} activeOpacity={0.8}>
        <Text style={s.btnGoldText}>▶ NEXT TRANSMISSION</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.btnRed]} onPress={onSkip} activeOpacity={0.8}>
        <Text style={s.btnRedText}>SKIP BRIEFING</Text>
      </TouchableOpacity>

      <Text style={s.powered}>POWERED BY WEATHERLENS.DEV</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 24,
    paddingBottom: 32,
  },
  art: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 180,
  },
  character: { fontSize: 80 },
  title: {
    fontFamily: FONTS.mono,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  desc: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.text2,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  btn: {
    width: "85%",
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 8,
  },
  btnGold: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  btnGoldText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: COLORS.bg },
  btnRed: { backgroundColor: "transparent", borderColor: COLORS.red },
  btnRedText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: COLORS.red },
  powered: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.text2, letterSpacing: 1, marginTop: 12, textAlign: "center" },
});
