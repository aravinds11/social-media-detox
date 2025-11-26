import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/api";

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  primaryGreen: "#008a72",
  accentText: "#0e2233",
  muted: "#8a98a6",
};

export default function AIInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/user/insights");
      if (!res.data.error) setData(res.data);
    } catch (e) {}
    setLoading(false);
  }

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loading}>Loading insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>
            Personalized analysis of your digital habits
          </Text>
        </View>

        <Card title="Addiction Score">
          <Text style={styles.score}>{Math.round(data.probability * 100)}%</Text>
          <Text style={styles.sub}>{data.addiction_status}</Text>
        </Card>

        <Card title="Cluster Classification">
          <Text style={styles.score}>{data.cluster_label.toUpperCase()}</Text>
        </Card>

        <Card title="Insights">
          {data.insights.map((t, i) => (
            <Text key={i} style={styles.item}>• {t}</Text>
          ))}
        </Card>

        <Card title="Goals">
          <Text style={styles.section}>Short-Term</Text>
          {data.goals.short_term.map((t, i) => (
            <Text key={i} style={styles.item}>• {t}</Text>
          ))}
          <Text style={styles.section}>Long-Term</Text>
          {data.goals.long_term.map((t, i) => (
            <Text key={i} style={styles.item}>• {t}</Text>
          ))}
        </Card>

        <Card title="Targeted Tips">
          {data.targeted_tips.map((t, i) => (
            <Text key={i} style={styles.item}>• {t}</Text>
          ))}
        </Card>

        <Card title="Alternative Activities">
          {data.alternative_activities.map((t, i) => (
            <Text key={i} style={styles.item}>
              • {t}
            </Text>
          ))}
        </Card>

        <Card title="Encouragement">
          <Text style={styles.enc}>{data.encouragement}</Text>
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { marginTop: 10, color: COLORS.accentText },

  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 36, fontWeight: "800", color: COLORS.accentText },
  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
    fontSize: 16,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryGreen,
    marginBottom: 10,
  },

  score: { fontSize: 30, fontWeight: "900", color: COLORS.accentText },
  sub: { fontSize: 18, color: COLORS.muted, marginTop: 6 },

  item: {
    fontSize: 16,
    marginVertical: 4,
    color: COLORS.accentText,
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryGreen,
    marginTop: 10,
  },

  enc: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.accentText,
  },
});
