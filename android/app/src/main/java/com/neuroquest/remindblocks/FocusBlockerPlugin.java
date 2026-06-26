package com.neuroquest.remindblocks;

import android.Manifest;
import android.content.Context;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.pm.ActivityInfo;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.AlarmClock;
import android.provider.CalendarContract;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.text.SimpleDateFormat;
import java.io.ByteArrayOutputStream;
import java.util.Locale;
import java.util.TimeZone;

@CapacitorPlugin(
    name = "FocusBlocker",
    permissions = @Permission(
        alias = "calendar",
        strings = { Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR }
    )
)
public class FocusBlockerPlugin extends Plugin {
    public static final String CALENDAR_PERMISSION = "calendar";
    public static final String PREFS = "focus_blocker_prefs";
    public static final String KEY_ENABLED = "enabled";
    public static final String KEY_STRICT = "strict";
    public static final String KEY_END_AT = "endAt";
    public static final String KEY_TARGETS = "targets";
    public static final String KEY_SCHEDULES = "schedules";
    public static final String KEY_LIMITS = "limits";
    public static final String KEY_REDIRECT_COUNT = "redirectCount";
    public static final String KEY_LIMIT_BLOCKED_COUNT = "limitBlockedCount";
    public static final String KEY_LAST_BLOCKED_LABEL = "lastBlockedLabel";
    public static final String KEY_LAST_BLOCKED_AT = "lastBlockedAt";
    public static final String KEY_ACTIVE_SCHEDULE_LABEL = "activeScheduleLabel";

    @PluginMethod
    public void setConfig(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        boolean strict = Boolean.TRUE.equals(call.getBoolean("strict", true));
        long endAt = getLongValue(call, "endAt", 0L);
        JSArray targetsArray = call.getArray("targets", new JSArray());
        JSArray schedulesArray = call.getArray("schedules", new JSArray());
        JSArray limitsArray = call.getArray("limits", new JSArray());
        String targets = targetsArray == null ? "[]" : targetsArray.toString();
        String schedules = schedulesArray == null ? "[]" : schedulesArray.toString();
        String limits = limitsArray == null ? "[]" : limitsArray.toString();

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean(KEY_ENABLED, enabled)
            .putBoolean(KEY_STRICT, strict)
            .putLong(KEY_END_AT, endAt)
            .putString(KEY_TARGETS, targets)
            .putString(KEY_SCHEDULES, schedules)
            .putString(KEY_LIMITS, limits)
            .apply();

        syncBackgroundGuard(enabled || countTargets(schedules) > 0 || countTargets(limits) > 0);

        JSObject response = new JSObject();
        response.put("enabled", enabled);
        response.put("count", countTargets(targets));
        call.resolve(response);
    }

