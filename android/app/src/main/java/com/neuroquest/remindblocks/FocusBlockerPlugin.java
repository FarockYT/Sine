package com.neuroquest.remindblocks;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@CapacitorPlugin(name = "FocusBlocker")
public class FocusBlockerPlugin extends Plugin {
    public static final String PREFS = "focus_blocker_prefs";
    public static final String KEY_ENABLED = "enabled";
    public static final String KEY_STRICT = "strict";
    public static final String KEY_END_AT = "endAt";
    public static final String KEY_TARGETS = "targets";
    public static final String KEY_REDIRECT_COUNT = "redirectCount";
    public static final String KEY_LAST_BLOCKED_LABEL = "lastBlockedLabel";
    public static final String KEY_LAST_BLOCKED_AT = "lastBlockedAt";

    @PluginMethod
    public void setConfig(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        boolean strict = Boolean.TRUE.equals(call.getBoolean("strict", true));
        long endAt = getLongValue(call, "endAt", 0L);
        JSArray targetsArray = call.getArray("targets", new JSArray());
        String targets = targetsArray == null ? "[]" : targetsArray.toString();

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean(KEY_ENABLED, enabled)
            .putBoolean(KEY_STRICT, strict)
            .putLong(KEY_END_AT, endAt)
            .putString(KEY_TARGETS, targets)
            .apply();

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
    public void getStatus(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSObject response = new JSObject();
        response.put("accessibilityEnabled", isAccessibilityEnabled());
        response.put("focusEnabled", prefs.getBoolean(KEY_ENABLED, false));
        response.put("blockedCount", countTargets(prefs.getString(KEY_TARGETS, "[]")));
        response.put("redirectCount", prefs.getInt(KEY_REDIRECT_COUNT, 0));
        response.put("lastBlockedLabel", prefs.getString(KEY_LAST_BLOCKED_LABEL, ""));
        response.put("lastBlockedAt", prefs.getLong(KEY_LAST_BLOCKED_AT, 0L));
        call.resolve(response);
    }

    private long getLongValue(PluginCall call, String key, long fallback) {
        Object value = call.getData().opt(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return fallback;
    }

    private int countTargets(String targets) {
        try {
            return new JSONArray(targets).length();
        } catch (Exception ignored) {
            return 0;
        }
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
}
