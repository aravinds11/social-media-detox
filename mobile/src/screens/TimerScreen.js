import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/api";   // ✅ ADDED for coin rewards

const COLORS = {
  bg: "#E7F4FA",
  primary: "#0E827E",
  textDark: "#0A2533",
  muted: "#6C7A89",
  danger: "#D9534F",
};

const PRESETS = [
  { minutes: 5, seconds: 0, label: "5 min" },
  { minutes: 10, seconds: 0, label: "10 min" },
  { minutes: 30, seconds: 0, label: "30 min" },
];

export default function TimerScreen() {
  const [initialDuration, setInitialDuration] = useState(10 * 60); // seconds
  const [secondsLeft, setSecondsLeft] = useState(initialDuration);
  const [running, setRunning] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [customMin, setCustomMin] = useState("");
  const [customSec, setCustomSec] = useState("");

  const intervalRef = useRef(null);

  // Award coins based on completed duration
  async function awardCoins(totalSeconds) {
    const coinsEarned = Math.floor(totalSeconds / 300); // 1 coin = 5 mins

    if (coinsEarned <= 0) return;

    try {
      await api.post("/user/add-coins", { coins: coinsEarned });

      Alert.alert(
        "🎉 Detox Complete!",
        `You earned ${coinsEarned} coin${coinsEarned > 1 ? "s" : ""}!`
      );
    } catch (err) {
      console.log("Error awarding coins:", err);
    }
  }

  function resetTimer() {
    pauseTimer();
    setSecondsLeft(initialDuration);
  }

  function startTimer() {
    if (running) return;

    setRunning(true);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);

          // Award coins on completion
          awardCoins(initialDuration);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pauseTimer() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  // Custom Duration Save
  function saveCustomDuration() {
    const mins = parseInt(customMin) || 0;
    const secs = parseInt(customSec) || 0;

    if (mins < 0 || mins > 240) {
      Alert.alert("Invalid Minutes", "Minutes must be 0–240");
      return;
    }
    if (secs < 0 || secs > 59) {
      Alert.alert("Invalid Seconds", "Seconds must be 0–59");
      return;
    }
    if (mins === 0 && secs === 0) {
      Alert.alert("Invalid Duration", "Duration cannot be 0.");
      return;
    }

    const total = mins * 60 + secs;

    pauseTimer();
    setInitialDuration(total);
    setSecondsLeft(total);

    setCustomMin("");
    setCustomSec("");
    setModalVisible(false);
  }

  // Display
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Detox Session</Text>

        <Image source={require("../../assets/timer.png")} style={styles.timerIcon} />

        <Text style={styles.timerText}>{mm}:{ss}</Text>

        <Text style={styles.subtitle}>
          Ready to start your detox? Put your device away and relax.
        </Text>

        {/* PRESETS */}
        <View style={styles.presetsRow}>
          {PRESETS.map((p) => {
            const total = p.minutes * 60 + p.seconds;
            const selected = initialDuration === total;

            return (
              <TouchableOpacity
                key={p.label}
                style={[
                  styles.presetBtn,
                  selected ? styles.presetActive : null,
                ]}
                disabled={running}
                onPress={() => {
                  pauseTimer();
                  setInitialDuration(total);
                  setSecondsLeft(total);
                }}
              >
                <Text
                  style={[
                    styles.presetText,
                    selected ? styles.presetTextActive : null,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* CUSTOM */}
          <TouchableOpacity
            style={styles.customBtn}
            disabled={running}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.customText}>Custom</Text>
          </TouchableOpacity>
        </View>

        {/* START / PAUSE */}
        {!running ? (
          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.startText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={pauseTimer}>
            <Text style={styles.stopText}>Pause</Text>
          </TouchableOpacity>
        )}

        {/* RESET */}
        {!running && secondsLeft !== initialDuration && (
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CUSTOM MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom Duration</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Minutes</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={customMin}
                  onChangeText={setCustomMin}
                  placeholder="0"
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Seconds</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={customSec}
                  onChangeText={setCustomSec}
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={saveCustomDuration}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, alignItems: "center", paddingTop: 80 },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 30,
  },
  timerIcon: {
    width: 200,
    height: 200,
    tintColor: COLORS.primary,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 70,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 15,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 30,
    marginBottom: 20,
  },

  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    justifyContent: "center",
  },
  presetBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE3EA",
  },
  presetActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontWeight: "700",
    color: COLORS.textDark,
  },
  presetTextActive: {
    color: "white",
  },

  customBtn: {
    backgroundColor: "#DDE3EA",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 6,
  },
  customText: {
    fontWeight: "700",
    color: COLORS.textDark,
  },

  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginBottom: 20,
  },
  startText: { color: "white", fontSize: 18, fontWeight: "700" },

  stopButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginBottom: 20,
  },
  stopText: { color: "white", fontSize: 18, fontWeight: "700" },

  resetButton: {
    backgroundColor: COLORS.muted,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  resetText: { color: "white", fontSize: 16, fontWeight: "600" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "white",
    padding: 22,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "47%" },

  label: { fontWeight: "700", color: COLORS.textDark, marginBottom: 6 },
  input: {
    backgroundColor: "#F6F7F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE3EA",
    padding: 10,
    fontSize: 16,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  cancelBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#DDE3EA",
    flex: 1,
    marginRight: 6,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "700",
    color: COLORS.textDark,
  },
  saveBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flex: 1,
    marginLeft: 6,
  },
  saveText: {
    textAlign: "center",
    fontWeight: "700",
    color: "white",
  },
});
