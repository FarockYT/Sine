# NeuroQuest Focus Arcade

A Vercel + GitHub + Supabase multiplayer study-board game for gamified ADHD-friendly focus support.

## Added in this version

- Public server room: `PUBLIC-SERVER`
- Separate app pages for Quest, Board, Deck, Squad, Rooms, and Profile
- ADHD-friendly quest setup with quick starts, short sprints, reset cues, and visible rewards
- Lobby browser for public rooms
- Create public or private rooms
- Player profile system
- Profile fields:
  - display name
  - avatar
  - target/goal
  - bio
  - GitHub repo/profile URL
  - Vercel project URL
- Multiplayer board sync
- Shared quest deck
- Realtime player presence
- GitHub workflow build check
- Vercel config
- Supabase SQL schema

## Run locally

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run:

```sql
supabase_schema.sql
```

4. In Supabase, go to **Project Settings → API**.
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
VITE_GITHUB_REPO_URL=https://github.com/YOUR_USERNAME/neuroquest-public-lobby
VITE_VERCEL_PROJECT_URL=https://YOUR_PROJECT.vercel.app
```

8. Restart:

```bash
npm run dev
```

## GitHub repo setup

```bash
git init
git add .
git commit -m "Initial NeuroQuest public lobby"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/neuroquest-public-lobby.git
git push -u origin main
```

## Vercel integration

1. Push the repo to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GITHUB_REPO_URL`
   - `VITE_VERCEL_PROJECT_URL`
5. Deploy.

## Public lobby use

- Click **Join Public Study Server** to enter the global public room.
- Use **Create Room** to create a public/private study room.
- Public rooms appear in the lobby.
- Same room code = same board and shared quest deck.

## Security note

The schema uses open RLS policies for easy public-room testing. For production, add authentication and stricter room ownership policies.
# Sine
