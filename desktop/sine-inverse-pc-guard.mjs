#!/usr/bin/env node
import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const CONFIG_PATH = path.join(homedir(), ".sine-inverse-pc-guard.json");
const USAGE_PATH = path.join(homedir(), ".sine-inverse-pc-usage.json");
const HOSTS_MARKER_START = "# SINE-INVERSE-PC-GUARD-START";
const HOSTS_MARKER_END = "# SINE-INVERSE-PC-GUARD-END";

const aliasMap = [
  ["discord", ["discord", "discord.exe"]],
  ["steam", ["steam", "steam.exe", "steamwebhelper", "steamwebhelper.exe"]],
  ["epic", ["epicgameslauncher", "epicgameslauncher.exe", "epicwebhelper", "epicwebhelper.exe"]],
  ["roblox", ["robloxplayerbeta", "robloxplayerbeta.exe", "roblox"]],
  ["minecraft", ["minecraftlauncher", "minecraftlauncher.exe", "minecraft", "javaw.exe"]],
  ["spotify", ["spotify", "spotify.exe"]],
  ["telegram", ["telegram", "telegram.exe"]],
  ["whatsapp", ["whatsapp", "whatsapp.exe"]],
  ["slack", ["slack", "slack.exe"]],
  ["zoom", ["zoom", "zoom.exe"]],
  ["chrome", ["chrome", "chrome.exe", "google chrome"]],
  ["edge", ["msedge", "msedge.exe", "microsoft edge"]],
  ["firefox", ["firefox", "firefox.exe"]],
  ["opera", ["opera", "opera.exe", "opera gx"]],
  ["brave", ["brave", "brave.exe", "brave browser"]]
];

function parseArgs(argv) {
  const args = {
    cloudId: "",
    endpoint: "",
    enforce: false,
    hosts: false,
    once: false,
    save: false,
    poll: 5,
    refresh: 30
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--cloud-id" && next) {
      args.cloudId = next;
      index += 1;
    } else if (arg === "--endpoint" && next) {
      args.endpoint = next;
      index += 1;
    } else if (arg === "--poll" && next) {
      args.poll = Math.max(2, Number(next) || args.poll);
      index += 1;
    } else if (arg === "--refresh" && next) {
      args.refresh = Math.max(10, Number(next) || args.refresh);
      index += 1;
    } else if (arg === "--enforce") {
      args.enforce = true;
    } else if (arg === "--hosts") {
      args.hosts = true;
    } else if (arg === "--once") {
      args.once = true;
    } else if (arg === "--save") {
      args.save = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Sine Inverse PC Guard

Usage:
  node sine-inverse-pc-guard.mjs --endpoint https://your-site.vercel.app/api/cloud-sync --cloud-id YOUR_ID --enforce

Options:
  --cloud-id VALUE   Same Cloud ID used in the web/APK app.
  --endpoint URL     Your deployed /api/cloud-sync URL.
  --enforce          Close matching blocked desktop apps.
  --hosts            Also write locked websites to the system hosts file.
  --once             Pull and scan once, then exit.
  --save             Save endpoint and Cloud ID to ${CONFIG_PATH}.
  --poll SECONDS     Process scan interval. Default: 5.
  --refresh SECONDS  Cloud rule refresh interval. Default: 30.
`);
}

function loadJson(filePath, fallback) {
  try {
    return existsSync(filePath) ? JSON.parse(readFileSync(filePath, "utf8")) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function loadConfig(cli) {
  const saved = loadJson(CONFIG_PATH, {});
  const config = {
    endpoint: cli.endpoint || process.env.SINE_SYNC_ENDPOINT || saved.endpoint || "",
    cloudId: cli.cloudId || process.env.SINE_CLOUD_ID || saved.cloudId || "",
    enforce: cli.enforce || process.env.SINE_GUARD_ENFORCE === "1" || saved.enforce || false,
    hosts: cli.hosts || process.env.SINE_GUARD_HOSTS === "1" || saved.hosts || false,
    poll: cli.poll || saved.poll || 5,
    refresh: cli.refresh || saved.refresh || 30
  };

  if ((!config.endpoint || !config.cloudId) && process.stdin.isTTY) {
    const rl = readline.createInterface({ input, output });
    if (!config.endpoint) {
      config.endpoint = (await rl.question("Cloud sync endpoint: ")).trim();
    }
    if (!config.cloudId) {
      config.cloudId = (await rl.question("Cloud ID: ")).trim();
    }
    rl.close();
  }

  if (!config.endpoint || !config.cloudId) {
    printHelp();
    throw new Error("Missing endpoint or Cloud ID.");
  }

  if (cli.save) saveJson(CONFIG_PATH, config);
  return config;
}

async function pullCloudRules(config) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pull", key: config.cloudId })
  });
  const body = await response.json();
  if (!response.ok || !body.ok) throw new Error(body.error || `Cloud sync failed: ${response.status}`);
  if (!body.payload) throw new Error("No cloud save found for this Cloud ID.");
  return body.payload;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/["']/g, "")
    .trim();
}

function compactNeedle(value) {
  return normalize(value).replace(/[^a-z0-9.]/g, "");
}

function getDomain(value) {
  try {
    const url = String(value || "").includes("://") ? new URL(String(value)) : new URL(`https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return compactNeedle(value).replace(/^www\./, "");
  }
}

