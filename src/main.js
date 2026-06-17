import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const PUBLIC_PATH_CODE = "PUBLIC-JOURNEY-PATH";
const colors = ["#3b82f6", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef476f", "#22c55e", "#06b6d4"];
const pages = ["path", "create", "quiz", "public", "profile"];
const storageKeys = {
  client: "nqJourneyClientId",
  state: "nqJourneyState",
  profile: "nqJourneyProfile",
  sound: "nqJourneySound"
};

const presets = [
  {
    id: "exam-raid",
    title: "Exam Raid",
    goal: "Reach the final review gate with notes, practice, and recall finished.",
    theme: "Study",
    days: 7,
    tasks: [
      "Collect syllabus and mark weak zones",
      "Make a 20-minute revision map",
      "Solve 10 easy questions",
      "Solve 8 medium questions",
      "Make mistake flashcards",
      "Do one timed mini test",
      "Review errors without rewriting everything",
      "Finish final recall sprint"
    ],
    quizzes: [
      quiz("When stuck, what is the smallest useful move?", ["Open a new tab", "Name the next action", "Wait for motivation"], 1),
      quiz("Best check after practice?", ["Count effort only", "Find one repeat mistake", "Start a new chapter"], 1)
    ]
  },
  {
    id: "project-launch",
    title: "Project Launch",
    goal: "Ship a small visible version instead of polishing forever.",
    theme: "Build",
    days: 10,
    tasks: [
      "Write the one-sentence outcome",
      "Sketch the first screen",
      "Build the smallest working flow",
      "Add saved progress",
      "Test on phone size",
      "Fix the most obvious friction",
      "Write a short launch note",
      "Share the link with one person"
    ],
    quizzes: [
      quiz("A launchable version should be:", ["Huge and complete", "Small and usable", "Hidden until perfect"], 1),
      quiz("If scope grows, you should:", ["Add everything", "Pick the next useful slice", "Restart"], 1)
    ]
  },
  {
    id: "daily-stabilizer",
    title: "Daily Stabilizer",
    goal: "Turn a messy day into a playable sequence of small wins.",
    theme: "Life",
    days: 1,
    tasks: [
      "Drink water and clear one surface",
      "Park distracting thoughts",
      "Pick the top three tasks",
      "Do the two-minute starter",
      "Finish one focus block",
      "Send one pending message",
      "Reset the room for tomorrow"
    ],
    quizzes: [
      quiz("A parked distraction is:", ["A task for right now", "A thought saved for later", "A failure"], 1),
      quiz("A good ADHD-friendly start is:", ["Tiny and visible", "Perfectly planned", "Delayed"], 0)
    ]
  }
];

const app = document.querySelector("#app");
app.innerHTML = `
<div class="shell">
  <header class="topbar">
    <div class="brand">
      <div class="logo">NQ</div>
      <div>
        <h1>NeuroQuest Journey</h1>
        <div class="sub">Public path for Android APK and PC web play</div>
      </div>
    </div>
    <div class="statusPills">
      <span class="pill" id="connectionPill">SOLO</span>
      <span class="pill" id="pathPill">PUBLIC PATH</span>
      <span class="pill" id="apkPill">APK READY</span>
      <button class="pill soundButton" id="soundToggle">SOUND OFF</button>
    </div>
  </header>

  <nav class="tabs" aria-label="Journey pages">
    <button data-page-link="path">Path</button>
    <button data-page-link="create">Create</button>
    <button data-page-link="quiz">Quiz</button>
    <button data-page-link="public">Public</button>
    <button data-page-link="profile">Profile</button>
  </nav>

  <div class="notice" id="message">Ready.</div>

  <main>
    <section class="page" data-page="path">
      <div class="pathLayout">
        <section class="panel mapPanel">
          <div class="panelHead">
            <div>
              <label>Shared Journey</label>
              <h2 id="journeyTitle">Journey Path</h2>
              <p id="journeyGoal" class="muted"></p>
            </div>
            <div class="progressRing" id="progressRing"><b id="progressText">0%</b></div>
          </div>

          <div class="deviceStrip">
            <span>Android APK install target</span>
            <span>PC browser synced by public room</span>
            <span>Subtasks and quizzes move the map</span>
          </div>

          <div class="mapViewport">
            <div class="mapCanvas" id="mapCanvas">
              <svg id="mapLines" viewBox="0 0 1200 560" preserveAspectRatio="none"></svg>
              <div id="timeCursor" class="timeCursor"><span></span></div>
              <div id="mapNodes"></div>
            </div>
          </div>
        </section>

        <aside class="panel actionPanel">
          <div class="panelHead compact">
            <div>
              <label>Current Gate</label>
              <h2 id="activeNodeTitle">Start</h2>
            </div>
            <span class="typeBadge" id="activeNodeType">TASK</span>
          </div>

          <p class="activeDetail" id="activeNodeDetail"></p>

          <div class="timeBox">
            <div>
              <label>Journey Time</label>
              <b id="timeStatus">Day 1</b>
            </div>
            <div class="bar"><span id="timeFill"></span></div>
          </div>

          <div class="focusTimer">
            <div id="timer">15:00</div>
            <div class="bar"><span id="timerFill"></span></div>
          </div>

          <div class="actionGrid">
            <button class="primary" id="startFocus">Start Focus</button>
            <button class="secondary" id="pauseFocus">Pause</button>
            <button class="success" id="completeNode">Check Off Gate</button>
            <button class="danger" id="resetProgress">Reset Mine</button>
          </div>

          <div class="scoreGrid">
            <div><span>XP</span><b id="xpView">0</b></div>
            <div><span>Coins</span><b id="coinView">0</b></div>
            <div><span>Streak</span><b id="streakView">0</b></div>
            <div><span>Focus</span><b id="focusView">0m</b></div>
          </div>
        </aside>
      </div>

      <section class="panel listPanel">
        <div class="panelHead compact">
          <div>
            <label>Subtask Gates</label>
            <h2>Checklist path</h2>
          </div>
          <button class="secondary small" id="jumpToQuiz">Open Quiz Gate</button>
        </div>
        <div id="taskList" class="taskList"></div>
      </section>
    </section>

    <section class="page" data-page="create">
      <div class="createLayout">
        <section class="panel">
          <div class="panelHead compact">
            <div>
              <label>Presets</label>
              <h2>Start a journey fast</h2>
            </div>
          </div>
          <div class="presetGrid" id="presetGrid"></div>
        </section>

        <section class="panel builderPanel">
          <div class="panelHead compact">
            <div>
              <label>Custom Journey</label>
              <h2>Create your own path</h2>
            </div>
          </div>

          <label>Journey Name</label>
          <input id="customTitle" placeholder="Example: Physics Chapter 3 Raid" />

          <label>Goal End</label>
          <textarea id="customGoal" placeholder="What counts as finishing this journey?"></textarea>

          <div class="two">
            <div>
              <label>Path Style</label>
              <select id="customTheme">
                <option>Study</option>
                <option>Build</option>
                <option>Life</option>
                <option>Fitness</option>
                <option>Creative</option>
              </select>
            </div>
            <div>
              <label>Duration</label>
              <select id="customDays">
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7" selected>7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>

          <label>Subtasks</label>
          <textarea id="customTasks" class="tall" placeholder="One subtask per line&#10;Example: Watch lecture 1&#10;Solve 10 questions&#10;Review mistakes"></textarea>

          <label>Quiz Gate</label>
          <input id="quizQuestion" placeholder="Question" />
          <div class="three">
            <input id="quizA" placeholder="Answer A" />
            <input id="quizB" placeholder="Answer B" />
            <input id="quizC" placeholder="Answer C" />
          </div>
          <select id="quizCorrect">
            <option value="0">Correct: A</option>
            <option value="1">Correct: B</option>
            <option value="2">Correct: C</option>
          </select>

          <div class="actionGrid">
            <button class="primary" id="createJourney">Publish Public Path</button>
            <button class="secondary" id="previewCustom">Preview Path</button>
          </div>
        </section>
      </div>
    </section>

    <section class="page" data-page="quiz">
      <div class="quizLayout">
        <section class="panel quizPanel">
          <div class="panelHead compact">
            <div>
              <label>Quiz Gate</label>
              <h2 id="quizTitle">No quiz selected</h2>
            </div>
            <span class="typeBadge">QUIZ</span>
          </div>
          <p id="quizQuestionText" class="quizQuestion"></p>
          <div id="answerList" class="answerList"></div>
        </section>

        <aside class="panel">
          <label>Quiz Queue</label>
          <div id="quizQueue" class="taskList"></div>
        </aside>
      </div>
    </section>

    <section class="page" data-page="public">
      <div class="publicLayout">
        <section class="panel">
          <div class="panelHead compact">
            <div>
              <label>Public Room</label>
              <h2>Anyone can enter this path</h2>
            </div>
            <button class="primary" id="joinPublic">Enter Public Path</button>
          </div>
          <div class="roomCode">${PUBLIC_PATH_CODE}</div>
          <p class="muted">With Supabase configured, Android APK users and PC web users share the same public journey and live presence.</p>
          <div id="players" class="players"></div>
        </section>

        <section class="panel">
          <label>Activity</label>
          <div id="activityFeed" class="activityFeed"></div>
        </section>
      </div>
    </section>

    <section class="page" data-page="profile">
      <div class="profileLayout">
        <section class="panel builderPanel">
          <label>Profile</label>
          <div class="avatarPreview">
            <div id="avatarPreview">NQ</div>
            <div>
              <h2 id="profileNameView">Player</h2>
              <p id="profileTargetView" class="muted">Local player</p>
            </div>
          </div>
          <div class="two">
            <input id="playerName" placeholder="Name" />
            <input id="avatar" placeholder="Avatar initials" maxlength="2" />
          </div>
          <input id="target" placeholder="Target / goal" />
          <textarea id="bio" placeholder="Short note to other players"></textarea>
          <button class="success" id="saveProfile">Save Profile</button>
        </section>

        <section class="panel">
          <label>Install Shape</label>
          <div class="installGrid">
            <div><b>Android</b><span>APK wrapper / sideload target</span></div>
            <div><b>PC</b><span>Vercel web app</span></div>
            <div><b>Sync</b><span>Supabase public room</span></div>
          </div>
        </section>
      </div>
    </section>
  </main>
</div>

<div class="modal" id="modal">
  <div class="modalBox">
    <h2 id="modalTitle">Journey Clear</h2>
    <p id="modalText">The final gate opened.</p>
    <button id="closeModal">Continue</button>
  </div>
</div>
<div class="confetti" id="confetti"></div>
`;

const $ = id => document.getElementById(id);
const clientId = getClientId();
let profile = loadProfile();
let state = loadState() || freshState();
let roomCode = "";
let channel = null;
let syncingRemote = false;
let pushTimer = null;
let running = false;
let timerInterval = null;
let total = 15 * 60;
let left = total;
let soundEnabled = localStorage.getItem(storageKeys.sound) === "on";
let audioCtx = null;
let lastOnlineCount = 1;

ensureJourney();
ensurePlayer();

function quiz(question, options, answer){
  return { question, options, answer };
}

function getClientId(){
  let id = localStorage.getItem(storageKeys.client);
  if(!id){
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
    localStorage.setItem(storageKeys.client, id);
  }
  return id;
}

function loadProfile(){
  try{
    return JSON.parse(localStorage.getItem(storageKeys.profile)) || defaultProfile();
  }catch(e){
    return defaultProfile();
  }
}

function defaultProfile(){
  return {
    display_name: localStorage.getItem("nqPlayerName") || "Player",
    avatar: "NQ",
    target: "",
    bio: "",
    color: colors[Math.floor(Math.random()*colors.length)]
  };
}

function loadState(){
  try{
    return JSON.parse(localStorage.getItem(storageKeys.state));
  }catch(e){
    return null;
  }
}

function freshState(){
  return {
    journey: createJourneyFromPreset(presets[0]),
    players: {},
    activity: [],
    updatedAt: Date.now()
  };
}

function saveLocal(){
  localStorage.setItem(storageKeys.state, JSON.stringify(state));
  localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
  localStorage.setItem("nqPlayerName", profile.display_name);
}

function ensureJourney(){
  if(!state.journey) state.journey = createJourneyFromPreset(presets[0]);
  if(!state.activity) state.activity = [];
}

function defaultPlayer(){
  return {
    id: clientId,
    name: profile.display_name || "Player",
    avatar: profile.avatar || "NQ",
    target: profile.target || "",
    bio: profile.bio || "",
    color: profile.color || colors[0],
    completed: [],
    nodeIndex: 1,
    quizAnswers: {},
    xp: 0,
    coins: 0,
    streak: 0,
    focus: 0,
    online: true,
    active: false
  };
}

function ensurePlayer(){
  if(!state.players) state.players = {};
  if(!state.players[clientId]) state.players[clientId] = defaultPlayer();
  normalizePlayer(state.players[clientId]);
  syncProfileIntoPlayer();
}

function normalizePlayer(player){
  player.completed = player.completed || [];
  player.quizAnswers = player.quizAnswers || {};
  player.nodeIndex = Math.max(1, player.nodeIndex || 1);
  player.xp = player.xp || 0;
  player.coins = player.coins || 0;
  player.streak = player.streak || 0;
  player.focus = player.focus || 0;
  player.online = player.online !== false;
  player.active = Boolean(player.active);
}

function me(){
  ensurePlayer();
  return state.players[clientId];
}

function syncProfileIntoPlayer(){
  const player = state.players?.[clientId];
  if(!player) return;
  player.name = profile.display_name || "Player";
  player.avatar = profile.avatar || initials(profile.display_name);
  player.target = profile.target || "";
  player.bio = profile.bio || "";
  player.color = profile.color || player.color || colors[0];
}

function createJourneyFromPreset(preset){
  return createJourney({
    title: preset.title,
    goal: preset.goal,
    theme: preset.theme,
    days: preset.days,
    tasks: preset.tasks,
    quizzes: preset.quizzes
  });
}

function createJourney({title, goal, theme, days, tasks, quizzes}){
  const cleanTasks = tasks.map(x => x.trim()).filter(Boolean);
  const cleanQuizzes = quizzes.filter(q => q.question && q.options?.filter(Boolean).length >= 2);
  const rawNodes = [
    { id:"start", type:"start", title:"Open Gate", detail:"Everyone begins here.", points:0, minutes:2 }
  ];

  cleanTasks.forEach((task, index) => {
    rawNodes.push({
      id:`task-${Date.now()}-${index}`,
      type:"task",
      title: task,
      detail: `Subtask ${index + 1} on the path to ${title}.`,
      points: 25 + (index % 3) * 10,
      minutes: index % 3 === 0 ? 10 : 15
    });
    if((index + 1) % 3 === 0 && cleanQuizzes.length){
      const q = cleanQuizzes[index % cleanQuizzes.length];
      rawNodes.push({
        id:`quiz-${Date.now()}-${index}`,
        type:"quiz",
        title:"Quiz Gate",
        detail:q.question,
        quiz:q,
        points:35,
        minutes:5
      });
    }
  });

  if(cleanTasks.length < 3 && cleanQuizzes.length){
    const q = cleanQuizzes[0];
    rawNodes.push({
      id:`quiz-${Date.now()}-short`,
      type:"quiz",
      title:"Quiz Gate",
      detail:q.question,
      quiz:q,
      points:35,
      minutes:5
    });
  }

  rawNodes.push({
    id:"finish",
    type:"finish",
    title:"Goal End",
    detail: goal,
    points:80,
    minutes:10
  });

  const wobble = [48, 24, 68, 34, 78, 42, 18, 62, 30, 72, 46, 20, 58, 36];
  const nodes = rawNodes.map((node, index) => {
    const x = rawNodes.length === 1 ? 50 : 7 + (index / (rawNodes.length - 1)) * 86;
    const y = wobble[index % wobble.length] + (theme === "Creative" ? (index % 2 ? 8 : -4) : 0);
    return {...node, x, y: Math.max(12, Math.min(86, y))};
  });

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: title || "Custom Journey",
    goal: goal || "Reach the final gate.",
    theme: theme || "Study",
    days: Number(days || 7),
    createdAt: Date.now(),
    nodes
  };
}

