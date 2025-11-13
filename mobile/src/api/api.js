import axios from "axios";
import Constants from "expo-constants";

const { apiUrl } = Constants.expoConfig.extra;

export const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});
