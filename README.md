# WeatherLens App

A retro atomic-age weather app powered by the [WeatherLens API](https://weatherlens.dev).

## Features

- **16-Day Hyperlocal Forecast** — Multi-source blended predictions (NWS + Open-Meteo + ML)
- **Climate Normals** — 5-year weighted historical averages for any location
- **Weather Events** — Real-time severe weather scanner with radius filtering
- **Accuracy Tracking** — Live ML model accuracy metrics
- **Retro UI** — Fallout-inspired atomic-age aesthetic with SpaceMono typography

## Screens

1. **Splash** — Animated entry with radiation rays
2. **Onboard** — Feature introduction
3. **Home** — Current conditions, hourly forecast, accuracy cards
4. **Forecast** — 16-day detailed forecast with source badges
5. **Events** — Severe weather scanner with filters
6. **Event Detail** — Animated radar sweep with forecast data
7. **Climate** — Monthly temperature profiles and normals
8. **Settings** — API key management, display preferences

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your device.

## API Key

The app ships with a demo API key (starter plan, 5000 req/day). Get your own key at [weatherlens.dev/pricing](https://weatherlens.dev/pricing) and enter it in Settings → API Key.

## Tech Stack

- [Expo](https://expo.dev) (SDK 54)
- React Native 0.81
- WeatherLens API v1

## License

MIT
