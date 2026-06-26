# Sine Inverse

AI-assisted reminder blocks, focus shield, timer, app limits, and daily planning in one cross-platform app.

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

The production site is generated in `dist/` and includes a PWA service worker. On desktop widths, the same app switches into the full PC layout with sidebar navigation, wide dashboards, and the PC + phone sync panel.

## Cloud Sync

The Settings tab includes `PC + phone` controls for APK download, PC Guard download, manual sync codes, and cloud storage. Cloud sync uses the Vercel serverless endpoint at `/api/cloud-sync`. When `Always synced` is enabled, the app loads from cloud on startup, saves edits after a short debounce, and refreshes in the background.

Recommended on Vercel: connect a Vercel Blob store to the project. The endpoint stores each Cloud ID as a private JSON blob and automatically uses Blob before Redis/KV when Blob env vars are present. Set `SINE_SYNC_BACKEND=redis` if you want to force the Vercel KV/Upstash backend instead.

```bash
BLOB_STORE_ID=...
```

Vercel provides the OIDC token to serverless functions when the store is connected. For local/off-Vercel testing, use a read/write token instead:

```bash
BLOB_READ_WRITE_TOKEN=...
```

`BLOB_WEBHOOK_PUBLIC_KEY` is only for Blob webhook verification. Sine Inverse sync does not need it.

Redis REST remains supported as a fallback:

```bash
SINE_SYNC_BACKEND=redis
SINE_SYNC_REST_URL=...
SINE_SYNC_REST_TOKEN=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

`KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, and `REDIS_URL` are not required by the Sine Inverse sync endpoint. Save/load needs the REST URL plus the write token, and those real values should live in Vercel environment variables instead of source control.

Use the same Cloud ID on the PC website and Android APK, then tap `Save` on one device and `Load` on the other.

## PC Guard

The desktop companion lives in `desktop/` and can be downloaded from `/downloads/sine-inverse-pc-guard.zip` after running `npm run pc:pack`.

```bash
npm run pc:guard -- --endpoint https://your-site.vercel.app/api/cloud-sync --cloud-id YOUR_CLOUD_ID --enforce
```

PC Guard pulls the same Cloud ID rules, watches desktop processes, tracks local daily app-limit usage, and closes matched blocked apps when `--enforce` is enabled. Use exact process names such as `discord.exe`, `steam.exe`, `Spotify.exe`, or `chrome.exe` as custom Shield apps for the strongest PC matching.

## Android APK

This project uses Capacitor, so the same React app can be packaged as an Android app.

```bash
npm run android:add
npm run apk:debug
```

The debug APK will be created under `android/app/build/outputs/apk/debug/` after the Android platform and Java toolchain are available. The deployed website can also serve the APK from `/downloads/sine-inverse.apk` when `public/downloads/sine-inverse.apk` is present.
On this machine, the `apk:debug` script also falls back to the local Java 21 install at `~/.local/share/remind-blocks-jdk21`.

## Shield, Schedules, And Usage Limits

Blocking has two layers:

- Web/PWA: locked targets, session timer, interruption log, and stats work inside the app.
- Android APK: selected app package names, focus schedules, and daily app limits are synced to a native Accessibility service. When a rule is active, opening a locked or over-limit app redirects straight back to Sine Inverse.

To enable native app blocking, screen-time history, and app limits on Android:

1. Install `android/app/build/outputs/apk/debug/app-debug.apk`.
2. Open Sine Inverse, go to `Shield` or `Focus`, and tap `Accessibility`.
3. Enable `Sine Inverse` in Android Accessibility settings.
4. Go to `Settings` or `Shield`, tap `Usage access`, and allow Sine Inverse so Android can report app foreground time.
5. Add apps like `Instagram` or exact package names like `com.instagram.android`.
6. Turn `Shield` on, create scheduled focus windows, or set a daily app limit such as `2h`. Opening a locked or over-limit app sends you back to Sine Inverse.
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
- Full PC web layout with desktop navigation, wide dashboard sections, APK download, cloud Save/Load, and manual sync-code transfer between PC and phone.
- Always-on cloud sync for PC web, Android APK, and the PC Guard companion.
- PC Guard desktop companion with Cloud ID rule pull, process blocking, daily limit enforcement, and optional hosts-file website blocking.

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

- Reminder data is stored locally by default. Cloud sync stores the same payload under your Cloud ID when Vercel Blob or Redis REST env vars are configured.
- The AI coach is a local planning engine that turns natural-language prompts into reminder blocks and shield targets.
- Web notifications work while the app session is active. Native Android notifications use Capacitor Local Notifications.
- Native app blocking requires Android Accessibility permission and exact Android package names.
- Native screen-time history and daily usage limits require Android Usage Access permission.
