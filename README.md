# ReMind Blocks

AI-assisted reminder blocks, focus shield, timer, and daily planning in one cross-platform app.

## Run The Website

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build The Website

```bash
npm run build
```

The production site is generated in `dist/` and includes a PWA service worker.

## Android APK

This project uses Capacitor, so the same React app can be packaged as an Android app.

```bash
npm run android:add
npm run apk:debug
```

The debug APK will be created under `android/app/build/outputs/apk/debug/` after the Android platform and Java toolchain are available.
On this machine, the `apk:debug` script also falls back to the local Java 21 install at `~/.local/share/remind-blocks-jdk21`.

## Shield, Schedules, And Usage Limits

Blocking has two layers:

- Web/PWA: locked targets, session timer, interruption log, and stats work inside the app.
- Android APK: selected app package names, focus schedules, and daily app limits are synced to a native Accessibility service. When a rule is active, opening a locked or over-limit app redirects straight back to ReMind Blocks.

To enable native app blocking, screen-time history, and app limits on Android:

1. Install `android/app/build/outputs/apk/debug/app-debug.apk`.
2. Open ReMind Blocks, go to `Shield` or `Focus`, and tap `Accessibility`.
3. Enable `ReMind Blocks Focus Mode` in Android Accessibility settings.
4. Go to `Settings` or `Shield`, tap `Usage access`, and allow ReMind Blocks so Android can report app foreground time.
5. Add apps like `Instagram` or exact package names like `com.instagram.android`.
6. Turn `Shield` on, create scheduled focus windows, or set a daily app limit such as `2h`. Opening a locked or over-limit app sends you back to ReMind Blocks.
7. Start Focus Mode when you want a timed protected session on top of Shield.

## Product Features

- Profile and Settings tab with name, role, avatar, compact mode, reduced motion, and focus sound preference.
- Theme system with Sunrise, Midnight, Forest, Clean, Aurora, and Graphite modes.
- Daily flow dashboard with focus goal progress, streak, estimated time saved, and native screen-time totals.
- Richer insights with screen-time history, weekly usage charts, productivity vs disturbance totals, app limits, redirect counts, focus score, locked apps, and queued blocks.
- Focus presets for deep work, study, routine, and wind down.
- Scheduled focus timing with day chips, start/end windows, target app selection, and optional alerts.
- Usage timers that can allow an app for a daily budget, such as 2 hours, then block it through the Android Accessibility redirect.
- App picker modal with search, category chips, checkboxes, selected-app chips, custom package entry, PiP badges, and quick bundles like Shorts & Reels.
- Smarter local AI commands for blocking bundles, setting daily limits, creating scheduled focus windows, and turning prompts into reminder blocks.
- AI command center with dynamic attention-risk scoring, autopilot recommendations, quick actions, and optional hosted AI replies through `VITE_AI_ENDPOINT`.

## AI Engine

The app works offline with the built-in local planner. To connect a full hosted model, set `VITE_AI_ENDPOINT` to your own backend endpoint. Keep model provider API keys on that backend, not inside the web or APK bundle.

## Custom Apps

The Shield screen supports three ways to add blocked apps:

- Presets such as Instagram, YouTube, TikTok, Chrome, and Roblox.
- Custom app name plus Android package name, for example `Discord` and `com.discord`.
- Installed app picker in the Android APK. Tap `Choose apps`, then tap the phone button to list launchable apps on the phone.
- Shield app picker modal. Select apps with checkboxes, use category chips, clear selected chips, or block bundles such as `Shorts & Reels`.
- Picture-in-picture awareness marks common floating-video apps such as YouTube, Netflix, and Chrome so they are easier to find and block.

## Notes

- Reminder data is stored locally in the browser or WebView.
- The AI coach is a local planning engine that turns natural-language prompts into reminder blocks and shield targets.
- Web notifications work while the app session is active. Native Android notifications use Capacitor Local Notifications.
- Native app blocking requires Android Accessibility permission and exact Android package names.
- Native screen-time history and daily usage limits require Android Usage Access permission.