function completedSet(player = me()){
  return new Set(["start", ...(player.completed || [])]);
}

function isDone(node, player = me()){
  return completedSet(player).has(node.id);
}

function firstOpenIndex(player = me()){
  const nodes = state.journey.nodes;
  for(let i=1; i<nodes.length; i++){
    if(!isDone(nodes[i], player)) return i;
  }
  return Math.max(1, nodes.length - 1);
}

function activeNode(){
  const player = me();
  const index = Math.min(player.nodeIndex || firstOpenIndex(player), state.journey.nodes.length - 1);
  const node = state.journey.nodes[index] || state.journey.nodes[1] || state.journey.nodes[0];
  if(isDone(node, player) && node.type !== "finish") return state.journey.nodes[firstOpenIndex(player)];
  return node;
}

function journeyProgress(player = me()){
  const playable = state.journey.nodes.filter(n => n.type !== "start");
  if(!playable.length) return 0;
  const done = playable.filter(n => isDone(n, player)).length;
  return Math.round(done / playable.length * 100);
}

function timeProgress(){
  const elapsed = Date.now() - (state.journey.createdAt || Date.now());
  const duration = Math.max(1, state.journey.days || 1) * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.min(100, elapsed / duration * 100));
}

function render(){
  ensureJourney();
  ensurePlayer();
  renderPills();
  renderProfile();
  renderPresets();
  renderPath();
  renderActionPanel();
  renderTaskList();
  renderQuiz();
  renderPublic();
  saveLocal();
}