function needlesForTarget(target) {
  const raw = [
    target.label,
    target.packageName
  ].filter(Boolean);
  const needles = new Set(raw.flatMap((value) => {
    const compact = compactNeedle(value);
    const parts = compact.split(".").filter((part) => part.length > 2);
    return [normalize(value), compact, ...parts];
  }));

  const label = normalize(target.label);
  const packageName = normalize(target.packageName);
  for (const [key, aliases] of aliasMap) {
    if (label.includes(key) || packageName.includes(key)) {
      aliases.forEach((alias) => needles.add(normalize(alias)));
    }
  }

  return [...needles].filter((needle) => needle.length >= 3);
}

function dayKey(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function minutesFromTime(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function isInWindow(start, end, now = new Date()) {
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function hasActiveSchedule(payload) {
  const today = dayKey();
  return Array.isArray(payload.schedules) && payload.schedules.some((schedule) =>
    schedule.enabled &&
    Array.isArray(schedule.days) &&
    schedule.days.includes(today) &&
    isInWindow(schedule.startTime, schedule.endTime)
  );
}

function shieldActive(payload) {
  return Boolean(payload.shieldEnabled || hasActiveSchedule(payload));
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage() {
  const usage = loadJson(USAGE_PATH, {});
  const today = todayStamp();
  if (!usage[today]) usage[today] = {};
  for (const date of Object.keys(usage)) {
    if (date !== today) delete usage[date];
  }
  return usage;
}

function saveUsage(usage) {
  saveJson(USAGE_PATH, usage);
}

async function listProcesses() {
  if (platform() === "win32") return listWindowsProcesses();
  return listUnixProcesses();
}

function parseCsvLine(line) {
  const result = [];
  let value = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  result.push(value);
  return result;
}

async function listWindowsProcesses() {
  const { stdout } = await execFileAsync("tasklist", ["/fo", "csv", "/nh"], { windowsHide: true });
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, pid] = parseCsvLine(line);
      return {
        pid: Number(pid),
        name: normalize(name),
        command: normalize(name)
      };
    })
    .filter((item) => item.pid && item.pid !== process.pid);
}

async function listUnixProcesses() {
  const { stdout } = await execFileAsync("ps", ["-axo", "pid=,comm=,args="]);
  return stdout
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(\S+)\s*(.*)$/);
      if (!match) return null;
      const pid = Number(match[1]);
      const name = path.basename(match[2] || "");
      const command = `${name} ${match[3] || ""}`;
      return { pid, name: normalize(name), command: normalize(command) };
    })
    .filter(Boolean)
    .filter((item) => item.pid && item.pid !== process.pid && !item.command.includes("sine-inverse-pc-guard"));
}

function processMatches(processItem, needles) {
  const haystack = `${processItem.name} ${processItem.command}`;
  const compactHaystack = compactNeedle(haystack);
  return needles.some((needle) => haystack.includes(needle) || compactHaystack.includes(compactNeedle(needle)));
}

function matchTargets(payload, processes) {
  const targets = Array.isArray(payload.targets) ? payload.targets : [];
  return targets
    .filter((target) => target.kind === "app")
    .map((target) => ({
      target,
      processes: processes.filter((processItem) => processMatches(processItem, needlesForTarget(target)))
    }))
    .filter((entry) => entry.processes.length > 0);
}

