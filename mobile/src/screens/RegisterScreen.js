import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/api";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: fullName,
        email,
        password,
      });

      const token = response.data.token;

      // Save token
      await AsyncStorage.setItem("token", token);

      Alert.alert("Success", "Account created!");
      
      await AsyncStorage.setItem("fullName", fullName);

      navigation.navigate("Dashboard", {
      username: fullName,
      });


    } catch (error) {
      console.log("Register error:", error?.response?.data || error.message);

      if (error?.response?.data?.message === "Email already exists" || error?.response?.data?.message === "User already exists") {
        Alert.alert("Registration Failed", "This email is already registered.");
      } else {
        Alert.alert("Registration Failed", "Could not create your account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        {/* Full Name */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#8E9AA9"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E9AA9"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor="#8E9AA9"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Image
              source={
                passwordVisible
                  ? require("../../assets/eye-open.png")
                  : require("../../assets/eye-closed.png")
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#8E9AA9"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setConfirmPasswordVisible(!confirmPasswordVisible)
            }
          >
            <Image
              source={
                confirmPasswordVisible
                  ? require("../../assets/eye-open.png")
                  : require("../../assets/eye-closed.png")
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By registering, you agree to our{" "}
          <Text style={styles.link}>Terms</Text> &{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const PRIMARY = "#0E827E";
const BG = "#E7F4FA";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "white",
    padding: 28,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#0A2533",
  },

  input: {
    backgroundColor: "#F6F7F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDE3EA",
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE3EA",
    paddingRight: 10,
    marginBottom: 16,
  },

  eyeButton: {
    padding: 6,
  },

  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: "#6C7A89",
  },

  registerButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },

  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  termsText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#6C7A89",
    lineHeight: 20,
  },

  link: {
    color: PRIMARY,
    fontWeight: "600",
  },
});