function renderPills(){
  $("connectionPill").textContent = roomCode ? "ONLINE PUBLIC" : "LOCAL";
  $("pathPill").textContent = state.journey.theme.toUpperCase();
  $("soundToggle").textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
  $("soundToggle").classList.toggle("active", soundEnabled);
}

function renderProfile(){
  $("playerName").value = profile.display_name || "";
  $("avatar").value = profile.avatar || "";
  $("target").value = profile.target || "";
  $("bio").value = profile.bio || "";
  $("avatarPreview").textContent = profile.avatar || initials(profile.display_name);
  $("profileNameView").textContent = profile.display_name || "Player";
  $("profileTargetView").textContent = profile.target || "Local player";
}

function renderPresets(){
  $("presetGrid").innerHTML = presets.map(preset => `
    <button class="presetCard" data-preset="${preset.id}">
      <span>${escapeHTML(preset.theme)}</span>
      <b>${escapeHTML(preset.title)}</b>
      <small>${preset.tasks.length} subtasks · ${preset.days} days · ${preset.quizzes.length} quizzes</small>
    </button>
  `).join("");
  document.querySelectorAll("[data-preset]").forEach(button => {
    button.onclick = () => startPreset(button.dataset.preset);
  });
}

function renderPath(){
  const journey = state.journey;
  const player = me();
  const progress = journeyProgress(player);
  $("journeyTitle").textContent = journey.title;
  $("journeyGoal").textContent = journey.goal;
  $("progressText").textContent = `${progress}%`;
  $("progressRing").style.setProperty("--progress", `${progress}%`);

  const lines = $("mapLines");
  lines.innerHTML = "";
  for(let i=0; i<journey.nodes.length - 1; i++){
    const a = point(journey.nodes[i]);
    const b = point(journey.nodes[i + 1]);
    const curve = i % 2 ? -55 : 55;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${a.x} ${a.y} C ${a.x + 90} ${a.y + curve}, ${b.x - 90} ${b.y - curve}, ${b.x} ${b.y}`);
    path.setAttribute("class", "mapLine");
    lines.appendChild(path);
  }

  const active = activeNode();
  $("mapNodes").innerHTML = journey.nodes.map((node, index) => {
    const done = isDone(node, player);
    const locked = index > firstOpenIndex(player);
    const activeClass = node.id === active.id ? " active" : "";
    return `
      <button class="mapNode ${node.type}${done ? " done" : ""}${locked ? " locked" : ""}${activeClass}"
        style="left:${node.x}%;top:${node.y}%"
        data-node="${node.id}">
        <span>${nodeIcon(node)}</span>
        <b>${escapeHTML(shortTitle(node.title))}</b>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-node]").forEach(button => {
    button.onclick = () => selectNode(button.dataset.node);
  });

  $("timeCursor").style.left = `${timeProgress()}%`;
  $("timeCursor").querySelector("span").textContent = "now";
}

