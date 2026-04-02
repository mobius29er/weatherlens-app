import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTextScale } from "../theme";

/**
 * Drop-in Text replacement that auto-scales fontSize based on:
 *  - In-app text size preference (Small / Default / Large / Extra Large)
 *  - OS-level accessibility font scale
 *  - Screen width factor (tablets vs small phones)
 */
export default function ScaledText({ style, ...props }) {
  const { fs } = useTextScale();
  const flat = StyleSheet.flatten(style);
  const scaled = flat?.fontSize ? [style, { fontSize: fs(flat.fontSize) }] : style;
  return <RNText {...props} style={scaled} />;
}
