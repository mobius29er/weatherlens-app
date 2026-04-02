import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";

export default function SplashScreen({ onEnter = () => {} }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={s.container}>
      <View style={s.art}>
        <Animated.Text style={[s.rays, { transform: [{ rotate }] }]}>
          ✦✧✦✧✦✧✦✧✦✧✦✧
        </Animated.Text>
        <Text style={s.character}>🔭</Text>
        <Text style={s.clouds}>☁️ ⛈️ ☁️</Text>
      </View>

      <Text style={s.title}>WEATHERLENS</Text>
      <Text style={s.sub}>YOUR ATOMIC AGE FORECAST COMPANION</Text>

      <TouchableOpacity style={[s.btn, s.btnGold]} onPress={onEnter} activeOpacity={0.8}>
        <Text style={s.btnGoldText}>▶ ENTER THE WASTELAND</Text>
      </TouchableOpacity>

      <Text style={s.powered}>
        POWERED BY WEATHERLENS.DEV · NWS + OPEN-METEO BLENDED
      </Text>
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
  },
  rays: {
    position: "absolute",
    fontSize: 48,
    opacity: 0.15,
    color: COLORS.gold,
  },
  character: { fontSize: 80 },
  clouds: { fontSize: 32, opacity: 0.5, marginTop: -10, letterSpacing: 8 },
  title: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 4,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 4,
  },
  sub: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.text2,
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
  btnGold: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  btnGoldText: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.bg,
  },
  powered: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.text2,
    letterSpacing: 1,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 14,
  },
});