function point(node){
  return { x: node.x / 100 * 1200, y: node.y / 100 * 560 };
}

function nodeIcon(node){
  if(node.type === "start") return "S";
  if(node.type === "quiz") return "?";
  if(node.type === "finish") return "F";
  return String(Math.max(1, state.journey.nodes.indexOf(node))).padStart(2, "0");
}

function shortTitle(title){
  return title.length > 26 ? title.slice(0, 24) + ".." : title;
}

function renderActionPanel(){
  const node = activeNode();
  const player = me();
  $("activeNodeTitle").textContent = node.title;
  $("activeNodeType").textContent = node.type.toUpperCase();
  $("activeNodeDetail").textContent = node.detail || "";
  $("xpView").textContent = player.xp || 0;
  $("coinView").textContent = player.coins || 0;
  $("streakView").textContent = player.streak || 0;
  $("focusView").textContent = `${player.focus || 0}m`;

  total = Math.max(2, node.minutes || 15) * 60;
  if(!running && left > total) left = total;
  renderTimer();

  const pct = timeProgress();
  $("timeFill").style.width = `${pct}%`;
  const day = Math.min(state.journey.days, Math.max(1, Math.ceil(pct / 100 * state.journey.days)));
  $("timeStatus").textContent = `Day ${day} of ${state.journey.days}`;
}

