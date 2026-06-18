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

## Shield And Focus Blocking

Blocking has two layers:

- Web/PWA: locked targets, session timer, interruption log, and stats work inside the app.
- Android APK: selected app package names are synced to a native Accessibility service. When Shield is on, opening a locked app redirects straight back to ReMind Blocks.

To enable native app blocking on Android:

1. Install `android/app/build/outputs/apk/debug/app-debug.apk`.
2. Open ReMind Blocks, go to `Shield` or `Focus`, and tap `Accessibility`.
3. Enable `ReMind Blocks Focus Mode` in Android Accessibility settings.
4. Add apps like `Instagram` or exact package names like `com.instagram.android`.
5. Turn `Shield` on. Opening a locked app sends you back to ReMind Blocks.
6. Start Focus Mode when you want a timed protected session on top of Shield.

## Product Features

- Profile and Settings tab with name, role, avatar, compact mode, reduced motion, and focus sound preference.
- Theme system with Sunrise, Midnight, Forest, and Clean modes.
- Daily flow dashboard with focus goal progress, streak, and estimated time saved.
- Richer insights with redirect counts, focus score, locked apps, queued blocks, and weekly bars.
- Focus presets for deep work, study, routine, and wind down.

## Custom Apps

The Shield screen supports three ways to add blocked apps:

- Presets such as Instagram, YouTube, TikTok, Chrome, and Roblox.
- Custom app name plus Android package name, for example `Discord` and `com.discord`.
- Installed app picker in the Android APK. Tap `Load` under `Custom apps` to list launchable apps on the phone, then tap an app to lock it.

## Notes

- Reminder data is stored locally in the browser or WebView.
- The AI coach is a local planning engine that turns natural-language prompts into reminder blocks and shield targets.
- Web notifications work while the app session is active. Native Android notifications use Capacitor Local Notifications.
- Native app blocking requires Android Accessibility permission and exact Android package names.
