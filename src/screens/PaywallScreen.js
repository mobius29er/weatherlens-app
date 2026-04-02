import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import Purchases from "react-native-purchases";
import { COLORS, FONTS } from "../theme";

const PLANS = [
  {
    id: "monthly",
    label: "MONTHLY",
    price: "$4.99",
    period: "/mo",
    trial: "7-day free trial",
    badge: null,
    effective: null,
  },
  {
    id: "annual",
    label: "ANNUAL",
    price: "$29.99",
    period: "/yr",
    trial: "7-day free trial",
    badge: "BEST VALUE",
    effective: "≈ $2.50/mo",
  },
  {
    id: "lifetime",
    label: "LIFETIME",
    price: "$99.99",
    period: "",
    trial: null,
    badge: "ONE TIME",
    effective: "Pay once, forever",
  },
];

const PRODUCT_IDS = {
  monthly: "weatherlens_monthly_499",
  annual: "weatherlens_annual_2999",
  lifetime: "weatherlens_lifetime_9999",
};

export default function PaywallScreen({ onSubscribe, onRestore }) {
  const [selected, setSelected] = useState("annual");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.find(
        (p) => p.product.identifier === PRODUCT_IDS[selected]
      );
      if (pkg) {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        if (customerInfo.entitlements.active["premium"]) {
          onSubscribe(selected);
          return;
        }
      }
      setError("Unable to complete purchase. Please try again.");
    } catch (e) {
      if (!e.userCancelled) {
        setError("Purchase failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      const success = await onRestore();
      if (!success) {
        setError("No active subscription found.");
      }
    } catch {
      setError("Restore failed. Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.emoji}>🔭</Text>
        <Text style={s.title}>UNLOCK WEATHERLENS</Text>
        <Text style={s.subtitle}>FULL ACCESS TO HYPERLOCAL INTELLIGENCE</Text>

        {/* Features */}
        <View style={s.features}>
          {[
            "16-day multi-source forecasts",
            "Climate normals & accuracy metrics",
            "Severe weather event scanner",
            "Animated radar & proximity alerts",
          ].map((f) => (
            <Text key={f} style={s.feature}>
              ✦ {f}
            </Text>
          ))}
        </View>

        {/* Plan cards */}
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[s.planCard, selected === plan.id && s.planCardActive]}
            onPress={() => setSelected(plan.id)}
            activeOpacity={0.8}
          >
            <View style={s.planHeader}>
              <View style={s.planLeft}>
                <View
                  style={[
                    s.radio,
                    selected === plan.id && s.radioActive,
                  ]}
                >
                  {selected === plan.id && <View style={s.radioDot} />}
                </View>
                <Text
                  style={[
                    s.planLabel,
                    selected === plan.id && s.planLabelActive,
                  ]}
                >
                  {plan.label}
                </Text>
                {plan.badge && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{plan.badge}</Text>
                  </View>
                )}
              </View>
              <View style={s.planRight}>
                <Text
                  style={[
                    s.planPrice,
                    selected === plan.id && s.planPriceActive,
                  ]}
                >
                  {plan.price}
                  <Text style={s.planPeriod}>{plan.period}</Text>
                </Text>
              </View>
            </View>
            {(plan.trial || plan.effective) && (
              <View style={s.planMeta}>
                {plan.trial && <Text style={s.planTrial}>⚡ {plan.trial}</Text>}
                {plan.effective && (
                  <Text style={s.planEffective}>{plan.effective}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Error */}
        {error && <Text style={s.error}>{error}</Text>}

        {/* Subscribe button */}
        <TouchableOpacity
          style={[s.subBtn, loading && s.subBtnDisabled]}
          onPress={handleSubscribe}
          disabled={loading || restoring}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={s.subBtnText}>
              {selected === "lifetime"
                ? "▶ PURCHASE LIFETIME ACCESS"
                : "▶ START FREE TRIAL"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={s.restoreBtn}
          onPress={handleRestore}
          disabled={loading || restoring}
          activeOpacity={0.8}
        >
          {restoring ? (
            <ActivityIndicator color={COLORS.text2} size="small" />
          ) : (
            <Text style={s.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={s.legal}>
          {selected !== "lifetime"
            ? "Payment will be charged to your App Store or Google Play account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period."
            : "One-time purchase. No recurring charges."}
        </Text>
        <View style={s.legalLinks}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://weatherlens.dev/terms")}
          >
            <Text style={s.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={s.legalSep}>·</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://weatherlens.dev/privacy")}
          >
            <Text style={s.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontFamily: FONTS.mono,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.text2,
    marginBottom: 24,
    textAlign: "center",
  },
  features: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  feature: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 22,
  },

  // Plan cards
  planCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    padding: 14,
    marginBottom: 8,
  },
  planCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surface2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  planRight: { alignItems: "flex-end" },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderColor: COLORS.gold },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  planLabel: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.text2,
  },
  planLabelActive: { color: COLORS.text },
  badge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    fontWeight: "700",
    color: COLORS.bg,
    letterSpacing: 0.5,
  },
  planPrice: {
    fontFamily: FONTS.mono,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text2,
  },
  planPriceActive: { color: COLORS.gold },
  planPeriod: { fontSize: 11, fontWeight: "600" },
  planMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingLeft: 28,
  },
  planTrial: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.greenBright,
  },
  planEffective: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.text2,
  },

  // Error
  error: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.red,
    textAlign: "center",
    marginBottom: 8,
  },

  // Subscribe button
  subBtn: {
    width: "100%",
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  subBtnDisabled: { opacity: 0.6 },
  subBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.bg,
  },

  // Restore
  restoreBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  restoreText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.text2,
    textDecorationLine: "underline",
  },

  // Legal
  legal: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.text2,
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  legalLink: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.gold,
    textDecorationLine: "underline",
  },
  legalSep: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.text2,
  },
});
