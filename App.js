import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreenModule from "expo-splash-screen";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { COLORS, TextScaleProvider } from "./src/theme";

// RevenueCat is native-only — stub on web
const Purchases = Platform.OS === "web"
  ? { configure: () => {}, getCustomerInfo: () => Promise.reject(), restorePurchases: () => Promise.reject() }
  : require("react-native-purchases").default;
import { getForecast, getClimate, getAccuracy, getHistorical, getNWSAlerts, getHourlyForecast } from "./src/api";
import { DEFAULT_LOCATION, getWeatherIcon, computeMonthlyAverages, mapNWSAlert } from "./src/data";

import SplashScreen from "./src/screens/SplashScreen";
import OnboardScreen from "./src/screens/OnboardScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
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
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [forecast, setForecast] = useState(null);
  const [climate, setClimate] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [monthlyClimate, setMonthlyClimate] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [hourlyData, setHourlyData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // In dev mode, bypass paywall entirely
  const isDev = __DEV__;

  // Initialize RevenueCat (native only)
  useEffect(() => {
    if (isDev || Platform.OS === "web") return;
    const apiKey = Platform.select({
      ios: Constants.expoConfig?.extra?.revenueCatApiKeyApple,
      android: Constants.expoConfig?.extra?.revenueCatApiKeyGoogle,
    });
    if (apiKey) {
      Purchases.configure({ apiKey });
    }
  }, [isDev]);

  // Request device location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setLocation({
            name: geo ? `${geo.city || geo.subregion}, ${geo.region}` : DEFAULT_LOCATION.name,
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
          });
        }
      } catch {
        // Location denied or failed — keep default
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreenModule.hideAsync();
  }, [fontsLoaded]);

  // Check subscription status — bypass in dev mode
  const checkSubscription = useCallback(async () => {
    if (isDev) {
      setSubscription({ plan: "dev" });
      return true;
    }
    try {
      const info = await Purchases.getCustomerInfo();
      if (info.entitlements.active["premium"]) {
        setSubscription({ plan: "active" });
        return true;
      }
    } catch {
      // RevenueCat unavailable
    }
    return false;
  }, [isDev]);

  // Fetch data when entering main screens
  useEffect(() => {
    if (screen === "home" && !forecast) {
      setLoading(true);
      const today = new Date();
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const fmt = (d) => d.toISOString().split("T")[0];

      Promise.allSettled([
        getForecast(location.lat, location.lon, 16),
        getClimate(location.lat, location.lon, fmt(today)),
        getAccuracy(location.lat, location.lon),
        getHistorical(location.lat, location.lon, fmt(yearAgo), fmt(today)),
        getNWSAlerts({ lat: location.lat, lon: location.lon }),
        getHourlyForecast(location.lat, location.lon, 16),
      ]).then(([fc, cl, ac, hist, nws, hourly]) => {
        if (fc.status === "fulfilled") setForecast(fc.value.forecast || []);
        else console.warn("Forecast fetch failed:", fc.reason?.message);
        if (cl.status === "fulfilled") {
          const arr = cl.value.climate || [];
          setClimate(arr.length ? arr[0] : null);
        }
        if (ac.status === "fulfilled") setAccuracy(ac.value);
        if (hist.status === "fulfilled") {
          setMonthlyClimate(computeMonthlyAverages(hist.value.data || []));
        }
        if (nws.status === "fulfilled") {
          setAlerts((nws.value || []).map(mapNWSAlert));
        }
        if (hourly.status === "fulfilled") setHourlyData(hourly.value);
        setLoading(false);
      });
    }
  }, [screen, forecast, location]);

  // Handle splash "Enter" — check subscription before routing
  const handleEnter = useCallback(async () => {
    const active = await checkSubscription();
    setScreen(active ? "home" : "onboard");
  }, [checkSubscription]);

  // Handle onboard completion — paywall if not subscribed
  const handleOnboardComplete = useCallback(async () => {
    const active = await checkSubscription();
    setScreen(active ? "home" : "paywall");
  }, [checkSubscription]);

  // Handle successful subscription
  const handleSubscribe = useCallback((planId) => {
    setSubscription({ plan: planId });
    setScreen("home");
  }, []);

  // Handle restore purchases
  const handleRestore = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      if (info.entitlements.active["premium"]) {
        setSubscription({ plan: "restored" });
        setScreen("home");
        return true;
      }
    } catch {
      // Restore failed
    }
    return false;
  }, []);

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
  const todayFc = forecast?.[0];
  const todayTemp = todayFc ? todayFc.temperature?.avgF || Math.round((todayFc.temperature?.highF + todayFc.temperature?.lowF) / 2) : null;
  const todayIcon = todayFc ? getWeatherIcon(todayFc.conditions?.code) : { icon: "☀️", label: "Clear" };

  return (
    <TextScaleProvider>
    <View style={s.root} onLayout={onLayoutRootView}>
      {screen === "splash" && <SplashScreen onEnter={handleEnter} />}
      {screen === "onboard" && (
        <OnboardScreen
          onNext={handleOnboardComplete}
          onSkip={handleOnboardComplete}
        />
      )}
      {screen === "paywall" && (
        <PaywallScreen
          onSubscribe={handleSubscribe}
          onRestore={handleRestore}
        />
      )}
      {screen === "home" && (
        <HomeScreen
          location={location}
          forecast={forecast}
          climate={climate}
          accuracy={accuracy}
          todayTemp={todayTemp}
          todayIcon={todayIcon}
          hourlyData={hourlyData}
          loading={loading}
          onNav={navigate}
        />
      )}
      {screen === "forecast" && (
        <ForecastScreen
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
          todayFc={todayFc}
          onBack={() => setScreen("events")}
          onNav={navigate}
        />
      )}
      {screen === "climate" && (
        <ClimateScreen
          location={location}
          climate={climate}
          monthlyClimate={monthlyClimate}
          todayTemp={todayTemp}
          onNav={navigate}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen
          onNav={navigate}
          subscription={subscription}
          location={location}
        />
      )}

      {loading && screen === "home" && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      )}
    </View>
    </TextScaleProvider>
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
