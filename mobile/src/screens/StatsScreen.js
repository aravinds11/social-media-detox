import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/api";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  primaryGreen: "#008a72",
  accentText: "#0e2233",
  muted: "#8a98a6",
  progressTrack: "#e6eef0",
};

export default function StatsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState([]);
  const [trend, setTrend] = useState(null);
  const [addictionScore, setAddictionScore] = useState(0);

  useEffect(() => {
    fetchStats();
    const unsubscribe = navigation.addListener("focus", fetchStats);
    return unsubscribe;
  }, []);

  async function fetchStats() {
    try {
      const weekRes = await api.get("/usage/weekly");
      const aiRes = await api.get("/user/insights");

      setWeekly(weekRes.data.days || []);
      setAddictionScore(aiRes.data.addictionScore || 0);
      setTrend(aiRes.data.trend || "No trend available");
    } catch (err) {}
    setLoading(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loadingText}>Loading your stats…</Text>
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
          <Text style={styles.title}>Your Stats</Text>
          <Text style={styles.subtitle}>Analytics • Insights • Trends</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Insights</Text>

          <View style={styles.row}>
            <Image
              source={require("../../assets/stats.png")}
              style={styles.insightIcon}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bigNumber}>{addictionScore}/100</Text>
              <Text style={styles.smallText}>Addiction Score</Text>
            </View>
          </View>

          <Text style={styles.trendText}>📊 {trend}</Text>
        </View>

        <View style={[styles.card, { marginTop: 18 }]}>
          <Text style={styles.cardTitle}>Weekly Usage</Text>

          {weekly.length === 0 ? (
            <Text style={styles.noData}>No weekly data available.</Text>
          ) : (
            weekly.map((day, index) => (
              <View key={index} style={styles.weekRow}>
                <Text style={styles.weekDay}>{day.day}</Text>

                <View style={styles.weekBarTrack}>
                  <View
                    style={[
                      styles.weekBarFill,
                      { width: `${day.percent || 0}%` },
                    ]}
                  />
                </View>

                <Text style={styles.weekMinutes}>{day.minutes}m</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PAD = 20;
const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: PAD,
    paddingTop: 36,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.accentText,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightIcon: {
    width: 50,
    height: 50,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.accentText,
  },
  smallText: {
    fontSize: 16,
    color: COLORS.muted,
  },
  trendText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.accentText,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  weekDay: {
    width: 62,
    fontWeight: "700",
    color: COLORS.accentText,
  },
  weekBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  weekBarFill: {
    height: "100%",
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 10,
  },
  weekMinutes: {
    width: 40,
    textAlign: "right",
    color: COLORS.accentText,
    fontWeight: "600",
  },
  noData: {
    color: COLORS.muted,
    textAlign: "center",
    paddingVertical: 10,
  },
});
