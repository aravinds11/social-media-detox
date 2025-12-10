package com.detoxmobile.app.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.os.Process
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream
import java.util.*

class UsageStatsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val ctx = reactContext.applicationContext
  private val manager = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
  private val pm: PackageManager = ctx.packageManager

  private val tracked = listOf(
    "com.instagram.android",
    "com.facebook.katana",
    "com.snapchat.android",
    "com.zhiliaoapp.musically",
    "com.google.android.youtube",
    "com.twitter.android"
  )

  override fun getName(): String = "UsageStats"

  @ReactMethod
  fun hasPermission(promise: Promise) {
    try {
      val ops = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = ops.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        ctx.packageName
      )
      promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun getTotalUsage(startMs: Double, endMs: Double, promise: Promise) {
    try {
      val stats = manager.queryUsageStats(
        UsageStatsManager.INTERVAL_BEST,
        startMs.toLong(),
        endMs.toLong()
      )
      var total = 0L
      stats?.forEach { total += it.totalTimeInForeground }
      promise.resolve(total)
    } catch (e: Exception) {
      promise.resolve(0)
    }
  }

  @ReactMethod
  fun hasLaunchEvents(startMs: Double, endMs: Double, promise: Promise) {
    try {
      val events = manager.queryEvents(startMs.toLong(), endMs.toLong())
      val event = UsageEvents.Event()
      while (events.hasNextEvent()) {
        events.getNextEvent(event)
        if (
          event.eventType == UsageEvents.Event.ACTIVITY_RESUMED ||
          event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND
        ) {
          promise.resolve(true)
          return
        }
      }
      promise.resolve(false)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun getTrackedApps(promise: Promise) {
    val arr = Arguments.createArray()
    tracked.forEach { arr.pushString(it) }
    promise.resolve(arr)
  }

  @ReactMethod
  fun getPerAppUsage(startMs: Double, endMs: Double, promise: Promise) {
    try {
      val stats = manager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startMs.toLong(),
        endMs.toLong()
      )

      val filtered = stats.filter {
        tracked.contains(it.packageName) && it.totalTimeInForeground > 0
      }

      val arr = Arguments.createArray()
      val max = filtered.maxOfOrNull { it.totalTimeInForeground } ?: 0

      filtered.sortedByDescending { it.totalTimeInForeground }.forEach { us: UsageStats ->
        val map = Arguments.createMap()
        val pkg = us.packageName

        val label = try {
          val info = pm.getApplicationInfo(pkg, 0)
          pm.getApplicationLabel(info).toString()
        } catch (e: Exception) {
          pkg
        }

        val minutes = (us.totalTimeInForeground / 60000.0).toInt()
        val pct = if (max > 0) us.totalTimeInForeground.toDouble() / max else 0.0

        val iconBase64 = try {
          val info = pm.getApplicationInfo(pkg, 0)
          val drawable = pm.getApplicationIcon(info)
          val bmp = (drawable as BitmapDrawable).bitmap
          val stream = ByteArrayOutputStream()
          bmp.compress(Bitmap.CompressFormat.PNG, 90, stream)
          Base64.encodeToString(stream.toByteArray(), Base64.DEFAULT)
        } catch (e: Exception) {
          ""
        }

        map.putString("id", pkg)
        map.putString("label", label)
        map.putString("time", "${minutes}m")
        map.putInt("minutes", minutes)
        map.putDouble("pct", pct)
        map.putString("icon", "data:image/png;base64,$iconBase64")

        arr.pushMap(map)
      }

      promise.resolve(arr)
    } catch (e: Exception) {
      promise.reject("ERR_GET_USAGE", e)
    }
  }

  @ReactMethod
  fun getDailyMetrics(startMs: Double, endMs: Double, promise: Promise) {
    try {
      val events = manager.queryEvents(startMs.toLong(), endMs.toLong())
      val event = UsageEvents.Event()

      var totalScreen = 0L
      var lastForegroundStart = 0L
      var lastApp: String? = null
      var switches = 0
      val sessions = mutableListOf<Long>()
      var nightActivity = 0L

      val cal = Calendar.getInstance()

      while (events.hasNextEvent()) {
        events.getNextEvent(event)
        val pkg = event.packageName
        if (!tracked.contains(pkg)) continue

        when (event.eventType) {
          UsageEvents.Event.MOVE_TO_FOREGROUND -> {
            lastForegroundStart = event.timeStamp
            if (lastApp != null && lastApp != pkg) switches++
            lastApp = pkg
          }

          UsageEvents.Event.MOVE_TO_BACKGROUND -> {
            if (lastForegroundStart > 0) {
              val duration = event.timeStamp - lastForegroundStart
              if (duration > 0) {
                sessions.add(duration)
                totalScreen += duration
                cal.timeInMillis = lastForegroundStart
                val hour = cal.get(Calendar.HOUR_OF_DAY)
                if (hour >= 22 || hour < 4) nightActivity += duration
              }
            }
            lastForegroundStart = 0L
          }
        }
      }

      val avgSession = if (sessions.isNotEmpty()) {
        (sessions.average() / 60000).toInt()
      } else 0

      val minutes = (totalScreen / 60000).toInt()
      val nightMinutes = (nightActivity / 60000).toInt()

      val map = Arguments.createMap()
      map.putInt("daily_screen_time", minutes)
      map.putInt("session_duration", avgSession)
      map.putInt("app_switches", switches)
      map.putInt("night_activity", nightMinutes)

      promise.resolve(map)

    } catch (e: Exception) {
      promise.reject("ERR_METRICS", e)
    }
  }
}
