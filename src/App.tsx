import {
  AlarmClock,
  AppWindow,
  Ban,
  BarChart3,
  BellRing,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Clock3,
  Flame,
  Focus,
  Gauge,
  Globe2,
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
  Zap,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

type BlockType = "focus" | "routine" | "health" | "break" | "shield";
type TabId = "today" | "focus" | "shield" | "ai" | "insights" | "settings";
type FocusMode = "deep" | "study" | "routine" | "sleep";
type ThemeMode = "sunrise" | "midnight" | "forest" | "clean";

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

type InstalledApp = {
  label: string;
  packageName: string;
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

type NativeFocusStatus = {
  accessibilityEnabled: boolean;
  focusEnabled: boolean;
  blockedCount: number;
  redirectCount: number;
  lastBlockedLabel: string;
  lastBlockedAt: number;
};

type FocusBlockerPlugin = {
  setConfig(options: {
    enabled: boolean;
    strict: boolean;
    endAt: number;
    targets: NativeFocusTarget[];
  }): Promise<{ enabled: boolean; count: number }>;
  openAccessibilitySettings(): Promise<void>;
  getStatus(): Promise<NativeFocusStatus>;
  listInstalledApps(): Promise<{ apps: InstalledApp[] }>;
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
  profile: "remind-blocks.profile"
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
  { id: "clean", label: "Clean", detail: "Quiet neutral", colors: ["#f8f8f5", "#5a7c89", "#e0a458"] }
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
}> = [
  { label: "Instagram", packageName: "com.instagram.android", category: "Social" },
  { label: "YouTube", packageName: "com.google.android.youtube", category: "Video" },
  { label: "TikTok", packageName: "com.zhiliaoapp.musically", category: "Social" },
  { label: "Snapchat", packageName: "com.snapchat.android", category: "Social" },
  { label: "Facebook", packageName: "com.facebook.katana", category: "Social" },
  { label: "X", packageName: "com.twitter.android", category: "Social" },
  { label: "Reddit", packageName: "com.reddit.frontpage", category: "Social" },
  { label: "Netflix", packageName: "com.netflix.mediaclient", category: "Video" },
  { label: "Chrome", packageName: "com.android.chrome", category: "Browser" },
  { label: "Roblox", packageName: "com.roblox.client", category: "Games" }
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

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
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
    focusEnabled: false,
    blockedCount: 0,
    redirectCount: 0,
    lastBlockedLabel: "",
    lastBlockedAt: 0
  });
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [installedSearch, setInstalledSearch] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quickText, setQuickText] = useState("");
  const [manualType, setManualType] = useState<BlockType>("focus");
  const [manualTime, setManualTime] = useState(getInitialTime());
  const [targetText, setTargetText] = useState("");
  const [targetPackageText, setTargetPackageText] = useState("");
  const [targetKind, setTargetKind] = useState<"app" | "site">("app");
  const [focusBlockId, setFocusBlockId] = useState("");
  const [aiInput, setAiInput] = useState("");
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
  const blockerActive = shieldEnabled || sessionActive;
  const filteredInstalledApps = installedApps
    .filter((app) => {
      const query = installedSearch.trim().toLowerCase();
      return !query || app.label.toLowerCase().includes(query) || app.packageName.includes(query);
    })
    .slice(0, 24);
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
  }, [blockerActive, sessionActive, focusSession, targets, strictMode]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !blockerActive) return;
    const interval = window.setInterval(() => void refreshNativeStatus(), 3000);
    return () => window.clearInterval(interval);
  }, [blockerActive]);

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
        focusEnabled: false,
        blockedCount: 0,
        redirectCount: 0,
        lastBlockedLabel: "",
        lastBlockedAt: 0
      });
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
          : []
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
      setInstalledApps(response.apps);
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
          category: "Installed",
          packageName: app.packageName,
          locked: true
        },
        ...current
      ];
    });
  };

  const handleAiSubmit = () => {
    const text = aiInput.trim();
    if (!text) return;

    const block = addAiBlock(text);
    const gap = minutesUntil(block.dueAt);
    const response =
      block.type === "shield"
        ? `Locked a shield block for ${formatTime(block.dueAt)}. Pair it with ${Math.max(15, block.minutes)} minutes of Focus Mode.`
        : `Added "${block.title}" at ${formatTime(block.dueAt)}. It starts in ${Math.max(gap, 0)} minutes.`;

    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", text },
      { id: createId(), role: "assistant", text: response }
    ]);
    setAiInput("");
  };

  const generateDailyPlan = () => {
    const plan: AiMessage = {
      id: createId(),
      role: "assistant",
      text: `Plan: start with "${nextBlock?.title ?? "a 25 minute focus block"}", keep ${lockedTargets} distractions locked, then run ${focusProfiles[focusMode].label}. Today's focus score is ${focusScore}.`
    };
    setMessages((current) => [...current, plan]);
    setActiveTab("ai");
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
            <h1>Blocks</h1>
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

              <FocusLogPanel logs={focusLogs} />
            </>
          )}

          {activeTab === "shield" && (
            <>
              <section className="shield-panel">
                <div>
                  <p className="eyebrow">Native redirect shield</p>
                  <h2>{shieldEnabled ? "Shield is on" : `${lockedTargets} locked apps`}</h2>
                </div>
                <div className="shield-actions">
                  <span className={`status-pill ${nativeStatus.accessibilityEnabled ? "ready" : ""}`}>
                    <Smartphone size={15} />
                    {nativeStatus.accessibilityEnabled ? "Native ready" : "Native setup"}
                  </span>
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

              <section className="target-entry">
                <select value={targetKind} onChange={(event) => setTargetKind(event.target.value as "app" | "site")}>
                  <option value="app">App</option>
                  <option value="site">Site</option>
                </select>
                <input
                  value={targetText}
                  onChange={(event) => setTargetText(event.target.value)}
                  placeholder={targetKind === "app" ? "App name" : "youtube.com"}
                />
                {targetKind === "app" && (
                  <input
                    value={targetPackageText}
                    onChange={(event) => setTargetPackageText(event.target.value)}
                    placeholder="com.example.app"
                  />
                )}
                <button className="icon-button dark" type="button" onClick={() => addTarget()} aria-label="Add target" title="Add target">
                  <Plus size={20} />
                </button>
              </section>

              <section className="preset-strip">
                {popularAppTargets.slice(0, 8).map((preset) => (
                  <button
                    key={preset.packageName}
                    className="app-chip"
                    type="button"
                    onClick={() => addTarget(preset)}
                  >
                    <AppWindow size={15} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </section>

              <section className="native-panel">
                <div>
                  <p className="eyebrow">Android service</p>
                  <h3>{nativeStatus.focusEnabled ? `Redirecting ${nativeStatus.blockedCount}` : "Ready to redirect"}</h3>
                  <p className="native-subline">
                    {nativeStatus.lastBlockedLabel
                      ? `Last blocked: ${nativeStatus.lastBlockedLabel}`
                      : "Turn Shield on, enable Accessibility, then open a locked app."}
                  </p>
                </div>
                <div className="native-actions">
                  <button className="icon-button" type="button" onClick={refreshNativeStatus} aria-label="Refresh native status" title="Refresh native status">
                    <RefreshCw size={18} />
                  </button>
                  <button className="action-button" type="button" onClick={openAccessibilitySettings}>
                    <Settings size={18} />
                    <span>Accessibility</span>
                  </button>
                </div>
              </section>

              <section className="installed-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Custom apps</p>
                    <h3>Installed picker</h3>
                  </div>
                  <button className="action-button" type="button" onClick={loadInstalledApps}>
                    <Smartphone size={18} />
                    <span>Load</span>
                  </button>
                </div>
                <label className="search-row">
                  <Search size={18} />
                  <input
                    value={installedSearch}
                    onChange={(event) => setInstalledSearch(event.target.value)}
                    placeholder="Search installed apps or package names"
                  />
                </label>
                <div className="installed-grid">
                  {(filteredInstalledApps.length ? filteredInstalledApps : popularAppTargets.slice(0, 6)).map((app) => {
                    const packageName = "packageName" in app ? app.packageName : "";
                    return (
                      <button
                        key={packageName}
                        className="installed-app"
                        type="button"
                        onClick={() =>
                          addInstalledAppTarget({
                            label: app.label,
                            packageName
                          })
                        }
                      >
                        <AppWindow size={18} />
                        <strong>{app.label}</strong>
                        <span>{packageName}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="target-list">
                {targets.map((target) => (
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
              </section>
            </>
          )}

          {activeTab === "ai" && (
            <section className="ai-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">AI Planner</p>
                  <h3>Coach</h3>
                </div>
                <BrainCircuit size={24} />
              </div>
              <div className="chat-stream">
                {messages.map((message) => (
                  <div className={`chat-bubble ${message.role}`} key={message.id}>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  value={aiInput}
                  onChange={(event) => setAiInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleAiSubmit();
                  }}
                  placeholder="Block Instagram and remind me to revise biology at 7pm"
                />
                <button className="icon-button dark" type="button" onClick={handleAiSubmit} aria-label="Send to AI" title="Send to AI">
                  <ChevronRight size={21} />
                </button>
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
              </section>
              <section className="insight-panel">
                <p className="eyebrow">Pattern</p>
                <h2>{blockerActive ? "Locked apps now return to ReMind." : "Shield mode is ready when focus gets noisy."}</h2>
                <div className="insight-bars">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div className="bar-wrap" key={day}>
                      <span style={{ height: `${34 + ((focusScore + index * 11) % 56)}%` }} />
                      <small>{day}</small>
                    </div>
                  ))}
                </div>
              </section>
              <FocusLogPanel logs={focusLogs} />
            </>
          )}

          {activeTab === "settings" && (
            <>
              <section className="settings-hero">
                <div>
                  <p className="eyebrow">Profile</p>
                  <h2>{profile.name || "Focus user"}</h2>
                  <span>{profile.role || "Focused builder"}</span>
                </div>
                <div className="settings-avatar">{profile.avatar || profile.name.slice(0, 1) || "R"}</div>
              </section>

              <section className="settings-grid">
                <div className="settings-field">
                  <label>Name</label>
                  <input
                    value={profile.name}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>
                <div className="settings-field">
                  <label>Role</label>
                  <input
                    value={profile.role}
                    onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value }))}
                  />
                </div>
                <div className="settings-field">
                  <label>Avatar</label>
                  <input
                    maxLength={2}
                    value={profile.avatar}
                    onChange={(event) => setProfile((current) => ({ ...current, avatar: event.target.value.slice(0, 2).toUpperCase() }))}
                  />
                </div>
              </section>

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
            </>
          )}
        </div>
      </section>
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
        <span>{nativeReady ? target.packageName : target.category}</span>
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
