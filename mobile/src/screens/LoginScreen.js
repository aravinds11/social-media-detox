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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", { email, password });

      // console.log("LOGIN RESPONSE DATA:", response?.data);

      const { token, name, streak, coins } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("fullName", name);
      await AsyncStorage.setItem("streak", streak.toString());
      await AsyncStorage.setItem("coins", coins.toString());

      navigation.replace("Dashboard", { username: name });

    } catch (error) {
      console.log(
        "LOGIN ERROR RAW:",
        error?.response?.data ?? error?.response ?? error.message
      );
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require("../../assets/lock.png")}
            style={styles.icon}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E9AA9"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password Input with Eye */}
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

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign-In */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require("../../assets/google.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate("Register")}
          >
            Register
          </Text>
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

  iconContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    width: 80,
    height: 80,
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

  forgotText: {
    alignSelf: "flex-end",
    color: "#6C7A89",
    fontSize: 14,
    marginBottom: 20,
  },

  loginButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },

  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDE3EA",
  },

  dividerText: {
    marginHorizontal: 10,
    color: "#8A97A5",
    fontSize: 14,
  },

  googleButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  googleButtonText: {
    fontSize: 16,
    color: "#0A2533",
    fontWeight: "500",
  },

  footerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#6C7A89",
  },

  footerLink: {
    color: PRIMARY,
    fontWeight: "600",
  },
});


