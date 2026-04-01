import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreenModule from "expo-splash-screen";
import { COLORS } from "./src/theme";
import { getForecast, getClimate, getAccuracy } from "./src/api";
import { DEFAULT_LOCATION, getWeatherIcon } from "./src/data";

import SplashScreen from "./src/screens/SplashScreen";
import OnboardScreen from "./src/screens/OnboardScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ForecastScreen from "./src/screens/ForecastScreen";
import EventsScreen from "./src/screens/EventsScreen";
import EventDetailScreen from "./src/screens/EventDetailScreen";
import ClimateScreen from "./src/screens/ClimateScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

SplashScreenModule.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [screen, setScreen] = useState("splash");
  const [location] = useState(DEFAULT_LOCATION);
  const [forecast, setForecast] = useState(null);
  const [climate, setClimate] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreenModule.hideAsync();
  }, [fontsLoaded]);

  // Fetch data when entering main screens
  useEffect(() => {
    if (screen === "home" && !forecast) {
      setLoading(true);
      Promise.allSettled([
        getForecast(location.lat, location.lon, 16),
        getClimate(location.lat, location.lon),
        getAccuracy(location.lat, location.lon),
      ]).then(([fc, cl, ac]) => {
        if (fc.status === "fulfilled") setForecast(fc.value);
        if (cl.status === "fulfilled") setClimate(cl.value);
        if (ac.status === "fulfilled") setAccuracy(ac.value);
        setLoading(false);
      });
    }
  }, [screen, forecast, location]);

  const navigate = useCallback((target, data) => {
    if (target === "eventDetail") {
      setSelectedEvent(data);
      setScreen("eventDetail");
    } else {
      setScreen(target);
    }
  }, []);

  if (!fontsLoaded) return null;

  // Build screen props
  const todayFc = forecast?.forecast?.[0];
  const todayTemp = todayFc ? todayFc.high_f : 74;
  const todayIcon = todayFc ? getWeatherIcon(todayFc.wmo_code) : { emoji: "☀️", label: "Clear" };

  return (
    <View style={s.root} onLayout={onLayoutRootView}>
      {screen === "splash" && <SplashScreen onNav={navigate} />}
      {screen === "onboard" && <OnboardScreen onNav={navigate} />}
      {screen === "home" && (
        <HomeScreen
          location={location}
          forecast={forecast}
          climate={climate}
          accuracy={accuracy}
          todayTemp={todayTemp}
          todayIcon={todayIcon}
          loading={loading}
          onNav={navigate}
        />
      )}
      {screen === "forecast" && (
        <ForecastScreen
          location={location}
          forecast={forecast}
          onNav={navigate}
        />
      )}
      {screen === "events" && (
        <EventsScreen
          location={location}
          onNav={navigate}
        />
      )}
      {screen === "eventDetail" && (
        <EventDetailScreen
          event={selectedEvent}
          onNav={navigate}
        />
      )}
      {screen === "climate" && (
        <ClimateScreen
          location={location}
          climate={climate}
          todayTemp={todayTemp}
          onNav={navigate}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen onNav={navigate} />
      )}

      {loading && screen === "home" && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,30,20,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
