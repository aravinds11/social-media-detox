import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Google login handler
  const handleGoogleLogin = () => {
    // TODO: Add Google authentication logic here
    alert("Google login pressed!");
  };

  return (
    <LinearGradient
      colors={["#4facfe", "#00f2fe"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {/* Create Account Link */}
      <TouchableOpacity style={{ marginBottom: 18 }}>
        <Text style={{ color: "#fff", textDecorationLine: "underline", fontSize: 18, fontWeight: "500" }}>
          Create a new account
        </Text>
      </TouchableOpacity>

      {/* App Logo */}
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" }}
        style={{ width: 100, height: 100, marginBottom: 20 }}
      />

      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 30 }}>
        Aravind S
      </Text>

      {/* Email Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          paddingHorizontal: 20,
          marginBottom: 15,
          width: "90%",
          height: 60,
        }}
      >
        <Ionicons name="mail-outline" size={26} color="#555" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Email"
          style={{ flex: 1, paddingVertical: 14, fontSize: 18 }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          paddingHorizontal: 20,
          marginBottom: 5,
          width: "90%",
          height: 60,
        }}
      >
        <Ionicons name="lock-closed-outline" size={26} color="#555" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          style={{ flex: 1, paddingVertical: 14, fontSize: 18 }}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)}>
          <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={26} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
   <TouchableOpacity
  onPress={() => alert("Forgot password pressed!")}
  style={{
    alignSelf: "flex-end",
    marginRight: "5%",
    marginBottom: 15,
    maxWidth: "60%", // Add this line to prevent clipping
  }}
>
  <Text style={{ color: "#fff", fontSize: 15, textDecorationLine: "underline" }}>
    Forgot password
  </Text>
</TouchableOpacity>
      {/* Login Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          paddingVertical: 15,
          borderRadius: 12,
          width: "90%",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#4facfe" }}>Login</Text>
      </TouchableOpacity>

      {/* Social Login */}
      <Text style={{ color: "#fff", marginBottom: 18, fontSize: 14, alignSelf: "center" }}>Or Continue with</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "200%",
          marginBottom: 2,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            padding: 14,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleGoogleLogin}
        >
          <Image
            source={{ uri: "https://cdn.discordapp.com/attachments/1413415422098673685/1413416772912287766/google.png?ex=68bbda72&is=68ba88f2&hm=c1a2b036dd42b7b79df49bd6627146f1f5982454c16c76a9d606a55f8a8c8e8a&" }}
            style={{ width: 34, height: 34 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}