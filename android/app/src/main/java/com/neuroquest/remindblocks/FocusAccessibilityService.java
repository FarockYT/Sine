package com.neuroquest.remindblocks;

import android.accessibilityservice.AccessibilityService;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.view.accessibility.AccessibilityEvent;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Map;

public class FocusAccessibilityService extends AccessibilityService {
    private static final String CHANNEL_ID = "focus_blocks";
    private String lastBlockedPackage = "";
    private long lastBlockedAt = 0L;
    private String lastWarnedPackage = "";
    private long lastWarnedAt = 0L;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) {
            return;
        }

        int eventType = event.getEventType();
        if (eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED && eventType != AccessibilityEvent.TYPE_WINDOWS_CHANGED) {
            return;
        }

        String packageName = event.getPackageName().toString();
        if (packageName.equals(getPackageName())) {
            return;
        }

        SharedPreferences prefs = getSharedPreferences(FocusBlockerPlugin.PREFS, MODE_PRIVATE);
        boolean enabled = prefs.getBoolean(FocusBlockerPlugin.KEY_ENABLED, false);
        long endAt = prefs.getLong(FocusBlockerPlugin.KEY_END_AT, 0L);
        long now = System.currentTimeMillis();

        if (enabled && endAt > 0L && endAt <= now) {
            enabled = false;
            prefs.edit().putBoolean(FocusBlockerPlugin.KEY_ENABLED, false).apply();
        }

        TargetMatch target = null;
        if (enabled) {
            target = findTarget(prefs.getString(FocusBlockerPlugin.KEY_TARGETS, "[]"), packageName, "Shield");
        }
        if (target == null) {
            target = findScheduledTarget(prefs.getString(FocusBlockerPlugin.KEY_SCHEDULES, "[]"), packageName, now);
        }
        if (target == null) {
            target = findLimitTarget(prefs.getString(FocusBlockerPlugin.KEY_LIMITS, "[]"), packageName);
        }
        if (target == null) {
            maybeShowLimitWarning(prefs.getString(FocusBlockerPlugin.KEY_LIMITS, "[]"), packageName, now);
            return;
        }

        if (packageName.equals(lastBlockedPackage) && now - lastBlockedAt < 1800L) {
            return;
        }

        lastBlockedPackage = packageName;
        lastBlockedAt = now;
        int redirectCount = prefs.getInt(FocusBlockerPlugin.KEY_REDIRECT_COUNT, 0) + 1;
        SharedPreferences.Editor editor = prefs.edit()
            .putInt(FocusBlockerPlugin.KEY_REDIRECT_COUNT, redirectCount)
            .putString(FocusBlockerPlugin.KEY_LAST_BLOCKED_LABEL, target.label)
            .putLong(FocusBlockerPlugin.KEY_LAST_BLOCKED_AT, now)
            .putString(FocusBlockerPlugin.KEY_ACTIVE_SCHEDULE_LABEL, target.scheduleLabel);
        if ("Limit".equals(target.reason)) {
            editor.putInt(FocusBlockerPlugin.KEY_LIMIT_BLOCKED_COUNT, prefs.getInt(FocusBlockerPlugin.KEY_LIMIT_BLOCKED_COUNT, 0) + 1);
        }
        editor.apply();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("label", target.label);
        intent.putExtra("packageName", packageName);
        startActivity(intent);
        showBlockedNotification(target);
    }

    @Override
    public void onInterrupt() {
    }

    private TargetMatch findTarget(String targetsJson, String packageName, String reason) {
        try {
            JSONArray targets = new JSONArray(targetsJson);
            for (int i = 0; i < targets.length(); i++) {
                JSONObject target = targets.getJSONObject(i);
                if (packageName.equals(target.optString("packageName"))) {
                    return new TargetMatch(target.optString("label", packageName), reason, "");
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private TargetMatch findScheduledTarget(String schedulesJson, String packageName, long now) {
        try {
            JSONArray schedules = new JSONArray(schedulesJson);
            for (int i = 0; i < schedules.length(); i++) {
                JSONObject schedule = schedules.getJSONObject(i);
                if (!schedule.optBoolean("enabled", false) || !isScheduleActive(schedule, now)) {
                    continue;
                }

                JSONArray targets = schedule.optJSONArray("targets");
                if (targets == null) {
                    continue;
                }

                for (int targetIndex = 0; targetIndex < targets.length(); targetIndex++) {
                    JSONObject target = targets.getJSONObject(targetIndex);
                    if (packageName.equals(target.optString("packageName"))) {
                        String title = schedule.optString("title", "Scheduled focus");
                        return new TargetMatch(target.optString("label", packageName), title, title);
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private TargetMatch findLimitTarget(String limitsJson, String packageName) {
        try {
            JSONArray limits = new JSONArray(limitsJson);
            for (int i = 0; i < limits.length(); i++) {
                JSONObject limit = limits.getJSONObject(i);
                if (!limit.optBoolean("enabled", false) || !packageName.equals(limit.optString("packageName"))) {
                    continue;
                }

                int allowedMinutes = limit.optInt("minutes", 0);
                if (allowedMinutes <= 0) {
                    continue;
                }

                if (getTodayUsageMinutes(packageName) >= allowedMinutes) {
                    return new TargetMatch(limit.optString("label", packageName), "Limit", "");
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private void maybeShowLimitWarning(String limitsJson, String packageName, long now) {
        try {
            JSONArray limits = new JSONArray(limitsJson);
            for (int i = 0; i < limits.length(); i++) {
                JSONObject limit = limits.getJSONObject(i);
                if (!limit.optBoolean("enabled", false) || !packageName.equals(limit.optString("packageName"))) {
                    continue;
                }

                int allowedMinutes = limit.optInt("minutes", 0);
                if (allowedMinutes <= 0) {
                    continue;
                }

                int warnAt = Math.max(50, Math.min(95, limit.optInt("warnAt", 85)));
                int warningMinutes = Math.max(1, (int) Math.ceil(allowedMinutes * (warnAt / 100.0)));
                int usedMinutes = getTodayUsageMinutes(packageName);
                if (usedMinutes < warningMinutes || usedMinutes >= allowedMinutes) {
                    continue;
                }

                if (packageName.equals(lastWarnedPackage) && now - lastWarnedAt < 900000L) {
                    return;
                }

                lastWarnedPackage = packageName;
                lastWarnedAt = now;
                showLimitWarningNotification(limit.optString("label", packageName), usedMinutes, allowedMinutes);
                return;
            }
        } catch (Exception ignored) {
        }
    }

    private int getTodayUsageMinutes(String packageName) {
        UsageStatsManager usageStatsManager = (UsageStatsManager) getSystemService(USAGE_STATS_SERVICE);
        if (usageStatsManager == null) {
            return 0;
        }

        Calendar calendar = Calendar.getInstance();
        long now = calendar.getTimeInMillis();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        Map<String, UsageStats> statsMap = usageStatsManager.queryAndAggregateUsageStats(calendar.getTimeInMillis(), now);
        UsageStats stats = statsMap.get(packageName);
        if (stats == null) {
            return 0;
        }
        return (int) Math.ceil(stats.getTotalTimeInForeground() / 60000.0);
    }

    private boolean isScheduleActive(JSONObject schedule, long now) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(now);
        int minutesNow = calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE);
        int start = parseMinutes(schedule.optString("startTime", "00:00"));
        int end = parseMinutes(schedule.optString("endTime", "00:00"));
        int today = getDayKey(calendar);
        JSONArray days = schedule.optJSONArray("days");

        if (start == end) {
            return containsDay(days, today);
        }

        if (start < end) {
            return containsDay(days, today) && minutesNow >= start && minutesNow < end;
        }

        return (containsDay(days, today) && minutesNow >= start) ||
            (containsDay(days, previousDay(today)) && minutesNow < end);
    }

    private int parseMinutes(String time) {
        try {
            String[] parts = time.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception ignored) {
            return 0;
        }
    }

    private int getDayKey(Calendar calendar) {
        int day = calendar.get(Calendar.DAY_OF_WEEK);
        return day == Calendar.SUNDAY ? 7 : day - 1;
    }

    private int previousDay(int day) {
        return day == 1 ? 7 : day - 1;
    }

    private boolean containsDay(JSONArray days, int day) {
        if (days == null || days.length() == 0) {
            return true;
        }
        for (int i = 0; i < days.length(); i++) {
            if (days.optInt(i) == day) {
                return true;
            }
        }
        return false;
    }

    private void showBlockedNotification(TargetMatch target) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Sine Inverse blocks",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Alerts when Sine Inverse redirects locked apps.");
            manager.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            42,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(target.label + " blocked")
            .setContentText(target.reason + " is active. You're back in Sine Inverse.")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true);

        try {
            manager.notify((int) (System.currentTimeMillis() % Integer.MAX_VALUE), builder.build());
        } catch (SecurityException ignored) {
            // Android 13+ may block notifications until the user grants permission.
        }
    }

    private void showLimitWarningNotification(String label, int usedMinutes, int allowedMinutes) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Sine Inverse blocks",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Alerts when Sine Inverse redirects locked apps and warns before limits.");
            manager.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            43,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        builder
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(label + " limit reminder")
            .setContentText("Used " + usedMinutes + "m of " + allowedMinutes + "m. Blocking starts soon.")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true);

        try {
            manager.notify((int) ((System.currentTimeMillis() + 17L) % Integer.MAX_VALUE), builder.build());
        } catch (SecurityException ignored) {
            // Android 13+ may block notifications until the user grants permission.
        }
    }

    private static class TargetMatch {
        final String label;
        final String reason;
        final String scheduleLabel;

        TargetMatch(String label, String reason, String scheduleLabel) {
            this.label = label;
            this.reason = reason;
            this.scheduleLabel = scheduleLabel;
        }
    }
}