function renderTimer(){
  const safeTotal = Math.max(1, total);
  $("timer").textContent = fmt(left);
  $("timerFill").style.width = `${100 - (left / safeTotal * 100)}%`;
}

function renderTaskList(){
  const player = me();
  $("taskList").innerHTML = state.journey.nodes
    .filter(node => node.type !== "start")
    .map(node => `
      <button class="taskRow ${isDone(node, player) ? "done" : ""}" data-task-node="${node.id}">
        <span>${nodeIcon(node)}</span>
        <div>
          <b>${escapeHTML(node.title)}</b>
          <small>${node.type} · ${node.points || 0} XP · ${node.minutes || 5} min</small>
        </div>
      </button>
    `).join("");

  document.querySelectorAll("[data-task-node]").forEach(button => {
    button.onclick = () => selectNode(button.dataset.taskNode);
  });
}

function renderQuiz(){
  const quizNodes = state.journey.nodes.filter(node => node.type === "quiz");
  const node = activeNode().type === "quiz" ? activeNode() : quizNodes.find(q => !isDone(q)) || quizNodes[0];
  if(!node){
    $("quizTitle").textContent = "No quiz gates";
    $("quizQuestionText").textContent = "Create a custom journey with a quiz gate or choose a preset.";
    $("answerList").innerHTML = "";
  }else{
    $("quizTitle").textContent = node.title;
    $("quizQuestionText").textContent = node.quiz.question;
    $("answerList").innerHTML = node.quiz.options.map((option, index) => `
      <button data-answer="${index}" data-quiz-node="${node.id}">${escapeHTML(option)}</button>
    `).join("");
    document.querySelectorAll("[data-answer]").forEach(button => {
      button.onclick = () => answerQuiz(button.dataset.quizNode, Number(button.dataset.answer));
    });
  }

  $("quizQueue").innerHTML = quizNodes.length ? quizNodes.map(q => `
    <button class="taskRow ${isDone(q) ? "done" : ""}" data-quiz-jump="${q.id}">
      <span>?</span>
      <div><b>${escapeHTML(q.quiz.question)}</b><small>${isDone(q) ? "cleared" : "waiting"}</small></div>
    </button>
  `).join("") : `<div class="empty">No quiz gates on this path.</div>`;

  document.querySelectorAll("[data-quiz-jump]").forEach(button => {
    button.onclick = () => {
      selectNode(button.dataset.quizJump);
      setPage("quiz");
    };
  });
}

