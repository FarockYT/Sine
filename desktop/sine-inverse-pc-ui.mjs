#!/usr/bin/env node
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";

const CONFIG_PATH = path.join(homedir(), ".sine-inverse-pc-guard.json");
const PORT = Number(process.env.SINE_PC_UI_PORT || 4728);
const HOST = "127.0.0.1";
const logs = [];
let guardProcess = null;
let currentConfig = loadConfig();

function loadConfig() {
  try {
    return existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, "utf8")) : {};
  } catch {
    return {};
  }
}

function saveConfig(config) {
  currentConfig = { ...currentConfig, ...config };
  writeFileSync(CONFIG_PATH, `${JSON.stringify(currentConfig, null, 2)}\n`, "utf8");
}

function addLog(line) {
  const stamped = `[${new Date().toLocaleTimeString()}] ${line}`;
  logs.push(stamped);
  while (logs.length > 220) logs.shift();
  console.log(stamped);
}

function sendJson(res, body, status = 200) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function scriptPath(name) {
  return path.join(path.dirname(new URL(import.meta.url).pathname), name);
}

function startGuard(config) {
  if (guardProcess) return;
  saveConfig(config);
  const args = [
    scriptPath("sine-inverse-pc-guard.mjs"),
    "--endpoint",
    config.endpoint,
    "--cloud-id",
    config.cloudId,
    "--poll",
    String(config.poll || 5),
    "--refresh",
    String(config.refresh || 30)
  ];
  if (config.enforce) args.push("--enforce");
  if (config.hosts) args.push("--hosts");

  guardProcess = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
  addLog(`Guard started in ${config.enforce ? "enforce" : "preview"} mode.`);
  guardProcess.stdout.on("data", (chunk) => String(chunk).split(/\r?\n/).filter(Boolean).forEach(addLog));
  guardProcess.stderr.on("data", (chunk) => String(chunk).split(/\r?\n/).filter(Boolean).forEach((line) => addLog(`Error: ${line}`)));
  guardProcess.on("exit", (code) => {
    addLog(`Guard stopped${typeof code === "number" ? ` (${code})` : ""}.`);
    guardProcess = null;
  });
}

function stopGuard() {
  if (!guardProcess) return;
  guardProcess.kill();
  guardProcess = null;
  addLog("Stop requested.");
}

async function testCloud(config) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pull", key: config.cloudId })
  });
  const body = await response.json();
  if (!response.ok || !body.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return {
    ok: true,
    hasPayload: Boolean(body.payload),
    updatedAt: body.updatedAt || 0,
    device: body.device || "cloud",
    targets: Array.isArray(body.payload?.targets) ? body.payload.targets.length : 0,
    limits: Array.isArray(body.payload?.appLimits) ? body.payload.appLimits.length : 0
  };
}

function openBrowser(url) {
  const command = platform() === "win32" ? "cmd" : platform() === "darwin" ? "open" : "xdg-open";
  const args = platform() === "win32" ? ["/c", "start", "", url] : [url];
  spawn(command, args, { detached: true, stdio: "ignore" }).unref();
}

