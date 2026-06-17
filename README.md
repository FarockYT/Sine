# NeuroQuest Journey

A public gamified journey-path app for Android APK sideload use and PC web use. Everyone can enter the same public path when Supabase is configured, while each player keeps their own progress through subtasks, quiz gates, focus blocks, and the final goal.

## What It Does

- Public journey room: `PUBLIC-JOURNEY-PATH`
- Android-friendly PWA shell and Capacitor config for APK wrapping
- PC web deployment through Vercel
- Preset journeys for study, project launch, and daily stabilization
- Custom journey builder with journey name, goal end, duration, path style, subtasks, and quiz gate
- Wonky tournament-style map visualization
- Time cursor that moves across the path as the journey duration passes
- Player-specific gate completion on a shared public journey
- Quiz gates with answer checking
- Public player list and activity feed
- Optional sound effects
- Offline-capable install metadata via service worker and web manifest

## Run Locally

```bash
npm install
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run:

```sql
supabase_schema.sql
```

4. In Supabase, go to **Project Settings -> API**.
5. Copy:
   - Project URL
   - anon public key

6. Create `.env`:

```bash
cp .env.example .env
```

7. Fill:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

8. Restart:

```bash
npm run dev
```

## Vercel Web

The included `vercel.json` is configured for Vite:

- build command: `npm run build`
- output directory: `dist`
- SPA rewrite to `index.html`

Add the Supabase environment variables in Vercel for live public sync.

## Android APK Sideload Target

This repo includes:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icon.svg`
- `capacitor.config.json`

To create a sideloadable APK locally, install Capacitor tooling in your Android build environment, build the web app, add Android, then build the APK from Android Studio or Gradle. This is meant for direct APK distribution, not Play Store/App Store distribution.

## Security Note

The schema uses open RLS policies for public-room testing. For production, add authentication, moderation, and stricter write rules before letting strangers publish shared public paths.
