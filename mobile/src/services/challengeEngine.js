import AsyncStorage from "@react-native-async-storage/async-storage";
import UsageStats from "../native/UsageStats";
import { AppState } from "react-native";

const STRICT_POLL_MS = 15000;
const NORMAL_POLL_MS = 60000;

const CHALLENGE_RULES = {
  EASY: { durationHours: 2, allowedMs: 2000, reward: 20 },
  MEDIUM: { durationHours: 4, allowedMs: 2000, reward: 40 },
  HARD: { durationHours: 8, allowedMs: 60000, reward: 80 },
  CHALLENGING: { durationHours: 24, allowedMs: 120000, reward: 240 },
  LEGENDARY: { durationHours: 48, allowedMs: 180000, reward: 480 },
};

class ChallengeEngine {
  constructor() {
    this.active = null;
    this.timer = null;
    this.onProgress = null;
    this.onSuccess = null;
    this.onFail = null;
    this._restoreOnForeground();
  }

  _restoreOnForeground() {
    AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const raw = await AsyncStorage.getItem("activeChallenge");
        if (raw) {
          this.active = JSON.parse(raw);
          this._schedulePoll();
          this._checkNow();
        }
      }
    });
  }

  async startChallenge(levelKey, onProgress, onSuccess, onFail) {
    const rule = CHALLENGE_RULES[levelKey];
    if (!rule) throw new Error("Invalid challenge level");

    const hasPermission = await UsageStats.hasPermission();
    if (!hasPermission) throw new Error("MISSING_USAGE_PERMISSION");

    const startTime = Date.now();
    const endTime = startTime + rule.durationHours * 3600 * 1000;

    this.active = {
      levelKey,
      startTime,
      endTime,
      allowedMs: rule.allowedMs,
      reward: rule.reward,
    };

    this.onProgress = onProgress;
    this.onSuccess = onSuccess;
    this.onFail = onFail;

    await AsyncStorage.setItem("activeChallenge", JSON.stringify(this.active));

    setTimeout(() => this._checkNow(), 1200);
    this._schedulePoll();
  }

  async stopChallenge() {
    this.active = null;
    this.onProgress = null;
    this.onSuccess = null;
    this.onFail = null;

    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    await AsyncStorage.removeItem("activeChallenge");
  }

  async resumeIfAny() {
    const raw = await AsyncStorage.getItem("activeChallenge");
    if (!raw) return;

    this.active = JSON.parse(raw);
    this._schedulePoll();
    setTimeout(() => this._checkNow(), 800);
  }

  _schedulePoll() {
    if (!this.active) return;

    if (this.timer) clearInterval(this.timer);

    const ms = this.active.allowedMs <= 2000 ? STRICT_POLL_MS : NORMAL_POLL_MS;

    this.timer = setInterval(() => this._safeCheck(), ms);
  }

  async _safeCheck() {
    try {
      await this._checkNow();
    } catch (e) {
      console.log("ChallengeEngine _safeCheck error:", e);
    }
  }

  async _checkNow() {
    if (!this.active) return;

    const { startTime, endTime, allowedMs } = this.active;
    const now = Date.now();

    let hasPermission = false;
    try {
      hasPermission = await UsageStats.hasPermission();
    } catch (e) {
      console.log("UsageStats.hasPermission error:", e);
    }

    if (!hasPermission) {
      return this._fail("Missing Usage Access Permission");
    }

    let launched = false;
    if (allowedMs <= 2000) {
      try {
        launched = await UsageStats.hasLaunchEvents(startTime, now);
      } catch (e) {
        console.log("hasLaunchEvents crashed, ignoring:", e);
        launched = false;
      }

      if (launched) {
        return this._fail("Restricted App Launched");
      }
    }

    let totalMs = 0;
    if (allowedMs > 2000) {
      try {
        totalMs = await UsageStats.getTotalUsage(startTime, now);
      } catch (e) {
        console.log("getTotalUsage crashed, ignoring:", e);
        totalMs = 0;
      }

      if (totalMs > allowedMs) {
        return this._fail("Usage Limit Exceeded");
      }
    }

    const remainingMs = Math.max(0, endTime - now);
    const duration = endTime - startTime;
    const percent = Math.min(
      100,
      Math.round(((duration - remainingMs) / duration) * 100)
    );

    try {
      this.onProgress?.({ remainingMs, percent });
    } catch (e) {
      console.log("onProgress callback error:", e);
    }

    if (remainingMs <= 0) {
      return this._success();
    }
  }

  async _success() {
    const reward = this.active?.reward ?? 0;

    try {
      this.onSuccess?.({ reward });
    } catch (e) {
      console.log("onSuccess callback error:", e);
    }

    await this._addCoins(reward);
    await this.stopChallenge();
  }

  async _fail(reason) {
    try {
      this.onFail?.({ reason });
    } catch (e) {
      console.log("onFail callback error:", e);
    }
    await this.stopChallenge();
  }

  async _addCoins(amount) {
    const raw = await AsyncStorage.getItem("coins");
    const coins = parseInt(raw || "0", 10);
    await AsyncStorage.setItem("coins", String(coins + amount));
  }
}

export default new ChallengeEngine();
