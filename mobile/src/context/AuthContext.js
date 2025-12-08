import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkStoredToken();
  }, []);

  async function checkStoredToken() {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }

  async function login(token) {
    await AsyncStorage.setItem("token", token);
    setIsLoggedIn(true);
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ loading, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
