import 'dotenv/config';

export default {
  expo: {
    name: "detox-mobile",
    slug: "detox-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    extra: {
      apiUrl: process.env.API_URL,
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true
    },

    ios: {
      supportsTablet: true
    },

    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
