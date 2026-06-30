package com.neuroquest.remindblocks;

import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.os.Build;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class UsageTracker {
    public static class UsageEntry {
        public long foregroundMillis = 0L;
        public long lastTimeUsed = 0L;
    }

    public static long startOfTodayMillis() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTimeInMillis();
    }

    public static int getPackageMinutes(Context context, String packageName, long startAt, long endAt) {
        UsageEntry entry = queryUsage(context, startAt, endAt).get(packageName);
        if (entry == null || entry.foregroundMillis <= 0L) {
            return 0;
        }
        return (int) Math.ceil(entry.foregroundMillis / 60000.0);
    }

    public static Map<String, UsageEntry> queryUsage(Context context, long startAt, long endAt) {
        Map<String, UsageEntry> result = new HashMap<>();
        if (context == null || endAt <= startAt) {
            return result;
        }

        UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        if (usageStatsManager == null) {
            return result;
        }

        UsageEvents events = usageStatsManager.queryEvents(startAt, endAt);
        if (events == null) {
            return result;
        }

        Map<String, Long> activeSince = new HashMap<>();
        UsageEvents.Event event = new UsageEvents.Event();
        while (events.hasNextEvent()) {
            events.getNextEvent(event);
            String packageName = event.getPackageName();
            if (packageName == null || packageName.isEmpty()) {
                continue;
            }

            int type = event.getEventType();
            long eventTime = Math.max(startAt, Math.min(event.getTimeStamp(), endAt));
            UsageEntry entry = getEntry(result, packageName);

            if (isForegroundEvent(type)) {
                activeSince.put(packageName, eventTime);
                entry.lastTimeUsed = Math.max(entry.lastTimeUsed, eventTime);
                continue;
            }

            if (isBackgroundEvent(type)) {
                long foregroundStart = activeSince.containsKey(packageName)
                    ? activeSince.remove(packageName)
                    : startAt;
                if (eventTime > foregroundStart) {
                    entry.foregroundMillis += eventTime - foregroundStart;
                }
                entry.lastTimeUsed = Math.max(entry.lastTimeUsed, eventTime);
            }
        }

        for (Map.Entry<String, Long> active : activeSince.entrySet()) {
            UsageEntry entry = getEntry(result, active.getKey());
            long foregroundStart = Math.max(startAt, active.getValue());
            if (endAt > foregroundStart) {
                entry.foregroundMillis += endAt - foregroundStart;
                entry.lastTimeUsed = Math.max(entry.lastTimeUsed, endAt);
            }
        }

        return result;
    }

    private static UsageEntry getEntry(Map<String, UsageEntry> usage, String packageName) {
        UsageEntry entry = usage.get(packageName);
        if (entry == null) {
            entry = new UsageEntry();
            usage.put(packageName, entry);
        }
        return entry;
    }

    private static boolean isForegroundEvent(int type) {
        return type == UsageEvents.Event.MOVE_TO_FOREGROUND ||
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && type == UsageEvents.Event.ACTIVITY_RESUMED);
    }

    private static boolean isBackgroundEvent(int type) {
        return type == UsageEvents.Event.MOVE_TO_BACKGROUND ||
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && type == UsageEvents.Event.ACTIVITY_PAUSED);
    }
}
