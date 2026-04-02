# WeatherLens App — Production Launch Plan

> **Status:** Not Started  
> **Target Platforms:** iOS App Store + Google Play Store  
> **Pricing:** $4.99/mo · $29.99/yr · $99.99 lifetime (7-day free trial)  
> **Last Updated:** April 2, 2026

---

## Overview

WeatherLens is a retro atomic-age weather app (Expo SDK 54, React Native 0.81) that blends NWS + Open-Meteo forecast data via the WeatherLens API. The app is a functional prototype that needs: API key security, GPS location, in-app subscriptions, and store compliance before going live. The Settings screen will also serve as an advertising funnel for the WeatherLens API developer product at weatherlens.dev.

---

## Phase 1: API Key Security & EAS Build Setup

### 1.1 — Convert `app.json` → `app.config.js`
- [ ] Create `app.config.js` that exports the current `app.json` config as a JS object
- [ ] Enable reading `process.env` variables at build time
- [ ] Delete `app.json` after migration
- **Why:** Dynamic config is required to inject EAS secrets at build time

### 1.2 — Add App Identifiers
- [ ] Add `ios.bundleIdentifier: "dev.weatherlens.app"` to config
- [ ] Add `android.package: "dev.weatherlens.app"` to config
- [ ] Set initial `ios.buildNumber: "1"` and `android.versionCode: 1`
- **Why:** Required for App Store Connect and Google Play Console

### 1.3 — Create `eas.json` Build Profiles
- [ ] Create `eas.json` with three profiles:
  - `development` — simulator/emulator builds for local testing
  - `preview` — internal distribution builds for TestFlight / internal track
  - `production` — store submission builds
- [ ] Set `cli.version` and `build.production.autoIncrement` options

### 1.4 — Store API Key as EAS Secret
- [ ] Run: `eas secret:create --name WEATHERLENS_API_KEY --value <key> --scope project`
- [ ] Run: `eas secret:create --name REVENUECAT_API_KEY_APPLE --value <key> --scope project`
- [ ] Run: `eas secret:create --name REVENUECAT_API_KEY_GOOGLE --value <key> --scope project`
- [ ] Expose in `app.config.js` via `extra.weatherlensApiKey: process.env.WEATHERLENS_API_KEY`
- **Why:** Keys injected at build time, never committed to source

### 1.5 — Refactor `src/api.js`
- [ ] Remove hardcoded API key (`wl_live_b8c13d25...`)
- [ ] Remove `getApiKey()` and `setApiKey()` exports
- [ ] Install `expo-constants`
- [ ] Read key from `Constants.expoConfig.extra.weatherlensApiKey`
- [ ] Add fallback for local development (read from env or provide dev key mechanism)
- **File:** `src/api.js`

### 1.6 — Update Settings Screen (API Key → WeatherLens API Promo)
- [ ] Remove the API key editor (masked input, save button, usage meter)
- [ ] **Add WeatherLens API advertisement section** in its place:
  - Branded "WeatherLens API" banner/card with retro atomic styling
  - Tagline: "Build your own weather apps with our API"
  - Feature bullets: 16-day forecasts, climate normals, accuracy metrics, NWS + Open-Meteo blended data
  - Prominent **"Explore the API →"** button linking to `https://weatherlens.dev`
  - Pricing teaser: "Free tier: 5,000 requests/day"
  - The section should feel like a natural part of the app, not an aggressive ad
- **File:** `src/screens/SettingsScreen.js`