function updateUsage(usage, matches, elapsedSeconds) {
  const today = todayStamp();
  usage[today] ||= {};
  for (const match of matches) {
    usage[today][match.target.id] = (usage[today][match.target.id] || 0) + elapsedSeconds / 60;
  }
}

function overLimitTargetIds(payload, usage) {
  const today = todayStamp();
  const usedToday = usage[today] || {};
  const limits = Array.isArray(payload.appLimits) ? payload.appLimits : [];
  return new Set(
    limits
      .filter((limit) => limit.enabled && usedToday[limit.targetId] >= limit.minutes)
      .map((limit) => limit.targetId)
  );
}

async function closeProcess(processItem, enforce) {
  if (!enforce) return false;
  if (platform() === "win32") {
    await execFileAsync("taskkill", ["/PID", String(processItem.pid), "/F"], { windowsHide: true });
    return true;
  }
  try {
    process.kill(processItem.pid, "SIGTERM");
  } catch {
    return false;
  }
  return true;
}

function lockedDomains(payload) {
  const targets = Array.isArray(payload.targets) ? payload.targets : [];
  const domains = new Set();
  for (const target of targets) {
    if (target.kind !== "site" || !target.locked) continue;
    const domain = getDomain(target.url || target.label);
    if (domain) {
      domains.add(domain);
      domains.add(`www.${domain}`);
    }
  }
  return [...domains];
}

function hostsFilePath() {
  if (platform() === "win32") return "C:/Windows/System32/drivers/etc/hosts";
  return "/etc/hosts";
}

function updateHosts(domains) {
  const hostsPath = hostsFilePath();
  const existing = existsSync(hostsPath) ? readFileSync(hostsPath, "utf8") : "";
  const cleaned = existing.replace(
    new RegExp(`${HOSTS_MARKER_START}[\\s\\S]*?${HOSTS_MARKER_END}\\n?`, "m"),
    ""
  );
  const block = domains.length
    ? `${HOSTS_MARKER_START}\n${domains.map((domain) => `0.0.0.0 ${domain}`).join("\n")}\n${HOSTS_MARKER_END}\n`
    : "";
  writeFileSync(hostsPath, `${cleaned.trimEnd()}\n${block}`, "utf8");
}

async function enforceRules(payload, config, usage, elapsedSeconds) {
  const processes = await listProcesses();
  const matches = matchTargets(payload, processes);
  updateUsage(usage, matches, elapsedSeconds);
  const overLimit = overLimitTargetIds(payload, usage);
  const activeShield = shieldActive(payload);
  const blocked = matches.filter(({ target }) => (activeShield && target.locked) || overLimit.has(target.id));

  for (const entry of blocked) {
    for (const processItem of entry.processes) {
      const reason = overLimit.has(entry.target.id) ? "over daily limit" : "shield locked";
      console.log(`[${new Date().toLocaleTimeString()}] ${config.enforce ? "Closing" : "Would close"} ${processItem.name} (${entry.target.label}) - ${reason}`);
      await closeProcess(processItem, config.enforce).catch((error) => {
        console.log(`  Could not close ${processItem.name}: ${error.message}`);
      });
    }
  }

  if (config.hosts) {
    try {
      updateHosts(activeShield ? lockedDomains(payload) : []);
    } catch (error) {
      console.log(`Hosts update skipped: ${error.message}`);
    }
  }

  saveUsage(usage);
  return { running: matches.length, blocked: blocked.length };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const config = await loadConfig(cli);
  let usage = loadUsage();
  let payload = await pullCloudRules(config);
  let lastPull = Date.now();
  let lastTick = Date.now();

  console.log(`Sine Inverse PC Guard connected. Mode: ${config.enforce ? "enforce" : "preview"}.`);
  console.log(`Cloud ID: ${config.cloudId}`);

  while (true) {
    const now = Date.now();
    const elapsed = Math.max(1, (now - lastTick) / 1000);
    lastTick = now;

    if (now - lastPull >= config.refresh * 1000) {
      payload = await pullCloudRules(config);
      lastPull = now;
      console.log(`[${new Date().toLocaleTimeString()}] Rules refreshed.`);
    }

    const result = await enforceRules(payload, config, usage, elapsed);
    if (result.running || result.blocked) {
      console.log(`[${new Date().toLocaleTimeString()}] Matched ${result.running}; blocked ${result.blocked}.`);
    }

    if (cli.once) break;
    await sleep(config.poll * 1000);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
