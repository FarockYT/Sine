# Sine Inverse PC Guard

PC Guard is the desktop companion for Sine Inverse. It pulls the same Cloud ID rules as the phone app, then watches desktop processes and can close blocked or over-limit apps.

## Start With The UI

Linux/macOS:

```bash
./start-pc-ui-linux-mac.sh
```

Windows:

```bat
start-pc-ui-windows.cmd
```

The UI opens at `http://127.0.0.1:4728` and lets you enter your Cloud ID, test cloud sync, start/stop the guard, and see live logs.

## Terminal Mode

```bash
node sine-inverse-pc-guard.mjs --endpoint https://your-site.vercel.app/api/cloud-sync --cloud-id YOUR_CLOUD_ID --enforce
```

You can copy the ready-made command from Sine Inverse Settings after entering your Cloud ID.

## Options

```bash
--enforce          Close matched apps. Without this, PC Guard previews only.
--hosts            Add locked websites to the system hosts file. Requires admin.
--once             Pull and scan once.
--save             Save endpoint and Cloud ID to ~/.sine-inverse-pc-guard.json.
--poll 5           Scan interval in seconds.
--refresh 30       Cloud refresh interval in seconds.
```

For best desktop app matching, add custom Shield apps with the real process name, such as `discord.exe`, `steam.exe`, `RobloxPlayerBeta.exe`, `Spotify.exe`, or `chrome.exe`.
