import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import Text from "../components/ScaledText";
import { COLORS, FONTS } from "../theme";
import { SEVERITY_COLORS } from "../theme";
import StatusBar from "../components/Header";
import BottomNav from "../components/BottomNav";
import { EVENT_FILTERS, RADIUS_OPTIONS, mapNWSAlert, extractStateCode, getAreaForRadius } from "../data";
import { getNWSAlerts } from "../api";

export default function EventsScreen({ location, onNav }) {
  const [filter, setFilter] = useState(0);
  const [radius, setRadius] = useState(1);         // default 50mi (state-level)
  const [searchText, setSearchText] = useState("");  // user-typed search location
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive state code from search text or location
  const activeLocation = searchText.trim() || location?.name || "";
  const stateCode = extractStateCode(activeLocation);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const area = getAreaForRadius(stateCode, radius);
      let raw;
      if (radius === 0 && location?.lat != null) {
        // 25mi → point query (narrow)
        raw = await getNWSAlerts({ lat: location.lat, lon: location.lon });
        // fall back to state if point returns nothing
        if (raw.length === 0 && stateCode) {
          raw = await getNWSAlerts({ area: stateCode });
        }
      } else if (area) {
        raw = await getNWSAlerts({ area });
      } else {
        // nationwide
        raw = await getNWSAlerts();
      }
      setEvents(raw.map(mapNWSAlert));
    } catch (e) {
      console.warn("Events fetch error:", e);
      setError("Failed to load alerts");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [stateCode, radius, location]);

  // Fetch when screen mounts or radius/search changes
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = filter === 0
    ? events
    : events.filter((e) => {
        const types = ["", "rain", "storm", "snow", "wind", "fog"];
        return e.type.includes(types[filter]) || types[filter] === "";
      });

  const scopeLabel = radius === 4 ? "Nationwide" : stateCode ? stateCode : "Local";

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <StatusBar />
        <Text style={s.title}>⚡ EVENT SCANNER</Text>

        {/* Search bar */}
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={location?.name || "Enter state or city, ST"}
            placeholderTextColor={COLORS.text2}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={fetchAlerts}
          />
          <TouchableOpacity style={s.scanBtn} onPress={fetchAlerts}>
            <Text style={s.scanIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {EVENT_FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[s.filterPill, filter === i && s.filterActive]}
              onPress={() => setFilter(i)}
            >
              <Text style={[s.filterText, filter === i && s.filterActiveText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Radius */}
        <View style={s.radiusRow}>
          <Text style={s.radiusLabel}>RADIUS:</Text>
          {RADIUS_OPTIONS.map((r, i) => (
            <TouchableOpacity
              key={r}
              style={[s.radiusPill, radius === i && s.radiusActive]}
              onPress={() => setRadius(i)}
            >
              <Text style={[s.radiusText, radius === i && s.radiusActiveText]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.count}>
          {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "alert" : "alerts"} active`} · {scopeLabel} · NWS data
        </Text>

        {loading && (
          <View style={s.emptyCard}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={s.emptyText}>Scanning for events…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>⚠️</Text>
            <Text style={s.emptyTitle}>FETCH ERROR</Text>
            <Text style={s.emptyText}>{error}</Text>
          </View>
        )}

        {!loading && !error && filtered.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>✓</Text>
            <Text style={s.emptyTitle}>ALL CLEAR</Text>
            <Text style={s.emptyText}>No active weather alerts for {scopeLabel}.</Text>
          </View>
        )}

        {/* Event cards */}
        {!loading && filtered.map((ev) => (
          <TouchableOpacity
            key={ev.id}
            style={s.card}
            onPress={() => onNav("eventDetail", ev)}
            activeOpacity={0.7}
          >
            <Text style={s.cardIcon}>{ev.icon}</Text>
            <View style={s.cardBody}>
              <Text style={s.cardName}>{ev.name}</Text>
              <View style={s.cardMeta}>
                {ev.distance != null && <Text style={s.dist}>● {ev.distance} mi {ev.direction}</Text>}
                <Text style={s.eta}>{ev.eta}</Text>
                <View style={[s.sevBadge, { backgroundColor: SEVERITY_COLORS[ev.severity] || COLORS.text2 }]}>
                  <Text style={s.sevText}>{ev.severity}</Text>
                </View>
              </View>
              <Text style={s.cardLoc}>{ev.location} · {ev.detail}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav active="events" onNav={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  title: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: "900", letterSpacing: 2, color: COLORS.text, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },

  searchRow: { flexDirection: "row", gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontFamily: FONTS.mono, fontSize: 12, fontWeight: "600", color: COLORS.gold2 },
  scanBtn: { width: 38, backgroundColor: COLORS.gold, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  scanIcon: { fontSize: 16 },

  filterRow: { paddingHorizontal: 16, paddingBottom: 6 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border2, borderRadius: 14, marginRight: 4 },
  filterActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterText: { fontFamily: FONTS.mono, fontSize: 9, fontWeight: "700", letterSpacing: 0.5, color: COLORS.text2 },
  filterActiveText: { color: COLORS.bg },

  radiusRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 6 },
  radiusLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, letterSpacing: 0.5 },
  radiusPill: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  radiusActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  radiusText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },
  radiusActiveText: { color: COLORS.bg, fontWeight: "700" },

  count: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, paddingHorizontal: 16, paddingBottom: 8 },

  card: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, padding: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginBottom: 6 },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardName: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "700", color: COLORS.text },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  dist: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.greenBright, fontWeight: "600" },
  eta: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2 },
  sevBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3 },
  sevText: { fontFamily: FONTS.mono, fontSize: 8, fontWeight: "800", letterSpacing: 0.5, color: COLORS.white },
  cardLoc: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.text2, marginTop: 2 },
  chevron: { fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text2 },

  emptyCard: { alignItems: "center", marginHorizontal: 12, padding: 32, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  emptyIcon: { fontSize: 36, color: COLORS.greenBright, marginBottom: 8 },
  emptyTitle: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: "900", letterSpacing: 2, color: COLORS.greenBright },
  emptyText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.text2, marginTop: 4, textAlign: "center" },
});