    @PluginMethod
    public void listInstalledApps(PluginCall call) {
        PackageManager packageManager = getContext().getPackageManager();
        Intent launcherIntent = new Intent(Intent.ACTION_MAIN, null);
        launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> launchableApps = packageManager.queryIntentActivities(launcherIntent, 0);
        List<JSObject> apps = new ArrayList<>();

        for (ResolveInfo info : launchableApps) {
            if (info.activityInfo == null || info.activityInfo.packageName == null) {
                continue;
            }

            String packageName = info.activityInfo.packageName;
            if (packageName.equals(getContext().getPackageName())) {
                continue;
            }

            CharSequence labelValue = info.loadLabel(packageManager);
            JSObject app = new JSObject();
            app.put("label", labelValue == null ? packageName : labelValue.toString());
            app.put("packageName", packageName);
            app.put("category", getCategoryLabel(info.activityInfo.applicationInfo));
            app.put("supportsPiP", supportsPictureInPicture(info.activityInfo));
            String icon = getAppIconDataUri(info, packageManager);
            if (!icon.isEmpty()) {
                app.put("icon", icon);
            }
            apps.add(app);
        }

        apps.sort(Comparator.comparing(app -> app.getString("label", "")));
        JSArray resultApps = new JSArray();
        for (JSObject app : apps) {
            resultApps.put(app);
        }

        JSObject response = new JSObject();
        response.put("apps", resultApps);
        call.resolve(response);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void setPhoneAlarm(PluginCall call) {
        String title = call.getString("title", "Sine Inverse alarm");
        String time = call.getString("time", "06:30");
        JSArray daysArray = call.getArray("days", new JSArray());
        boolean skipUi = Boolean.TRUE.equals(call.getBoolean("skipUi", true));

        String[] parts = time.split(":");
        int hour;
        int minute;
        try {
            hour = Integer.parseInt(parts[0]);
            minute = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        } catch (Exception exception) {
            call.reject("Invalid alarm time");
            return;
        }

        Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);
        intent.putExtra(AlarmClock.EXTRA_MESSAGE, title);
        intent.putExtra(AlarmClock.EXTRA_HOUR, Math.max(0, Math.min(23, hour)));
        intent.putExtra(AlarmClock.EXTRA_MINUTES, Math.max(0, Math.min(59, minute)));
        intent.putExtra(AlarmClock.EXTRA_VIBRATE, true);
        intent.putExtra(AlarmClock.EXTRA_SKIP_UI, skipUi);
        ArrayList<Integer> clockDays = toClockDays(daysArray);
        if (!clockDays.isEmpty()) {
            intent.putExtra(AlarmClock.EXTRA_DAYS, clockDays);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PackageManager packageManager = getContext().getPackageManager();
        List<ResolveInfo> clockApps = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
        if (clockApps.isEmpty()) {
            call.reject("No Android Clock app is available for alarms");
            return;
        }

        try {
            getContext().startActivity(intent);
            JSObject response = new JSObject();
            response.put("opened", true);
            response.put("skipUi", skipUi);
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Could not open the Android Clock alarm screen");
        }
    }

    @PluginMethod
    public void openClockAlarms(PluginCall call) {
        Intent intent = new Intent(AlarmClock.ACTION_SHOW_ALARMS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception exception) {
            call.reject("Could not open Android Clock");
        }
    }

    @PluginMethod
    public void dismissPhoneAlarm(PluginCall call) {
        String title = call.getString("title", "");
        String time = call.getString("time", "");
        Intent intent = new Intent(AlarmClock.ACTION_DISMISS_ALARM);
        if (!title.isEmpty()) {
            intent.putExtra(AlarmClock.EXTRA_ALARM_SEARCH_MODE, AlarmClock.ALARM_SEARCH_MODE_LABEL);
            intent.putExtra(AlarmClock.EXTRA_MESSAGE, title);
        } else if (!time.isEmpty()) {
            String[] parts = time.split(":");
            try {
                intent.putExtra(AlarmClock.EXTRA_ALARM_SEARCH_MODE, AlarmClock.ALARM_SEARCH_MODE_TIME);
                intent.putExtra(AlarmClock.EXTRA_HOUR, Integer.parseInt(parts[0]));
                intent.putExtra(AlarmClock.EXTRA_MINUTES, parts.length > 1 ? Integer.parseInt(parts[1]) : 0);
            } catch (Exception ignored) {
                intent.putExtra(AlarmClock.EXTRA_ALARM_SEARCH_MODE, AlarmClock.ALARM_SEARCH_MODE_NEXT);
            }
        } else {
            intent.putExtra(AlarmClock.EXTRA_ALARM_SEARCH_MODE, AlarmClock.ALARM_SEARCH_MODE_NEXT);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception exception) {
            call.reject("Could not dismiss matching Android Clock alarm");
        }
    }

    @PluginMethod
    public void openUsageSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openCalendarEvent(PluginCall call) {
        String title = call.getString("title", "Sine Inverse focus");
        String description = call.getString("description", "Created by Sine Inverse");
        long startAt = getLongValue(call, "startAt", System.currentTimeMillis());
        long endAt = getLongValue(call, "endAt", startAt + 3600000L);

        Intent intent = new Intent(Intent.ACTION_INSERT)
            .setData(CalendarContract.Events.CONTENT_URI)
            .putExtra(CalendarContract.Events.TITLE, title)
            .putExtra(CalendarContract.Events.DESCRIPTION, description)
            .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, startAt)
            .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, Math.max(startAt + 60000L, endAt));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        try {
            getContext().startActivity(intent);
            JSObject response = new JSObject();
            response.put("opened", true);
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Could not open Calendar");
        }
    }

    @PluginMethod
    public void requestCalendarAccess(PluginCall call) {
        if (getPermissionState(CALENDAR_PERMISSION) == PermissionState.GRANTED) {
            resolveCalendarPermission(call);
            return;
        }
        requestPermissionForAlias(CALENDAR_PERMISSION, call, "calendarPermissionCallback");
    }

    @PermissionCallback
    private void calendarPermissionCallback(PluginCall call) {
        resolveCalendarPermission(call);
    }

    @PluginMethod
    public void checkCalendarAccess(PluginCall call) {
        resolveCalendarPermission(call);
    }

    @PluginMethod
    public void listCalendarEvents(PluginCall call) {
        if (!hasCalendarPermission()) {
            call.reject("Calendar permission required");
            return;
        }

        long now = System.currentTimeMillis();
        long startAt = getLongValue(call, "startAt", now);
        long endAt = getLongValue(call, "endAt", now + 14L * 24L * 60L * 60L * 1000L);
        Uri.Builder builder = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(builder, startAt);
        ContentUris.appendId(builder, endAt);

        String[] projection = {
            CalendarContract.Instances.EVENT_ID,
            CalendarContract.Instances.TITLE,
            CalendarContract.Instances.DESCRIPTION,
            CalendarContract.Instances.BEGIN,
            CalendarContract.Instances.END,
            CalendarContract.Instances.ALL_DAY,
            CalendarContract.Instances.CALENDAR_DISPLAY_NAME
        };
        JSArray events = new JSArray();
        try (Cursor cursor = getContext().getContentResolver().query(
            builder.build(),
            projection,
            null,
            null,
            CalendarContract.Instances.BEGIN + " ASC"
        )) {
            if (cursor != null) {
                while (cursor.moveToNext() && events.length() < 80) {
                    JSObject event = new JSObject();
                    event.put("eventId", cursor.getLong(0));
                    event.put("title", cursor.getString(1) == null ? "Calendar event" : cursor.getString(1));
                    event.put("description", cursor.getString(2) == null ? "" : cursor.getString(2));
                    event.put("startAt", cursor.getLong(3));
                    event.put("endAt", cursor.getLong(4));
                    event.put("allDay", cursor.getInt(5) == 1);
                    event.put("calendarName", cursor.getString(6) == null ? "Calendar" : cursor.getString(6));
                    events.put(event);
                }
            }
            JSObject response = new JSObject();
            response.put("events", events);
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Could not read Calendar events");
        }
    }

    @PluginMethod
    public void saveCalendarEvent(PluginCall call) {
        if (!hasCalendarPermission()) {
            call.reject("Calendar permission required");
            return;
        }

        long eventId = getLongValue(call, "eventId", 0L);
        long startAt = getLongValue(call, "startAt", System.currentTimeMillis());
        long endAt = getLongValue(call, "endAt", startAt + 3600000L);
        String title = call.getString("title", "Sine Inverse focus");
        String description = call.getString("description", "Created by Sine Inverse");

        ContentValues values = new ContentValues();
        values.put(CalendarContract.Events.TITLE, title);
        values.put(CalendarContract.Events.DESCRIPTION, description);
        values.put(CalendarContract.Events.DTSTART, startAt);
        values.put(CalendarContract.Events.DTEND, Math.max(startAt + 60000L, endAt));
        values.put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());

        ContentResolver resolver = getContext().getContentResolver();
        try {
            if (eventId > 0) {
                int updated = resolver.update(ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId), values, null, null);
                if (updated > 0) {
                    JSObject response = new JSObject();
                    response.put("eventId", eventId);
                    response.put("updated", true);
                    call.resolve(response);
                    return;
                }
            }

            long calendarId = getWritableCalendarId();
            if (calendarId <= 0) {
                call.reject("No writable Calendar found");
                return;
            }
            values.put(CalendarContract.Events.CALENDAR_ID, calendarId);
            Uri eventUri = resolver.insert(CalendarContract.Events.CONTENT_URI, values);
            if (eventUri == null || eventUri.getLastPathSegment() == null) {
                call.reject("Could not create Calendar event");
                return;
            }
            JSObject response = new JSObject();
            response.put("eventId", Long.parseLong(eventUri.getLastPathSegment()));
            response.put("updated", false);
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Could not save Calendar event");
        }
    }

    @PluginMethod
    public void deleteCalendarEvent(PluginCall call) {
        if (!hasCalendarPermission()) {
            call.reject("Calendar permission required");
            return;
        }
        long eventId = getLongValue(call, "eventId", 0L);
        if (eventId <= 0) {
            JSObject response = new JSObject();
            response.put("deleted", false);
            call.resolve(response);
            return;
        }

        try {
            int deleted = getContext().getContentResolver().delete(
                ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId),
                null,
                null
            );
            JSObject response = new JSObject();
            response.put("deleted", deleted > 0);
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Could not delete Calendar event");
        }
    }

    @PluginMethod
    public void getSharedText(PluginCall call) {
        Intent intent = getActivity() == null ? null : getActivity().getIntent();
        JSObject response = new JSObject();
        response.put("text", extractSharedText(intent));
        call.resolve(response);
    }

    @PluginMethod
    public void clearSharedText(PluginCall call) {
        if (getActivity() != null) {
            Intent cleanIntent = new Intent(getContext(), MainActivity.class);
            getActivity().setIntent(cleanIntent);
        }
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSObject response = new JSObject();
        response.put("accessibilityEnabled", isAccessibilityEnabled());
        response.put("usageAccessEnabled", hasUsageStatsPermission());
        response.put("focusEnabled", prefs.getBoolean(KEY_ENABLED, false));
        response.put("blockedCount", countTargets(prefs.getString(KEY_TARGETS, "[]")));
        response.put("redirectCount", prefs.getInt(KEY_REDIRECT_COUNT, 0));
        response.put("limitBlockedCount", prefs.getInt(KEY_LIMIT_BLOCKED_COUNT, 0));
        response.put("lastBlockedLabel", prefs.getString(KEY_LAST_BLOCKED_LABEL, ""));
        response.put("lastBlockedAt", prefs.getLong(KEY_LAST_BLOCKED_AT, 0L));
        response.put("activeScheduleLabel", getActiveScheduleLabel(prefs.getString(KEY_SCHEDULES, "[]"), System.currentTimeMillis()));
        call.resolve(response);
    }

    @PluginMethod
    public void getUsageHistory(PluginCall call) {
        int days = Math.max(1, call.getInt("days", 1));
        JSArray limitsArray = call.getArray("limits", new JSArray());
        Map<String, LimitConfig> limits = parseLimits(limitsArray == null ? "[]" : limitsArray.toString());
        JSObject response = new JSObject();
        JSArray apps = new JSArray();
        JSArray dayRows = new JSArray();

        if (!hasUsageStatsPermission()) {
            response.put("apps", apps);
            response.put("days", dayRows);
            call.resolve(response);
            return;
        }

        UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        if (usageStatsManager == null) {
            response.put("apps", apps);
            response.put("days", dayRows);
            call.resolve(response);
            return;
        }

        long now = System.currentTimeMillis();
        Calendar todayStart = Calendar.getInstance();
        todayStart.set(Calendar.HOUR_OF_DAY, 0);
        todayStart.set(Calendar.MINUTE, 0);
        todayStart.set(Calendar.SECOND, 0);
        todayStart.set(Calendar.MILLISECOND, 0);

        Map<String, UsageStats> statsMap = usageStatsManager.queryAndAggregateUsageStats(todayStart.getTimeInMillis(), now);
        List<JSObject> rows = new ArrayList<>();
        for (Map.Entry<String, UsageStats> entry : statsMap.entrySet()) {
            UsageStats stat = entry.getValue();
            long foreground = stat == null ? 0L : stat.getTotalTimeInForeground();
            if (foreground <= 0L) {
                continue;
            }

            String packageName = entry.getKey();
            int minutes = (int) Math.ceil(foreground / 60000.0);
            LimitConfig limit = limits.get(packageName);
            ApplicationInfo applicationInfo = getApplicationInfo(packageName);
            String label = limit != null && !limit.label.isEmpty() ? limit.label : getAppLabel(packageName);
            String category = getCategoryLabel(applicationInfo);
            JSObject row = new JSObject();
            row.put("label", label);
            row.put("packageName", packageName);
            row.put("minutes", minutes);
            row.put("lastTimeUsed", stat.getLastTimeUsed());
            row.put("category", category);
            row.put("supportsPiP", supportsPictureInPicture(packageName));
            if (limit != null) {
                row.put("limitMinutes", limit.minutes);
                row.put("overLimit", limit.enabled && minutes >= limit.minutes);
            }
            rows.add(row);
        }

        rows.sort((left, right) -> Integer.compare(right.getInteger("minutes", 0), left.getInteger("minutes", 0)));
        for (int i = 0; i < Math.min(rows.size(), 80); i++) {
            apps.put(rows.get(i));
        }

        response.put("apps", apps);
        response.put("days", buildUsageDays(usageStatsManager, days, now));
        call.resolve(response);
    }

    private long getLongValue(PluginCall call, String key, long fallback) {
        Object value = call.getData().opt(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return fallback;
    }

    private void resolveCalendarPermission(PluginCall call) {
        JSObject response = new JSObject();
        response.put("calendar", hasCalendarPermission() ? "granted" : "denied");
        call.resolve(response);
    }

    private boolean hasCalendarPermission() {
        return getPermissionState(CALENDAR_PERMISSION) == PermissionState.GRANTED;
    }

    private long getWritableCalendarId() {
        String[] projection = {
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL
        };
        String selection = CalendarContract.Calendars.VISIBLE + " = 1 AND " +
            CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + " >= ?";
        String[] args = { String.valueOf(CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR) };

        try (Cursor cursor = getContext().getContentResolver().query(
            CalendarContract.Calendars.CONTENT_URI,
            projection,
            selection,
            args,
            CalendarContract.Calendars.IS_PRIMARY + " DESC"
        )) {
            if (cursor != null && cursor.moveToFirst()) {
                return cursor.getLong(0);
            }
        } catch (Exception ignored) {
        }
        return -1L;
    }

    private String extractSharedText(Intent intent) {
        if (intent == null) {
            return "";
        }

        String action = intent.getAction();
        if (Intent.ACTION_SEND.equals(action)) {
            CharSequence text = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
            return text == null ? "" : text.toString();
        }

        if (Intent.ACTION_PROCESS_TEXT.equals(action)) {
            CharSequence text = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
            return text == null ? "" : text.toString();
        }

        if (Intent.ACTION_VIEW.equals(action) && intent.getDataString() != null) {
            return intent.getDataString();
        }

        return "";
    }

    private int countTargets(String targets) {
        try {
            return new JSONArray(targets).length();
        } catch (Exception ignored) {
            return 0;
        }
    }

    private void syncBackgroundGuard(boolean shouldRun) {
        Intent intent = new Intent(getContext(), FocusGuardService.class);
        if (shouldRun) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
            return;
        }
        getContext().stopService(intent);
    }

    private Map<String, LimitConfig> parseLimits(String limitsJson) {
        Map<String, LimitConfig> limits = new HashMap<>();
        try {
            JSONArray items = new JSONArray(limitsJson);
            for (int i = 0; i < items.length(); i++) {
                org.json.JSONObject item = items.getJSONObject(i);
                String packageName = item.optString("packageName", "");
                if (packageName.isEmpty()) {
                    continue;
                }
                limits.put(packageName, new LimitConfig(
                    item.optString("label", packageName),
                    packageName,
                    item.optInt("minutes", 0),
                    item.optBoolean("enabled", false)
                ));
            }
        } catch (Exception ignored) {
        }
        return limits;
    }

    private String getAppLabel(String packageName) {
        try {
            PackageManager packageManager = getContext().getPackageManager();
            ApplicationInfo info = packageManager.getApplicationInfo(packageName, 0);
            CharSequence label = packageManager.getApplicationLabel(info);
            return label == null ? packageName : label.toString();
        } catch (Exception ignored) {
            return packageName;
        }
    }

    private ApplicationInfo getApplicationInfo(String packageName) {
        try {
            return getContext().getPackageManager().getApplicationInfo(packageName, 0);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String getAppIconDataUri(ResolveInfo info, PackageManager packageManager) {
        try {
            Drawable drawable = info.loadIcon(packageManager);
            if (drawable == null) {
                return "";
            }

            int size = 72;
            Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, size, size);
            drawable.draw(canvas);

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 92, output);
            bitmap.recycle();
            return "data:image/png;base64," + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
        } catch (Exception ignored) {
            return "";
        }
    }

    private ArrayList<Integer> toClockDays(JSArray daysArray) {
        ArrayList<Integer> clockDays = new ArrayList<>();
        if (daysArray == null) {
            return clockDays;
        }

        for (int i = 0; i < daysArray.length(); i++) {
            int day = daysArray.optInt(i, 0);
            int clockDay = 0;
            switch (day) {
                case 1:
                    clockDay = Calendar.MONDAY;
                    break;
                case 2:
                    clockDay = Calendar.TUESDAY;
                    break;
                case 3:
                    clockDay = Calendar.WEDNESDAY;
                    break;
                case 4:
                    clockDay = Calendar.THURSDAY;
                    break;
                case 5:
                    clockDay = Calendar.FRIDAY;
                    break;
                case 6:
                    clockDay = Calendar.SATURDAY;
                    break;
                case 7:
                    clockDay = Calendar.SUNDAY;
                    break;
                default:
                    break;
            }
            if (clockDay != 0 && !clockDays.contains(clockDay)) {
                clockDays.add(clockDay);
            }
        }
        return clockDays;
    }

    private String getCategoryLabel(ApplicationInfo info) {
        if (info == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return "Installed";
        }

        switch (info.category) {
            case ApplicationInfo.CATEGORY_GAME:
                return "Games";
            case ApplicationInfo.CATEGORY_VIDEO:
                return "Video";
            case ApplicationInfo.CATEGORY_SOCIAL:
                return "Social";
            case ApplicationInfo.CATEGORY_PRODUCTIVITY:
                return "Productivity";
            default:
                return "Installed";
        }
    }

    private boolean supportsPictureInPicture(ActivityInfo info) {
        if (info == null || info.packageName == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return false;
        }
        String packageName = info.packageName.toLowerCase(Locale.US);
        return packageName.contains("youtube") ||
            packageName.contains("netflix") ||
            packageName.contains("chrome") ||
            packageName.contains("vlc") ||
            packageName.contains("twitch") ||
            packageName.contains("primevideo") ||
            packageName.contains("disney") ||
            packageName.contains("hulu") ||
            packageName.contains("mxtech");
    }

    private boolean supportsPictureInPicture(String packageName) {
        PackageManager packageManager = getContext().getPackageManager();
        Intent launcherIntent = new Intent(Intent.ACTION_MAIN, null);
        launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        launcherIntent.setPackage(packageName);
        List<ResolveInfo> launchableApps = packageManager.queryIntentActivities(launcherIntent, 0);
        for (ResolveInfo info : launchableApps) {
            if (info.activityInfo != null && supportsPictureInPicture(info.activityInfo)) {
                return true;
            }
        }
        return false;
    }

    private JSArray buildUsageDays(UsageStatsManager usageStatsManager, int days, long now) {
        JSArray result = new JSArray();
        Calendar cursor = Calendar.getInstance();
        cursor.add(Calendar.DATE, -(days - 1));
        cursor.set(Calendar.HOUR_OF_DAY, 0);
        cursor.set(Calendar.MINUTE, 0);
        cursor.set(Calendar.SECOND, 0);
        cursor.set(Calendar.MILLISECOND, 0);
        SimpleDateFormat labelFormat = new SimpleDateFormat("EEE", Locale.getDefault());

        for (int i = 0; i < days; i++) {
            long start = cursor.getTimeInMillis();
            Calendar endCursor = (Calendar) cursor.clone();
            endCursor.add(Calendar.DATE, 1);
            long end = Math.min(endCursor.getTimeInMillis(), now);
            Map<String, UsageStats> statsMap = usageStatsManager.queryAndAggregateUsageStats(start, end);
            int productive = 0;
            int disturbance = 0;
            int neutral = 0;

            for (Map.Entry<String, UsageStats> entry : statsMap.entrySet()) {
                UsageStats stat = entry.getValue();
                long foreground = stat == null ? 0L : stat.getTotalTimeInForeground();
                if (foreground <= 0L) {
                    continue;
                }

                String packageName = entry.getKey();
                String label = getAppLabel(packageName);
                String category = getCategoryLabel(getApplicationInfo(packageName));
                int minutes = (int) Math.ceil(foreground / 60000.0);
                if (isProductiveUsage(label, packageName, category)) {
                    productive += minutes;
                } else if (isDisturbanceUsage(label, packageName, category)) {
                    disturbance += minutes;
                } else {
                    neutral += minutes;
                }
            }

            int total = productive + disturbance + neutral;
            JSObject day = new JSObject();
            day.put("label", labelFormat.format(cursor.getTime()));
            day.put("date", String.valueOf(start));
            day.put("totalMinutes", total);
            day.put("productiveMinutes", productive);
            day.put("disturbanceMinutes", disturbance);
            day.put("neutralMinutes", neutral);
            day.put("productivityScore", total == 0 ? 0 : Math.round((productive * 100f) / total));
            result.put(day);
            cursor.add(Calendar.DATE, 1);
        }
        return result;
    }

    private boolean isProductiveUsage(String label, String packageName, String category) {
        String value = (label + " " + packageName + " " + category).toLowerCase(Locale.US);
        return value.contains("productivity") ||
            value.contains("docs") ||
            value.contains("notion") ||
            value.contains("calendar") ||
            value.contains("mail") ||
            value.contains("classroom") ||
            value.contains("drive") ||
            value.contains("office") ||
            value.contains("tasks") ||
            value.contains("todo") ||
            value.contains("slack") ||
            value.contains("teams") ||
            value.contains("zoom");
    }

    private boolean isDisturbanceUsage(String label, String packageName, String category) {
        String value = (label + " " + packageName + " " + category).toLowerCase(Locale.US);
        return value.contains("social") ||
            value.contains("video") ||
            value.contains("games") ||
            value.contains("browser") ||
            value.contains("instagram") ||
            value.contains("youtube") ||
            value.contains("tiktok") ||
            value.contains("snap") ||
            value.contains("facebook") ||
            value.contains("reddit") ||
            value.contains("netflix") ||
            value.contains("chrome") ||
            value.contains("roblox") ||
            value.contains("shorts") ||
            value.contains("reels");
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) {
            return false;
        }

        int mode;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mode = appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                getContext().getPackageName()
            );
        } else {
            mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                getContext().getPackageName()
            );
        }
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private String getActiveScheduleLabel(String schedulesJson, long now) {
        try {
            JSONArray schedules = new JSONArray(schedulesJson);
            for (int i = 0; i < schedules.length(); i++) {
                org.json.JSONObject schedule = schedules.getJSONObject(i);
                if (schedule.optBoolean("enabled", false) && isScheduleActive(schedule, now)) {
                    return schedule.optString("title", "Scheduled focus");
                }
            }
        } catch (Exception ignored) {
        }
        return "";
    }

    private boolean isScheduleActive(org.json.JSONObject schedule, long now) {
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

    private boolean isAccessibilityEnabled() {
        String enabledServices = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        if (enabledServices == null) {
            return false;
        }

        String expected = getContext().getPackageName() + "/" + FocusAccessibilityService.class.getName();
        TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
        splitter.setString(enabledServices);
        while (splitter.hasNext()) {
            if (expected.equalsIgnoreCase(splitter.next())) {
                return true;
            }
        }
        return false;
    }

    private static class LimitConfig {
        final String label;
        final String packageName;
        final int minutes;
        final boolean enabled;

        LimitConfig(String label, String packageName, int minutes, boolean enabled) {
            this.label = label;
            this.packageName = packageName;
            this.minutes = minutes;
            this.enabled = enabled;
        }
    }
}