### 1.7 — Clean Up Splash & Onboard Screens
- [ ] **SplashScreen:** Remove "Get Free API Key" button (users don't need their own key)
- [ ] **OnboardScreen:** Remove direct API pricing links; optionally keep a subtle "Powered by WeatherLens API" footer
- **Files:** `src/screens/SplashScreen.js`, `src/screens/OnboardScreen.js`

### 1.8 — Git Hygiene
- [ ] Delete `.env.local` if it contains a real key
- [ ] Verify `.gitignore` covers `.env`, `.env.local`, `.env*.local`
- [ ] Add `eas.json` to version control (it contains no secrets)

### Phase 1 Verification
- [ ] `eas build --profile preview --platform ios` succeeds
- [ ] App launches and fetches forecast data using injected key
- [ ] No API key visible anywhere in app UI or source
- [ ] Settings screen shows WeatherLens API promo with working link

---

## Phase 2: GPS Location

### 2.1 — Install `expo-location`
- [ ] `npx expo install expo-location`
- [ ] Add plugin config to `app.config.js`
- [ ] Add `NSLocationWhenInUseUsageDescription` for iOS: "WeatherLens uses your location to provide hyper-local weather forecasts."
- [ ] Add Android fine/coarse location permissions

### 2.2 — Add Location Permission Flow
- [ ] In `App.js`, after splash, request foreground location permission
- [ ] If granted → use device coordinates for all API calls
- [ ] If denied → fall back to `DEFAULT_LAT`/`DEFAULT_LON` from `src/data.js` (Denver)
- [ ] Store permission state to avoid re-prompting every launch
- **File:** `App.js`

### 2.3 — Update Location Display
- [ ] Use `Location.reverseGeocodeAsync()` to get city/state name
- [ ] Show real location in Settings screen and Home screen header
- [ ] Keep Denver as the labeled fallback when permission denied
- **Files:** `src/screens/SettingsScreen.js`, `src/screens/HomeScreen.js`

### Phase 2 Verification
- [ ] App prompts for location on first launch
- [ ] Forecast data reflects actual user location
- [ ] Denying permission shows Denver data with a note
- [ ] Settings shows correct location name

---

## Phase 3: Subscriptions & Paywall (RevenueCat)

### Pricing Structure

| Tier | Price | Effective Monthly | Trial |
|------|-------|-------------------|-------|
| Monthly | $4.99/mo | $4.99 | 7-day free |
| Annual | $29.99/yr | $2.50 (~50% savings) | 7-day free |
| Lifetime | $99.99 | — | N/A |

> **Note:** Pricing is on the premium end for weather. Consider launching at $2.99/$19.99 to maximize early conversion, then raising with traction. Lifetime at $99.99 is fine as an early-adopter play.

### 3.1 — RevenueCat Dashboard Setup
- [ ] Create RevenueCat project
- [ ] Connect App Store Connect credentials
- [ ] Connect Google Play Console credentials
- [ ] Create entitlement: `premium`
- [ ] Create products:
  - `weatherlens_monthly_499` (auto-renewable, $4.99/mo)
  - `weatherlens_annual_2999` (auto-renewable, $29.99/yr)
  - `weatherlens_lifetime_9999` (non-consumable, $99.99)
- [ ] Create offering: `default` → attach all 3 products
- [ ] Configure 7-day free trial on monthly and annual

### 3.2 — App Store Connect Products
- [ ] Create subscription group: "WeatherLens Premium"
- [ ] Add monthly subscription ($4.99, 7-day free trial)
- [ ] Add annual subscription ($29.99, 7-day free trial)
- [ ] Add non-consumable IAP ($99.99 lifetime)
- [ ] Set up sandbox test accounts

### 3.3 — Google Play Console Products
- [ ] Create monthly subscription ($4.99, 7-day free trial)
- [ ] Create annual subscription ($29.99, 7-day free trial)
- [ ] Create one-time purchase ($99.99 lifetime)
- [ ] Set up license testing accounts

### 3.4 — Install & Initialize RevenueCat SDK
- [ ] `npx expo install react-native-purchases`
- [ ] Add RevenueCat plugin to `app.config.js`
- [ ] In `App.js`, call `Purchases.configure()` on mount with platform-specific API key (from EAS secrets)
- **File:** `App.js`

### 3.5 — Create Paywall Screen
- [ ] Create `src/screens/PaywallScreen.js`
- [ ] Design in retro atomic theme (gold/olive palette, SpaceMono font)
- [ ] Display all 3 pricing tiers with clear feature descriptions
- [ ] "7-Day Free Trial" badge on monthly and annual
- [ ] Highlight annual as "Best Value"
- [ ] "Restore Purchases" button (REQUIRED by Apple)
- [ ] Links to Terms of Service and Privacy Policy (REQUIRED by Apple for subscriptions)
- [ ] Subscription auto-renewal disclosure text (REQUIRED by Apple)
- **File:** `src/screens/PaywallScreen.js` (NEW)

### 3.6 — Add Subscription Gate
- [ ] In `App.js`, after splash: check `Purchases.getCustomerInfo()`
- [ ] If `premium` entitlement active → route to home
- [ ] If not active → route to paywall
- [ ] On successful purchase → route to home
- [ ] Handle edge cases: expired, billing issue, grace period
- **File:** `App.js`

### 3.7 — Update Settings Screen (Subscription Management)
- [ ] Add "Your Plan" section showing current tier and expiry
- [ ] Add "Manage Subscription" button → deep link to device subscription settings
- [ ] Add "Restore Purchases" button
- [ ] Place above the WeatherLens API promo section
- **File:** `src/screens/SettingsScreen.js`

### Phase 3 Verification
- [ ] Sandbox purchases work on iOS and Android
- [ ] Free trial activates correctly
- [ ] Paywall blocks access when no subscription
- [ ] "Restore Purchases" recovers entitlement
- [ ] Subscription status persists across restarts
- [ ] Settings shows correct plan info

---

## Phase 4: Store Submission Requirements

### 4.1 — Apple App Store

- [ ] **App Store Connect listing:**
  - App name: "WeatherLens"
  - Category: Weather
  - Subtitle (max 30 chars): e.g. "Retro Hyper-Local Forecasts"
  - Description (up to 4000 chars)
  - Keywords (100 chars total, comma-separated)
  - What's New text
- [ ] **Screenshots:**
  - 6.7" iPhone (iPhone 16 Pro Max) — REQUIRED
  - 6.1" iPhone — REQUIRED
  - iPad 12.9" — REQUIRED since `supportsTablet: true`
  - Minimum 3 screenshots per size; recommend 6-8
- [ ] **App icon:** 1024x1024, no alpha channel, no rounded corners
- [ ] **Privacy Policy URL** — host at `https://weatherlens.dev/privacy`
- [ ] **Terms of Service URL** — host at `https://weatherlens.dev/terms`
- [ ] **App Privacy (nutrition labels):**
  - Location: "Used for App Functionality" / "Not Linked to You"
  - Diagnostics: if using Sentry
  - No other data collected (no accounts, no analytics IDs unless added)
- [ ] **Subscription review info:** screenshot of paywall, subscription terms text
- [ ] **Age rating:** 4+ (no objectionable content)
- [ ] **Review notes:** Provide sandbox test account or note that free trial is available

### 4.2 — Google Play Store

- [ ] **Play Console listing:**
  - Title, short desc (80 chars), full desc (4000 chars)
  - Feature graphic: 1024x500
  - Screenshots: phone + tablet (if applicable)
  - App icon: 512x512
- [ ] **Privacy Policy URL** — same as iOS
- [ ] **IARC content rating** — complete questionnaire
- [ ] **Target audience:** General, not directed at children
- [ ] **Data safety section:**
  - Location data: collected, not shared, required for core functionality
  - No personal data collected
  - Data not linked to identity

### 4.3 — Legal Pages (Must Create Before Submission)

- [ ] **Privacy Policy** (`weatherlens.dev/privacy`) covering:
  - Location data: what's collected, why, how stored (device-only)
  - API communications: what's sent to weatherlens.dev servers
  - No user accounts, no personal data collection
  - No third-party data sharing
  - Contact information
- [ ] **Terms of Service** (`weatherlens.dev/terms`) covering:
  - Subscription terms, auto-renewal disclosure
  - Cancellation policy
  - Weather data accuracy disclaimer
  - Limitation of liability

### 4.4 — App Polish & Error Handling

- [ ] Add loading indicators for all API calls (reviewers reject blank screens)
- [ ] Add error states for API failures (network down, server error)
- [ ] Add empty state for Events screen when no severe weather
- [ ] Verify all animations run smoothly on lower-end devices
- [ ] Match splash screen background to app theme (currently white — consider dark olive)
- [ ] Test on both platforms with clean installs
- [ ] Consider adding `sentry-expo` for crash reporting (recommended, not required)

### Phase 4 Verification
- [ ] TestFlight build installs and runs cleanly
- [ ] Google Play internal track build installs and runs cleanly
- [ ] All store listing fields completed
- [ ] Privacy policy and terms URLs resolve and content is accurate
- [ ] Screenshots captured and uploaded

---

## Phase 5: Final Testing & Submission

### 5.1 — End-to-End Test Matrix

| Flow | iOS | Android |
|------|-----|---------|
| Fresh install → splash → onboard → paywall | [ ] | [ ] |
| Subscribe (monthly, free trial) | [ ] | [ ] |
| Subscribe (annual, free trial) | [ ] | [ ] |
| Purchase (lifetime) | [ ] | [ ] |
| Restore purchases on new device | [ ] | [ ] |
| Location permission granted → real coords | [ ] | [ ] |
| Location permission denied → Denver fallback | [ ] | [ ] |
| Home screen loads with forecast data | [ ] | [ ] |
| Forecast screen (16 days, NWS + Open-Meteo badges) | [ ] | [ ] |
| Events screen with radius filter | [ ] | [ ] |
| Event detail animated radar | [ ] | [ ] |
| Climate screen monthly chart | [ ] | [ ] |
| Settings: manage subscription | [ ] | [ ] |
| Settings: WeatherLens API link opens in browser | [ ] | [ ] |
| Settings: temp unit toggle (°F/°C) | [ ] | [ ] |
| API offline → error state | [ ] | [ ] |
| Kill + reopen → subscription state persists | [ ] | [ ] |

### 5.2 — Submit

- [ ] Build production binaries: `eas build --profile production --platform all`
- [ ] Submit to App Store: `eas submit --platform ios`
- [ ] Submit to Play Store: `eas submit --platform android`
- [ ] Monitor review status (Apple: ~24-48hr, Google: ~3-7 days)
- [ ] Address any review rejections

---

## New Dependencies

| Package | Purpose |
|---------|---------|
| `expo-constants` | Read build-time config (API keys from EAS secrets) |
| `expo-location` | Device GPS + reverse geocoding |
| `react-native-purchases` | RevenueCat IAP SDK (subscriptions) |
| `sentry-expo` | Crash reporting (optional, recommended) |

## New Files

| File | Purpose |
|------|---------|
| `app.config.js` | Dynamic Expo config (replaces `app.json`) |
| `eas.json` | EAS Build profiles |
| `src/screens/PaywallScreen.js` | Subscription paywall with pricing tiers |

## Modified Files

| File | Changes |
|------|---------|
| `src/api.js` | Remove hardcoded key, read from Constants |
| `src/screens/SettingsScreen.js` | Remove key editor, add subscription management + WeatherLens API promo |
| `src/screens/SplashScreen.js` | Remove "Get Free API Key" button |
| `src/screens/OnboardScreen.js` | Remove API pricing links, add "Powered by" footer |
| `App.js` | Add location flow, RevenueCat init, subscription gate, paywall routing |
| `package.json` | New dependencies |
| `src/data.js` | Keep defaults as-is (fallback coords) |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Built-in API key (hidden from user) | Users are app consumers, not API developers. Key injected via EAS secrets. |
| WeatherLens API promo in Settings | Funnels interested developers to weatherlens.dev without cluttering main UX. |
| RevenueCat for IAP | Cross-platform subscription management, analytics, webhook support. Simpler than raw StoreKit/BillingClient. |
| No user accounts | Subscriptions tied to App Store / Play Store accounts. Simplifies privacy compliance. |
| 7-day free trial (store-managed) | Apple/Google handle trial logic — no custom expiry code needed. |
| Device-based subscription only | No need for server-side receipt validation since API key is universal (not per-user). |

## Future Considerations

- **Push notifications** — Settings has toggle UI but no implementation. Severe weather alerts could be a major feature. Needs `expo-notifications` + push server.
- **Analytics** — RevenueCat provides revenue analytics. Add Mixpanel/Amplitude for user behavior + trial conversion if needed.
- **Widgets** — iOS/Android home screen widgets showing current temp. High user engagement driver.
- **Apple Watch** — Complication showing current conditions. Premium differentiator.
