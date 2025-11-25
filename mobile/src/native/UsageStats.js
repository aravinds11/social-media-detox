import { NativeModules } from "react-native";

const { UsageStats } = NativeModules;

export default {
  hasPermission: () => UsageStats.hasPermission(),
  getTotalUsage: (start, end) => UsageStats.getTotalUsage(start, end),
  hasLaunchEvents: (start, end) => UsageStats.hasLaunchEvents(start, end),
  getTrackedApps: () => UsageStats.getTrackedApps(),
  getPerAppUsage: (start, end) => UsageStats.getPerAppUsage(start, end),
};
