import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  textDark: "#0e2233",
  muted: "#6b7a86",
  startBtn: "#00916E",
};

export default function ChallengeScreen({ navigation }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const challenges = [
    {
      id: 1,
      level: "Beginner",
      tagline: "Start small, stay mindful.",
      hours: 2,
      reward: 20,
      icon: require("../../assets/standing.png"),
      bg: "#E0F8F0",
    },
    {
      id: 2,
      level: "Medium",
      tagline: "Build momentum with steady focus.",
      hours: 4,
      reward: 40,
      icon: require("../../assets/walking.png"),
      bg: "#FFF5E1",
    },
    {
      id: 3,
      level: "Hard",
      tagline: "Push your limits and stay committed.",
      hours: 8,
      reward: 80,
      icon: require("../../assets/running.png"),
      bg: "#FFECE9",
    },
    {
      id: 4,
      level: "Challenging",
      tagline: "Test your discipline and go further.",
      hours: 24,
      reward: 240,
      icon: require("../../assets/trekking.png"),
      bg: "#FFF4DD",
    },
    {
      id: 5,
      level: "Legendary",
      tagline: "Conquer distractions. Reach the peak.",
      hours: 48,
      reward: 480,
      icon: require("../../assets/summit.png"),
      bg: "#E8F0FF",
    },
  ];

  function startChallenge(challenge) {
    alert(`Starting ${challenge.level} Challenge`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <Text style={styles.title}>Detox Challenges</Text>
        <Text style={styles.timeText}>{time}</Text>

        {/* Challenge Cards */}
        {challenges.map((c) => (
          <View key={c.id} style={[styles.card, { backgroundColor: c.bg }]}>
            <View style={styles.row}>
              <Image source={c.icon} style={styles.icon} />

              <View style={styles.info}>
                <Text style={styles.level}>{c.level}</Text>

                {/* Tagline */}
                <Text style={styles.tagline}>🎯{c.tagline}</Text>

                <Text style={styles.detail}>
                  ⏳ {c.hours} hours • 💰 {c.reward} coins
                </Text>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => startChallenge(c)}
              >
                <Text style={styles.startText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 16,
    paddingTop: 26,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
  },
  timeText: {
    fontSize: 18,
    color: COLORS.startBtn,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    fontWeight: "700",
  },

  card: {
    width: "100%",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 46,
    height: 46,
    resizeMode: "contain",
  },

  info: {
    marginLeft: 14,
    flex: 1,
  },

  level: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textDark,
  },

  tagline: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 6,
  },

  detail: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },

  startBtn: {
    backgroundColor: COLORS.startBtn,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  startText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
