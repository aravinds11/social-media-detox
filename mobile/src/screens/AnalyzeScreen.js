import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function AnalyzeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Detox Analyzer</Text>
      <Text style={{ marginBottom: 10 }}>Welcome to your digital wellness dashboard!</Text>
      <Button title="Logout" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, marginBottom: 10, textAlign: "center" },
});
