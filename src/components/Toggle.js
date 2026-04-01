import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { COLORS } from "../theme";

export default function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity
      style={[s.track, value && s.trackOn]}
      onPress={() => onToggle(!value)}
      activeOpacity={0.8}
    >
      <View style={[s.thumb, value && s.thumbOn]} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  track: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: COLORS.green },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.text,
  },
  thumbOn: { transform: [{ translateX: 18 }] },
});
