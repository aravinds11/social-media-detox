import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  primaryGreen: "#008a72",
  accentText: "#0e2233",
  muted: "#8a98a6",
  progressTrack: "#e6eef0",
};

const SAMPLE_USAGE = [
  { id: "instagram", label: "Instagram", time: "42m", pct: 0.7, icon: require("../../assets/ig.png") },
  { id: "youtube", label: "YouTube", time: "1h 10m", pct: 0.55, icon: require("../../assets/yt.png") },
  { id: "snapchat", label: "Snapchat", time: "12m", pct: 0.35, icon: require("../../assets/sc.png") },
  { id: "facebook", label: "Facebook", time: "12m", pct: 0.35, icon: require("../../assets/fb.png") },
  { id: "x", label: "X", time: "12m", pct: 0.35, icon: require("../../assets/x.png") },
];

export default function DashboardScreen({ navigation, route }) {
  const username = route?.params?.username || "User";

  const anims = useRef(SAMPLE_USAGE.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.timing(a, {
        toValue: SAMPLE_USAGE[i].pct,
        duration: 700,
        delay: 150 * i,
        useNativeDriver: false,
      })
    );
    Animated.stagger(100, animations).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, {username}</Text>
          <Text style={styles.subtitle}>Stay focused, stay healthy.</Text>
        </View>

        {/* Detox Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Detox Progress</Text>

          <View style={styles.progressRow}>
            {/* Streak */}
            <View style={styles.progressItem}>
              <View style={styles.iconCircle}>
                <Image source={require("../../assets/streak.png")} style={styles.iconImageGreen} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bigNumber}>5 days</Text>
                <Text style={styles.smallText}>Streak</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Coins */}
            <View style={styles.progressItem}>
              <View style={styles.iconCircle}>
                <Image source={require("../../assets/coin.png")} style={styles.iconImageGreen} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bigNumber}>12</Text>
                <Text style={styles.smallText}>Coins Earned</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <DashboardButton label="Start Timer" icon={require("../../assets/timer.png")} onPress={() => navigation?.navigate?.("Timer")} />

          <DashboardButton label="Challenge" icon={require("../../assets/challenge.png")} onPress={() => navigation?.navigate?.("Challenge")} />

          <DashboardButton label="Stats" icon={require("../../assets/stats.png")} onPress={() => navigation?.navigate?.("Stats")} />

          <DashboardButton label="Profile" icon={require("../../assets/profile.png")} onPress={() => navigation?.navigate?.("Profile")} />
        </View>

        {/* Today's Usage Card */}
        <View style={[styles.card, { marginTop: 18 }]}>
          <Text style={styles.cardTitle}>Today’s Usage</Text>

          <View style={{ marginTop: 12 }}>
            {SAMPLE_USAGE.map((row, i) => (
              <View key={row.id} style={styles.usageRow}>
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
                          width: anims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: PAD,
    paddingTop: 36,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.accentText,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: COLORS.muted,
    fontWeight: "500",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: CARD_RADIUS,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    color: COLORS.primaryGreen,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconImageGreen: {
    width: 64,
    height: 64,
    tintColor: COLORS.primaryGreen,
  },

  divider: {
    width: 1,
    height: 64,
    backgroundColor: "#eef3f4",
    marginHorizontal: 18,
  },

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

  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  usageLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  usageTime: {
    marginLeft: 12,
    fontWeight: "800",
    color: COLORS.accentText,
    fontSize: 16,
  },
  usageRight: {
    flex: 1,
    paddingLeft: 12,
  },
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
});
