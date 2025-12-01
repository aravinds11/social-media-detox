import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import ChallengeEngine from "../services/challengeEngine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";

const COLORS = {
  bg: "#dff3ff",
  textDark: "#0e2233",
  muted: "#6b7a86",
  accent: "#00916E",
  danger: "#e85b5b",
};

export default function ChallengeProgressScreen({ route, navigation }) {
  const [active, setActive] = useState(route?.params?.active || null);
  const [progress, setProgress] = useState({ remainingMs: 0, percent: 0 });

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      if (!active) {
        const raw = await AsyncStorage.getItem("activeChallenge");
        setActive(raw ? JSON.parse(raw) : null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(async () => {
      const raw = await AsyncStorage.getItem("activeChallenge");
      const parsed = raw ? JSON.parse(raw) : null;

      if (!parsed) {
        setActive(null);
        clearInterval(timer);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, parsed.endTime - now);
      const total = parsed.endTime - parsed.startTime;
      const percent = Math.min(100, 100 - (remaining / total) * 100);

      setActive(parsed);
      setProgress({ remainingMs: remaining, percent });

      Animated.timing(animatedValue, {
        toValue: percent,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  function formatRemaining(ms) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  const motivationalLines = {
    EASY: "Small steps create big change.",
    MEDIUM: "Stay steady. You're building momentum.",
    HARD: "Push harder. You're stronger than habits.",
    CHALLENGING: "Your discipline is taking you far.",
    LEGENDARY: "Only few reach this level. You're unstoppable.",
  };

  if (!active) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noContainer}>
          <Text style={styles.noTitle}>No Active Challenge</Text>
        </View>
      </SafeAreaView>
    );
  }

  const size = 240;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Challenge In Progress</Text>
        <Text style={styles.subtitle}>
          {active.levelKey} • Reward: {active.reward} coins
        </Text>
      </View>

      <View style={styles.center}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.accent + "40"}
              strokeWidth={strokeWidth}
              fill="none"
            />

            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.accent}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: [circumference, 0],
              })}
              strokeLinecap="round"
            />
          </Svg>

          <View style={styles.circleTextContainer}>
            <Text style={styles.remainingText}>
              {formatRemaining(progress.remainingMs)}
            </Text>
            <Text style={styles.percentText}>
              {Math.round(progress.percent)}%
            </Text>
          </View>
        </View>

        <Text style={styles.motivational}>
          {motivationalLines[active.levelKey]}
        </Text>

        <TouchableOpacity
          style={styles.stopBtn}
          onPress={async () => {
            await ChallengeEngine.stopChallenge();
            navigation.navigate("Challenge");
          }}
        >
          <Text style={styles.stopText}>Stop Challenge</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textDark,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },

  circleTextContainer: {
    position: "absolute",
    top: "35%",
    width: "100%",
    alignItems: "center",
  },

  remainingText: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.accent,
  },

  percentText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.muted,
  },

  motivational: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
    textAlign: "center",
    width: "80%",
  },

  stopBtn: {
    marginTop: 30,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
  },

  stopText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  noContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textDark,
  },
});
