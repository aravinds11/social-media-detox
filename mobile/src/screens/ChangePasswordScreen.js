import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api/api";

const COLORS = {
  bg: "#dff3ff",
  primary: "#008a72",
  accent: "#0e2233",
  card: "#fff",
};

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!currentPassword || !newPassword) {
      Alert.alert("Validation", "Both fields are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/auth/change-password", {
        oldPassword: currentPassword,
        newPassword,
      });
      if (res.data && (res.data.success || res.data.message)) {
        Alert.alert("Success", res.data.message || "Password updated");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Could not change password.");
      }
    } catch (err) {
      console.log("Change password error", err);
      Alert.alert("Error", err?.response?.data?.message || "Server error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Change Password</Text>

        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New password"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          <Text style={styles.btnText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.accent, marginBottom: 20 },

  input: {
    backgroundColor: COLORS.card,
    padding: 14,
    fontSize: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
