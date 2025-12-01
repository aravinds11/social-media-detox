import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChallengeEngine from "../services/challengeEngine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  textDark: "#0e2233",
  muted: "#6b7a86",
  startBtn: "#00916E",
};

export default function ChallengeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [nowString, setNowString] = useState("");
  const [active, setActive] = useState(null); 
  const [progress, setProgress] = useState({ remainingMs: 0, percent: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setNowString(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      await ChallengeEngine.resumeIfAny();
      const raw = await AsyncStorage.getItem("activeChallenge");
      setActive(raw ? JSON.parse(raw) : null);
    })();
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
      key: "EASY",
    },
    {
      id: 2,
      level: "Medium",
      tagline: "Build momentum with steady focus.",
      hours: 4,
      reward: 40,
      icon: require("../../assets/walking.png"),
      bg: "#FFF5E1",
      key: "MEDIUM",
    },
    {
      id: 3,
      level: "Hard",
      tagline: "Push your limits and stay committed.",
      hours: 8,
      reward: 80,
      icon: require("../../assets/running.png"),
      bg: "#FFECE9",
      key: "HARD",
    },
    {
      id: 4,
      level: "Challenging",
      tagline: "Test your discipline and go further.",
      hours: 24,
      reward: 240,
      icon: require("../../assets/trekking.png"),
      bg: "#FFF4DD",
      key: "CHALLENGING",
    },
    {
      id: 5,
      level: "Legendary",
      tagline: "Conquer distractions. Reach the peak.",
      hours: 48,
      reward: 480,
      icon: require("../../assets/summit.png"),
      bg: "#E8F0FF",
      key: "LEGENDARY",
    },
  ];

  const mapLevelKey = (id) => {
    const map = {
      1: "EASY",
      2: "MEDIUM",
      3: "HARD",
      4: "CHALLENGING",
      5: "LEGENDARY",
    };
    return map[id];
  };

  function formatRemaining(ms) {
    if (ms <= 0) return "0s";
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  async function handleStart(ch) {
    if (active) {
      alert("A challenge is already running. View Progress or wait until it ends.");
      return;
    }
    const levelKey = mapLevelKey(ch.id);

    const onProgress = ({ remainingMs, percent }) => {
      setProgress({ remainingMs, percent });
    };

    const onSuccess = async ({ reward }) => {
      setActive(null);
      setProgress({ remainingMs: 0, percent: 0 });
      alert(`Challenge complete! You earned ${reward} coins.`);
    };

    const onFail = ({ reason }) => {
      setActive(null);
      setProgress({ remainingMs: 0, percent: 0 });
      alert(`Challenge failed (${reason}). Try again.`);
    };

    try {
      await ChallengeEngine.startChallenge(levelKey, onProgress, onSuccess, onFail);

      const raw = await AsyncStorage.getItem("activeChallenge");
      const parsed = raw ? JSON.parse(raw) : null;
      setActive(parsed);

      setProgress({
        remainingMs: parsed ? parsed.endTime - Date.now() : 0,
        percent: 0,
      });
    } catch (e) {
      alert("Unable to start challenge. Please grant Usage Access permission.");
    }
  }

  function handleViewProgress() {
    if (!active) {
      alert("No active challenge.");
      return;
    }
    navigation.navigate("ChallengeProgress", { active });
  }

  const activeKey = active?.levelKey || null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Detox Challenges</Text>
        <Text style={styles.timeText}>{nowString}</Text>

        {challenges.map((c) => {
          const isActive = activeKey === c.key;
          const disabled = active && !isActive;
          const remainingMs = isActive
            ? progress.remainingMs
            : c.hours * 3600 * 1000;

          return (
            <View
              key={c.id}
              style={[
                styles.card,
                { backgroundColor: c.bg, opacity: disabled ? 0.55 : 1 },
              ]}
            >
              <View style={styles.row}>
                <Image source={c.icon} style={[styles.icon, isActive && styles.iconActive]} />

                <View style={styles.info}>
                  <Text style={styles.level}>{c.level}</Text>
                  <Text style={styles.tagline}>{c.tagline}</Text>

                  {isActive && (
                    <Text style={styles.miniCountdown}>
                      ⏳ {formatRemaining(remainingMs)} remaining
                    </Text>
                  )}

                  <Text style={styles.detail}>
                    ⏳ {c.hours} hours • 💰 {c.reward} coins
                  </Text>
                </View>

                <View style={styles.actionCol}>
                  {!isActive && (
                    <TouchableOpacity
                      style={[styles.startBtn, disabled && styles.startBtnDisabled]}
                      disabled={disabled}
                      onPress={() => handleStart(c)}
                    >
                      <Text style={styles.startText}>Start</Text>
                    </TouchableOpacity>
                  )}

                  {isActive && (
                    <>
                      <TouchableOpacity style={styles.viewBtn} onPress={handleViewProgress}>
                        <Text style={styles.viewText}>View Progress →</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelSmall}
                        onPress={async () => {
                          await ChallengeEngine.stopChallenge();
                          setActive(null);
                          setProgress({ remainingMs: 0, percent: 0 });
                        }}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingTop: 26 },

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
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  row: { flexDirection: "row", alignItems: "center" },

  icon: { width: 46, height: 46, resizeMode: "contain" },
  iconActive: { transform: [{ scale: 1.07 }] },

  info: { marginLeft: 14, flex: 1 },

  level: { fontSize: 20, fontWeight: "800", color: COLORS.textDark },

  tagline: { fontSize: 14, color: COLORS.muted, marginBottom: 6 },

  miniCountdown: { fontSize: 13, color: COLORS.startBtn, fontWeight: "700" },

  detail: { fontSize: 14, color: COLORS.muted, marginTop: 4 },

  actionCol: { justifyContent: "center", alignItems: "center" },

  startBtn: {
    backgroundColor: COLORS.startBtn,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  startBtnDisabled: { backgroundColor: "#8fcfb1" },
  startText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  viewBtn: { marginBottom: 6 },
  viewText: { color: COLORS.textDark, fontWeight: "700", fontSize: 14 },

  cancelSmall: { marginTop: 2 },
  cancelText: { color: "#a33", fontSize: 13, fontWeight: "700" },
});