function renderPublic(){
  const players = Object.values(state.players || {}).sort((a,b)=>(b.xp || 0) - (a.xp || 0));
  $("players").innerHTML = players.map(player => `
    <div class="playerCard">
      <div class="avatar" style="background:${player.color}">${escapeHTML(player.avatar || initials(player.name))}</div>
      <div>
        <b>${escapeHTML(player.name || "Player")}${player.id === clientId ? " (you)" : ""}</b>
        <span>${journeyProgress(player)}% · ${player.xp || 0} XP · ${player.online ? "online" : "away"}</span>
      </div>
    </div>
  `).join("");

  $("activityFeed").innerHTML = state.activity.length ? state.activity.slice(0, 18).map(item => `
    <div class="activityItem">
      <b>${escapeHTML(item.name)}</b>
      <span>${escapeHTML(item.text)}</span>
    </div>
  `).join("") : `<div class="empty">No public activity yet.</div>`;
}

function startPreset(id){
  const preset = presets.find(item => item.id === id);
  if(!preset) return;
  state.journey = createJourneyFromPreset(preset);
  resetMine(false);
  addActivity(`published ${preset.title}`);
  setPage("path");
  message(`${preset.title} is now the public path.`);
  playSound("start");
  render();
  pushState();
}

function createCustomJourney(){
  const title = $("customTitle").value.trim() || "Custom Journey";
  const goal = $("customGoal").value.trim() || "Reach the final gate.";
  const tasks = $("customTasks").value.split("\n").map(x => x.trim()).filter(Boolean);
  const quizQuestion = $("quizQuestion").value.trim();
  const options = [$("quizA").value.trim(), $("quizB").value.trim(), $("quizC").value.trim()].filter(Boolean);
  const quizzes = quizQuestion && options.length >= 2 ? [quiz(quizQuestion, options, Number($("quizCorrect").value))] : [
    quiz("What keeps this path moving?", ["A tiny next action", "Waiting for a perfect mood", "Skipping the checklist"], 0)
  ];

  if(tasks.length < 2){
    message("Add at least two subtasks.");
    return;
  }

  state.journey = createJourney({
    title,
    goal,
    theme: $("customTheme").value,
    days: Number($("customDays").value),
    tasks,
    quizzes
  });
  resetMine(false);
  addActivity(`published ${title}`);
  setPage("path");
  message("Custom public path published.");
  playSound("complete");
  render();
  pushState();
}

function previewCustom(){
  const tasks = $("customTasks").value.split("\n").map(x => x.trim()).filter(Boolean);
  message(tasks.length ? `${tasks.length} subtasks ready for the map.` : "Add subtasks to preview a path.");
}

function selectNode(id){
  const index = state.journey.nodes.findIndex(node => node.id === id);
  if(index < 0) return;
  const player = me();
  const firstOpen = firstOpenIndex(player);
  player.nodeIndex = Math.min(index, firstOpen);
  if(index > firstOpen) message("That gate is still locked by the previous one.");
  else message("Gate selected.");
  playSound("tap");
  render();
  pushState();
}

function completeActiveNode(){
  const player = me();
  const node = activeNode();
  if(node.type === "quiz"){
    setPage("quiz");
    message("Answer the quiz gate to clear it.");
    return;
  }
  completeNode(node);
}

function completeNode(node){
  const player = me();
  if(node.type !== "start" && !player.completed.includes(node.id)) player.completed.push(node.id);
  player.xp += node.points || 20;
  player.coins += node.type === "finish" ? 20 : 4;
  player.streak += 1;
  player.nodeIndex = firstOpenIndex(player);
  addActivity(`cleared ${node.title}`);
  playSound(node.type === "finish" ? "level" : "complete");
  if(node.type === "finish"){
    pop("Journey Clear", `${state.journey.title} reached its goal end.`);
    confetti(70);
  }else{
    confetti(18);
  }
  render();
  pushState();
}

