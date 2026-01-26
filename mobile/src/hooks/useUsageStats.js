import { useEffect, useState } from "react";
import UsageStats from "../native/UsageStats";
import { api } from "../api/api";

export default function useUsageStats({ autoUpload = true } = {}) {
  const [apps, setApps] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);

    const perm = await UsageStats.hasPermission();
    setHasPermission(perm);

    if (!perm) {
      setApps([]);
      setLoading(false);
      return;
    }

    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    let nativeApps = [];
    let metrics = null;

    try {
      nativeApps = await UsageStats.getPerAppUsage(start.getTime(), now);
    } catch {}

    try {
      metrics = await UsageStats.getDailyMetrics(start.getTime(), now);
    } catch {
      metrics = null;
    }

    if (nativeApps && nativeApps.length > 0) {
      const formatted = nativeApps.map((a) => ({
        id: a.id,
        label: a.label,
        time: a.time,
        minutes: a.minutes,
        pct: a.pct,
        iconUrl: a.icon,
      }));

      setApps(formatted);

      if (autoUpload && formatted.length > 0) {
        const totalMinutes = formatted.reduce((s, a) => s + a.minutes, 0);
        const body = {
          totalTime: `${totalMinutes}m`,
          apps: formatted,
        };

        if (
          metrics &&
          typeof metrics.daily_screen_time === "number" &&
          typeof metrics.session_duration === "number" &&
          typeof metrics.app_switches === "number" &&
          typeof metrics.night_activity === "number"
        ) {
          body.metrics = metrics;
        }

        try {
          await api.post("/usage/log", body);
        } catch {}
      }
    } else {
      try {
        const backendRes = await api.get("/usage/apps");
        const stored = backendRes.data.apps || [];
        setApps(stored);
      } catch {}
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    apps,
    hasPermission,
    loading,
    refresh,
  };
}
