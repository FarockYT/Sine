package com.neuroquest.remindblocks;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;

import org.json.JSONArray;
import org.json.JSONObject;

public class FocusAccessibilityService extends AccessibilityService {
    private String lastBlockedPackage = "";
    private long lastBlockedAt = 0L;

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

        if (!enabled || (endAt > 0L && endAt <= now)) {
            if (enabled) {
                prefs.edit().putBoolean(FocusBlockerPlugin.KEY_ENABLED, false).apply();
            }
            return;
        }

        TargetMatch target = findTarget(prefs.getString(FocusBlockerPlugin.KEY_TARGETS, "[]"), packageName);
        if (target == null) {
            return;
        }

        if (packageName.equals(lastBlockedPackage) && now - lastBlockedAt < 1800L) {
            return;
        }

        lastBlockedPackage = packageName;
        lastBlockedAt = now;
        int redirectCount = prefs.getInt(FocusBlockerPlugin.KEY_REDIRECT_COUNT, 0) + 1;
        prefs.edit()
            .putInt(FocusBlockerPlugin.KEY_REDIRECT_COUNT, redirectCount)
            .putString(FocusBlockerPlugin.KEY_LAST_BLOCKED_LABEL, target.label)
            .putLong(FocusBlockerPlugin.KEY_LAST_BLOCKED_AT, now)
            .apply();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("label", target.label);
        intent.putExtra("packageName", packageName);
        startActivity(intent);
    }

    @Override
    public void onInterrupt() {
    }

    private TargetMatch findTarget(String targetsJson, String packageName) {
        try {
            JSONArray targets = new JSONArray(targetsJson);
            for (int i = 0; i < targets.length(); i++) {
                JSONObject target = targets.getJSONObject(i);
                if (packageName.equals(target.optString("packageName"))) {
                    return new TargetMatch(target.optString("label", packageName));
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static class TargetMatch {
        final String label;

        TargetMatch(String label) {
            this.label = label;
        }
    }
}