function answerQuiz(nodeId, answer){
  const node = state.journey.nodes.find(item => item.id === nodeId);
  if(!node?.quiz) return;
  const player = me();
  player.quizAnswers[node.id] = answer;
  if(answer === node.quiz.answer){
    message("Correct. Quiz gate cleared.");
    completeNode(node);
  }else{
    player.streak = 0;
    message("Not yet. Try another answer.");
    playSound("miss");
    render();
    pushState();
  }
}

function startFocus(){
  if(running) return;
  const node = activeNode();
  total = Math.max(2, node.minutes || 15) * 60;
  left = Math.min(left || total, total);
  running = true;
  me().active = true;
  message(`Focus started for ${node.title}.`);
  playSound("start");
  render();
  pushState();
  timerInterval = setInterval(() => {
    left -= 1;
    renderTimer();
    if(left <= 0){
      pauseFocus(false);
      const minutes = Math.max(2, Math.round(total / 60));
      me().focus += minutes;
      me().coins += 3;
      addActivity(`finished a ${minutes} minute focus block`);
      message("Focus block finished. Check off the gate when the subtask is actually done.");
      playSound("complete");
      confetti(24);
      left = total;
      render();
      pushState();
    }
  }, 1000);
}

function pauseFocus(withSound = true){
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  running = false;
  me().active = false;
  if(withSound) playSound("pause");
  render();
  pushState();
}

function resetMine(confirmFirst = true){
  if(confirmFirst && !confirm("Reset only your progress on this journey?")) return;
  const player = me();
  player.completed = [];
  player.nodeIndex = 1;
  player.quizAnswers = {};
  player.streak = 0;
  player.active = false;
  pauseFocus(false);
  left = total;
  message("Your path progress was reset.");
  render();
  pushState();
}

function addActivity(text){
  state.activity.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: profile.display_name || "Player",
    text,
    at: Date.now()
  });
  state.activity = state.activity.slice(0, 40);
}

async function joinPublicPath(){
  if(!hasSupabase){
    message("Add Supabase env values to connect Android and PC users.");
    return;
  }

  roomCode = PUBLIC_PATH_CODE;

  if(channel){
    await supabase.removeChannel(channel);
    channel = null;
  }

  const localPlayer = structuredClone(me());
  const { data, error } = await supabase
    .from("game_rooms")
    .select("state,room_name")
    .eq("room_code", PUBLIC_PATH_CODE)
    .maybeSingle();

  if(error){
    message(error.message);
    return;
  }

  if(data?.state?.journey){
    syncingRemote = true;
    state = {
      ...freshState(),
      ...data.state,
      players: {
        ...(data.state.players || {}),
        [clientId]: {
          ...localPlayer,
          ...(data.state.players?.[clientId] || {}),
          id: clientId,
          online: true
        }
      }
    };
    syncingRemote = false;
  }else{
    state.players[clientId] = localPlayer;
    await supabase.from("game_rooms").upsert({
      room_code: PUBLIC_PATH_CODE,
      room_name: "Public Journey Path",
      is_public: true,
      max_players: 100,
      state,
      created_by: clientId,
      updated_by: clientId,
      updated_at: new Date().toISOString()
    }, { onConflict: "room_code" });
  }

  ensureJourney();
  ensurePlayer();

  channel = supabase
    .channel(`journey:${PUBLIC_PATH_CODE}`, { config: { presence: { key: clientId } } })
    .on("presence", { event: "sync" }, () => {
      const presence = channel.presenceState();
      const online = Object.values(presence).flat();
      Object.values(state.players || {}).forEach(player => player.online = false);
      online.forEach(item => {
        if(state.players[item.id]) state.players[item.id].online = true;
      });
      if(online.length > lastOnlineCount) playSound("online");
      lastOnlineCount = online.length;
      render();
    })
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "game_rooms",
      filter: `room_code=eq.${PUBLIC_PATH_CODE}`
    }, payload => {
      if(payload.new?.updated_by === clientId || !payload.new?.state) return;
      syncingRemote = true;
      const local = structuredClone(me());
      state = payload.new.state;
      if(!state.players) state.players = {};
      state.players[clientId] = {
        ...local,
        ...(state.players[clientId] || {}),
        id: clientId,
        online: true
      };
      ensureJourney();
      ensurePlayer();
      syncingRemote = false;
      render();
    })
    .subscribe(async status => {
      if(status === "SUBSCRIBED"){
        await channel.track({ id: clientId, name: profile.display_name, at: Date.now() });
        lastOnlineCount = 1;
        addActivity("entered the public path");
        message("Entered public journey path.");
        playSound("online");
        render();
        pushState();
      }
    });
}