const html = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sine Inverse PC Guard</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #080d0f;
        --panel: #121a1d;
        --panel-2: #182326;
        --line: #26383c;
        --text: #f4fbf8;
        --muted: #9fb3ad;
        --mint: #6be6bf;
        --red: #ff6b6b;
        --gold: #e7c66b;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background: radial-gradient(circle at 15% 10%, rgba(107,230,191,.13), transparent 28%), var(--bg);
        color: var(--text);
        font: 15px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { width: min(1180px, 100%); margin: 0 auto; padding: 28px; }
      .hero {
        display: grid;
        grid-template-columns: 1.1fr .9fr;
        gap: 18px;
        align-items: stretch;
        min-height: 260px;
      }
      .hero, .panel {
        border: 1px solid var(--line);
        border-radius: 22px;
        background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.015)), var(--panel);
        box-shadow: 0 24px 90px rgba(0,0,0,.24);
      }
      .hero-copy { padding: 26px; display: grid; align-content: center; gap: 14px; }
      .eyebrow { margin: 0; color: var(--mint); text-transform: uppercase; letter-spacing: .08em; font-size: .75rem; font-weight: 900; }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: clamp(2.3rem, 6vw, 5.2rem); line-height: .93; letter-spacing: 0; }
      h2 { font-size: 1.1rem; }
      p { color: var(--muted); }
      .status-card {
        margin: 18px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: var(--panel-2);
        padding: 18px;
        display: grid;
        gap: 14px;
      }
      .status-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--gold); display: inline-block; }
      .status-dot.on { background: var(--mint); box-shadow: 0 0 24px rgba(107,230,191,.8); }
      .grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 18px; margin-top: 18px; }
      .panel { padding: 18px; }
      label { display: grid; gap: 8px; color: var(--muted); font-weight: 800; }
      input {
        width: 100%;
        min-height: 46px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #0c1315;
        color: var(--text);
        padding: 0 13px;
        font: inherit;
      }
      .form { display: grid; gap: 12px; margin-top: 16px; }
      .inline { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .checks { display: flex; flex-wrap: wrap; gap: 10px; }
      .check { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 999px; padding: 10px 12px; color: var(--text); }
      .check input { width: 18px; min-height: 18px; accent-color: var(--mint); }
      .buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
      button {
        border: 0;
        min-height: 44px;
        border-radius: 999px;
        padding: 0 18px;
        background: var(--mint);
        color: #07110e;
        font-weight: 950;
        cursor: pointer;
      }
      button.secondary { background: #1e2a2e; color: var(--text); border: 1px solid var(--line); }
      button.danger { background: var(--red); color: #210606; }
      .steps { display: grid; gap: 10px; margin-top: 14px; }
      .step { border: 1px solid var(--line); border-radius: 14px; background: #0c1315; padding: 13px; }
      .logs {
        height: 360px;
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: #060909;
        padding: 12px;
        color: #d9ede7;
        font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        white-space: pre-wrap;
      }
      @media (max-width: 800px) {
        main { padding: 14px; }
        .hero, .grid, .inline { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Sine Inverse desktop</p>
          <h1>PC Guard</h1>
          <p>Run your Shield rules on Linux, Windows, or macOS. Connect the same Cloud ID, preview matches, then enforce when you are ready.</p>
          <div class="buttons">
            <button id="start">Start guard</button>
            <button class="danger" id="stop">Stop</button>
            <button class="secondary" id="test">Test cloud</button>
          </div>
        </div>
        <aside class="status-card">
          <p class="eyebrow">Runtime</p>
          <h2><span id="dot" class="status-dot"></span> <span id="runText">Stopped</span></h2>
          <p id="summary">Enter your endpoint and Cloud ID, then test the cloud connection.</p>
          <div class="steps">
            <article class="step"><strong>1. Same Cloud ID</strong><p>Use the ID from the phone app or download site.</p></article>
            <article class="step"><strong>2. Preview first</strong><p>Leave enforce off to see what would be closed.</p></article>
            <article class="step"><strong>3. Enforce focus</strong><p>Turn on enforce to close blocked or over-limit apps.</p></article>
          </div>
        </aside>
      </section>
      <section class="grid">
        <div class="panel">
          <p class="eyebrow">Connection</p>
          <h2>Cloud rules</h2>
          <div class="form">
            <label>Endpoint <input id="endpoint" placeholder="https://sine-ruby.vercel.app/api/cloud-sync" /></label>
            <label>Cloud ID <input id="cloudId" placeholder="sugan-main-sync" /></label>
            <div class="inline">
              <label>Scan seconds <input id="poll" type="number" min="2" value="5" /></label>
              <label>Refresh seconds <input id="refresh" type="number" min="10" value="30" /></label>
            </div>
            <div class="checks">
              <label class="check"><input id="enforce" type="checkbox" /> Enforce app blocking</label>
              <label class="check"><input id="hosts" type="checkbox" /> Website hosts blocking</label>
            </div>
          </div>
        </div>
        <div class="panel">
          <p class="eyebrow">Live log</p>
          <h2>Activity</h2>
          <div id="logs" class="logs"></div>
        </div>
      </section>
    </main>
    <script>
      const $ = (id) => document.getElementById(id);
      async function api(path, body) {
        const res = await fetch(path, {
          method: body ? "POST" : "GET",
          headers: body ? { "content-type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined
        });
        return res.json();
      }
      function readForm() {
        return {
          endpoint: $("endpoint").value.trim(),
          cloudId: $("cloudId").value.trim(),
          poll: Number($("poll").value || 5),
          refresh: Number($("refresh").value || 30),
          enforce: $("enforce").checked,
          hosts: $("hosts").checked
        };
      }
      function applyState(state) {
        $("endpoint").value = state.config.endpoint || "https://sine-ruby.vercel.app/api/cloud-sync";
        $("cloudId").value = state.config.cloudId || "";
        $("poll").value = state.config.poll || 5;
        $("refresh").value = state.config.refresh || 30;
        $("enforce").checked = Boolean(state.config.enforce);
        $("hosts").checked = Boolean(state.config.hosts);
        $("dot").classList.toggle("on", state.running);
        $("runText").textContent = state.running ? "Running" : "Stopped";
        $("logs").textContent = state.logs.join("\\n");
        $("logs").scrollTop = $("logs").scrollHeight;
      }
      async function refreshState() {
        applyState(await api("/api/state"));
      }
      $("start").onclick = async () => { applyState(await api("/api/start", readForm())); };
      $("stop").onclick = async () => { applyState(await api("/api/stop", {})); };
      $("test").onclick = async () => {
        const result = await api("/api/test", readForm());
        $("summary").textContent = result.ok
          ? "Cloud connected. " + result.targets + " targets and " + result.limits + " limits found."
          : result.error;
        await refreshState();
      };
      refreshState();
      setInterval(refreshState, 1800);
    </script>
  </body>
</html>`;

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    if (req.method === "GET" && req.url === "/api/state") {
      sendJson(res, { running: Boolean(guardProcess), config: currentConfig, logs });
      return;
    }
    if (req.method === "POST" && req.url === "/api/start") {
      const config = await readBody(req);
      startGuard(config);
      sendJson(res, { running: Boolean(guardProcess), config: currentConfig, logs });
      return;
    }
    if (req.method === "POST" && req.url === "/api/stop") {
      stopGuard();
      sendJson(res, { running: false, config: currentConfig, logs });
      return;
    }
    if (req.method === "POST" && req.url === "/api/test") {
      const config = await readBody(req);
      saveConfig(config);
      const result = await testCloud(config);
      addLog(`Cloud test ok: ${result.targets} targets, ${result.limits} limits.`);
      sendJson(res, result);
      return;
    }
    sendJson(res, { error: "Not found" }, 404);
  } catch (error) {
    addLog(error.message || String(error));
    sendJson(res, { ok: false, error: error.message || "PC UI failed" }, 500);
  }
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  addLog(`PC Guard UI running at ${url}`);
  if (process.env.SINE_PC_UI_NO_OPEN !== "1") {
    openBrowser(url);
  }
});
