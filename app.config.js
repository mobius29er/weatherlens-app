export default ({ config }) => ({
  ...config,
  name: "WeatherLens",
  slug: "weatherlens-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1a1e14",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "dev.weatherlens.app",
    buildNumber: "1",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "WeatherLens uses your location to provide hyper-local weather forecasts.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1a1e14",
    },
    edgeToEdgeEnabled: true,
    package: "dev.weatherlens.app",
    versionCode: 1,
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-font",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "WeatherLens uses your location to provide hyper-local weather forecasts.",
      },
    ],
  ],
  extra: {
    weatherlensApiKey: process.env.WEATHERLENS_API_KEY || "",
    revenueCatApiKeyApple: process.env.REVENUECAT_API_KEY_APPLE || "",
    revenueCatApiKeyGoogle: process.env.REVENUECAT_API_KEY_GOOGLE || "",
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "",
    },
  },
});