function pushState(){
  saveLocal();
  if(!hasSupabase || !roomCode || syncingRemote) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    await supabase.from("game_rooms").upsert({
      room_code: PUBLIC_PATH_CODE,
      room_name: "Public Journey Path",
      is_public: true,
      max_players: 100,
      state,
      updated_by: clientId,
      updated_at: new Date().toISOString()
    }, { onConflict: "room_code" });
  }, 250);
}

function updateProfileFromInputs(){
  profile.display_name = $("playerName").value.trim() || "Player";
  profile.avatar = $("avatar").value.trim() || initials(profile.display_name);
  profile.target = $("target").value.trim();
  profile.bio = $("bio").value.trim();
  syncProfileIntoPlayer();
  message("Profile saved.");
  render();
  pushState();
}

function setPage(page, push = true){
  const next = pages.includes(page) ? page : "path";
  document.querySelectorAll("[data-page]").forEach(section => {
    section.classList.toggle("active", section.dataset.page === next);
  });
  document.querySelectorAll("[data-page-link]").forEach(button => {
    const active = button.dataset.pageLink === next;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  if(push && window.location.hash !== `#${next}`) history.pushState(null, "", `#${next}`);
}

function pageFromHash(){
  const page = window.location.hash.replace("#", "");
  return pages.includes(page) ? page : "path";
}

function fmt(seconds){
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function initials(name){
  return String(name || "NQ").trim().split(/\s+/).slice(0,2).map(x => x[0]?.toUpperCase()).join("") || "NQ";
}

function escapeHTML(str){
  return String(str ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#039;"
  }[char]));
}

function message(text){
  $("message").textContent = text;
}

function pop(title, text){
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  $("modal").classList.add("show");
}

function confetti(count=40){
  const box = $("confetti");
  const palette = ["#f59e0b", "#3b82f6", "#8b5cf6", "#14b8a6", "#ef476f", "#22c55e"];
  for(let i=0; i<count; i++){
    const piece = document.createElement("i");
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = palette[Math.floor(Math.random() * palette.length)];
    piece.style.animationDelay = Math.random() * .35 + "s";
    box.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

function setSoundEnabled(enabled){
  soundEnabled = enabled;
  localStorage.setItem(storageKeys.sound, enabled ? "on" : "off");
  renderPills();
  if(enabled) playSound("toggle");
}

function getAudioContext(){
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  if(!AudioClass) return null;
  if(!audioCtx || audioCtx.state === "closed") audioCtx = new AudioClass();
  if(audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playSound(kind){
  if(!soundEnabled) return;
  try{
    const ctx = getAudioContext();
    if(!ctx) return;
    const patterns = {
      toggle:[[440,.05],[660,.08]],
      tap:[[520,.04]],
      start:[[392,.06],[523,.08],[659,.1]],
      pause:[[330,.05],[247,.08]],
      complete:[[523,.06],[659,.08],[784,.12]],
      level:[[659,.08],[880,.08],[1175,.18]],
      miss:[[220,.08],[174,.12]],
      online:[[440,.05],[554,.05],[659,.08]]
    };
    const notes = patterns[kind] || patterns.tap;
    let offset = 0;
    notes.forEach(([freq, duration]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "miss" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
      gain.gain.setValueAtTime(.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(.05, ctx.currentTime + offset + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + offset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + duration + .02);
      offset += duration * .82;
    });
  }catch(e){}
}

function registerServiceWorker(){
  if(import.meta.env.PROD && "serviceWorker" in navigator){
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

function bind(){
  document.querySelectorAll("[data-page-link]").forEach(button => {
    button.onclick = () => {
      playSound("tap");
      setPage(button.dataset.pageLink);
    };
  });
  window.addEventListener("hashchange", () => setPage(pageFromHash(), false));

  $("startFocus").onclick = startFocus;
  $("pauseFocus").onclick = () => pauseFocus(true);
  $("completeNode").onclick = completeActiveNode;
  $("resetProgress").onclick = () => resetMine(true);
  $("jumpToQuiz").onclick = () => setPage("quiz");
  $("joinPublic").onclick = joinPublicPath;
  $("createJourney").onclick = createCustomJourney;
  $("previewCustom").onclick = previewCustom;
  $("saveProfile").onclick = updateProfileFromInputs;
  $("soundToggle").onclick = () => setSoundEnabled(!soundEnabled);
  $("closeModal").onclick = () => $("modal").classList.remove("show");
}

bind();
setPage(pageFromHash(), false);
render();
registerServiceWorker();
message(hasSupabase ? "Ready. Enter the public path to sync Android and PC." : "Solo preview. Add Supabase env values for live public sync.");
