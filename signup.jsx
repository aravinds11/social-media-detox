import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSignup = () => {
    alert("Sign up pressed!");
  };

  const handleGoogleSignup = () => {
    alert("Google signup pressed!");
  };

  return (
    <LinearGradient
      colors={["#4facfe", "#00f2fe"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8 }}>
        Sign up for free
      </Text>
      <TouchableOpacity style={{ marginBottom: 22 }}>
        <Text style={{ color: "#fff", textAlign: "center", textDecorationLine: "underline", fontSize: 16 }}>
          Or sign in to your existing account
        </Text>
      </TouchableOpacity>

      {/* Form Container */}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 24,
          width: "90%",
          maxWidth: 400,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Username */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 6 }}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#888"
          style={{
            backgroundColor: "#fff",
            color: "#222",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: "#4facfe",
          }}
        />

        {/* Email */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 6 }}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor: "#fff",
            color: "#222",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: "#4facfe",
          }}
        />

        {/* Password */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 6 }}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          style={{
            backgroundColor: "#fff",
            color: "#222",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: "#4facfe",
          }}
        />

        {/* Password Confirmation */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 6 }}>Password confirmation</Text>
        <TextInput
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="Password confirmation"
          placeholderTextColor="#888"
          secureTextEntry
          style={{
            backgroundColor: "#fff",
            color: "#222",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: "#4facfe",
          }}
        />

        {/* Terms */}
        <Text style={{ color: "#0e0c0cff", fontSize: 13, textAlign: "center", marginBottom: 18 }}>
          By signing up, you agree to our terms of use.
        </Text>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignup}
          style={{
            backgroundColor: "#009688",
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>Sign up</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#4facfe" }} />
        <Text style={{ color: "#000000ff", marginHorizontal: 8, flexShrink: 1 }}>
  Or continue with
</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#4facfe" }} />
        </View>

        {/* Social Button */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            onPress={handleGoogleSignup}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#4facfe",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Image
              source={{ uri: "https://cdn.discordapp.com/attachments/1413415422098673685/1413416772912287766/google.png?ex=68bbda72&is=68ba88f2&hm=c1a2b036dd42b7b79df49bd6627146f1f5982454c16c76a9d606a55f8a8c8e8a&" }}
              style={{ width: 24, height: 24, marginRight: 6 }}
            />
            <Text style={{ color: "#222", fontSize: 16 }}></Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}