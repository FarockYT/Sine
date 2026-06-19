import {
  Activity,
  AlarmClock,
  AppWindow,
  Ban,
  BarChart3,
  BellRing,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Clock3,
  Filter,
  Flame,
  Focus,
  Gauge,
  Globe2,
  History,
  Hourglass,
  Layers3,
  LockKeyhole,
  Moon,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Square,
  Target,
  TimerReset,
  Trash2,
  Trophy,
  User,
  Waves,
  X,
  Zap,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

type BlockType = "focus" | "routine" | "health" | "break" | "shield";
type TabId = "today" | "focus" | "shield" | "ai" | "insights" | "settings";
type FocusMode = "deep" | "study" | "routine" | "sleep";
type ThemeMode = "sunrise" | "midnight" | "forest" | "clean" | "aurora" | "graphite";
type DayKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ReminderBlock = {
  id: string;
  title: string;
  detail: string;
  type: BlockType;
  dueAt: string;
  minutes: number;
  completed: boolean;
  intensity: number;
};

type ShieldTarget = {
  id: string;
  label: string;
  kind: "app" | "site";
  locked: boolean;
  category: string;
  packageName?: string;
  url?: string;
  supportsPiP?: boolean;
};

type FocusSession = {
  id: string;
  active: boolean;
  mode: FocusMode;
  startedAt: number;
  endsAt: number;
  blockId?: string;
  targetIds: string[];
  interruptions: number;
};

type FocusLog = {
  id: string;
  title: string;
  detail: string;
  tone: "mint" | "coral" | "gold" | "ink";
  createdAt: number;
};

type AiMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type AiRecommendation = {
  id: string;
  title: string;
  detail: string;
  cta: string;
  tone: "mint" | "coral" | "gold" | "ink" | "lilac";
  icon: LucideIcon;
};

type InstalledApp = {
  label: string;
  packageName: string;
  category?: string;
  supportsPiP?: boolean;
};

type ProfileSettings = {
  name: string;
  role: string;
  avatar: string;
  dailyFocusGoal: number;
  weeklyFocusGoal: number;
  theme: ThemeMode;
  focusSound: "rain" | "cafe" | "white-noise" | "off";
  compactMode: boolean;
  reduceMotion: boolean;
};

type NativeFocusTarget = {
  id: string;
  label: string;
  packageName: string;
};

type NativeFocusSchedule = {
  id: string;
  title: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: DayKey[];
  targets: NativeFocusTarget[];
};

type NativeAppLimit = {
  id: string;
  label: string;
  packageName: string;
  minutes: number;
  enabled: boolean;
  warnAt: number;
};

type NativeFocusStatus = {
  accessibilityEnabled: boolean;
  usageAccessEnabled: boolean;
  focusEnabled: boolean;
  blockedCount: number;
  redirectCount: number;
  limitBlockedCount: number;
  lastBlockedLabel: string;
  lastBlockedAt: number;
  activeScheduleLabel: string;
};

type UsageStat = {
  label: string;
  packageName: string;
  minutes: number;
  limitMinutes?: number;
  overLimit?: boolean;
  lastTimeUsed?: number;
  category?: string;
  supportsPiP?: boolean;
};

type UsageDay = {
  label: string;
  date: string;
  totalMinutes: number;
  productiveMinutes: number;
  disturbanceMinutes: number;
  neutralMinutes: number;
  productivityScore: number;
};

type FocusSchedule = {
  id: string;
  title: string;
  enabled: boolean;
  mode: FocusMode;
  startTime: string;
  endTime: string;
  days: DayKey[];
  targetIds: string[];
  notifyBefore: number;
};

type AppLimit = {
  id: string;
  targetId: string;
  label: string;
  packageName: string;
  minutes: number;
  enabled: boolean;
  warnAt: number;
};

type FocusBlockerPlugin = {
  setConfig(options: {
    enabled: boolean;
    strict: boolean;
    endAt: number;
    targets: NativeFocusTarget[];
    schedules: NativeFocusSchedule[];
    limits: NativeAppLimit[];
  }): Promise<{ enabled: boolean; count: number }>;
  openAccessibilitySettings(): Promise<void>;
  openUsageSettings(): Promise<void>;
  getStatus(): Promise<NativeFocusStatus>;
  listInstalledApps(): Promise<{ apps: InstalledApp[] }>;
  getUsageHistory(options: { days: number; limits: NativeAppLimit[] }): Promise<{ apps: UsageStat[]; days?: UsageDay[] }>;
};

const NativeFocusBlocker = registerPlugin<FocusBlockerPlugin>("FocusBlocker");

const storageKeys = {
  blocks: "remind-blocks.blocks",
  targets: "remind-blocks.targets",
  strict: "remind-blocks.strict",
  focusMinutes: "remind-blocks.focus-minutes",
  focusSession: "remind-blocks.focus-session",
  focusLogs: "remind-blocks.focus-logs",
  focusMode: "remind-blocks.focus-mode",
  shieldEnabled: "remind-blocks.shield-enabled",
  profile: "remind-blocks.profile",
  schedules: "remind-blocks.schedules",
  appLimits: "remind-blocks.app-limits"
};

const typeMeta: Record<BlockType, { label: string; tone: string; icon: LucideIcon }> = {
  focus: { label: "Focus", tone: "mint", icon: Focus },
  routine: { label: "Routine", tone: "gold", icon: CalendarDays },
  health: { label: "Health", tone: "coral", icon: Waves },
  break: { label: "Break", tone: "lilac", icon: Moon },
  shield: { label: "Shield", tone: "ink", icon: Shield }
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "focus", label: "Focus", icon: LockKeyhole },
  { id: "shield", label: "Shield", icon: Shield },
  { id: "ai", label: "AI", icon: BrainCircuit },
  { id: "insights", label: "Stats", icon: Gauge },
  { id: "settings", label: "Settings", icon: Settings }
];

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  detail: string;
  colors: string[];
}> = [
  { id: "sunrise", label: "Sunrise", detail: "Warm and bright", colors: ["#f7f3ea", "#8fd6b3", "#f07167"] },
  { id: "midnight", label: "Midnight", detail: "Dark focus", colors: ["#101818", "#83c5de", "#f2b35d"] },
  { id: "forest", label: "Forest", detail: "Calm green", colors: ["#eff7ee", "#2d7a55", "#d6a84f"] },
  { id: "clean", label: "Clean", detail: "Quiet neutral", colors: ["#f8f8f5", "#5a7c89", "#e0a458"] },
  { id: "aurora", label: "Aurora", detail: "Premium dark", colors: ["#111417", "#49c6a8", "#f35f5f"] },
  { id: "graphite", label: "Graphite", detail: "Sharp contrast", colors: ["#f4f1eb", "#1f2933", "#5aa8a1"] }
];

const focusProfiles: Record<
  FocusMode,
  { label: string; minutes: number; icon: LucideIcon; detail: string }
> = {
  deep: { label: "Deep Work", minutes: 50, icon: Flame, detail: "High lock" },
  study: { label: "Study", minutes: 35, icon: BrainCircuit, detail: "Clean pace" },
  routine: { label: "Routine", minutes: 25, icon: CalendarDays, detail: "Fast block" },
  sleep: { label: "Wind Down", minutes: 45, icon: Moon, detail: "Low noise" }
};

const popularAppTargets: Array<{
  label: string;
  packageName: string;
  category: string;
  supportsPiP?: boolean;
}> = [
  { label: "Instagram", packageName: "com.instagram.android", category: "Social" },
  { label: "YouTube", packageName: "com.google.android.youtube", category: "Video", supportsPiP: true },
  { label: "TikTok", packageName: "com.zhiliaoapp.musically", category: "Social" },
  { label: "Snapchat", packageName: "com.snapchat.android", category: "Social" },
  { label: "Facebook", packageName: "com.facebook.katana", category: "Social" },
  { label: "X", packageName: "com.twitter.android", category: "Social" },
  { label: "Reddit", packageName: "com.reddit.frontpage", category: "Social" },
  { label: "Netflix", packageName: "com.netflix.mediaclient", category: "Video", supportsPiP: true },
  { label: "Chrome", packageName: "com.android.chrome", category: "Browser", supportsPiP: true },
  { label: "Roblox", packageName: "com.roblox.client", category: "Games" }
];

const appBundles: Array<{
  id: string;
  label: string;
  detail: string;
  packages: string[];
}> = [
  {
    id: "shorts",
    label: "Shorts & Reels",
    detail: "YouTube Shorts, Reels, TikTok, Snap",
    packages: [
      "com.google.android.youtube",
      "com.instagram.android",
      "com.zhiliaoapp.musically",
      "com.snapchat.android",
      "com.facebook.katana"
    ]
  },
  {
    id: "social",
    label: "Social Scroll",
    detail: "Feeds, chats, and comment loops",
    packages: [
      "com.instagram.android",
      "com.facebook.katana",
      "com.twitter.android",
      "com.reddit.frontpage",
      "com.snapchat.android"
    ]
  },
  {
    id: "video",
    label: "Video Binge",
    detail: "Streaming and endless watch apps",
    packages: ["com.google.android.youtube", "com.netflix.mediaclient"]
  },
  {
    id: "games",
    label: "Games",
    detail: "High dopamine games and worlds",
    packages: ["com.roblox.client"]
  },
  {
    id: "browser",
    label: "Browser Detours",
    detail: "Chrome and web rabbit holes",
    packages: ["com.android.chrome"]
  },
  {
    id: "pip",
    label: "Picture-in-picture",
    detail: "Floating video apps",
    packages: ["com.google.android.youtube", "com.netflix.mediaclient", "com.android.chrome"]
  }
];

const aiSuggestionPrompts = [
  "Block shorts and reels until tonight",
  "Limit YouTube to 2 hours daily",
  "Schedule study focus from 7pm to 9pm",
  "Block social scroll and start deep work"
];

const packageByName = popularAppTargets.reduce<Record<string, string>>((map, target) => {
  map[target.label.toLowerCase()] = target.packageName;
  return map;
}, {});

const targetByPackage = popularAppTargets.reduce<Record<string, (typeof popularAppTargets)[number]>>(
  (map, target) => {
    map[target.packageName] = target;
    return map;
  },
  {}
);

const dayLabels: Record<DayKey, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun"
};

const appCategoryOptions = ["All", "Social", "Video", "Games", "Browser", "Productivity", "Installed", "PiP"];

const nowPlus = (minutes: number) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  date.setSeconds(0, 0);
  return date.toISOString();
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const seedBlocks = (): ReminderBlock[] => [
  {
    id: createId(),
    title: "Deep work sprint",
    detail: "Protect the first block and start with the hardest task.",
    type: "focus",
    dueAt: nowPlus(25),
    minutes: 45,
    completed: false,
    intensity: 82
  },
  {
    id: createId(),
    title: "Hydrate and reset",
    detail: "A quick body check before the next focus block.",
    type: "health",
    dueAt: nowPlus(75),
    minutes: 8,
    completed: false,
    intensity: 42
  },
  {
    id: createId(),
    title: "Evening review",
    detail: "Move unfinished items into tomorrow's blocks.",
    type: "routine",
    dueAt: nowPlus(180),
    minutes: 15,
    completed: false,
    intensity: 58
  }
];

const seedTargets = (): ShieldTarget[] => [
  {
    id: createId(),
    label: "Instagram",
    kind: "app",
    locked: true,
    category: "Social",
    packageName: "com.instagram.android"
  },
  {
    id: createId(),
    label: "YouTube",
    kind: "app",
    locked: true,
    category: "Video",
    packageName: "com.google.android.youtube"
  },
  {
    id: createId(),
    label: "Chrome",
    kind: "app",
    locked: false,
    category: "Browser",
    packageName: "com.android.chrome"
  },
  {
    id: createId(),
    label: "youtube.com",
    kind: "site",
    locked: true,
    category: "Website",
    url: "https://youtube.com"
  }
];

const seedProfile = (): ProfileSettings => ({
  name: "Sugan",
  role: "Deep work builder",
  avatar: "S",
  dailyFocusGoal: 120,
  weeklyFocusGoal: 720,
  theme: "sunrise",
  focusSound: "rain",
  compactMode: false,
  reduceMotion: false
});

const seedSchedules = (): FocusSchedule[] => [
  {
    id: createId(),
    title: "School night shield",
    enabled: true,
    mode: "study",
    startTime: "19:00",
    endTime: "21:00",
    days: [1, 2, 3, 4, 5],
    targetIds: [],
    notifyBefore: 10
  }
];

