# NeuroQuest Journey

A public gamified journey-map app for Android APK sideload use and PC web use. Everyone can enter the same public room when Supabase is configured, while each player keeps their own progress through subjects, units, micro goals, quiz gates, map nodes, and the final goal.

## What It Does

- Public journey room: `PUBLIC-JOURNEY-PATH`
- Android-friendly PWA shell and Capacitor config for APK wrapping
- PC web deployment through Vercel
- Multiple public journeys in one shared world
- 10th Portion Quest preset with Biology, Physics, Prose, Grammar, History, and Maths
- Each journey is split into subjects, units, and micro goals such as 2m questions, 5m answer frames, recall rounds, diagrams, practice, and quiz gates
- Distraction Shield page with app blocks, website blocks, study allowlist, strict mode, shield score, and quick block presets
- Custom syllabus builder with a simple outline format:

```text
Subject: Biology
Unit: Life Processes
- 2m question: nutrition keywords
- 5m answer frame: digestion
? Quiz | What carries oxygen in blood? | Red blood cells | Platelets | Starch | 0
```

- Wonky quest-map visualization with subject routes, unit flags, boss nodes, quiz gates, and checkable micro goals
- Player-specific progress on shared public journeys
- Quiz gates with answer checking and sound effects
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
- `android/` native Capacitor project after `npx cap add android`

Build and sync Android assets:

```bash
npm run mobile:build
```

Build a debug APK:

```bash
npm run mobile:apk
```

The debug APK output is:

```bash
android/app/build/outputs/apk/debug/app-debug.apk
```

For convenience, the current debug APK is also copied to:

```bash
apk/NeuroQuest-Journey-debug.apk
```

This is meant for direct APK distribution/sideloading, not Play Store/App Store distribution.

## Security Note

The schema uses open RLS policies for public-room testing. For production, add authentication, moderation, and stricter write rules before letting strangers publish shared public paths.
