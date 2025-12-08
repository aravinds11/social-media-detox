import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/api";
import useUsageStats from "../hooks/useUsageStats";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  primaryGreen: "#008a72",
  accentText: "#0e2233",
  muted: "#8a98a6",
  progressTrack: "#e6eef0",
};

const ICONS = {
  "com.instagram.android": require("../../assets/instagram.png"),
  "com.facebook.katana": require("../../assets/facebook.png"),
  "com.snapchat.android": require("../../assets/snapchat.png"),
  "com.zhiliaoapp.musically": require("../../assets/tiktok.png"),
  "com.google.android.youtube": require("../../assets/youtube.png"),
  "com.twitter.android": require("../../assets/x.png"),
};

const DEFAULT_ICON = require("../../assets/default_app.png");

export default function DashboardScreen({ navigation, route }) {
  const nameFromRoute = route?.params?.username || "User";

  const [usageData, setUsageData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState(nameFromRoute);
  const [loading, setLoading] = useState(true);

  const anims = useRef([]).current;

  const { apps, hasPermission, loading: usageLoading, refresh } = useUsageStats({
    autoUpload: true,
  });

  useEffect(() => {
    fetchDashboardData();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchDashboardData();
      refresh();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!usageLoading) {
      if (apps.length > 0) {
        const mapped = apps.map((a) => ({
          ...a,
          icon: ICONS[a.id] || DEFAULT_ICON,
          pct: typeof a.pct === "number" ? a.pct : 0,
        }));
        setUsageData(mapped);
        animateApps(mapped);
      } else {
        fetchAppsFromBackend();
      }
    }
  }, [usageLoading, apps]);

  async function fetchAppsFromBackend() {
    try {
      const res = await api.get("/usage/apps");
      const stored = res.data.apps || [];

      const mapped = stored.map((a) => ({
        ...a,
        icon: ICONS[a.id] || DEFAULT_ICON,
        pct: typeof a.pct === "number" ? a.pct : 0,
      }));

      setUsageData(mapped);
      animateApps(mapped);
    } catch {}
  }

  async function fetchDashboardData() {
    try {
      const progressRes = await api.get("/user/progress");
      setStreak(progressRes.data.streak ?? 0);
      setCoins(progressRes.data.coins ?? 0);
      setUsername(progressRes.data.name || nameFromRoute);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  function animateApps(apps) {
    anims.length = apps.length;

    apps.forEach((_, i) => (anims[i] = new Animated.Value(0)));

    const animations = apps.map((app, i) =>
      Animated.timing(anims[i], {
        toValue: app.pct,
        duration: 600,
        delay: 80 * i,
        useNativeDriver: false,
      })
    );

    Animated.stagger(80, animations).start();
  }

  if (loading || usageLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, {username}</Text>
          <Text style={styles.subtitle}>Stay focused, stay healthy.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Detox Progress</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <View style={styles.iconCircle}>
                <Image source={require("../../assets/streak.png")} style={styles.iconImageGreen} />
              </View>
              <View style={styles.progressLabelBlock}>
                <Text style={styles.bigNumber}>{streak}</Text>
                <Text style={styles.smallText}>Days Streak</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.progressItem}>
              <View style={styles.iconCircle}>
                <Image source={require("../../assets/coin.png")} style={styles.iconImageGreen} />
              </View>
              <View style={styles.progressLabelBlock}>
                <Text style={styles.bigNumber}>{coins}</Text>
                <Text style={styles.smallText}>Coins Earned</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <DashboardButton label="Start Timer" icon={require("../../assets/timer.png")} onPress={() => navigation.navigate("Timer")} />
          <DashboardButton label="Challenge" icon={require("../../assets/challenge.png")} onPress={() => navigation.navigate("Challenge")} />
          <DashboardButton label="Stats" icon={require("../../assets/stats.png")} onPress={() => navigation.navigate("Stats")} />
          <DashboardButton label="Profile" icon={require("../../assets/profile.png")} onPress={() => navigation.navigate("Profile")} />
        </View>

        <View style={[styles.card, { marginTop: 18 }]}>
          <Text style={styles.cardTitle}>Today’s Social Media Usage</Text>

          {!hasPermission && (
            <Text style={styles.noDataText}>Usage Access permission not granted.</Text>
          )}

          {usageData.length === 0 && hasPermission && (
            <Text style={styles.noDataText}>No social media usage detected today.</Text>
          )}

          {usageData.map((row, i) => (
            <View key={row.id + i} style={styles.usageRow}>
              <View style={styles.usageLeft}>
                <Image source={row.icon} style={styles.appIcon} />
                <Text style={styles.usageTime}>{row.time}</Text>
              </View>

              <View style={styles.usageRight}>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: anims[i]
                          ? anims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            })
                          : "0%",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardButton({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Image source={icon} style={styles.actionBtnIcon} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const PAD = 20;
const CARD_RADIUS = 18;
const BTN_SIZE = (width - PAD * 2 - 48) / 4;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: COLORS.accentText },
  container: { padding: PAD, paddingTop: 36 },

  header: { alignItems: "center", marginBottom: 18 },
  title: { fontSize: 36, fontWeight: "800", color: COLORS.accentText },
  subtitle: { marginTop: 6, fontSize: 18, color: COLORS.muted },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: CARD_RADIUS,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTitle: { color: COLORS.primaryGreen, fontSize: 20, fontWeight: "800", marginBottom: 10 },

  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressItem: { flexDirection: "row", alignItems: "center", flex: 1 },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconImageGreen: { width: 64, height: 64 },

  progressLabelBlock: { marginLeft: 12 },
  bigNumber: { fontSize: 26, fontWeight: "800", color: COLORS.accentText },
  smallText: { fontSize: 14, color: COLORS.muted },

  divider: { width: 1, height: 64, backgroundColor: "#eef3f4", marginHorizontal: 18 },

  actionsRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: 18,
    backgroundColor: COLORS.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  actionBtnIcon: {
    width: 34,
    height: 34,
    tintColor: "#fff",
    marginBottom: 6,
  },
  actionLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },

  noDataText: { color: COLORS.muted, textAlign: "center", paddingVertical: 10 },

  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  usageLeft: { flexDirection: "row", alignItems: "center", width: 140 },
  appIcon: { width: 36, height: 36, borderRadius: 8 },
  usageTime: { marginLeft: 12, fontSize: 16, fontWeight: "800", color: COLORS.accentText },

  usageRight: { flex: 1, paddingLeft: 12 },
  progressTrack: {
    height: 16,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
  },

  bottomSpace: { height: 40 },
});
