import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/api";

const COLORS = {
  bg: "#dff3ff",
  card: "#ffffff",
  primary: "#008a72",
  accent: "#0e2233",
  muted: "#8a98a6",
};

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadProfile();
    const unsub = navigation.addListener("focus", loadProfile);
    return unsub;
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await api.get("/user/progress");
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setStreak(res.data.streak ?? 0);
      setCoins(res.data.coins ?? 0);
    } catch (e) {
      console.log("Profile load error", e);
      // fallback to locally stored values if available
      try {
        const localName = await AsyncStorage.getItem("fullName");
        const localEmail = await AsyncStorage.getItem("email");
        const localStreak = await AsyncStorage.getItem("streak");
        const localCoins = await AsyncStorage.getItem("coins");
        if (localName) setName(localName);
        if (localEmail) setEmail(localEmail);
        if (localStreak) setStreak(parseInt(localStreak, 10));
        if (localCoins) setCoins(parseInt(localCoins, 10));
      } catch (e2) {}
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  async function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.center}>
          <Image source={require("../../assets/profile.png")} style={styles.avatar} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.statCard}>
            <Image source={require("../../assets/streak.png")} style={styles.statIcon} />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Image source={require("../../assets/coin.png")} style={styles.statIcon} />
            <Text style={styles.statNumber}>{coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>

        <MenuItem
          label="Edit Name"
          icon={require("../../assets/edit.png")}
          onPress={() => navigation.navigate("EditName")}
        />

        <MenuItem
          label="Change Password"
          icon={require("../../assets/password.png")}
          onPress={() => navigation.navigate("ChangePassword")}
        />

        <MenuItem
          label="Logout"
          icon={require("../../assets/logout.png")}
          red
          onPress={confirmLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ label, icon, onPress, red }) {
  return (
    <TouchableOpacity style={styles.menu} onPress={onPress}>
      <Image source={icon} style={[styles.menuIcon, red && { tintColor: "#d9534f" }]} />
      <Text style={[styles.menuLabel, red && { color: "#d9534f" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20 },

  center: { alignItems: "center" },
  avatar: { width: 100, height: 100, marginBottom: 10 },
  name: { fontSize: 26, fontWeight: "800", color: COLORS.accent },
  email: { fontSize: 16, color: COLORS.muted, marginBottom: 20 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    marginHorizontal: 6,
    borderRadius: 18,
    alignItems: "center",
  },
  statIcon: { width: 40, height: 40, marginBottom: 8 },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.accent,
  },
  statLabel: { fontSize: 14, color: COLORS.muted },

  menu: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 18,
    marginVertical: 8,
    alignItems: "center",
  },
  menuIcon: { width: 26, height: 26, marginRight: 14, tintColor: COLORS.primary },
  menuLabel: { fontSize: 18, color: COLORS.accent, fontWeight: "600" },
});
