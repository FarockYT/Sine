# NeuroQuest Journey

A public gamified focus and journey OS for Android APK sideload use and PC web use. Everyone can enter the same public room when Supabase is configured, while each player keeps their own progress through separate pages for dashboard, focus, tasks, dot map, subjects, builder, shield, quizzes, public room, and profile.

## What It Does

- Public journey room: `PUBLIC-JOURNEY-PATH`
- Android-friendly PWA shell and Capacitor config for APK wrapping
- PC web deployment through Vercel
- Multiple public journeys in one shared world
- Separate app pages instead of a single tag-style surface
- Courses page for choosing exactly one active course map at a time
- Dashboard active-map card showing the course currently driving the Journey Map
- Focus page with Pomodoro, timer, stopwatch, ambient sound choice, strict shield toggle, session history, and task or journey-dot targeting
- Task command center with checkable tasks, focus-target handoff, reminders, and an ADHD-friendly capture/choose/focus/close flow
- 10th Portion Quest preset with Biology, Physics, Prose, Grammar, History, and Maths
- Each journey is split into subjects, units, and micro goals such as 2m questions, 5m answer frames, recall rounds, diagrams, practice, and quiz gates
- Distraction Shield page with app rows, website rows, study allowlist, strict mode, shield score, quick presets, usage-pressure bars, and smart block schedules
- Custom syllabus builder with a simple outline format:

```text
Subject: Biology
Unit: Life Processes
- 2m question: nutrition keywords
- 5m answer frame: digestion
? Quiz | What carries oxygen in blood? | Red blood cells | Platelets | Starch | 0
```

- Dot-based quest map with subject routes, unit rows, quiz gates, boss dots, and checkable micro goals
- Player-specific progress on shared public journeys
- Quiz gates with answer checking and sound effects
- Public player list and activity feed
- Optional sound effects
- Offline-capable install metadata via service worker and web manifest

The shield and focus flows are built as APK-ready planning controls. Actual Android app blocking would need a native enforcement layer such as accessibility, VPN/DNS, or platform screen-time permissions wired into the Capacitor shell.

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
