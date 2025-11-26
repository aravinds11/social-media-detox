import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/api";

const COLORS = {
  bg: "#dff3ff",
  primary: "#008a72",
  accent: "#0e2233",
  card: "#fff",
};

export default function EditNameScreen({ navigation }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const localName = await AsyncStorage.getItem("fullName");
      if (localName) setName(localName);
    })();
  }, []);

  async function save() {
    if (!name) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/auth/update-name", { name });
      if (res.data && res.data.name) {
        await AsyncStorage.setItem("fullName", res.data.name);
        if (res.data.email) await AsyncStorage.setItem("email", res.data.email);
        Alert.alert("Saved", "Name updated successfully.");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Could not update name.");
      }
    } catch (err) {
      console.log("Update name error", err);
      Alert.alert("Error", err?.response?.data?.message || "Server error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Name</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter new name"
          value={name}
          onChangeText={setName}
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
