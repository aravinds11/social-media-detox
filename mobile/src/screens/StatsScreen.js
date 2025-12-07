import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
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
  const [addictionScore, setAddictionScore] = useState(0);
  const [trend, setTrend] = useState("No trend available");

  useEffect(() => {
    fetchStats();
    const unsub = navigation.addListener("focus", fetchStats);
    return unsub;
  }, []);

  async function fetchStats() {
    try {
      const weekRes = await api.get("/usage/weekly");
      const aiRes = await api.get("/user/insights");

      setWeekly(weekRes.data.days || []);

      const prob = aiRes.data?.probability ?? 0;
      setAddictionScore(Math.round(prob * 100));

      const cl = aiRes.data?.cluster_label;

      if (!cl) {
        setTrend("No trend available");
      } else if (cl === "light") {
        setTrend("Your usage is healthy (light)");
      } else if (cl === "moderate") {
        setTrend("Your usage is moderate — room for improvement");
      } else if (cl === "heavy") {
        setTrend("Your usage is high — consider reducing screen time");
      } else {
        setTrend("No trend available");
      }

    } catch (e) {
      console.log("Stats fetch error", e.message);
    }

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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Stats</Text>
          <Text style={styles.subtitle}>Analytics • Insights • Trends</Text>
        </View>

        {/* AI Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Insights</Text>
          <View style={styles.row}>
            <Image
              source={require("../../assets/stats.png")}
              style={styles.icon}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bigNumber}>{addictionScore}/100</Text>
              <Text style={styles.smallText}>Addiction Score</Text>
            </View>
          </View>

          <Text style={styles.trendText}>📊 {trend}</Text>

          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => navigation.navigate("AIInsights")}
          >
            <Text style={styles.aiBtnLabel}>View Full AI Insights →</Text>
          </TouchableOpacity>
        </View>

        {/* WEEKLY USAGE */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Weekly Usage</Text>

          {weekly.length === 0 ? (
            <Text style={styles.noData}>No weekly data available.</Text>
          ) : (
            weekly.map((d, i) => (
              <View key={i} style={styles.weekRow}>
                <Text style={styles.weekDay}>{d.day}</Text>
                <View style={styles.weekBarTrack}>
                  <View
                    style={[
                      styles.weekBarFill,
                      { width: `${d.percent || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.weekMinutes}>{d.minutes}m</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: PAD, paddingTop: 36 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: COLORS.accentText, marginTop: 10 },

  header: { alignItems: "center", marginBottom: 18 },
  title: { fontSize: 36, fontWeight: "800", color: COLORS.accentText },
  subtitle: { fontSize: 18, color: COLORS.muted },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryGreen,
    marginBottom: 10,
  },

  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 50, height: 50 },
  bigNumber: { fontSize: 32, fontWeight: "800", color: COLORS.accentText },
  smallText: { color: COLORS.muted, fontSize: 16 },

  trendText: { marginTop: 10, color: COLORS.accentText, fontSize: 16 },

  aiBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    alignItems: "center",
  },
  aiBtnLabel: { fontSize: 16, color: "#fff", fontWeight: "700" },

  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  weekDay: { width: 62, fontWeight: "700", color: COLORS.accentText },
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
  },
  noData: { textAlign: "center", color: COLORS.muted, paddingVertical: 10 },
});