const seedAppLimits = (targets: ShieldTarget[]): AppLimit[] =>
  targets
    .filter((target) => target.kind === "app" && target.packageName)
    .slice(0, 2)
    .map((target, index) => ({
      id: createId(),
      targetId: target.id,
      label: target.label,
      packageName: target.packageName!,
      minutes: index === 0 ? 120 : 60,
      enabled: index === 0,
      warnAt: 85
    }));

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(value: string | number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function minutesUntil(value: string) {
  return Math.round((new Date(value).getTime() - Date.now()) / 60000);
}

function parseTimeFromText(text: string) {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  const date = new Date();

  if (!match) {
    date.setMinutes(date.getMinutes() + 60, 0, 0);
    return date;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const marker = match[3]?.toLowerCase();

  if (marker === "pm" && hour < 12) hour += 12;
  if (marker === "am" && hour === 12) hour = 0;

  date.setHours(hour, minute, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function inferBlockType(text: string): BlockType {
  const lowered = text.toLowerCase();
  if (/(block|instagram|youtube|game|social|site|app|tiktok|snapchat|reddit)/.test(lowered)) {
    return "shield";
  }
  if (/(water|walk|medicine|meditate|stretch|health)/.test(lowered)) return "health";
  if (/(sleep|rest|break|nap|pause)/.test(lowered)) return "break";
  if (/(review|routine|habit|clean|daily)/.test(lowered)) return "routine";
  return "focus";
}

function cleanTitle(text: string) {
  return text
    .replace(/\b(remind me to|reminder|at|by|please|create|add|block)\b/gi, "")
    .replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getInitialTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 45);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatInputTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function formatMinutes(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function timeToMinutes(time: string) {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getDayKey(date = new Date()): DayKey {
  const day = date.getDay();
  return (day === 0 ? 7 : day) as DayKey;
}

function previousDay(day: DayKey): DayKey {
  return (day === 1 ? 7 : day - 1) as DayKey;
}

function isTimeWindowActive(startTime: string, endTime: string, days: DayKey[], date = new Date()) {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const today = getDayKey(date);

  if (start === end) return days.includes(today);
  if (start < end) {
    return days.includes(today) && nowMinutes >= start && nowMinutes < end;
  }

  return (
    (days.includes(today) && nowMinutes >= start) ||
    (days.includes(previousDay(today)) && nowMinutes < end)
  );
}

function getNextScheduleDate(schedule: FocusSchedule) {
  const now = new Date();
  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    const day = getDayKey(candidate);
    if (!schedule.days.includes(day)) continue;
    const [hour, minute] = schedule.startTime.split(":").map(Number);
    candidate.setHours(hour, minute - schedule.notifyBefore, 0, 0);
    if (candidate.getTime() > now.getTime()) return candidate;
  }
  return null;
}

function formatScheduleDays(days: DayKey[]) {
  return days.length === 7 ? "Every day" : days.map((day) => dayLabels[day]).join(", ");
}

function guessAppCategory(label: string, packageName = "") {
  const value = `${label} ${packageName}`.toLowerCase();
  if (/(instagram|facebook|snap|twitter|tiktok|reddit|discord|telegram|whatsapp)/.test(value)) return "Social";
  if (/(youtube|netflix|video|prime|hotstar|reels|shorts)/.test(value)) return "Video";
  if (/(game|roblox|minecraft|pubg|freefire|play)/.test(value)) return "Games";
  if (/(chrome|browser|firefox|edge)/.test(value)) return "Browser";
  if (/(docs|notion|calendar|mail|classroom|drive|office)/.test(value)) return "Productivity";
  return "Installed";
}

function isProductiveUsage(app: Pick<UsageStat, "label" | "packageName" | "category">) {
  const value = `${app.label} ${app.packageName} ${app.category ?? ""}`.toLowerCase();
  return /(productivity|docs|notion|calendar|mail|classroom|drive|office|tasks|todo|slack|teams|zoom)/.test(value);
}

function isDisturbanceUsage(app: Pick<UsageStat, "label" | "packageName" | "category">) {
  const value = `${app.label} ${app.packageName} ${app.category ?? ""}`.toLowerCase();
  return /(social|video|games|browser|instagram|youtube|tiktok|snap|facebook|reddit|netflix|chrome|roblox|shorts|reels)/.test(value);
}

function buildFallbackWeeklyUsage(apps: UsageStat[], focusScore: number): UsageDay[] {
  const totalToday = apps.reduce((total, app) => total + app.minutes, 0);
  const productiveToday = apps
    .filter(isProductiveUsage)
    .reduce((total, app) => total + app.minutes, 0);
  const disturbanceToday = apps
    .filter(isDisturbanceUsage)
    .reduce((total, app) => total + app.minutes, 0);
  const neutralToday = Math.max(0, totalToday - productiveToday - disturbanceToday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    const offset = 6 - index;
    date.setDate(date.getDate() - offset);
    const factor = 0.72 + ((focusScore + index * 13) % 35) / 100;
    const productiveMinutes = Math.round(productiveToday * factor * (index % 3 === 0 ? 1.12 : 0.92));
    const disturbanceMinutes = Math.round(disturbanceToday * factor * (index % 2 === 0 ? 1.1 : 0.82));
    const neutralMinutes = Math.round(neutralToday * factor);
    const totalMinutes = productiveMinutes + disturbanceMinutes + neutralMinutes;
    return {
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      date: date.toISOString(),
      totalMinutes,
      productiveMinutes,
      disturbanceMinutes,
      neutralMinutes,
      productivityScore: totalMinutes ? Math.round((productiveMinutes / totalMinutes) * 100) : 0
    };
  });
}

function parseDurationMinutes(text: string, fallback = 120) {
  const lowered = text.toLowerCase();
  const hourMatch = lowered.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  const minuteMatch = lowered.match(/(\d+)\s*(m|min|mins|minute|minutes)\b/);
  if (hourMatch) {
    return Math.max(15, Math.round(Number(hourMatch[1]) * 60));
  }
  if (minuteMatch) {
    return Math.max(15, Number(minuteMatch[1]));
  }
  return fallback;
}

function parseTimeRange(text: string) {
  const match = text.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i
  );
  if (!match) return null;

  const to24 = (hourValue: string, minuteValue?: string, markerValue?: string) => {
    let hour = Number(hourValue);
    const marker = markerValue?.toLowerCase();
    if (marker === "pm" && hour < 12) hour += 12;
    if (marker === "am" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${String(Number(minuteValue ?? 0)).padStart(2, "0")}`;
  };

  return {
    startTime: to24(match[1], match[2], match[3] || match[6]),
    endTime: to24(match[4], match[5], match[6] || match[3])
  };
}

function getMentionedPresets(text: string) {
  const lowered = text.toLowerCase();
  const packageNames = new Set<string>();

  popularAppTargets.forEach((target) => {
    if (lowered.includes(target.label.toLowerCase()) || lowered.includes(target.packageName.toLowerCase())) {
      packageNames.add(target.packageName);
    }
  });

  appBundles.forEach((bundle) => {
    const words = [bundle.id, ...bundle.label.toLowerCase().split(/\W+/)]
      .filter((word) => word.length > 3);
    if (words.some((word) => lowered.includes(word))) {
      bundle.packages.forEach((packageName) => packageNames.add(packageName));
    }
  });

  return popularAppTargets.filter((target) => packageNames.has(target.packageName));
}

function buildAiInsight({
  text,
  appCount,
  focusScore,
  lockedTargets,
  activeBlocks
}: {
  text: string;
  appCount: number;
  focusScore: number;
  lockedTargets: number;
  activeBlocks: number;
}) {
  const lowered = text.toLowerCase();
  if (/(shorts|reels|scroll|doom|binge)/.test(lowered)) {
    return `I treated this as a high-distraction loop and selected ${appCount || "the matching"} apps for Shield.`;
  }
  if (/(limit|usage|timer|only|per day|daily)/.test(lowered)) {
    return `I set a daily usage timer and kept the apps visible in Shield so you can adjust the minutes.`;
  }
  if (/(schedule|every|from|until|till)/.test(lowered)) {
    return `I created a scheduled focus window and attached your locked app list to it.`;
  }
  return `I planned this against ${lockedTargets} locked apps, ${activeBlocks} open blocks, and a focus score of ${focusScore}.`;
}

function getTargetDraft(input: string, kind: "app" | "site"): Omit<ShieldTarget, "id" | "locked"> {
  const value = input.trim();
  const normalized = value.toLowerCase();

  if (kind === "site") {
    const url = value.startsWith("http") ? value : `https://${value}`;
    return {
      label: value.replace(/^https?:\/\//, ""),
      kind: "site",
      category: "Website",
      url
    };
  }

  const knownPackage = packageByName[normalized];
  const knownByPackage = targetByPackage[value];

  if (knownPackage) {
    return {
      label: popularAppTargets.find((target) => target.packageName === knownPackage)?.label ?? value,
      kind: "app",
      category: popularAppTargets.find((target) => target.packageName === knownPackage)?.category ?? "App",
      packageName: knownPackage
    };
  }

  if (knownByPackage) {
    return {
      label: knownByPackage.label,
      kind: "app",
      category: knownByPackage.category,
      packageName: value
    };
  }

  return {
    label: value,
    kind: "app",
    category: value.includes(".") ? "Package" : "Custom",
    packageName: value.includes(".") ? value : undefined
  };
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [blocks, setBlocks] = useState<ReminderBlock[]>(() =>
    readJson(storageKeys.blocks, seedBlocks())
  );
  const [targets, setTargets] = useState<ShieldTarget[]>(() =>
    readJson(storageKeys.targets, seedTargets())
  );
  const [schedules, setSchedules] = useState<FocusSchedule[]>(() =>
    readJson(storageKeys.schedules, seedSchedules())
  );
  const [appLimits, setAppLimits] = useState<AppLimit[]>(() =>
    readJson(storageKeys.appLimits, seedAppLimits(readJson(storageKeys.targets, seedTargets())))
  );
  const [strictMode, setStrictMode] = useState(() => readJson(storageKeys.strict, true));
  const [focusMinutes, setFocusMinutes] = useState(() => readJson(storageKeys.focusMinutes, 25));
  const [focusMode, setFocusMode] = useState<FocusMode>(() =>
    readJson(storageKeys.focusMode, "deep" as FocusMode)
  );
  const [focusSession, setFocusSession] = useState<FocusSession | null>(() =>
    readJson<FocusSession | null>(storageKeys.focusSession, null)
  );
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>(() =>
    readJson<FocusLog[]>(storageKeys.focusLogs, [])
  );
  const [profile, setProfile] = useState<ProfileSettings>(() =>
    readJson(storageKeys.profile, seedProfile())
  );
  const [shieldEnabled, setShieldEnabled] = useState(() =>
    readJson(storageKeys.shieldEnabled, true)
  );
  const [nativeStatus, setNativeStatus] = useState<NativeFocusStatus>({
    accessibilityEnabled: false,
    usageAccessEnabled: false,
    focusEnabled: false,
    blockedCount: 0,
    redirectCount: 0,
    limitBlockedCount: 0,
    lastBlockedLabel: "",
    lastBlockedAt: 0,
    activeScheduleLabel: ""
  });
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<UsageDay[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [installedSearch, setInstalledSearch] = useState("");
  const [installedCategory, setInstalledCategory] = useState("All");
  const [installedSort, setInstalledSort] = useState<"name" | "category">("name");
  const [appPickerOpen, setAppPickerOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quickText, setQuickText] = useState("");
  const [manualType, setManualType] = useState<BlockType>("focus");
  const [manualTime, setManualTime] = useState(getInitialTime());
  const [targetText, setTargetText] = useState("");
  const [targetPackageText, setTargetPackageText] = useState("");
  const [targetKind, setTargetKind] = useState<"app" | "site">("app");
  const [focusBlockId, setFocusBlockId] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState<{
    title: string;
    startTime: string;
    endTime: string;
    days: DayKey[];
    mode: FocusMode;
    notifyBefore: number;
  }>({
    title: "Evening focus shield",
    startTime: "18:00",
    endTime: "20:00",
    days: [1, 2, 3, 4, 5],
    mode: "study",
    notifyBefore: 10
  });
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: createId(),
      role: "assistant",
      text: "I shaped your next day into focus blocks, shield moments, and recovery breaks."
    }
  ]);

  const completedCount = blocks.filter((block) => block.completed).length;
  const activeBlocks = blocks.filter((block) => !block.completed);
  const lockedTargets = targets.filter((target) => target.locked).length;
  const nativeBlockedTargets = targets.filter(
    (target): target is ShieldTarget & { packageName: string } =>
      target.locked && target.kind === "app" && Boolean(target.packageName)
  );
  const appTargets = targets.filter(
    (target): target is ShieldTarget & { packageName: string } =>
      target.kind === "app" && Boolean(target.packageName)
  );
  const activeSchedule = schedules.find((schedule) => schedule.enabled && isTimeWindowActive(schedule.startTime, schedule.endTime, schedule.days));
  const enabledAppLimits = appLimits.filter((limit) => limit.enabled);
  const appLimitMap = enabledAppLimits.reduce<Record<string, AppLimit>>((map, limit) => {
    map[limit.packageName] = limit;
    return map;
  }, {});
  const nextBlock = activeBlocks
    .slice()
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
  const selectedFocusBlock = blocks.find((block) => block.id === focusBlockId) ?? nextBlock;
  const sessionActive = Boolean(
    focusSession?.active && focusSession.endsAt > Date.now()
  );
  const sessionBlock = focusSession?.blockId
    ? blocks.find((block) => block.id === focusSession.blockId)
    : undefined;
  const sessionTargets = focusSession
    ? targets.filter((target) => focusSession.targetIds.includes(target.id))
    : [];
  const blockerActive = shieldEnabled || sessionActive || Boolean(activeSchedule) || enabledAppLimits.length > 0;
  const appSearchSource = installedApps.length
    ? installedApps
    : popularAppTargets.map((target) => ({
        label: target.label,
        packageName: target.packageName,
        category: target.category,
        supportsPiP: target.supportsPiP
      }));
  const filteredInstalledApps = appSearchSource
    .map((app) => ({ ...app, category: app.category ?? guessAppCategory(app.label, app.packageName) }))
    .filter((app) => {
      const query = installedSearch.trim().toLowerCase();
      const matchesQuery =
        !query ||
        app.label.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query) ||
        (app.supportsPiP && /(pip|picture|floating)/.test(query));
      const matchesCategory =
        installedCategory === "All" ||
        (installedCategory === "PiP" ? Boolean(app.supportsPiP) : app.category === installedCategory);
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) =>
      installedSort === "category"
        ? `${a.category}${a.label}`.localeCompare(`${b.category}${b.label}`)
        : a.label.localeCompare(b.label)
    )
    .slice(0, 36);
  const completedFocusMinutes = blocks
    .filter((block) => block.completed)
    .reduce((total, block) => total + block.minutes, 0);
  const activeElapsedMinutes =
    sessionActive && focusSession ? Math.max(0, Math.floor((Date.now() - focusSession.startedAt) / 60000)) : 0;
  const focusedMinutes = completedFocusMinutes + activeElapsedMinutes;
  const dailyProgress = Math.min(100, Math.round((focusedMinutes / Math.max(profile.dailyFocusGoal, 1)) * 100));
  const weeklyProgress = Math.min(100, Math.round((focusedMinutes / Math.max(profile.weeklyFocusGoal, 1)) * 100));
  const focusStreak = Math.min(30, Math.max(completedCount, focusLogs.filter((log) => log.title.includes("completed")).length));
  const savedMinutes = nativeStatus.redirectCount * 12;
  const totalScreenMinutes = usageStats.reduce((total, app) => total + app.minutes, 0);
  const overLimitCount = usageStats.filter((app) => app.overLimit).length;
  const usageLeader = usageStats.slice().sort((a, b) => b.minutes - a.minutes)[0];
  const pipAppCount = appSearchSource.filter((app) => app.supportsPiP).length;
  const weeklyReport = weeklyUsage.length ? weeklyUsage : buildFallbackWeeklyUsage(usageStats, 70);
  const weeklyTotals = weeklyReport.reduce(
    (totals, day) => ({
      total: totals.total + day.totalMinutes,
      productive: totals.productive + day.productiveMinutes,
      disturbance: totals.disturbance + day.disturbanceMinutes,
      neutral: totals.neutral + day.neutralMinutes
    }),
    { total: 0, productive: 0, disturbance: 0, neutral: 0 }
  );
  const weeklyProductivity = weeklyTotals.total ? Math.round((weeklyTotals.productive / weeklyTotals.total) * 100) : 0;
  const weeklyDisturbance = weeklyTotals.total ? Math.round((weeklyTotals.disturbance / weeklyTotals.total) * 100) : 0;
  const bestProductiveDay = weeklyReport.slice().sort((a, b) => b.productivityScore - a.productivityScore)[0];
  const mostDisturbedDay = weeklyReport.slice().sort((a, b) => b.disturbanceMinutes - a.disturbanceMinutes)[0];
  const weeklyMaxMinutes = Math.max(1, ...weeklyReport.map((day) => day.totalMinutes));
  const aiAttentionRisk = Math.min(
    100,
    Math.round(
      24 +
        Math.min(totalScreenMinutes / 5, 28) +
        Math.max(0, 24 - lockedTargets * 4) +
        (enabledAppLimits.length ? -8 : 10) +
        (activeSchedule ? -8 : 6) +
        (sessionActive ? -10 : 0)
    )
  );
  const aiStateLabel =
    aiAttentionRisk > 74 ? "High drift risk" : aiAttentionRisk > 48 ? "Needs guardrails" : "Protected flow";
  const aiRecommendations = useMemo<AiRecommendation[]>(() => {
    const cards: AiRecommendation[] = [];

    if (lockedTargets < 4) {
      cards.push({
        id: "block-shorts",
        title: "Block short-form loops",
        detail: "Select Shorts & Reels, social feeds, and video apps in one action.",
        cta: "Block bundle",
        tone: "coral",
        icon: Ban
      });
    }

    if (enabledAppLimits.length < 2) {
      cards.push({
        id: "limit-top-apps",
        title: "Add daily timers",
        detail: usageLeader ? `Start with ${usageLeader.label}, then cap noisy apps at 2h/day.` : "Cap the most distracting apps before they become the default.",
        cta: "Set timers",
        tone: "gold",
        icon: Hourglass
      });
    }

    if (!activeSchedule && schedules.filter((schedule) => schedule.enabled).length < 2) {
      cards.push({
        id: "schedule-evening",
        title: "Create evening shield",
        detail: "A weekday 7-9pm window protects homework, revision, or deep work.",
        cta: "Create",
        tone: "mint",
        icon: CalendarDays
      });
    }

    if (!sessionActive) {
      cards.push({
        id: "start-focus",
        title: "Start a protected sprint",
        detail: nextBlock ? `Use "${nextBlock.title}" as the focus target.` : "Launch a 35 minute study sprint with your current shield.",
        cta: "Start",
        tone: "ink",
        icon: CirclePlay
      });
    }

    if (!nativeStatus.accessibilityEnabled || !nativeStatus.usageAccessEnabled) {
      cards.push({
        id: "native-setup",
        title: "Finish native setup",
        detail: "Accessibility and Usage Access unlock real redirects and screen-time limits.",
        cta: "Setup",
        tone: "lilac",
        icon: Smartphone
      });
    }

    return cards.slice(0, 4);
  }, [
    activeSchedule,
    enabledAppLimits.length,
    lockedTargets,
    nativeStatus.accessibilityEnabled,
    nativeStatus.usageAccessEnabled,
    nextBlock,
    schedules,
    sessionActive,
    usageLeader
  ]);
  const nativeSchedules: NativeFocusSchedule[] = schedules
    .filter((schedule) => schedule.enabled)
    .map((schedule) => {
      const scheduleTargetIds = schedule.targetIds.length
        ? schedule.targetIds
        : targets.filter((target) => target.locked).map((target) => target.id);
      return {
        id: schedule.id,
        title: schedule.title,
        enabled: schedule.enabled,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        days: schedule.days,
        targets: targets
          .filter(
            (target): target is ShieldTarget & { packageName: string } =>
              scheduleTargetIds.includes(target.id) && target.kind === "app" && Boolean(target.packageName)
          )
          .map((target) => ({
            id: target.id,
            label: target.label,
            packageName: target.packageName
          }))
      };
    });
  const nativeAppLimits: NativeAppLimit[] = appLimits
    .filter((limit) => limit.enabled)
    .map((limit) => ({
      id: limit.id,
      label: limit.label,
      packageName: limit.packageName,
      minutes: limit.minutes,
      enabled: limit.enabled,
      warnAt: limit.warnAt
    }));

  const focusScore = useMemo(() => {
    const completion = blocks.length ? completedCount / blocks.length : 0;
    const shieldBoost = Math.min(lockedTargets * 8, 24);
    const strictBoost = strictMode ? 10 : 0;
    const liveBoost = sessionActive ? 9 : 0;
    const blockerBoost = shieldEnabled ? 8 : 0;
    const goalBoost = dailyProgress >= 100 ? 6 : Math.round(dailyProgress / 20);
    return Math.min(99, Math.round(42 + completion * 28 + shieldBoost + strictBoost + liveBoost + blockerBoost + goalBoost));
  }, [blocks.length, completedCount, lockedTargets, strictMode, sessionActive, shieldEnabled, dailyProgress]);

  useEffect(() => {
    localStorage.setItem(storageKeys.blocks, JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem(storageKeys.targets, JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem(storageKeys.schedules, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(storageKeys.appLimits, JSON.stringify(appLimits));
  }, [appLimits]);

  useEffect(() => {
    localStorage.setItem(storageKeys.strict, JSON.stringify(strictMode));
  }, [strictMode]);

  useEffect(() => {
    localStorage.setItem(storageKeys.focusMode, JSON.stringify(focusMode));
  }, [focusMode]);

  useEffect(() => {
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    document.documentElement.dataset.theme = profile.theme;
    document.documentElement.dataset.motion = profile.reduceMotion ? "reduced" : "full";
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(storageKeys.shieldEnabled, JSON.stringify(shieldEnabled));
  }, [shieldEnabled]);

  useEffect(() => {
    localStorage.setItem(storageKeys.focusLogs, JSON.stringify(focusLogs));
  }, [focusLogs]);

  useEffect(() => {
    localStorage.setItem(storageKeys.focusSession, JSON.stringify(focusSession));
  }, [focusSession]);

  useEffect(() => {
    if (!focusSession?.active) return;
    const remaining = Math.max(0, Math.ceil((focusSession.endsAt - Date.now()) / 1000));
    if (remaining <= 0) {
      setFocusSession(null);
      return;
    }
    setSecondsLeft(remaining);
    setTimerRunning(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKeys.focusMinutes, JSON.stringify(focusMinutes));
    if (!timerRunning) {
      setSecondsLeft(focusMinutes * 60);
    }
  }, [focusMinutes, timerRunning]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          setFocusSession((session) => {
            if (session?.active) {
              setFocusLogs((logs) => [
                {
                  id: createId(),
                  title: "Focus completed",
                  detail: `${focusProfiles[session.mode].label} finished at ${formatTime(Date.now())}`,
                  tone: "mint" as const,
                  createdAt: Date.now()
                },
                ...logs
              ].slice(0, 12));
              if (session.blockId) {
                setBlocks((current) =>
                  current.map((block) =>
                    block.id === session.blockId ? { ...block, completed: true } : block
                  )
                );
              }
            }
            return null;
          });
          void pushNativeFocusConfig(shieldEnabled, null);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning, shieldEnabled]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      void refreshNativeStatus();
      void refreshUsageHistory();
    }
  }, []);

  useEffect(() => {
    if (focusSession?.active && focusSession.endsAt <= Date.now()) {
      setFocusSession(null);
      setTimerRunning(false);
      void pushNativeFocusConfig(shieldEnabled, null);
    }
  }, [focusSession, shieldEnabled]);

  useEffect(() => {
    void pushNativeFocusConfig(blockerActive, sessionActive ? focusSession : null);
  }, [blockerActive, sessionActive, focusSession, targets, strictMode, schedules, appLimits]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !blockerActive) return;
    const interval = window.setInterval(() => {
      void refreshNativeStatus();
      void refreshUsageHistory();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [blockerActive]);

  useEffect(() => {
    if (activeTab === "insights" || activeTab === "shield") {
      void refreshUsageHistory();
    }
  }, [activeTab, appLimits]);

  const addFocusLog = (title: string, detail: string, tone: FocusLog["tone"] = "ink") => {
    setFocusLogs((logs) => [
      { id: createId(), title, detail, tone, createdAt: Date.now() },
      ...logs
    ].slice(0, 12));
  };

  async function refreshNativeStatus() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const status = await NativeFocusBlocker.getStatus();
      setNativeStatus(status);
    } catch {
      setNativeStatus({
        accessibilityEnabled: false,
        usageAccessEnabled: false,
        focusEnabled: false,
        blockedCount: 0,
        redirectCount: 0,
        limitBlockedCount: 0,
        lastBlockedLabel: "",
        lastBlockedAt: 0,
        activeScheduleLabel: ""
      });
    }
  }

  async function refreshUsageHistory() {
    if (!Capacitor.isNativePlatform()) {
      const fallbackStats = appTargets.slice(0, 5).map((target, index) => {
        const limit = appLimitMap[target.packageName];
        const minutes = Math.max(8, (nativeStatus.redirectCount + index + 1) * 7);
        return {
          label: target.label,
          packageName: target.packageName,
          minutes,
          limitMinutes: limit?.minutes,
          overLimit: Boolean(limit && minutes >= limit.minutes),
          category: target.category,
          supportsPiP: target.supportsPiP,
          lastTimeUsed: Date.now() - index * 1800000
        };
      });
      setUsageStats(fallbackStats);
      setWeeklyUsage(buildFallbackWeeklyUsage(fallbackStats, focusScore));
      return;
    }

    try {
      const response = await NativeFocusBlocker.getUsageHistory({
        days: 7,
        limits: nativeAppLimits
      });
      setUsageStats(response.apps);
      setWeeklyUsage(response.days ?? []);
    } catch {
      setUsageStats([]);
      setWeeklyUsage([]);
    }
  }

  async function pushNativeFocusConfig(enabled: boolean, session: FocusSession | null) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const response = await NativeFocusBlocker.setConfig({
        enabled,
        strict: strictMode,
        endAt: enabled && session ? session.endsAt : 0,
        targets: enabled
          ? nativeBlockedTargets.map((target) => ({
              id: target.id,
              label: target.label,
              packageName: target.packageName
            }))
          : [],
        schedules: nativeSchedules,
        limits: nativeAppLimits
      });
      setNativeStatus((current) => ({
        ...current,
        focusEnabled: response.enabled,
        blockedCount: response.count
      }));
    } catch {
      setNativeStatus((current) => ({ ...current, focusEnabled: false, blockedCount: 0 }));
    }
  }

  const loadInstalledApps = async () => {
    if (!Capacitor.isNativePlatform()) {
      addFocusLog("APK feature", "Installed app picker works inside the Android APK.", "gold");
      return;
    }

    try {
      const response = await NativeFocusBlocker.listInstalledApps();
      setInstalledApps(
        response.apps.map((app) => ({
          ...app,
          category: app.category ?? guessAppCategory(app.label, app.packageName)
        }))
      );
      addFocusLog("Installed apps loaded", `${response.apps.length} apps found`, "mint");
    } catch {
      addFocusLog("App picker unavailable", "Use custom package names instead.", "gold");
    }
  };

  const scheduleBlockNotification = async (block: ReminderBlock) => {
    const dueDate = new Date(block.dueAt);
    if (dueDate.getTime() <= Date.now()) return;

    if (Capacitor.isNativePlatform()) {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.abs(block.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)),
            title: block.title,
            body: block.detail || `${typeMeta[block.type].label} block is ready.`,
            schedule: { at: dueDate },
            smallIcon: "ic_stat_icon_config_sample"
          }
        ]
      });
      return;
    }

    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    const delay = dueDate.getTime() - Date.now();
    if ("Notification" in window && Notification.permission === "granted" && delay < 2147483647) {
      window.setTimeout(() => {
        new Notification(block.title, {
          body: block.detail || `${typeMeta[block.type].label} block is ready.`,
          icon: "/app-icon.svg"
        });
      }, delay);
    }
  };

  const scheduleFocusStartNotification = async (schedule: FocusSchedule) => {
    const nextDate = getNextScheduleDate(schedule);
    if (!nextDate) return;

    if (Capacitor.isNativePlatform()) {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.abs(schedule.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) + 1000),
            title: `${schedule.title} starts soon`,
            body: `${focusProfiles[schedule.mode].label} begins at ${schedule.startTime}.`,
            schedule: { at: nextDate },
            smallIcon: "ic_stat_icon_config_sample"
          }
        ]
      });
      return;
    }

    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  const armScheduleNotifications = () => {
    schedules.filter((schedule) => schedule.enabled).forEach((schedule) => void scheduleFocusStartNotification(schedule));
    addFocusLog("Schedule alerts armed", `${schedules.filter((schedule) => schedule.enabled).length} focus windows`, "mint");
  };

  const addBlock = (sourceText = quickText, sourceType = manualType) => {
    const text = sourceText.trim();
    if (!text) return;

    const [hour, minute] = manualTime.split(":").map(Number);
    const due = new Date();
    due.setHours(hour, minute, 0, 0);
    if (due.getTime() < Date.now()) due.setDate(due.getDate() + 1);

    const inferred = sourceType || inferBlockType(text);
    const block: ReminderBlock = {
      id: createId(),
      title: cleanTitle(text) || "New reminder block",
      detail:
        inferred === "shield"
          ? "Focus shield will stay active during this block."
          : "AI grouped this into your day.",
      type: inferred,
      dueAt: due.toISOString(),
      minutes: inferred === "break" ? 10 : inferred === "health" ? 8 : 25,
      completed: false,
      intensity: inferred === "shield" ? 76 : 62
    };

    setBlocks((current) => [block, ...current]);
    setQuickText("");
    void scheduleBlockNotification(block);
  };

  const addAiBlock = (text: string) => {
    const blockType = inferBlockType(text);
    const due = parseTimeFromText(text);
    const title = cleanTitle(text) || (blockType === "shield" ? "Focus shield" : "AI reminder");
    const block: ReminderBlock = {
      id: createId(),
      title,
      detail:
        blockType === "shield"
          ? "AI suggests locking noisy apps before this starts."
          : "Created from the AI planning prompt.",
      type: blockType,
      dueAt: due.toISOString(),
      minutes: blockType === "break" ? 10 : blockType === "health" ? 8 : 30,
      completed: false,
      intensity: blockType === "focus" ? 80 : 55
    };

    setBlocks((current) => [block, ...current]);
    void scheduleBlockNotification(block);

    const lowered = text.toLowerCase();
    const matchedApp = popularAppTargets.find((target) =>
      lowered.includes(target.label.toLowerCase())
    );
    if (blockType === "shield" && matchedApp && !targets.some((target) => target.packageName === matchedApp.packageName)) {
      setTargets((current) => [
        {
          id: createId(),
          label: matchedApp.label,
          kind: "app",
          category: matchedApp.category,
          packageName: matchedApp.packageName,
          locked: true
        },
        ...current
      ]);
    }

    return block;
  };

  const addTarget = (preset?: (typeof popularAppTargets)[number]) => {
    const draft = preset
      ? {
          label: preset.label,
          kind: "app" as const,
          category: preset.category,
          packageName: preset.packageName
        }
      : targetKind === "app" && targetPackageText.trim()
        ? {
            label: targetText.trim() || targetPackageText.trim(),
            kind: "app" as const,
            category: "Custom",
            packageName: targetPackageText.trim()
          }
        : getTargetDraft(targetText, targetKind);

    if (!draft.label) return;

    setTargets((current) => {
      const exists = current.some((target) =>
        draft.packageName ? target.packageName === draft.packageName : target.label === draft.label
      );
      if (exists) {
        return current.map((target) =>
          (draft.packageName && target.packageName === draft.packageName) || target.label === draft.label
            ? { ...target, locked: true }
            : target
        );
      }
      return [{ id: createId(), locked: true, ...draft }, ...current];
    });
    setTargetText("");
    setTargetPackageText("");
  };

  const addInstalledAppTarget = (app: InstalledApp) => {
    setTargets((current) => {
      const exists = current.some((target) => target.packageName === app.packageName);
      if (exists) {
        return current.map((target) =>
          target.packageName === app.packageName ? { ...target, locked: true } : target
        );
      }
      return [
        {
          id: createId(),
          label: app.label,
          kind: "app",
          category: app.category ?? guessAppCategory(app.label, app.packageName),
          packageName: app.packageName,
          supportsPiP: app.supportsPiP,
          locked: true
        },
        ...current
      ];
    });
  };

  const getAppInfo = (packageName: string) => {
    const sourceApp = appSearchSource.find((app) => app.packageName === packageName);
    const preset = popularAppTargets.find((target) => target.packageName === packageName);
    return {
      label: sourceApp?.label ?? preset?.label ?? packageName,
      packageName,
      category: sourceApp?.category ?? preset?.category ?? guessAppCategory(sourceApp?.label ?? preset?.label ?? packageName, packageName),
      supportsPiP: sourceApp?.supportsPiP ?? preset?.supportsPiP
    };
  };

  const setAppLocked = (app: InstalledApp, locked: boolean) => {
    setTargets((current) => {
      const existing = current.find((target) => target.packageName === app.packageName);
      if (existing) {
        return current.map((target) =>
          target.packageName === app.packageName ? { ...target, locked } : target
        );
      }

      return [
        {
          id: createId(),
          label: app.label,
          kind: "app",
          category: app.category ?? guessAppCategory(app.label, app.packageName),
          packageName: app.packageName,
          supportsPiP: app.supportsPiP,
          locked
        },
        ...current
      ];
    });
  };

  const setBundleLocked = (bundle: (typeof appBundles)[number], locked: boolean) => {
    bundle.packages.forEach((packageName) => setAppLocked(getAppInfo(packageName), locked));
    addFocusLog(
      locked ? "Bundle blocked" : "Bundle opened",
      `${bundle.label}: ${bundle.packages.length} apps`,
      locked ? "mint" : "gold"
    );
  };

  const lockPresetTargets = (presets: typeof popularAppTargets) => {
    const nextTargets: Array<ShieldTarget & { packageName: string }> = presets.map((preset) => {
      const existing = targets.find((target) => target.packageName === preset.packageName);
      return {
        id: existing?.id ?? createId(),
        label: existing?.label ?? preset.label,
        kind: "app",
        locked: true,
        category: existing?.category ?? preset.category,
        packageName: preset.packageName,
        supportsPiP: existing?.supportsPiP ?? preset.supportsPiP
      };
    });

    setTargets((current) => {
      const nextPackages = new Set(nextTargets.map((target) => target.packageName));
      return [
        ...nextTargets.filter((target) => !current.some((item) => item.packageName === target.packageName)),
        ...current.map((target) =>
          target.packageName && nextPackages.has(target.packageName)
            ? { ...target, locked: true }
            : target
        )
      ];
    });

    return nextTargets;
  };

  const openAppPicker = () => {
    setAppPickerOpen(true);
    if (Capacitor.isNativePlatform() && installedApps.length === 0) {
      void loadInstalledApps();
    }
  };

  const upsertAppLimit = (
    target: ShieldTarget & { packageName: string },
    patch: Partial<Pick<AppLimit, "minutes" | "enabled" | "warnAt">>
  ) => {
    setAppLimits((current) => {
      const existing = current.find((limit) => limit.packageName === target.packageName);
      if (existing) {
        return current.map((limit) =>
          limit.packageName === target.packageName
            ? { ...limit, label: target.label, targetId: target.id, ...patch }
            : limit
        );
      }

      return [
        {
          id: createId(),
          targetId: target.id,
          label: target.label,
          packageName: target.packageName,
          minutes: 120,
          enabled: true,
          warnAt: 85,
          ...patch
        },
        ...current
      ];
    });
  };

  const removeAppLimit = (packageName: string) => {
    setAppLimits((current) => current.filter((limit) => limit.packageName !== packageName));
  };

  const addFocusSchedule = () => {
    const title = scheduleDraft.title.trim() || `${focusProfiles[scheduleDraft.mode].label} schedule`;
    const defaultTargetIds = targets.filter((target) => target.locked).map((target) => target.id);
    const schedule: FocusSchedule = {
      id: createId(),
      title,
      enabled: true,
      mode: scheduleDraft.mode,
      startTime: scheduleDraft.startTime,
      endTime: scheduleDraft.endTime,
      days: scheduleDraft.days.length ? scheduleDraft.days : [1, 2, 3, 4, 5],
      targetIds: defaultTargetIds,
      notifyBefore: scheduleDraft.notifyBefore
    };
    setSchedules((current) => [schedule, ...current]);
    void scheduleFocusStartNotification(schedule);
    addFocusLog("Schedule created", `${title} ${schedule.startTime}-${schedule.endTime}`, "mint");
  };

  const toggleDraftDay = (day: DayKey) => {
    setScheduleDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day].sort((a, b) => a - b)
    }));
  };

  const toggleScheduleTarget = (scheduleId: string, targetId: string) => {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              targetIds: schedule.targetIds.includes(targetId)
                ? schedule.targetIds.filter((item) => item !== targetId)
                : [...schedule.targetIds, targetId]
            }
          : schedule
      )
    );
  };

  const toggleScheduleDay = (scheduleId: string, day: DayKey) => {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              days: schedule.days.includes(day)
                ? schedule.days.filter((item) => item !== day)
                : [...schedule.days, day].sort((a, b) => a - b)
            }
          : schedule
      )
    );
  };

  const openUsageSettings = async () => {
    if (!Capacitor.isNativePlatform()) {
      addFocusLog("Usage access", "Native screen-time history appears inside the APK.", "gold");
      return;
    }

    try {
      await NativeFocusBlocker.openUsageSettings();
      window.setTimeout(() => {
        void refreshNativeStatus();
        void refreshUsageHistory();
      }, 1200);
    } catch {
      addFocusLog("Usage settings unavailable", "Open Android Usage Access manually.", "gold");
    }
  };

  const requestRemoteAiReply = async (text: string, localReply: string) => {
    const endpoint = import.meta.env.VITE_AI_ENDPOINT;
    if (!endpoint) return null;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          localReply,
          context: {
            focusScore,
            aiAttentionRisk,
            lockedTargets,
            activeBlocks: activeBlocks.length,
            enabledAppLimits: enabledAppLimits.length,
            activeSchedule: activeSchedule?.title ?? "",
            usageLeader: usageLeader
              ? {
                  label: usageLeader.label,
                  minutes: usageLeader.minutes,
                  packageName: usageLeader.packageName
                }
              : null
          }
        })
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { reply?: string; text?: string; message?: string };
      return data.reply ?? data.text ?? data.message ?? null;
    } catch {
      addFocusLog("AI endpoint unavailable", "Using the local AI engine.", "gold");
      return null;
    }
  };

  const handleAiSubmit = async (overrideText?: string) => {
    const text = (overrideText ?? aiInput).trim();
    if (!text) return;
    setAiThinking(true);

    const mentionedPresets = getMentionedPresets(text);
    const aiTargets = mentionedPresets.length ? lockPresetTargets(mentionedPresets) : [];
    const lowered = text.toLowerCase();
    const wantsLimit = /(limit|usage|timer|only|per day|daily|allow)/.test(lowered);
    const wantsSchedule = /(schedule|every\s+(day|weekday|weekend|night)|from\b|until|till|-)/.test(lowered);
    const durationMinutes = parseDurationMinutes(text, focusMinutes);
    const timeRange = parseTimeRange(text);

    if (wantsLimit && aiTargets.length) {
      aiTargets.forEach((target) => upsertAppLimit(target, { minutes: durationMinutes, enabled: true }));
      addFocusLog("AI limit set", `${aiTargets.length} apps at ${formatMinutes(durationMinutes)}/day`, "mint");
    }

    if (wantsSchedule || timeRange) {
      const range = timeRange ?? {
        startTime: formatInputTime(parseTimeFromText(text)),
        endTime: "21:00"
      };
      const schedule: FocusSchedule = {
        id: createId(),
        title: lowered.includes("night") ? "AI night shield" : "AI focus window",
        enabled: true,
        mode: lowered.includes("sleep") || lowered.includes("night") ? "sleep" : lowered.includes("study") ? "study" : focusMode,
        startTime: range.startTime,
        endTime: range.endTime,
        days: lowered.includes("weekend") ? [6, 7] : lowered.includes("daily") || lowered.includes("every") ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5],
        targetIds: aiTargets.length ? aiTargets.map((target) => target.id) : targets.filter((target) => target.locked).map((target) => target.id),
        notifyBefore: 10
      };
      setSchedules((current) => [schedule, ...current]);
      void scheduleFocusStartNotification(schedule);
      addFocusLog("AI schedule created", `${schedule.startTime}-${schedule.endTime}`, "mint");
    }

    const block = addAiBlock(text);
    const gap = minutesUntil(block.dueAt);
    const insight = buildAiInsight({
      text,
      appCount: aiTargets.length,
      focusScore,
      lockedTargets,
      activeBlocks: activeBlocks.length
    });
    let response =
      [
        block.type === "shield"
          ? `Locked a shield block for ${formatTime(block.dueAt)}.`
          : `Added "${block.title}" at ${formatTime(block.dueAt)}. It starts in ${Math.max(gap, 0)} minutes.`,
        insight,
        wantsLimit && aiTargets.length ? `${aiTargets.map((target) => target.label).slice(0, 3).join(", ")} now have ${formatMinutes(durationMinutes)} daily timers.` : "",
        (wantsSchedule || timeRange) ? "A scheduled focus window is ready in Focus." : ""
      ]
        .filter(Boolean)
        .join(" ");

    const remoteReply = await requestRemoteAiReply(text, response);
    if (remoteReply) {
      response = remoteReply;
    }

    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", text },
      { id: createId(), role: "assistant", text: response }
    ]);
    if (!overrideText) setAiInput("");
    setAiThinking(false);
  };

  const generateDailyPlan = () => {
    const plan: AiMessage = {
      id: createId(),
      role: "assistant",
      text: [
        `AI plan: start with "${nextBlock?.title ?? "a 35 minute focus block"}".`,
        `Keep ${lockedTargets} distractions locked and run ${focusProfiles[focusMode].label}.`,
        usageLeader ? `Watch ${usageLeader.label}; it is currently the highest usage app.` : "",
        `Attention risk is ${aiAttentionRisk}/100, so I recommend ${aiRecommendations[0]?.title.toLowerCase() ?? "a protected sprint"}.`
      ].filter(Boolean).join(" ")
    };
    setMessages((current) => [...current, plan]);
    setActiveTab("ai");
  };

  const applyAiRecommendation = (id: string) => {
    if (id === "block-shorts") {
      const bundle = appBundles.find((item) => item.id === "shorts");
      if (bundle) setBundleLocked(bundle, true);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          text: "I blocked the Shorts & Reels bundle. You can fine-tune individual apps in Shield."
        }
      ]);
      setActiveTab("shield");
      return;
    }

    if (id === "limit-top-apps") {
      const candidates = usageLeader
        ? [getAppInfo(usageLeader.packageName)]
        : appBundles.find((item) => item.id === "shorts")?.packages.slice(0, 3).map(getAppInfo) ?? [];
      candidates.forEach((app) => {
        setAppLocked(app, true);
        upsertAppLimit(
          {
            id: targets.find((target) => target.packageName === app.packageName)?.id ?? createId(),
            label: app.label,
            kind: "app",
            locked: true,
            category: app.category ?? "App",
            packageName: app.packageName
          },
          { minutes: 120, enabled: true }
        );
      });
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          text: "I added 2 hour daily timers to the top distraction candidates."
        }
      ]);
      setActiveTab("shield");
      return;
    }

    if (id === "schedule-evening") {
      const schedule: FocusSchedule = {
        id: createId(),
        title: "AI evening shield",
        enabled: true,
        mode: "study",
        startTime: "19:00",
        endTime: "21:00",
        days: [1, 2, 3, 4, 5],
        targetIds: targets.filter((target) => target.locked).map((target) => target.id),
        notifyBefore: 10
      };
      setSchedules((current) => [schedule, ...current]);
      void scheduleFocusStartNotification(schedule);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          text: "I created a weekday 7-9pm AI evening shield and attached your locked apps."
        }
      ]);
      setActiveTab("focus");
      return;
    }

    if (id === "start-focus") {
      startFocusSession({ mode: focusMode, minutes: focusProfiles[focusMode].minutes, title: "AI sprint started" });
      return;
    }

    if (id === "native-setup") {
      if (!nativeStatus.accessibilityEnabled) {
        void openAccessibilitySettings();
      } else {
        void openUsageSettings();
      }
    }
  };

  const armReminders = () => {
    activeBlocks.forEach((block) => void scheduleBlockNotification(block));
  };

  const startFocusSession = (override?: { mode?: FocusMode; minutes?: number; title?: string }) => {
    const now = Date.now();
    const sessionMode = override?.mode ?? focusMode;
    const sessionMinutes = override?.minutes ?? focusMinutes;
    const session: FocusSession = {
      id: createId(),
      active: true,
      mode: sessionMode,
      startedAt: now,
      endsAt: now + sessionMinutes * 60000,
      blockId: selectedFocusBlock?.id,
      targetIds: targets.filter((target) => target.locked).map((target) => target.id),
      interruptions: 0
    };

    setFocusSession(session);
    setTimerRunning(true);
    setSecondsLeft(sessionMinutes * 60);
    setActiveTab("focus");
    addFocusLog(
      override?.title ?? "Focus started",
      `${focusProfiles[sessionMode].label} until ${formatTime(session.endsAt)}`,
      "mint"
    );
    void scheduleBlockNotification({
      id: `focus-complete-${session.id}`,
      title: "Focus session complete",
      detail: "Your protected block is finished.",
      type: "focus",
      dueAt: new Date(session.endsAt).toISOString(),
      minutes: sessionMinutes,
      completed: false,
      intensity: 100
    });
  };

  const endFocusSession = (reason = "Focus ended") => {
    if (focusSession?.active) {
      addFocusLog(reason, `Stopped at ${formatTime(Date.now())}`, reason.includes("Blocked") ? "coral" : "gold");
    }
    setFocusSession(null);
    setTimerRunning(false);
    setSecondsLeft(focusMinutes * 60);
    void pushNativeFocusConfig(shieldEnabled, null);
  };

  const handleTargetAttempt = (target: ShieldTarget) => {
    if (blockerActive && target.locked) {
      setFocusSession((session) =>
        session ? { ...session, interruptions: session.interruptions + 1 } : session
      );
      addFocusLog("Blocked attempt", target.label, "coral");
      return;
    }

    if (target.kind === "site" && target.url) {
      window.open(target.url, "_blank", "noopener,noreferrer");
    }
  };

  const openAccessibilitySettings = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await NativeFocusBlocker.openAccessibilitySettings();
      window.setTimeout(() => void refreshNativeStatus(), 1000);
    } catch {
      addFocusLog("Native settings unavailable", "Open Android Accessibility manually", "gold");
    }
  };

  const timerLabel = formatDuration(secondsLeft);

  return (
    <main className={`app-shell ${sessionActive ? "focus-live" : ""} ${profile.compactMode ? "compact" : ""}`}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <img src="/app-icon.svg" alt="" className="brand-mark" />
          <div>
            <p className="eyebrow">ReMind</p>
            <h1>
              Blocks
              <span className="brand-version">V1</span>
            </h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-button ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={19} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <button className="profile-card" type="button" onClick={() => setActiveTab("settings")}>
          <span>{profile.avatar || profile.name.slice(0, 1) || "R"}</span>
          <div>
            <strong>{profile.name || "Focus user"}</strong>
            <small>{profile.role || "Focused builder"}</small>
          </div>
        </button>

        <div className="score-dial">
          <span>{focusScore}</span>
          <small>Focus score</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric"
              }).format(new Date())}
            </p>
            <h2>{sessionActive ? "Focus Mode" : nextBlock ? nextBlock.title : "All clear"}</h2>
          </div>
          <div className="topbar-actions">
            <span className="release-pill">
              <Sparkles size={14} />
              V1
            </span>
            {sessionActive && (
              <span className="focus-live-pill">
                <LockKeyhole size={15} />
                {timerLabel}
              </span>
            )}
            {!sessionActive && shieldEnabled && (
              <span className="focus-live-pill">
                <Shield size={15} />
                Shield on
              </span>
            )}
            {!sessionActive && activeSchedule && (
              <span className="focus-live-pill">
                <CalendarDays size={15} />
                {activeSchedule.title}
              </span>
            )}
            <button className="icon-button" type="button" onClick={armReminders} aria-label="Arm reminders" title="Arm reminders">
              <BellRing size={20} />
            </button>
            <button className="action-button" type="button" onClick={() => setActiveTab("focus")}>
              <LockKeyhole size={18} />
              <span>{sessionActive ? "Live" : "Focus"}</span>
            </button>
            <button className="action-button" type="button" onClick={generateDailyPlan}>
              <Sparkles size={18} />
              <span>AI Plan</span>
            </button>
          </div>
        </header>

        <div className="content-grid">
          {activeTab === "today" && (
            <>
              <section className="hero-panel">
                <div className="hero-copy">
                  <p className="eyebrow">AI day map</p>
                  <h2>Reminder blocks that defend your attention.</h2>
                  <div className="hero-status-grid" aria-label="Focus readiness">
                    <span>
                      <strong>{focusScore}</strong>
                      <small>Score</small>
                    </span>
                    <span>
                      <strong>{lockedTargets}</strong>
                      <small>Locked</small>
                    </span>
                    <span>
                      <strong>{enabledAppLimits.length}</strong>
                      <small>Timers</small>
                    </span>
                  </div>
                  <div className="quick-capture">
                    <input
                      value={quickText}
                      onChange={(event) => setQuickText(event.target.value)}
                      placeholder="Study physics, take medicine, block socials..."
                    />
                    <select value={manualType} onChange={(event) => setManualType(event.target.value as BlockType)}>
                      {Object.entries(typeMeta).map(([key, meta]) => (
                        <option value={key} key={key}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={manualTime}
                      onChange={(event) => setManualTime(event.target.value)}
                    />
                    <button className="icon-button dark" type="button" onClick={() => addBlock()} aria-label="Add block" title="Add block">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <img src="/assets/ai-companion.png" alt="" className="hero-art" />
              </section>

              <section className="flow-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Daily flow</p>
                    <h3>{dailyProgress >= 100 ? "Goal complete" : `${dailyProgress}% to goal`}</h3>
                  </div>
                  <Trophy size={24} />
                </div>
                <div className="goal-track">
                  <span style={{ width: `${dailyProgress}%` }} />
                </div>
                <div className="flow-stats">
                  <article>
                    <Target size={18} />
                    <strong>{focusedMinutes}m</strong>
                    <small>focused</small>
                  </article>
                  <article>
                    <Flame size={18} />
                    <strong>{focusStreak}</strong>
                    <small>streak</small>
                  </article>
                  <article>
                    <Ban size={18} />
                    <strong>{savedMinutes}m</strong>
                    <small>saved</small>
                  </article>
                  <article>
                    <Activity size={18} />
                    <strong>{formatMinutes(totalScreenMinutes)}</strong>
                    <small>screen</small>
                  </article>
                </div>
              </section>

              <TimerPanel
                timerLabel={timerLabel}
                timerRunning={timerRunning}
                focusMinutes={focusMinutes}
                onToggle={() => setTimerRunning((value) => !value)}
                onReset={() => {
                  setTimerRunning(false);
                  setSecondsLeft(focusMinutes * 60);
                }}
                onMinutesChange={setFocusMinutes}
                onStartFocus={() => startFocusSession()}
                sessionActive={sessionActive}
              />

              <section className="blocks-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Blocks</p>
                    <h3>Today</h3>
                  </div>
                  <span>{completedCount}/{blocks.length}</span>
                </div>
                <div className="block-grid">
                  {blocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      isSessionBlock={sessionActive && focusSession?.blockId === block.id}
                      onFocus={() => {
                        setFocusBlockId(block.id);
                        setActiveTab("focus");
                      }}
                      onToggle={() =>
                        setBlocks((current) =>
                          current.map((item) =>
                            item.id === block.id ? { ...item, completed: !item.completed } : item
                          )
                        )
                      }
                      onDelete={() => setBlocks((current) => current.filter((item) => item.id !== block.id))}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "focus" && (
            <>
              <section className={`focus-mode-panel ${sessionActive ? "is-live" : ""}`}>
                <div className="focus-copy">
                  <p className="eyebrow">{sessionActive ? "Protected" : "Focus mode"}</p>
                  <h2>{sessionActive ? sessionBlock?.title ?? "Focus session active" : "Start a protected block."}</h2>
                  <div className="focus-meta-row">
                    <span><Shield size={15} /> {sessionTargets.length || lockedTargets} locked</span>
                    <span><Ban size={15} /> {focusSession?.interruptions ?? 0} blocked</span>
                    <span><Clock3 size={15} /> {formatTime(sessionActive ? focusSession!.endsAt : Date.now() + focusMinutes * 60000)}</span>
                  </div>
                </div>
                <div className="focus-clock">
                  <span>{timerLabel}</span>
                  <small>{focusProfiles[focusMode].label}</small>
                </div>
                <div className="focus-controls">
                  <select value={focusBlockId} onChange={(event) => setFocusBlockId(event.target.value)} disabled={sessionActive}>
                    <option value="">Next active block</option>
                    {activeBlocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.title}
                      </option>
                    ))}
                  </select>
                  {sessionActive ? (
                    <button className="action-button danger" type="button" onClick={() => endFocusSession()}>
                      <Square size={18} />
                      <span>End</span>
                    </button>
                  ) : (
                    <button className="action-button" type="button" onClick={() => startFocusSession()}>
                      <CirclePlay size={18} />
                      <span>Start</span>
                    </button>
                  )}
                </div>
              </section>

              <section className="mode-preset-grid">
                {(Object.entries(focusProfiles) as Array<[FocusMode, (typeof focusProfiles)[FocusMode]]>).map(
                  ([key, profile]) => {
                    const Icon = profile.icon;
                    return (
                      <button
                        key={key}
                        className={`mode-preset ${focusMode === key ? "is-active" : ""}`}
                        type="button"
                        onClick={() => {
                          setFocusMode(key);
                          setFocusMinutes(profile.minutes);
                        }}
                        disabled={sessionActive}
                      >
                        <Icon size={20} />
                        <strong>{profile.label}</strong>
                        <span>{profile.minutes}m</span>
                      </button>
                    );
                  }
                )}
              </section>

              <section className="schedule-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Schedule focus timing</p>
                    <h3>Automatic focus windows</h3>
                  </div>
                  <button className="icon-button" type="button" onClick={armScheduleNotifications} aria-label="Arm schedule notifications" title="Arm schedule notifications">
                    <BellRing size={19} />
                  </button>
                </div>
                <div className="schedule-builder">
                  <input
                    value={scheduleDraft.title}
                    onChange={(event) => setScheduleDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Schedule name"
                  />
                  <select
                    value={scheduleDraft.mode}
                    onChange={(event) => setScheduleDraft((current) => ({ ...current, mode: event.target.value as FocusMode }))}
                  >
                    {(Object.entries(focusProfiles) as Array<[FocusMode, (typeof focusProfiles)[FocusMode]]>).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={scheduleDraft.startTime}
                    onChange={(event) => setScheduleDraft((current) => ({ ...current, startTime: event.target.value }))}
                  />
                  <input
                    type="time"
                    value={scheduleDraft.endTime}
                    onChange={(event) => setScheduleDraft((current) => ({ ...current, endTime: event.target.value }))}
                  />
                  <select
                    value={scheduleDraft.notifyBefore}
                    onChange={(event) => setScheduleDraft((current) => ({ ...current, notifyBefore: Number(event.target.value) }))}
                  >
                    <option value={0}>No alert</option>
                    <option value={5}>5m alert</option>
                    <option value={10}>10m alert</option>
                    <option value={15}>15m alert</option>
                  </select>
                  <button className="icon-button dark" type="button" onClick={addFocusSchedule} aria-label="Add schedule" title="Add schedule">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="day-picker">
                  {(Object.keys(dayLabels) as Array<`${DayKey}`>).map((day) => {
                    const value = Number(day) as DayKey;
                    return (
                      <button
                        key={day}
                        className={scheduleDraft.days.includes(value) ? "is-active" : ""}
                        type="button"
                        onClick={() => toggleDraftDay(value)}
                      >
                        {dayLabels[value]}
                      </button>
                    );
                  })}
                </div>
                <div className="schedule-grid">
                  {(schedules.length ? schedules : seedSchedules()).map((schedule) => (
                    <article className={`schedule-card ${activeSchedule?.id === schedule.id ? "is-live" : ""}`} key={schedule.id}>
                      <div>
                        <CalendarDays size={20} />
                        <strong>{schedule.title}</strong>
                        <span>{schedule.startTime}-{schedule.endTime} · {formatScheduleDays(schedule.days)}</span>
                      </div>
                      <div className="schedule-days">
                        {(Object.keys(dayLabels) as Array<`${DayKey}`>).map((day) => {
                          const value = Number(day) as DayKey;
                          return (
                            <button
                              key={day}
                              className={schedule.days.includes(value) ? "is-active" : ""}
                              type="button"
                              onClick={() => toggleScheduleDay(schedule.id, value)}
                            >
                              {dayLabels[value].slice(0, 1)}
                            </button>
                          );
                        })}
                      </div>
                      <div className="schedule-targets">
                        {appTargets.slice(0, 5).map((target) => (
                          <button
                            key={target.id}
                            className={schedule.targetIds.includes(target.id) || (!schedule.targetIds.length && target.locked) ? "is-active" : ""}
                            type="button"
                            onClick={() => toggleScheduleTarget(schedule.id, target.id)}
                          >
                            {target.label}
                          </button>
                        ))}
                      </div>
                      <div className="schedule-actions">
                        <button
                          className={`pill-toggle ${schedule.enabled ? "locked" : ""}`}
                          type="button"
                          onClick={() =>
                            setSchedules((current) =>
                              current.map((item) => item.id === schedule.id ? { ...item, enabled: !item.enabled } : item)
                            )
                          }
                        >
                          {schedule.enabled ? "Enabled" : "Paused"}
                        </button>
                        <button
                          className="icon-button subtle"
                          type="button"
                          onClick={() => setSchedules((current) => current.filter((item) => item.id !== schedule.id))}
                          aria-label={`Delete ${schedule.title}`}
                          title={`Delete ${schedule.title}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="focus-rule-grid">
                <article className="rule-card">
                  <LockKeyhole size={22} />
                  <strong>Strict mode</strong>
                  <label className="switch-row compact">
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(event) => setStrictMode(event.target.checked)}
                    />
                  </label>
                </article>
                <article className="rule-card">
                  <Smartphone size={22} />
                  <strong>Android blocker</strong>
                  <span>{nativeStatus.accessibilityEnabled ? "Ready" : "Setup"}</span>
                </article>
                <article className="rule-card">
                  <Shield size={22} />
                  <strong>Native apps</strong>
                  <span>{nativeBlockedTargets.length}</span>
                </article>
                <article className="rule-card">
                  <Hourglass size={22} />
                  <strong>Daily limits</strong>
                  <span>{enabledAppLimits.length}</span>
                </article>
                <article className="rule-card">
                  <CalendarDays size={22} />
                  <strong>Schedules</strong>
                  <span>{schedules.filter((schedule) => schedule.enabled).length}</span>
                </article>
              </section>

              <section className="blocked-apps-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Blocked apps</p>
                    <h3>Focus list</h3>
                  </div>
                  <button className="icon-button" type="button" onClick={openAccessibilitySettings} aria-label="Open Accessibility settings" title="Open Accessibility settings">
                    <Settings size={19} />
                  </button>
                </div>
                <div className="focus-target-grid">
                  {targets.filter((target) => target.locked).map((target) => (
                    <TargetCard
                      key={target.id}
                      target={target}
                      sessionActive={blockerActive}
                      onAttempt={() => handleTargetAttempt(target)}
                      onToggle={() =>
                        setTargets((current) =>
                          current.map((item) =>
                            item.id === target.id ? { ...item, locked: !item.locked } : item
                          )
                        )
                      }
                      onDelete={() => setTargets((current) => current.filter((item) => item.id !== target.id))}
                    />
                  ))}
                </div>
              </section>

            </>
          )}

          {activeTab === "shield" && (
            <>
              <section className="shield-panel">
                <div>
                  <p className="eyebrow">Native redirect shield</p>
                  <h2>{shieldEnabled ? "Distractions return here." : "Choose what gets blocked."}</h2>
                </div>
                <div className="shield-actions">
                  <button className="action-button light" type="button" onClick={openAppPicker}>
                    <AppWindow size={18} />
                    <span>Choose apps</span>
                  </button>
                  <label className="switch-row">
                    <span>Shield</span>
                    <input
                      type="checkbox"
                      checked={shieldEnabled}
                      onChange={(event) => setShieldEnabled(event.target.checked)}
                    />
                  </label>
                  <label className="switch-row">
                    <span>Strict</span>
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(event) => setStrictMode(event.target.checked)}
                    />
                  </label>
                </div>
              </section>

              <section className="shield-command-panel">
                <button className="permission-card" type="button" onClick={openAccessibilitySettings}>
                  <Smartphone size={21} />
                  <strong>{nativeStatus.accessibilityEnabled ? "Accessibility ready" : "Enable redirect"}</strong>
                  <span>{nativeStatus.accessibilityEnabled ? "Locked apps can be sent back." : "Required for real app blocking."}</span>
                </button>
                <button className="permission-card" type="button" onClick={openUsageSettings}>
                  <History size={21} />
                  <strong>{nativeStatus.usageAccessEnabled ? "Usage ready" : "Enable timers"}</strong>
                  <span>{nativeStatus.usageAccessEnabled ? "Daily usage timers can run." : "Required for screen-time limits."}</span>
                </button>
                <article className="permission-card passive">
                  <Ban size={21} />
                  <strong>{nativeStatus.redirectCount}</strong>
                  <span>Redirects</span>
                </article>
                <article className="permission-card passive">
                  <Hourglass size={21} />
                  <strong>{enabledAppLimits.length}</strong>
                  <span>Daily timers</span>
                </article>
              </section>

              <section className="blocked-apps-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Selected apps</p>
                    <h3>{lockedTargets} blocked</h3>
                  </div>
                  <button className="action-button" type="button" onClick={openAppPicker}>
                    <Plus size={18} />
                    <span>Add apps</span>
                  </button>
                </div>
                <div className="focus-target-grid">
                  {(targets.filter((target) => target.locked).length
                    ? targets.filter((target) => target.locked)
                    : targets.slice(0, 3)
                  ).map((target) => (
                    <TargetCard
                      key={target.id}
                      target={target}
                      sessionActive={blockerActive}
                      onAttempt={() => handleTargetAttempt(target)}
                      onToggle={() =>
                        setTargets((current) =>
                          current.map((item) =>
                            item.id === target.id ? { ...item, locked: !item.locked } : item
                          )
                        )
                      }
                      onDelete={() => setTargets((current) => current.filter((item) => item.id !== target.id))}
                    />
                  ))}
                </div>
              </section>

              <section className="limits-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Usage timer</p>
                    <h3>Daily app limits</h3>
                  </div>
                  <button className="action-button" type="button" onClick={openUsageSettings}>
                    <History size={18} />
                    <span>Usage access</span>
                  </button>
                </div>
                <div className="limit-grid">
                  {appTargets.map((target) => {
                    const limit = appLimits.find((item) => item.packageName === target.packageName);
                    const usage = usageStats.find((item) => item.packageName === target.packageName);
                    const minutes = limit?.minutes ?? 120;
                    const progress = Math.min(100, Math.round(((usage?.minutes ?? 0) / Math.max(minutes, 1)) * 100));
                    return (
                      <article className={`limit-card ${usage?.overLimit ? "is-over" : ""}`} key={target.id}>
                        <div className="limit-head">
                          <AppWindow size={19} />
                          <div>
                            <strong>{target.label}</strong>
                            <span>{formatMinutes(usage?.minutes ?? 0)} used today</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(limit?.enabled)}
                            onChange={(event) => upsertAppLimit(target, { enabled: event.target.checked })}
                            aria-label={`Enable daily limit for ${target.label}`}
                          />
                        </div>
                        <label className="limit-slider">
                          <span>{formatMinutes(minutes)} daily limit</span>
                          <input
                            type="range"
                            min="15"
                            max="360"
                            step="15"
                            value={minutes}
                            onChange={(event) => upsertAppLimit(target, { minutes: Number(event.target.value), enabled: true })}
                          />
                        </label>
                        <div className="goal-track">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <div className="limit-actions">
                          <button className="pill-toggle" type="button" onClick={() => upsertAppLimit(target, { minutes: 120, enabled: true })}>
                            2h
                          </button>
                          <button className="pill-toggle" type="button" onClick={() => upsertAppLimit(target, { minutes: 60, enabled: true })}>
                            1h
                          </button>
                          {limit && (
                            <button className="icon-button subtle" type="button" onClick={() => removeAppLimit(target.packageName)} aria-label={`Remove limit for ${target.label}`} title={`Remove limit for ${target.label}`}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === "ai" && (
            <section className="ai-panel">
              <div className="ai-hero">
                <div>
                  <p className="eyebrow">{import.meta.env.VITE_AI_ENDPOINT ? "Connected AI" : "Local AI engine"}</p>
                  <h2>{aiThinking ? "Thinking..." : aiStateLabel}</h2>
                  <span>Understands blocks, limits, schedules, app bundles, and screen-time context.</span>
                </div>
                <div className="ai-risk-dial">
                  <strong>{aiAttentionRisk}</strong>
                  <small>risk</small>
                </div>
              </div>

              <div className="ai-layout">
                <div className="ai-command-card">
                  <div className="section-heading compact-heading">
                    <div>
                      <p className="eyebrow">Command</p>
                      <h3>Ask for a change</h3>
                    </div>
                    <BrainCircuit size={22} />
                  </div>

                  <div className="ai-intel-grid">
                    <article>
                      <Sparkles size={18} />
                      <strong>{focusScore}</strong>
                      <span>focus score</span>
                    </article>
                    <article>
                      <Shield size={18} />
                      <strong>{lockedTargets}</strong>
                      <span>locked apps</span>
                    </article>
                    <article>
                      <Hourglass size={18} />
                      <strong>{enabledAppLimits.length}</strong>
                      <span>timers</span>
                    </article>
                  </div>

                  <div className="chat-input ai-main-input">
                    <input
                      value={aiInput}
                      onChange={(event) => setAiInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void handleAiSubmit();
                      }}
                      placeholder="Block shorts, limit YouTube to 2 hours, schedule study 7pm to 9pm"
                    />
                    <button className="icon-button dark" type="button" onClick={() => void handleAiSubmit()} disabled={aiThinking} aria-label="Send to AI" title="Send to AI">
                      {aiThinking ? <RefreshCw size={20} /> : <ChevronRight size={21} />}
                    </button>
                  </div>

                  <div className="ai-suggestion-row">
                    {aiSuggestionPrompts.map((prompt) => (
                      <button key={prompt} className="app-chip" type="button" onClick={() => void handleAiSubmit(prompt)}>
                        <Sparkles size={15} />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>

                  <div className="chat-stream">
                    {messages.map((message) => (
                      <div className={`chat-bubble ${message.role}`} key={message.id}>
                        {message.text}
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="ai-action-panel">
                  <div className="section-heading compact-heading">
                    <div>
                      <p className="eyebrow">Autopilot</p>
                      <h3>Recommended actions</h3>
                    </div>
                    <Target size={22} />
                  </div>
                  <div className="ai-action-list">
                    {aiRecommendations.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article className={`ai-action-card ${item.tone}`} key={item.id}>
                          <Icon size={20} />
                          <strong>{item.title}</strong>
                          <span>{item.detail}</span>
                          <button className="pill-toggle locked" type="button" onClick={() => applyAiRecommendation(item.id)}>
                            {item.cta}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                  <div className="ai-plan-actions">
                    <button className="action-button" type="button" onClick={generateDailyPlan}>
                      <Sparkles size={18} />
                      <span>Build plan</span>
                    </button>
                    <button className="icon-button" type="button" onClick={openAppPicker} aria-label="Open app picker" title="Open app picker">
                      <AppWindow size={18} />
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          )}

          {activeTab === "insights" && (
            <>
              <section className="stat-grid">
                <MetricCard icon={Check} label="Done" value={completedCount.toString()} tone="mint" />
                <MetricCard icon={Shield} label="Locked" value={lockedTargets.toString()} tone="ink" />
                <MetricCard icon={Ban} label="Redirects" value={nativeStatus.redirectCount.toString()} tone="lilac" />
                <MetricCard icon={Flame} label="Score" value={focusScore.toString()} tone="coral" />
                <MetricCard icon={AlarmClock} label="Queued" value={activeBlocks.length.toString()} tone="gold" />
                <MetricCard icon={Activity} label="Screen" value={formatMinutes(totalScreenMinutes)} tone="mint" />
                <MetricCard icon={Hourglass} label="Over limit" value={overLimitCount.toString()} tone="coral" />
                <MetricCard icon={Target} label="Productive" value={`${weeklyProductivity}%`} tone="mint" />
                <MetricCard icon={Ban} label="Disturbance" value={`${weeklyDisturbance}%`} tone="coral" />
              </section>

              <section className="weekly-report-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Weekly report</p>
                    <h3>Productivity vs disturbance</h3>
                  </div>
                  <BarChart3 size={23} />
                </div>
                <div className="weekly-summary-grid">
                  <article>
                    <Target size={18} />
                    <strong>{formatMinutes(weeklyTotals.productive)}</strong>
                    <span>productive</span>
                  </article>
                  <article>
                    <Ban size={18} />
                    <strong>{formatMinutes(weeklyTotals.disturbance)}</strong>
                    <span>disturbance</span>
                  </article>
                  <article>
                    <Activity size={18} />
                    <strong>{formatMinutes(weeklyTotals.total)}</strong>
                    <span>screen time</span>
                  </article>
                  <article>
                    <Smartphone size={18} />
                    <strong>{pipAppCount}</strong>
                    <span>PiP apps</span>
                  </article>
                </div>
                <div className="weekly-chart" aria-label="Weekly usage chart">
                  {weeklyReport.map((day) => {
                    const height = Math.max(10, Math.round((day.totalMinutes / weeklyMaxMinutes) * 100));
                    const productivePercent = day.totalMinutes ? Math.round((day.productiveMinutes / day.totalMinutes) * 100) : 0;
                    const disturbancePercent = day.totalMinutes ? Math.round((day.disturbanceMinutes / day.totalMinutes) * 100) : 0;
                    const neutralPercent = Math.max(0, 100 - productivePercent - disturbancePercent);
                    return (
                      <article className="weekly-day" key={day.date}>
                        <div className="weekly-stack" style={{ height: `${height}%` }}>
                          <span className="productive" style={{ height: `${productivePercent}%` }} />
                          <span className="neutral" style={{ height: `${neutralPercent}%` }} />
                          <span className="disturbance" style={{ height: `${disturbancePercent}%` }} />
                        </div>
                        <strong>{day.label}</strong>
                        <small>{formatMinutes(day.totalMinutes)}</small>
                      </article>
                    );
                  })}
                </div>
                <div className="weekly-notes">
                  <article>
                    <strong>{bestProductiveDay?.label ?? "Today"}</strong>
                    <span>best productivity</span>
                  </article>
                  <article>
                    <strong>{mostDisturbedDay?.label ?? "Today"}</strong>
                    <span>most disturbance</span>
                  </article>
                  <article>
                    <strong>{usageLeader?.label ?? "No app yet"}</strong>
                    <span>top app today</span>
                  </article>
                </div>
              </section>

              <section className="usage-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Native screen-time history</p>
                    <h3>Today by app</h3>
                  </div>
                  <div className="native-actions">
                    <button className="icon-button" type="button" onClick={refreshUsageHistory} aria-label="Refresh usage" title="Refresh usage">
                      <RefreshCw size={18} />
                    </button>
                    <button className="action-button" type="button" onClick={openUsageSettings}>
                      <History size={18} />
                      <span>{nativeStatus.usageAccessEnabled ? "Ready" : "Enable"}</span>
                    </button>
                  </div>
                </div>
                <div className="usage-list">
                  {(usageStats.length ? usageStats.slice(0, 10) : [
                    {
                      label: "No usage data yet",
                      packageName: "Enable Usage Access in the Android APK",
                      minutes: 0
                    }
                  ]).map((app) => {
                    const maxMinutes = Math.max(usageLeader?.minutes ?? 1, app.limitMinutes ?? 1);
                    const width = Math.min(100, Math.round((app.minutes / maxMinutes) * 100));
                    return (
                      <article className={`usage-row ${app.overLimit ? "is-over" : ""}`} key={app.packageName}>
                        <div>
                          <strong>{app.label}</strong>
                          <span>{app.packageName}</span>
                        </div>
                        <div className="usage-bar">
                          <span style={{ width: `${width}%` }} />
                        </div>
                        <strong>{formatMinutes(app.minutes)}</strong>
                        <small>{app.limitMinutes ? `${formatMinutes(app.limitMinutes)} limit` : "no limit"}</small>
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <section className="settings-overview">
                <div className="settings-profile-editor">
                  <div className="settings-avatar">{profile.avatar || profile.name.slice(0, 1) || "R"}</div>
                  <div>
                    <p className="eyebrow">Profile</p>
                    <h2>{profile.name || "Focus user"}</h2>
                    <span>{profile.role || "Focused builder"}</span>
                  </div>
                  <div className="settings-field-grid">
                    <label className="settings-field">
                      <span>Name</span>
                      <input
                        value={profile.name}
                        onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      />
                    </label>
                    <label className="settings-field">
                      <span>Role</span>
                      <input
                        value={profile.role}
                        onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value }))}
                      />
                    </label>
                    <label className="settings-field">
                      <span>Avatar</span>
                      <input
                        maxLength={2}
                        value={profile.avatar}
                        onChange={(event) => setProfile((current) => ({ ...current, avatar: event.target.value.slice(0, 2).toUpperCase() }))}
                      />
                    </label>
                  </div>
                </div>
                <div className="settings-status-grid">
                  <article>
                    <Target size={18} />
                    <strong>{dailyProgress}%</strong>
                    <span>daily goal</span>
                  </article>
                  <article>
                    <BarChart3 size={18} />
                    <strong>{weeklyProductivity}%</strong>
                    <span>productive</span>
                  </article>
                  <article>
                    <Palette size={18} />
                    <strong>{themeOptions.find((theme) => theme.id === profile.theme)?.label ?? "Theme"}</strong>
                    <span>theme</span>
                  </article>
                </div>
              </section>

              <div className="settings-two-column">
              <section className="theme-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Theme</p>
                    <h3>Choose mood</h3>
                  </div>
                  <Palette size={23} />
                </div>
                <div className="theme-grid">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-card ${profile.theme === theme.id ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setProfile((current) => ({ ...current, theme: theme.id }))}
                    >
                      <span>
                        {theme.colors.map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </span>
                      <strong>{theme.label}</strong>
                      <small>{theme.detail}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="goals-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Goals</p>
                    <h3>Focus targets</h3>
                  </div>
                  <BarChart3 size={23} />
                </div>
                <div className="settings-grid two">
                  <label className="slider-card">
                    <span>Daily {profile.dailyFocusGoal}m</span>
                    <input
                      type="range"
                      min="30"
                      max="360"
                      step="15"
                      value={profile.dailyFocusGoal}
                      onChange={(event) => setProfile((current) => ({ ...current, dailyFocusGoal: Number(event.target.value) }))}
                    />
                  </label>
                  <label className="slider-card">
                    <span>Weekly {profile.weeklyFocusGoal}m</span>
                    <input
                      type="range"
                      min="120"
                      max="1800"
                      step="60"
                      value={profile.weeklyFocusGoal}
                      onChange={(event) => setProfile((current) => ({ ...current, weeklyFocusGoal: Number(event.target.value) }))}
                    />
                  </label>
                </div>
                <div className="goal-row">
                  <div>
                    <strong>{dailyProgress}%</strong>
                    <span>daily</span>
                  </div>
                  <div>
                    <strong>{weeklyProgress}%</strong>
                    <span>weekly</span>
                  </div>
                  <div>
                    <strong>{focusScore}</strong>
                    <span>score</span>
                  </div>
                </div>
              </section>

              <section className="preference-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Experience</p>
                    <h3>Flow controls</h3>
                  </div>
                  <SlidersHorizontal size={23} />
                </div>
                <div className="preference-grid">
                  <label className="switch-card">
                    <span>Compact layout</span>
                    <input
                      type="checkbox"
                      checked={profile.compactMode}
                      onChange={(event) => setProfile((current) => ({ ...current, compactMode: event.target.checked }))}
                    />
                  </label>
                  <label className="switch-card">
                    <span>Reduce motion</span>
                    <input
                      type="checkbox"
                      checked={profile.reduceMotion}
                      onChange={(event) => setProfile((current) => ({ ...current, reduceMotion: event.target.checked }))}
                    />
                  </label>
                  <label className="settings-field">
                    <span>Focus sound</span>
                    <select
                      value={profile.focusSound}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          focusSound: event.target.value as ProfileSettings["focusSound"]
                        }))
                      }
                    >
                      <option value="rain">Rain</option>
                      <option value="cafe">Cafe</option>
                      <option value="white-noise">White noise</option>
                      <option value="off">Off</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="system-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Native features</p>
                    <h3>APK controls</h3>
                  </div>
                  <Layers3 size={23} />
                </div>
                <div className="system-grid">
                  <button className="system-card" type="button" onClick={openAccessibilitySettings}>
                    <Smartphone size={21} />
                    <strong>{nativeStatus.accessibilityEnabled ? "Accessibility ready" : "Enable app redirect"}</strong>
                    <span>Required to send locked apps back here.</span>
                  </button>
                  <button className="system-card" type="button" onClick={openUsageSettings}>
                    <History size={21} />
                    <strong>{nativeStatus.usageAccessEnabled ? "Usage access ready" : "Enable usage history"}</strong>
                    <span>Required for screen-time charts and daily app timers.</span>
                  </button>
                  <button className="system-card" type="button" onClick={armScheduleNotifications}>
                    <BellRing size={21} />
                    <strong>Arm schedule alerts</strong>
                    <span>{schedules.filter((schedule) => schedule.enabled).length} active windows.</span>
                  </button>
                </div>
              </section>
              </div>
            </>
          )}
        </div>
      </section>
      {appPickerOpen && (
        <div className="app-picker-overlay" role="presentation" onMouseDown={() => setAppPickerOpen(false)}>
          <section
            className="app-picker-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Choose blocked apps"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="app-picker-head">
              <div>
                <p className="eyebrow">App picker</p>
                <h3>Choose what Shield blocks</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => setAppPickerOpen(false)} aria-label="Close app picker" title="Close app picker">
                <X size={20} />
              </button>
            </div>

            <div className="picker-search-grid">
              <label className="search-row">
                <Search size={18} />
                <input
                  value={installedSearch}
                  onChange={(event) => setInstalledSearch(event.target.value)}
                  placeholder="Search app name, package, shorts, games..."
                  autoFocus
                />
              </label>
              <select value={installedSort} onChange={(event) => setInstalledSort(event.target.value as "name" | "category")}>
                <option value="name">Name</option>
                <option value="category">Category</option>
              </select>
              <button className="icon-button" type="button" onClick={loadInstalledApps} aria-label="Load installed apps" title="Load installed apps">
                <Smartphone size={18} />
              </button>
            </div>

            <div className="picker-category-row">
              {appCategoryOptions.map((category) => (
                <button
                  key={category}
                  className={installedCategory === category ? "is-active" : ""}
                  type="button"
                  onClick={() => setInstalledCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="bundle-grid">
              {appBundles.map((bundle) => {
                const selectedCount = bundle.packages.filter((packageName) =>
                  targets.some((target) => target.packageName === packageName && target.locked)
                ).length;
                const fullySelected = selectedCount === bundle.packages.length;
                return (
                  <button
                    key={bundle.id}
                    className={`bundle-card ${selectedCount ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setBundleLocked(bundle, !fullySelected)}
                  >
                    {fullySelected ? <CheckCircle2 size={19} /> : <AppWindow size={19} />}
                    <strong>{bundle.label}</strong>
                    <span>{selectedCount}/{bundle.packages.length} selected</span>
                  </button>
                );
              })}
            </div>

            <div className="selected-app-strip">
              {(targets.filter((target) => target.locked && target.kind === "app").length
                ? targets.filter((target) => target.locked && target.kind === "app")
                : []
              ).slice(0, 10).map((target) => (
                <button
                  key={target.id}
                  className="selected-app-chip"
                  type="button"
                  onClick={() =>
                    setTargets((current) =>
                      current.map((item) => item.id === target.id ? { ...item, locked: false } : item)
                    )
                  }
                >
                  <CheckCircle2 size={15} />
                  <span>{target.label}</span>
                  {target.supportsPiP && <small>PiP</small>}
                  <X size={14} />
                </button>
              ))}
              {!targets.some((target) => target.locked && target.kind === "app") && (
                <span className="selected-empty">No apps selected</span>
              )}
            </div>

            <div className="picker-toolbar">
              <span>{filteredInstalledApps.length} apps</span>
              <button
                className="pill-toggle locked"
                type="button"
                onClick={() => filteredInstalledApps.forEach((app) => setAppLocked(app, true))}
              >
                Select shown
              </button>
              <button
                className="pill-toggle"
                type="button"
                onClick={() => filteredInstalledApps.forEach((app) => setAppLocked(app, false))}
              >
                Clear shown
              </button>
            </div>

            <div className="app-picker-list">
              {filteredInstalledApps.map((app) => {
                const target = targets.find((item) => item.packageName === app.packageName);
                const locked = Boolean(target?.locked);
                const usage = usageStats.find((item) => item.packageName === app.packageName);
                return (
                  <label className={`app-picker-row ${locked ? "is-selected" : ""}`} key={app.packageName}>
                    <input
                      type="checkbox"
                      checked={locked}
                      onChange={(event) => setAppLocked(app, event.target.checked)}
                    />
                    <AppWindow size={18} />
                    <span>
                      <strong>{app.label}</strong>
                      <small>{app.category} · {app.packageName}</small>
                    </span>
                    <em>
                      {app.supportsPiP && <b>PiP</b>}
                      {locked && <b>Blocked</b>}
                      {usage ? formatMinutes(usage.minutes) : ""}
                    </em>
                  </label>
                );
              })}
            </div>

            <div className="custom-app-mini">
              <input
                value={targetText}
                onChange={(event) => setTargetText(event.target.value)}
                placeholder="Custom app name"
              />
              <input
                value={targetPackageText}
                onChange={(event) => setTargetPackageText(event.target.value)}
                placeholder="com.example.app"
              />
              <button
                className="action-button"
                type="button"
                onClick={() => {
                  if (!targetPackageText.trim()) return;
                  setAppLocked(
                    {
                      label: targetText.trim() || targetPackageText.trim(),
                      packageName: targetPackageText.trim(),
                      category: "Custom"
                    },
                    true
                  );
                  setTargetText("");
                  setTargetPackageText("");
                }}
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function TimerPanel({
  timerLabel,
  timerRunning,
  focusMinutes,
  sessionActive,
  onToggle,
  onReset,
  onMinutesChange,
  onStartFocus
}: {
  timerLabel: string;
  timerRunning: boolean;
  focusMinutes: number;
  sessionActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onMinutesChange: (minutes: number) => void;
  onStartFocus: () => void;
}) {
  return (
    <section className="timer-panel">
      <div className="timer-orbit">
        <span>{timerLabel}</span>
        <small>{sessionActive ? "Protected" : "Focus block"}</small>
      </div>
      <div className="timer-controls">
        <button className="icon-button dark" type="button" onClick={onToggle} aria-label={timerRunning ? "Pause timer" : "Start timer"} title={timerRunning ? "Pause timer" : "Start timer"}>
          {timerRunning ? <CirclePause size={22} /> : <CirclePlay size={22} />}
        </button>
        <button className="icon-button" type="button" onClick={onReset} aria-label="Reset timer" title="Reset timer">
          <TimerReset size={20} />
        </button>
        <button className="icon-button" type="button" onClick={onStartFocus} aria-label="Start focus mode" title="Start focus mode">
          <LockKeyhole size={20} />
        </button>
      </div>
      <label className="slider-row">
        <span>{focusMinutes} min</span>
        <input
          type="range"
          min="10"
          max="180"
          step="5"
          value={focusMinutes}
          onChange={(event) => onMinutesChange(Number(event.target.value))}
        />
      </label>
    </section>
  );
}

function BlockCard({
  block,
  isSessionBlock,
  onToggle,
  onDelete,
  onFocus
}: {
  block: ReminderBlock;
  isSessionBlock: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onFocus: () => void;
}) {
  const Icon = typeMeta[block.type].icon;
  const dueIn = minutesUntil(block.dueAt);

  return (
    <article className={`block-card ${typeMeta[block.type].tone} ${block.completed ? "is-done" : ""} ${isSessionBlock ? "is-live" : ""}`}>
      <div className="block-head">
        <div className="block-icon">
          <Icon size={20} />
        </div>
        <span>{isSessionBlock ? "Live" : typeMeta[block.type].label}</span>
      </div>
      <h4>{block.title}</h4>
      <p>{block.detail}</p>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${block.intensity}%` }} />
      </div>
      <div className="block-footer">
        <time>{formatTime(block.dueAt)}</time>
        <span>{dueIn > 0 ? `${dueIn}m` : "now"}</span>
        <button className="icon-button subtle" type="button" onClick={onFocus} aria-label={`Focus ${block.title}`} title={`Focus ${block.title}`}>
          <Zap size={18} />
        </button>
        <button className="icon-button subtle" type="button" onClick={onToggle} aria-label={block.completed ? "Mark active" : "Mark done"} title={block.completed ? "Mark active" : "Mark done"}>
          <Check size={18} />
        </button>
        <button className="icon-button subtle" type="button" onClick={onDelete} aria-label={`Delete ${block.title}`} title={`Delete ${block.title}`}>
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}

function TargetCard({
  target,
  sessionActive,
  onAttempt,
  onToggle,
  onDelete
}: {
  target: ShieldTarget;
  sessionActive: boolean;
  onAttempt: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const nativeReady = target.kind === "app" && Boolean(target.packageName);

  return (
    <div className={`target-card ${nativeReady ? "native-ready" : ""}`}>
      <button className="target-icon" type="button" onClick={onAttempt} aria-label={`Open ${target.label}`} title={`Open ${target.label}`}>
        {target.kind === "site" ? <Globe2 size={18} /> : <AppWindow size={18} />}
      </button>
      <div className="target-meta">
        <strong>{target.label}</strong>
        <span>{nativeReady ? `${target.packageName}${target.supportsPiP ? " · PiP" : ""}` : target.category}</span>
      </div>
      <button
        className={`pill-toggle ${target.locked ? "locked" : ""}`}
        type="button"
        onClick={onToggle}
      >
        {target.locked ? (sessionActive ? "Blocking" : "Locked") : "Open"}
      </button>
      <button
        className="icon-button subtle"
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${target.label}`}
        title={`Remove ${target.label}`}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

function FocusLogPanel({ logs }: { logs: FocusLog[] }) {
  return (
    <section className="log-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Session log</p>
          <h3>Activity</h3>
        </div>
      </div>
      <div className="log-list">
        {(logs.length ? logs : [
          {
            id: "empty",
            title: "No sessions yet",
            detail: "Start Focus Mode to build your log.",
            tone: "gold" as const,
            createdAt: Date.now()
          }
        ]).map((log) => (
          <article className={`log-item ${log.tone}`} key={log.id}>
            <span />
            <div>
              <strong>{log.title}</strong>
              <small>{log.detail}</small>
            </div>
            <time>{formatTime(log.createdAt)}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <Icon size={22} />
      <span>{value}</span>
      <small>{label}</small>
    </article>
  );
}

export default App;
