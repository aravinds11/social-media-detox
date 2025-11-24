import AsyncStorage from "@react-native-async-storage/async-storage";
import UsageStats from "../native/UsageStats";
import { AppState, Linking, Platform } from "react-native";

const STRICT_POLL_MS = 15000;
const NORMAL_POLL_MS = 60000;

const CHALLENGE_RULES = {
  EASY: { durationHours: 2, allowedMs: 0, reward: 20 },
  MEDIUM: { durationHours: 4, allowedMs: 0, reward: 40 },
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
    if (!hasPermission) {
      throw new Error("MISSING_USAGE_PERMISSION");
    }

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

    this._schedulePoll();
    await this._checkNow();
  }

  async stopChallenge() {
    this.active = null;
    this.onProgress = null;
    this.onSuccess = null;
    this.onFail = null;

    clearInterval(this.timer);
    this.timer = null;

    await AsyncStorage.removeItem("activeChallenge");
  }

  async resumeIfAny() {
    const raw = await AsyncStorage.getItem("activeChallenge");
    if (!raw) return;

    this.active = JSON.parse(raw);
    this._schedulePoll();
    await this._checkNow();
  }

  _schedulePoll() {
    if (!this.active) return;
    if (this.timer) clearInterval(this.timer);

    const ms = this.active.allowedMs === 0 ? STRICT_POLL_MS : NORMAL_POLL_MS;

    this.timer = setInterval(() => {
      this._checkNow();
    }, ms);
  }

  async _checkNow() {
    try {
      if (!this.active) return;

      const { startTime, endTime, allowedMs } = this.active;
      const now = Date.now();

      const hasPermission = await UsageStats.hasPermission();
      if (!hasPermission) {
        await this._fail("Missing Usage Access Permission");
        return;
      }

      if (allowedMs === 0) {
        const launched = await UsageStats.hasLaunchEvents(startTime, now);
        if (launched) {
          await this._fail("App Launched");
          return;
        }
      }

      if (allowedMs > 0) {
        const totalMs = await UsageStats.getTotalUsage(startTime, now);
        if (totalMs > allowedMs) {
          await this._fail("Usage Limit Exceeded");
          return;
        }
      }

      const remainingMs = Math.max(0, endTime - now);
      const total = endTime - startTime;
      const percent = Math.min(100, Math.round((1 - remainingMs / total) * 100));

      if (this.onProgress) {
        try {
          this.onProgress({ remainingMs, percent });
        } catch {}
      }

      if (now >= endTime) {
        await this._success();
      }
    } catch (err) {
      try {
        await this._fail("Internal Error");
      } catch {}
    }
  }

  async _success() {
    const reward = this.active.reward;

    if (this.onSuccess) {
      try {
        this.onSuccess({ reward });
      } catch {}
    }

    await this._addCoins(reward);
    await this.stopChallenge();
  }

  async _fail(reason) {
    if (this.onFail) {
      try {
        this.onFail({ reason });
      } catch {}
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
