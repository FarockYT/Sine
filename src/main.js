import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const PUBLIC_PATH_CODE = "PUBLIC-JOURNEY-PATH";
const colors = ["#2563eb", "#0f766e", "#7c3aed", "#d97706", "#db2777", "#16a34a", "#0891b2", "#dc2626"];
const pages = ["dashboard", "map", "subjects", "build", "shield", "quiz", "public", "profile"];
const pageAliases = { overview: "dashboard", journey: "map", journeys: "build", blocks: "shield", path: "map", create: "build" };
const pageTitles = {
  dashboard: "Dashboard",
  map: "Journey Map",
  subjects: "Subjects",
  build: "Build",
  shield: "Shield",
  quiz: "Quiz",
  public: "Public",
  profile: "Profile"
};
const storageKeys = {
  client: "nqJourneyClientId",
  state: "nqJourneyState",
  profile: "nqJourneyProfile",
  sound: "nqJourneySound"
};

const outlineSample = `Subject: Biology
Unit: Life Processes
- 2m question: nutrition keywords
- Diagram pass: digestive system labels
- 5m answer frame: transport in humans
? Bio quiz | What carries oxygen in human blood? | Red blood cells | Platelets | Starch | 0

Subject: Physics
Unit: Light
- 2m question: laws of reflection
- Ray diagram: concave mirror
- 5m numerical: magnification
? Physics quiz | A convex lens generally: | Converges light | Always absorbs light | Splits magnets | 0

Subject: Grammar
Unit: Tenses
- 2m drill: present perfect
- Rule card: signal words
- 5m worksheet: mixed tense edits
? Grammar quiz | Which tense uses has or have plus past participle? | Present perfect | Simple past | Future simple | 0`;

const shieldPresets = [
  {
    id: "scroll-lock",
    title: "Scroll Lock",
    apps: ["Instagram", "TikTok", "Snapchat", "Facebook"],
    websites: ["instagram.com/reels", "youtube.com/shorts", "tiktok.com"],
    allow: ["Notes", "Calendar", "Calculator"]
  },
  {
    id: "study-safe",
    title: "Study Safe",
    apps: ["Games", "Shopping", "Streaming", "Shorts"],
    websites: ["reddit.com", "x.com", "netflix.com"],
    allow: ["Dictionary", "Drive", "Classroom"]
  },
  {
    id: "night-reset",
    title: "Night Reset",
    apps: ["YouTube", "Discord", "Games", "Instagram"],
    websites: ["twitch.tv", "youtube.com", "primevideo.com"],
    allow: ["Alarm", "Music", "Notes"]
  }
];

const journeyTemplates = [
  {
    id: "journey-10th-portion",
    templateId: "10th-portion",
    title: "10th Portion Quest",
    goal: "Complete all portion work across subjects, units, 2m answers, 5m answers, recall rounds, and quizzes.",
    theme: "Class 10",
    subjects: [
      subjectSeed("Biology", "Processes, diagrams, keywords, and recall.", [
        unitSeed("Life Processes", "Nutrition, respiration, transport, excretion", [
          goalSeed("2m question: nutrition keywords", "2m", 8, "Answer one tiny definition without notes."),
          goalSeed("Diagram pass: digestive system labels", "diagram", 18, "Draw once, label once, hide labels once."),
          goalSeed("3m recall: respiration steps", "recall", 12, "Speak the sequence before writing."),
          goalSeed("5m answer frame: transport in humans", "5m", 22, "Write skeleton, then fill details."),
          quizSeed("Bio quiz: oxygen carrier", "What carries oxygen in human blood?", ["Red blood cells", "Platelets", "Starch"], 0)
        ]),
        unitSeed("Heredity", "Traits, variation, and crosses", [
          goalSeed("2m question: dominant trait", "2m", 8, "Make one crisp definition card."),
          goalSeed("Punnett square warmup", "practice", 16, "Solve one monohybrid cross slowly."),
          goalSeed("3m recall: inherited vs acquired", "recall", 12, "Say the difference in your own words."),
          goalSeed("5m answer frame: sex determination", "5m", 22, "Build the answer with labelled steps."),
          quizSeed("Bio quiz: Mendel", "In a monohybrid cross, what does F1 usually show?", ["Dominant trait", "Both parents equally", "No trait"], 0)
        ])
      ]),
      subjectSeed("Physics", "Formulas, diagrams, numericals, and quick tests.", [
        unitSeed("Light", "Reflection, refraction, mirrors, lenses", [
          goalSeed("2m question: laws of reflection", "2m", 8, "Write both laws from memory."),
          goalSeed("Ray diagram: concave mirror", "diagram", 18, "Draw one case and label image position."),
          goalSeed("Formula card: lens equation", "formula", 14, "Write formula, symbols, and units."),
          goalSeed("5m numerical: magnification", "5m", 22, "Solve with steps and final unit."),
          quizSeed("Physics quiz: lens", "A convex lens generally:", ["Converges light", "Always absorbs light", "Splits magnets"], 0)
        ]),
        unitSeed("Electricity", "Ohm law, resistance, power, circuits", [
          goalSeed("2m question: Ohm law", "2m", 8, "Write V, I, R relation with units."),
          goalSeed("Circuit sketch: series vs parallel", "diagram", 18, "Draw both and mark current paths."),
          goalSeed("3m recall: factors of resistance", "recall", 12, "List and explain one factor."),
          goalSeed("5m numerical: electric power", "5m", 22, "Use P = VI and show substitution."),
          quizSeed("Physics quiz: unit", "The SI unit of resistance is:", ["Ohm", "Watt", "Coulomb"], 0)
        ])
      ]),
      subjectSeed("Prose", "Chapter memory, themes, character points, and evidence.", [
        unitSeed("Chapter Summaries", "Plot, speaker, turning points", [
          goalSeed("2m skim: chapter headings", "2m", 8, "Read headings and first lines."),
          goalSeed("Story spine: five beats", "map", 16, "Beginning, problem, turn, result, message."),
          goalSeed("3m recall: main conflict", "recall", 12, "Say it without the book."),
          goalSeed("5m answer frame: theme", "5m", 22, "Claim, scene, quote memory, explanation."),
          quizSeed("Prose quiz: theme", "A theme answer should mainly include:", ["Message plus evidence", "Only plot names", "Only grammar rules"], 0)
        ])
      ]),
      subjectSeed("Grammar", "Rules converted into fast drills.", [
        unitSeed("Tenses", "Present, past, future, perfect forms", [
          goalSeed("2m drill: present perfect", "2m", 8, "Make three has/have sentences."),
          goalSeed("Rule card: signal words", "rule", 14, "Already, since, for, yesterday, tomorrow."),
          goalSeed("3m recall: tense table", "recall", 12, "Say one example per tense."),
          goalSeed("5m worksheet: mixed tense edits", "5m", 22, "Correct five sentences."),
          quizSeed("Grammar quiz: perfect", "Which tense uses has or have plus past participle?", ["Present perfect", "Simple past", "Future simple"], 0)
        ]),
        unitSeed("Voice and Speech", "Active, passive, direct, indirect", [
          goalSeed("2m question: object spotting", "2m", 8, "Find subject, verb, and object."),
          goalSeed("Rule card: passive pattern", "rule", 14, "Object + be + V3 + by + subject."),
          goalSeed("5m worksheet: transform five", "5m", 22, "Do two passive and three speech transforms."),
          quizSeed("Grammar quiz: passive", "In passive voice, focus moves to the:", ["Receiver of action", "Dictionary meaning", "Punctuation only"], 0)
        ])
      ]),
      subjectSeed("History", "Timelines, causes, effects, and maps.", [
        unitSeed("Nationalism", "Events, leaders, causes, symbols", [
          goalSeed("2m question: one event", "2m", 8, "Write date, place, result."),
          goalSeed("Timeline: five markers", "map", 16, "Order events left to right."),
          goalSeed("3m recall: cause and effect", "recall", 12, "Say one cause and one result."),
          goalSeed("5m answer frame: movement analysis", "5m", 22, "Cause, action, people, impact."),
          quizSeed("History quiz: timeline", "A timeline mainly helps you see:", ["Order of events", "Only spelling", "Only diagrams"], 0)
        ])
      ]),
      subjectSeed("Maths", "Formula visibility and low-friction practice.", [
        unitSeed("Algebra", "Polynomials, equations, AP", [
          goalSeed("2m question: formula recall", "2m", 8, "Write one identity from memory."),
          goalSeed("Warmup: two easy sums", "practice", 14, "Choose very low friction problems."),
          goalSeed("3m recall: steps before solving", "recall", 12, "State method before numbers."),
          goalSeed("5m problem: linear equations", "5m", 22, "Solve and check substitution."),
          quizSeed("Math quiz: identity", "(a+b)^2 equals:", ["a^2 + 2ab + b^2", "a^2 - 2ab + b^2", "a + b^2"], 0)
        ])
      ])
    ]
  },
  {
    id: "journey-exam-rescue",
    templateId: "exam-rescue",
    title: "Exam Rescue",
    goal: "Convert exam panic into a visible path of weak zones, practice, mistakes, and recall.",
    theme: "Exam",
    subjects: [
      subjectSeed("Sort", "Know what exists.", [
        unitSeed("Syllabus Sweep", "Mark what is red, yellow, and green", [
          goalSeed("2m dump: chapters remembered", "2m", 8, "Write rough chapter names."),
          goalSeed("Mark red yellow green topics", "map", 16, "Red unclear, yellow shaky, green safe."),
          goalSeed("Pick three danger zones", "choice", 12, "Choose by marks and fear level."),
          quizSeed("Sort quiz", "The first useful move is to:", ["Name the next tiny action", "Wait for motivation", "Rewrite everything"], 0)
        ])
      ]),
      subjectSeed("Practice", "Convert panic into attempts.", [
        unitSeed("Question Run", "Easy, medium, timed", [
          goalSeed("Solve five easy questions", "practice", 16, "Use momentum questions first."),
          goalSeed("Solve three medium questions", "practice", 22, "Stop after three and check errors."),
          goalSeed("One mini practice set", "practice", 24, "Short enough to finish."),
          quizSeed("Practice quiz", "After practice, the best check is:", ["Find one repeat mistake", "Count only effort", "Start a new chapter"], 0)
        ])
      ])
    ]
  }
];

const app = document.querySelector("#app");
app.innerHTML = `
<div class="appFrame">
  <aside class="sidebar">
    <div class="brandBlock">
      <div class="brandMark">NQ</div>
      <div>
        <h1>NeuroQuest</h1>
        <p>Journey OS</p>
      </div>
    </div>

    <nav class="sideNav" aria-label="Main pages">
      <button type="button" data-page-link="dashboard"><span></span>Dashboard</button>
      <button type="button" data-page-link="map"><span></span>Journey Map</button>
      <button type="button" data-page-link="subjects"><span></span>Subjects</button>
      <button type="button" data-page-link="build"><span></span>Build</button>
      <button type="button" data-page-link="shield"><span></span>Shield</button>
      <button type="button" data-page-link="quiz"><span></span>Quiz</button>
      <button type="button" data-page-link="public"><span></span>Public</button>
      <button type="button" data-page-link="profile"><span></span>Profile</button>
    </nav>

    <div class="sidebarFooter">
      <div class="miniMetric"><span>XP</span><b id="sideXp">0</b></div>
      <div class="miniMetric"><span>Shield</span><b id="sideShield">0%</b></div>
    </div>
  </aside>

  <section class="workspace">
    <header class="topbar">
      <div>
        <label id="pageKicker">Dashboard</label>
        <h2 id="pageTitle">Dashboard</h2>
      </div>
      <div class="topStatus">
        <div><span></span><b id="connectionView">Local</b></div>
        <div><span></span><b id="activeJourneyView">Journey</b></div>
        <button type="button" id="soundToggle">Sound Off</button>
      </div>
    </header>

    <div class="notice" id="message">Ready.</div>

    <main>
      <section class="page" data-page="dashboard">
        <div class="dashboardGrid">
          <section class="heroPanel">
            <div>
              <label id="journeyTheme">Class 10</label>
              <h2 id="journeyTitle">10th Portion Quest</h2>
              <p id="journeyGoal"></p>
            </div>
            <div class="progressOrb" id="progressOrb"><b id="progressText">0%</b><span>clear</span></div>
          </section>

          <section class="metricGrid">
            <div><span>Cleared</span><b id="clearedGoals">0</b></div>
            <div><span>Total Goals</span><b id="totalGoals">0</b></div>
            <div><span>Subjects</span><b id="subjectCount">0</b></div>
            <div><span>Rank</span><b id="rankView">Rookie</b></div>
          </section>

          <section class="panel currentPanel">
            <div class="panelHead">
              <div><label>Current Node</label><h2 id="currentGoalTitle">Pick a goal</h2></div>
              <button type="button" id="completeGoal">Check Off</button>
            </div>
            <p id="currentGoalDetail"></p>
            <div class="dotMeta" id="currentGoalMeta"></div>
          </section>

          <section class="panel shieldPanel">
            <div class="panelHead">
              <div><label>Distraction Shield</label><h2 id="shieldStatusTitle">Ready</h2></div>
              <button type="button" data-page-link="shield">Open</button>
            </div>
            <div class="shieldMeter"><span id="shieldMeterFill"></span></div>
            <div class="rowStats" id="shieldMiniStats"></div>
          </section>

          <section class="panel widePanel">
            <div class="panelHead">
              <div><label>Subject Progress</label><h2>Portion map</h2></div>
              <button type="button" data-page-link="map">Open Map</button>
            </div>
            <div class="subjectProgressList" id="dashboardSubjects"></div>
          </section>
        </div>
      </section>

      <section class="page" data-page="map">
        <div class="mapPage">
          <aside class="panel subjectList" id="mapSubjects"></aside>
          <section class="panel mapPanel">
            <div class="panelHead">
              <div>
                <label>Dot Route</label>
                <h2 id="mapSubjectTitle">Subject</h2>
                <p id="mapSubjectGoal"></p>
              </div>
              <b id="mapSubjectPercent">0%</b>
            </div>
            <div class="dotMapViewport">
              <div class="dotMap" id="dotMap">
                <svg id="dotLines" viewBox="0 0 1120 560" preserveAspectRatio="none"></svg>
                <div id="dotNodes"></div>
              </div>
            </div>
            <div class="unitDots" id="mapUnits"></div>
          </section>
          <aside class="panel detailPanel">
            <label>Selected Goal</label>
            <h2 id="selectedGoalTitle">Goal</h2>
            <p id="selectedGoalDetail"></p>
            <div class="detailRows" id="selectedGoalRows"></div>
            <div class="actionRow">
              <button type="button" id="mapCompleteGoal">Check Off</button>
              <button type="button" id="mapResetProgress">Reset</button>
            </div>
          </aside>
        </div>
      </section>

      <section class="page" data-page="subjects">
        <div class="subjectsPage">
          <section class="panel">
            <div class="panelHead"><div><label>Subjects</label><h2>Portion structure</h2></div></div>
            <div class="subjectTable" id="subjectTable"></div>
          </section>
          <section class="panel">
            <div class="panelHead"><div><label>Units</label><h2 id="unitPanelTitle">Selected subject</h2></div></div>
            <div class="unitList" id="unitList"></div>
          </section>
        </div>
      </section>

      <section class="page" data-page="build">
        <div class="buildPage">
          <section class="panel">
            <div class="panelHead"><div><label>Presets</label><h2>Start point</h2></div></div>
            <div class="presetRows" id="presetRows"></div>
          </section>
          <section class="panel buildPanel">
            <div class="panelHead">
              <div><label>Custom Journey</label><h2>Syllabus builder</h2></div>
              <button type="button" id="loadOutline">Load 10th Shape</button>
            </div>
            <label>Journey Name</label>
            <input id="customTitle" placeholder="10th Midterm Portion" />
            <label>Final Goal</label>
            <textarea id="customGoal" placeholder="Complete every subject, unit, and quiz gate."></textarea>
            <label>Theme</label>
            <select id="customTheme">
              <option>Class 10</option>
              <option>Exam</option>
              <option>Daily</option>
              <option>Project</option>
              <option>Creative</option>
            </select>
            <label>Syllabus Outline</label>
            <textarea id="customOutline" class="outlineInput">${escapeHTML(outlineSample)}</textarea>
            <div class="actionRow">
              <button type="button" id="createJourney">Publish Journey</button>
              <button type="button" id="previewJourney">Preview Shape</button>
            </div>
            <div class="shapePreview" id="shapePreview"></div>
          </section>
        </div>
      </section>

      <section class="page" data-page="shield">
        <div class="shieldPage">
          <section class="shieldHero">
            <div>
              <label>Distraction Shield</label>
              <h2>Shield control</h2>
              <p id="shieldSubtitle"></p>
            </div>
            <div class="shieldScore"><b id="shieldScore">0</b><span>score</span></div>
            <div class="actionRow">
              <button type="button" id="activateShield">Activate</button>
              <button type="button" id="endShield">End</button>
            </div>
          </section>

          <div class="shieldGrid">
            <section class="panel">
              <div class="panelHead"><div><label>Presets</label><h2>Shield templates</h2></div></div>
              <div class="shieldPresetRows" id="shieldPresetRows"></div>
            </section>

            <section class="panel">
              <div class="panelHead"><div><label>Apps</label><h2>Blocked apps</h2></div></div>
              <div class="addLine"><input id="appInput" placeholder="App name" /><button type="button" id="addApp">Add</button></div>
              <div class="cleanList" id="appList"></div>
            </section>

            <section class="panel">
              <div class="panelHead"><div><label>Websites</label><h2>Blocked sites</h2></div></div>
              <div class="addLine"><input id="siteInput" placeholder="website.com" /><button type="button" id="addSite">Add</button></div>
              <div class="cleanList" id="siteList"></div>
            </section>

            <section class="panel">
              <div class="panelHead"><div><label>Allowlist</label><h2>Study-safe tools</h2></div></div>
              <div class="addLine"><input id="allowInput" placeholder="Notes, Dictionary" /><button type="button" id="addAllow">Add</button></div>
              <div class="cleanList" id="allowList"></div>
            </section>

            <section class="panel widePanel">
              <div class="panelHead">
                <div><label>Protocol</label><h2>Shield rules</h2></div>
                <label class="checkLine"><input type="checkbox" id="strictMode" /> Strict</label>
              </div>
              <div class="ruleList" id="ruleList"></div>
            </section>
          </div>
        </div>
      </section>

      <section class="page" data-page="quiz">
        <div class="quizPage">
          <section class="panel quizPanel">
            <div class="panelHead"><div><label id="quizContext">Quiz</label><h2 id="quizTitle">Quiz Gate</h2></div></div>
            <p id="quizQuestion"></p>
            <div class="answerList" id="answerList"></div>
          </section>
          <section class="panel">
            <div class="panelHead"><div><label>Queue</label><h2>Quiz dots</h2></div></div>
            <div class="quizQueue" id="quizQueue"></div>
          </section>
        </div>
      </section>

      <section class="page" data-page="public">
        <div class="publicPage">
          <section class="panel">
            <div class="panelHead">
              <div><label>Public Room</label><h2>${PUBLIC_PATH_CODE}</h2></div>
              <button type="button" id="joinPublic">Enter</button>
            </div>
            <div class="roomStats" id="roomStats"></div>
          </section>
          <section class="panel">
            <div class="panelHead"><div><label>Players</label><h2>Leaderboard</h2></div></div>
            <div class="playerList" id="players"></div>
          </section>
          <section class="panel">
            <div class="panelHead"><div><label>Activity</label><h2>Room log</h2></div></div>
            <div class="activityList" id="activityFeed"></div>
          </section>
        </div>
      </section>

      <section class="page" data-page="profile">
        <div class="profilePage">
          <section class="panel profilePanel">
            <div class="avatarBlock"><div id="avatarPreview">NQ</div><div><label>Profile</label><h2 id="profileNameView">Player</h2><p id="profileTargetView"></p></div></div>
            <label>Name</label>
            <input id="playerName" placeholder="Name" />
            <label>Avatar</label>
            <input id="avatar" placeholder="NQ" maxlength="2" />
            <label>Target</label>
            <input id="target" placeholder="Main goal" />
            <label>Public Note</label>
            <textarea id="bio" placeholder="Short note"></textarea>
            <button type="button" id="saveProfile">Save Profile</button>
          </section>
          <section class="panel">
            <div class="panelHead"><div><label>Build Targets</label><h2>Install shape</h2></div></div>
            <div class="installRows">
              <div><span></span><b>Android APK</b><small>Sideload package</small></div>
              <div><span></span><b>PC Web</b><small>Vercel app</small></div>
              <div><span></span><b>Sync</b><small>Supabase public room</small></div>
            </div>
          </section>
        </div>
      </section>
    </main>
  </section>
</div>

<div class="modal" id="modal">
  <div class="modalBox">
    <h2 id="modalTitle">Journey Clear</h2>
    <p id="modalText">The final goal opened.</p>
    <button type="button" id="closeModal">Continue</button>
  </div>
</div>
<div class="confetti" id="confetti"></div>
`;

const $ = id => document.getElementById(id);
const clientId = getClientId();
let profile = loadProfile();
let state = normalizeState(loadState());
let roomCode = "";
let channel = null;
let syncingRemote = false;
let pushTimer = null;
let soundEnabled = localStorage.getItem(storageKeys.sound) === "on";
let audioCtx = null;
let lastOnlineCount = 1;
let currentPage = pageFromHash();
let selectedSubjectId = "";
let selectedUnitId = "";
let selectedGoalId = "";
let selectedQuizId = "";

ensureState();

function subjectSeed(name, summary, units){
  return { name, summary, units };
}

function unitSeed(title, outcome, goals){
  return { title, outcome, goals };
}

function goalSeed(title, kind, points, detail){
  return { title, kind, points, detail };
}

function quizSeed(title, question, options, answer){
  return { title, kind: "quiz", points: 24, detail: question, quiz: { question, options, answer } };
}

function uid(prefix = "id"){
  const value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function slug(value){
  return String(value || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "item";
}

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function getClientId(){
  let id = localStorage.getItem(storageKeys.client);
  if(!id){
    id = uid("client");
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
    color: colors[Math.floor(Math.random() * colors.length)]
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
  const journeys = journeyTemplates.map(template => materializeJourney(template));
  return {
    version: 4,
    journeys,
    activeJourneyId: journeys[0].id,
    players: {},
    activity: [],
    updatedAt: Date.now()
  };
}

function normalizeState(raw){
  const base = freshState();
  if(!raw || typeof raw !== "object") return base;

  let journeys = [];
  if(Array.isArray(raw.journeys)){
    journeys = raw.journeys.map(normalizeJourney).filter(Boolean);
  }else if(raw.journey){
    journeys = [convertFlatJourney(raw.journey)];
  }

  const seen = new Set(journeys.map(journey => journey.id));
  base.journeys.forEach(journey => {
    if(!seen.has(journey.id)){
      journeys.push(journey);
      seen.add(journey.id);
    }
  });

  if(!journeys.length) journeys = base.journeys;

  const activeJourneyId = journeys.some(journey => journey.id === raw.activeJourneyId)
    ? raw.activeJourneyId
    : journeys[0].id;

  const next = {
    version: 4,
    journeys,
    activeJourneyId,
    players: raw.players && typeof raw.players === "object" ? raw.players : {},
    activity: Array.isArray(raw.activity) ? raw.activity.slice(0, 80) : [],
    updatedAt: raw.updatedAt || Date.now()
  };
  Object.values(next.players).forEach(normalizePlayer);
  return next;
}

function materializeJourney(template){
  return normalizeJourney({
    id: template.id,
    templateId: template.templateId,
    title: template.title,
    goal: template.goal,
    theme: template.theme,
    createdAt: Date.now(),
    subjects: template.subjects
  });
}

function normalizeJourney(journey){
  if(!journey || typeof journey !== "object") return null;
  if(Array.isArray(journey.nodes)) return convertFlatJourney(journey);

  const id = journey.id || uid("journey");
  const subjects = Array.isArray(journey.subjects) ? journey.subjects : [];
  const normalizedSubjects = subjects.map((subject, subjectIndex) => {
    const subjectId = subject.id || `${id}-${slug(subject.name)}-${subjectIndex}`;
    const units = Array.isArray(subject.units) ? subject.units : [];
    return {
      id: subjectId,
      name: subject.name || `Subject ${subjectIndex + 1}`,
      summary: subject.summary || subject.goal || "Clear this portion.",
      color: subject.color || colors[subjectIndex % colors.length],
      units: units.map((unit, unitIndex) => {
        const unitId = unit.id || `${subjectId}-${slug(unit.title)}-${unitIndex}`;
        const goals = Array.isArray(unit.goals) ? unit.goals : [];
        return {
          id: unitId,
          title: unit.title || `Unit ${unitIndex + 1}`,
          outcome: unit.outcome || unit.target || "Finish this unit.",
          goals: goals.map((goal, goalIndex) => ({
            id: goal.id || `${unitId}-${slug(goal.title)}-${goalIndex}`,
            title: goal.title || `Goal ${goalIndex + 1}`,
            kind: goal.kind || "task",
            detail: goal.detail || "",
            points: Number(goal.points || inferPoints(goal.kind || goal.title)),
            quiz: goal.quiz ? normalizeQuiz(goal.quiz) : null
          }))
        };
      }).filter(unit => unit.goals.length)
    };
  }).filter(subject => subject.units.length);

  return {
    id,
    templateId: journey.templateId || "",
    title: journey.title || "Custom Journey",
    goal: journey.goal || journey.finalGoal || "Reach the final goal.",
    theme: journey.theme || "Study",
    createdAt: journey.createdAt || Date.now(),
    subjects: normalizedSubjects.length ? normalizedSubjects : fallbackSubjects(id)
  };
}

function convertFlatJourney(oldJourney){
  const id = oldJourney.id || uid("legacy");
  const nodes = (oldJourney.nodes || []).filter(node => node.type !== "start");
  return normalizeJourney({
    id,
    title: oldJourney.title || "Legacy Path",
    goal: oldJourney.goal || "Finish the path.",
    theme: oldJourney.theme || "Study",
    subjects: [{
      name: "Legacy Path",
      summary: oldJourney.goal || "Finish the path.",
      units: [{
        title: "Converted Gates",
        outcome: "Imported from the older map.",
        goals: nodes.map(node => ({
          id: node.id,
          title: node.title,
          kind: node.type === "quiz" ? "quiz" : "task",
          detail: node.detail,
          points: node.points || 12,
          quiz: node.quiz || null
        }))
      }]
    }]
  });
}

function fallbackSubjects(journeyId){
  return [{
    id: `${journeyId}-main`,
    name: "Main",
    summary: "Starter portion.",
    color: colors[0],
    units: [{
      id: `${journeyId}-unit`,
      title: "Starter Unit",
      outcome: "Make the journey playable.",
      goals: [
        { id: `${journeyId}-goal-1`, title: "2m starter", kind: "2m", detail: "Do the smallest visible move.", points: 8, quiz: null },
        { id: `${journeyId}-goal-2`, title: "First proper task", kind: "task", detail: "Finish one useful piece.", points: 12, quiz: null }
      ]
    }]
  }];
}

function normalizeQuiz(quiz){
  const options = Array.isArray(quiz.options) ? quiz.options.filter(Boolean) : [];
  return {
    question: quiz.question || "Quiz question",
    options: options.length >= 2 ? options : ["Yes", "No"],
    answer: Math.max(0, Math.min(Math.max(0, options.length - 1), Number(quiz.answer || 0)))
  };
}

function inferPoints(kind){
  const key = String(kind || "").toLowerCase();
  if(key.includes("quiz")) return 24;
  if(key.includes("5m")) return 22;
  if(key.includes("2m")) return 8;
  if(key.includes("diagram") || key.includes("map")) return 18;
  if(key.includes("practice")) return 16;
  return 12;
}

function ensureState(){
  state = normalizeState(state);
  ensurePlayer();
  ensureSelection();
}

function defaultPlayer(){
  return {
    id: clientId,
    name: profile.display_name || "Player",
    avatar: profile.avatar || "NQ",
    target: profile.target || "",
    bio: profile.bio || "",
    color: profile.color || colors[0],
    journeys: {},
    shield: defaultShield(),
    xp: 0,
    coins: 0,
    streak: 0,
    online: true
  };
}

function normalizePlayer(player){
  player.id = player.id || uid("player");
  player.name = player.name || "Player";
  player.avatar = player.avatar || initials(player.name);
  player.target = player.target || "";
  player.bio = player.bio || "";
  player.color = player.color || colors[0];
  player.journeys = player.journeys && typeof player.journeys === "object" ? player.journeys : {};
  player.shield = normalizeShield(player.shield || player.blockPlan);
  player.xp = Number(player.xp || 0);
  player.coins = Number(player.coins || 0);
  player.streak = Number(player.streak || 0);
  player.online = player.online !== false;
}

function ensurePlayer(){
  if(!state.players) state.players = {};
  if(!state.players[clientId]) state.players[clientId] = defaultPlayer();
  normalizePlayer(state.players[clientId]);
  syncProfileIntoPlayer();
  progressFor(state.players[clientId], activeJourney().id);
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

function defaultShield(){
  return {
    active: false,
    strict: false,
    sessions: 0,
    apps: ["Instagram", "YouTube Shorts", "Games"],
    websites: ["youtube.com/shorts", "instagram.com/reels"],
    allow: ["Notes", "Calculator", "Dictionary"],
    rules: [
      { id: "strict-edit", title: "Lock edits", detail: "Block list changes while shield is active.", enabled: true, weight: 18 },
      { id: "short-form", title: "Short-form gate", detail: "Reels, shorts, and loop feeds stay out.", enabled: true, weight: 18 },
      { id: "quiet-pings", title: "Quiet pings", detail: "Non-study alerts stay muted.", enabled: false, weight: 12 },
      { id: "allow-only", title: "Study allowlist", detail: "Study tools remain available.", enabled: true, weight: 16 },
      { id: "night-reset", title: "Night reset", detail: "Sleep-hour scrolling is discouraged.", enabled: false, weight: 12 }
    ]
  };
}

function normalizeShield(shield){
  const base = defaultShield();
  const next = shield && typeof shield === "object" ? { ...base, ...shield } : base;
  next.apps = uniqueList(Array.isArray(next.apps) ? next.apps : base.apps);
  next.websites = uniqueList(Array.isArray(next.websites) ? next.websites : base.websites);
  next.allow = uniqueList(Array.isArray(next.allow) ? next.allow : (Array.isArray(next.allowlist) ? next.allowlist : base.allow));
  const rules = Array.isArray(next.rules) ? next.rules : [];
  next.rules = base.rules.map(rule => {
    const saved = rules.find(item => item.id === rule.id);
    return { ...rule, ...(saved || {}), enabled: saved ? saved.enabled !== false : rule.enabled };
  });
  next.active = Boolean(next.active);
  next.strict = Boolean(next.strict);
  next.sessions = Number(next.sessions || next.savedSessions || 0);
  return next;
}

function uniqueList(items){
  const seen = new Set();
  return items.map(item => String(item || "").trim()).filter(Boolean).filter(item => {
    const key = item.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shieldScore(shield = me().shield){
  const rules = shield.rules.filter(rule => rule.enabled).reduce((sum, rule) => sum + Number(rule.weight || 0), 0);
  const apps = Math.min(18, shield.apps.length * 3);
  const sites = Math.min(18, shield.websites.length * 3);
  const allow = Math.min(12, shield.allow.length * 3);
  const strict = shield.strict ? 14 : 0;
  const active = shield.active ? 8 : 0;
  return Math.min(100, rules + apps + sites + allow + strict + active);
}

function isShieldLocked(){
  const shield = me().shield;
  return Boolean(shield.active && shield.strict);
}

function progressFor(player = me(), journeyId = activeJourney().id){
  if(!player.journeys) player.journeys = {};
  if(!player.journeys[journeyId]){
    player.journeys[journeyId] = {
      done: Array.isArray(player.completed) ? [...player.completed] : [],
      answers: {},
      cursor: null
    };
  }
  const progress = player.journeys[journeyId];
  progress.done = Array.isArray(progress.done) ? progress.done : (Array.isArray(progress.completed) ? progress.completed : []);
  progress.answers = progress.answers && typeof progress.answers === "object" ? progress.answers : {};
  return progress;
}

function activeJourney(){
  if(!state.journeys?.length) state.journeys = freshState().journeys;
  return state.journeys.find(journey => journey.id === state.activeJourneyId) || state.journeys[0];
}

function allGoalContexts(journey = activeJourney()){
  const list = [];
  journey.subjects.forEach((subject, subjectIndex) => {
    subject.units.forEach((unit, unitIndex) => {
      unit.goals.forEach((goal, goalIndex) => list.push({ journey, subject, unit, goal, subjectIndex, unitIndex, goalIndex }));
    });
  });
  return list;
}

function contextsForSubject(subject, journey = activeJourney()){
  return allGoalContexts(journey).filter(item => item.subject.id === subject.id);
}

function contextsForUnit(unit, journey = activeJourney()){
  return allGoalContexts(journey).filter(item => item.unit.id === unit.id);
}

function isDone(goal, player = me(), journeyId = activeJourney().id){
  return progressFor(player, journeyId).done.includes(goal.id);
}

function percent(contexts, player = me(), journeyId = activeJourney().id){
  if(!contexts.length) return 0;
  const done = contexts.filter(item => isDone(item.goal, player, journeyId)).length;
  return Math.round(done / contexts.length * 100);
}

function journeyPercent(player = me(), journey = activeJourney()){
  return percent(allGoalContexts(journey), player, journey.id);
}

function firstOpenContext(player = me(), journey = activeJourney()){
  const contexts = allGoalContexts(journey);
  return contexts.find(item => !isDone(item.goal, player, journey.id)) || contexts[contexts.length - 1] || null;
}

function findContext(goalId, journey = activeJourney()){
  return allGoalContexts(journey).find(item => item.goal.id === goalId) || null;
}

function selectedContext(){
  const journey = activeJourney();
  return findContext(selectedGoalId, journey) || firstOpenContext(me(), journey);
}

function ensureSelection(){
  const journey = activeJourney();
  const player = state.players?.[clientId];
  const cursor = player ? progressFor(player, journey.id).cursor : null;
  const cursorContext = cursor?.goalId ? findContext(cursor.goalId, journey) : null;
  const fallback = cursorContext || firstOpenContext(player || defaultPlayer(), journey) || allGoalContexts(journey)[0];
  if(!fallback) return;

  if(!selectedSubjectId || !journey.subjects.some(subject => subject.id === selectedSubjectId)){
    selectedSubjectId = fallback.subject.id;
  }
  const subject = journey.subjects.find(item => item.id === selectedSubjectId) || fallback.subject;
  if(!selectedUnitId || !subject.units.some(unit => unit.id === selectedUnitId)){
    selectedUnitId = fallback.subject.id === subject.id ? fallback.unit.id : subject.units[0]?.id;
  }
  const unit = subject.units.find(item => item.id === selectedUnitId) || subject.units[0];
  if(!selectedGoalId || !unit?.goals.some(goal => goal.id === selectedGoalId)){
    const open = unit?.goals.find(goal => !isDone(goal, player || me(), journey.id)) || unit?.goals[0];
    selectedGoalId = open?.id || fallback.goal.id;
  }
  const quiz = allGoalContexts(journey).find(item => item.goal.kind === "quiz" && !isDone(item.goal, player || me(), journey.id))
    || allGoalContexts(journey).find(item => item.goal.kind === "quiz");
  if(!selectedQuizId || !findContext(selectedQuizId, journey)){
    selectedQuizId = quiz?.goal.id || "";
  }
}

function saveLocal(){
  state.updatedAt = Date.now();
  localStorage.setItem(storageKeys.state, JSON.stringify(state));
  localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
  localStorage.setItem("nqPlayerName", profile.display_name);
}

function render(){
  ensureState();
  renderShell();
  renderDashboard();
  renderMap();
  renderSubjects();
  renderBuild();
  renderShield();
  renderQuiz();
  renderPublic();
  renderProfile();
  saveLocal();
}

function renderShell(){
  const player = me();
  const journey = activeJourney();
  $("pageKicker").textContent = journey.theme;
  $("pageTitle").textContent = pageTitles[currentPage] || "Dashboard";
  $("connectionView").textContent = roomCode ? "Online" : "Local";
  $("activeJourneyView").textContent = journey.title;
  $("sideXp").textContent = player.xp;
  $("sideShield").textContent = `${shieldScore(player.shield)}%`;
  $("soundToggle").textContent = soundEnabled ? "Sound On" : "Sound Off";
  document.querySelectorAll("[data-page-link]").forEach(button => {
    const active = button.dataset.pageLink === currentPage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
}

function renderDashboard(){
  const journey = activeJourney();
  const player = me();
  const contexts = allGoalContexts(journey);
  const progress = journeyPercent(player, journey);
  const done = contexts.filter(item => isDone(item.goal, player, journey.id)).length;
  const current = selectedContext();
  const shield = player.shield;

  $("journeyTheme").textContent = journey.theme;
  $("journeyTitle").textContent = journey.title;
  $("journeyGoal").textContent = journey.goal;
  $("progressText").textContent = `${progress}%`;
  $("progressOrb").style.setProperty("--progress", `${progress}%`);
  $("clearedGoals").textContent = done;
  $("totalGoals").textContent = contexts.length;
  $("subjectCount").textContent = journey.subjects.length;
  $("rankView").textContent = rankFor(player.xp);

  if(current){
    $("currentGoalTitle").textContent = current.goal.title;
    $("currentGoalDetail").textContent = current.goal.detail || current.unit.outcome;
    $("completeGoal").textContent = current.goal.kind === "quiz" && !isDone(current.goal, player, journey.id) ? "Open Quiz" : "Check Off";
    $("completeGoal").disabled = isDone(current.goal, player, journey.id);
    $("currentGoalMeta").innerHTML = detailRows([
      ["Subject", current.subject.name],
      ["Unit", current.unit.title],
      ["Reward", `+${current.goal.points} XP`],
      ["State", isDone(current.goal, player, journey.id) ? "Clear" : "Open"]
    ]);
  }

  $("shieldStatusTitle").textContent = shield.active ? "Active" : "Ready";
  $("shieldMeterFill").style.width = `${shieldScore(shield)}%`;
  $("shieldMiniStats").innerHTML = detailRows([
    ["Apps", shield.apps.length],
    ["Sites", shield.websites.length],
    ["Strict", shield.strict ? "On" : "Off"],
    ["Sessions", shield.sessions]
  ]);

  $("dashboardSubjects").innerHTML = journey.subjects.map(subject => {
    const pct = percent(contextsForSubject(subject, journey), player, journey.id);
    return `
      <button type="button" class="progressRow" data-subject="${escapeAttr(subject.id)}">
        <span style="background:${escapeAttr(subject.color)}"></span>
        <div><b>${escapeHTML(subject.name)}</b><small>${escapeHTML(subject.summary)}</small></div>
        <strong>${pct}%</strong>
      </button>
    `;
  }).join("");
  document.querySelectorAll("#dashboardSubjects [data-subject]").forEach(button => {
    button.onclick = () => {
      selectSubject(button.dataset.subject);
      setPage("map");
    };
  });
}

function renderMap(){
  const journey = activeJourney();
  const player = me();
  const subject = journey.subjects.find(item => item.id === selectedSubjectId) || journey.subjects[0];
  if(!subject) return;
  const contexts = contextsForSubject(subject, journey);
  $("mapSubjectTitle").textContent = subject.name;
  $("mapSubjectGoal").textContent = subject.summary;
  $("mapSubjectPercent").textContent = `${percent(contexts, player, journey.id)}%`;

  $("mapSubjects").innerHTML = journey.subjects.map(item => {
    const pct = percent(contextsForSubject(item, journey), player, journey.id);
    return `
      <button type="button" class="subjectButton ${item.id === subject.id ? "active" : ""}" data-map-subject="${escapeAttr(item.id)}">
        <span style="background:${escapeAttr(item.color)}"></span>
        <div><b>${escapeHTML(item.name)}</b><small>${pct}% clear</small></div>
      </button>
    `;
  }).join("");

  const points = contexts.map((context, index) => ({ ...context, point: mapPoint(context, index, contexts.length, subject.units.length) }));
  const lines = [];
  for(let index = 0; index < points.length - 1; index++){
    const a = svgPoint(points[index].point);
    const b = svgPoint(points[index + 1].point);
    const doneLine = isDone(points[index].goal, player, journey.id) && isDone(points[index + 1].goal, player, journey.id);
    const curve = index % 2 ? -48 : 48;
    lines.push(`<path class="routeLine ${doneLine ? "done" : ""}" d="M ${a.x} ${a.y} C ${a.x + 74} ${a.y + curve}, ${b.x - 74} ${b.y - curve}, ${b.x} ${b.y}" />`);
  }
  $("dotLines").innerHTML = lines.join("");
  $("dotNodes").innerHTML = points.map((context, index) => {
    const done = isDone(context.goal, player, journey.id);
    const active = context.goal.id === selectedGoalId;
    return `
      <button type="button" class="mapDot ${done ? "done" : ""} ${active ? "active" : ""} ${context.goal.kind === "quiz" ? "quiz" : ""}"
        data-goal="${escapeAttr(context.goal.id)}"
        aria-label="${escapeAttr(context.goal.title)}"
        style="left:${context.point.x}%;top:${context.point.y}%">
        <span>${dotLabel(context, index)}</span>
      </button>
    `;
  }).join("");

  $("mapUnits").innerHTML = subject.units.map((unit, index) => {
    const pct = percent(contextsForUnit(unit, journey), player, journey.id);
    return `
      <button type="button" class="unitDotRow ${unit.id === selectedUnitId ? "active" : ""}" data-unit="${escapeAttr(unit.id)}">
        <span>${index + 1}</span>
        <div><b>${escapeHTML(unit.title)}</b><small>${pct}% clear</small></div>
      </button>
    `;
  }).join("");

  const selected = selectedContext();
  if(selected){
    const done = isDone(selected.goal, player, journey.id);
    $("selectedGoalTitle").textContent = selected.goal.title;
    $("selectedGoalDetail").textContent = selected.goal.detail || selected.unit.outcome;
    $("selectedGoalRows").innerHTML = detailRows([
      ["Subject", selected.subject.name],
      ["Unit", selected.unit.title],
      ["Type", selected.goal.kind],
      ["Reward", `+${selected.goal.points} XP`],
      ["State", done ? "Clear" : "Open"]
    ]);
    $("mapCompleteGoal").textContent = selected.goal.kind === "quiz" && !done ? "Open Quiz" : "Check Off";
    $("mapCompleteGoal").disabled = done;
  }

  document.querySelectorAll("[data-map-subject]").forEach(button => {
    button.onclick = () => selectSubject(button.dataset.mapSubject);
  });
  document.querySelectorAll("[data-goal]").forEach(button => {
    button.onclick = () => selectGoal(button.dataset.goal);
  });
  document.querySelectorAll("[data-unit]").forEach(button => {
    button.onclick = () => selectUnit(button.dataset.unit);
  });
}

function mapPoint(context, index, total, unitCount){
  const x = total <= 1 ? 52 : 8 + (index / (total - 1)) * 84;
  const lane = 76 / Math.max(1, unitCount);
  const baseY = 12 + context.unitIndex * lane + lane / 2;
  const wobble = [0, 8, -7, 10, -4, 6, -9, 4];
  return { x, y: Math.max(11, Math.min(88, baseY + wobble[index % wobble.length])) };
}

function svgPoint(point){
  return { x: Math.round(point.x / 100 * 1120), y: Math.round(point.y / 100 * 560) };
}

function dotLabel(context, index){
  if(context.goal.kind === "quiz") return "?";
  if(context.goalIndex === context.unit.goals.length - 1) return "B";
  return String(index + 1);
}

function renderSubjects(){
  const journey = activeJourney();
  const player = me();
  const selectedSubject = journey.subjects.find(item => item.id === selectedSubjectId) || journey.subjects[0];
  $("subjectTable").innerHTML = journey.subjects.map(subject => {
    const pct = percent(contextsForSubject(subject, journey), player, journey.id);
    return `
      <button type="button" class="tableRow ${subject.id === selectedSubject?.id ? "active" : ""}" data-subject-row="${escapeAttr(subject.id)}">
        <span style="background:${escapeAttr(subject.color)}"></span>
        <div><b>${escapeHTML(subject.name)}</b><small>${escapeHTML(subject.summary)}</small></div>
        <strong>${pct}%</strong>
      </button>
    `;
  }).join("");

  $("unitPanelTitle").textContent = selectedSubject?.name || "Selected subject";
  $("unitList").innerHTML = selectedSubject ? selectedSubject.units.map((unit, unitIndex) => `
    <article class="unitSection">
      <header><span>${unitIndex + 1}</span><div><b>${escapeHTML(unit.title)}</b><small>${escapeHTML(unit.outcome)}</small></div></header>
      <div>
        ${unit.goals.map(goal => `
          <button type="button" class="goalLine ${isDone(goal, player, journey.id) ? "done" : ""}" data-subject-goal="${escapeAttr(goal.id)}">
            <span></span>
            <div><b>${escapeHTML(goal.title)}</b><small>${escapeHTML(goal.kind)} / +${goal.points} XP</small></div>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("") : `<div class="empty">No subject selected.</div>`;

  document.querySelectorAll("[data-subject-row]").forEach(button => {
    button.onclick = () => selectSubject(button.dataset.subjectRow);
  });
  document.querySelectorAll("[data-subject-goal]").forEach(button => {
    button.onclick = () => {
      selectGoal(button.dataset.subjectGoal);
      setPage("map");
    };
  });
}

function renderBuild(){
  $("presetRows").innerHTML = journeyTemplates.map(template => {
    const units = template.subjects.reduce((sum, subject) => sum + subject.units.length, 0);
    const goals = template.subjects.reduce((sum, subject) => sum + subject.units.reduce((inner, unit) => inner + unit.goals.length, 0), 0);
    return `
      <button type="button" class="presetRow" data-preset="${escapeAttr(template.templateId)}">
        <span></span>
        <div><b>${escapeHTML(template.title)}</b><small>${template.subjects.length} subjects / ${units} units / ${goals} goals</small></div>
      </button>
    `;
  }).join("");
  document.querySelectorAll("[data-preset]").forEach(button => {
    button.onclick = () => addPresetJourney(button.dataset.preset);
  });
}

function renderShield(){
  const shield = me().shield;
  const score = shieldScore(shield);
  const locked = isShieldLocked();
  $("shieldSubtitle").textContent = shield.active ? (locked ? "Strict shield is active." : "Shield is active.") : "Shield is ready.";
  $("shieldScore").textContent = score;
  $("activateShield").disabled = shield.active;
  $("endShield").disabled = !shield.active;
  $("strictMode").checked = shield.strict;
  $("strictMode").disabled = locked;

  $("shieldPresetRows").innerHTML = shieldPresets.map(preset => `
    <button type="button" class="presetRow" data-shield-preset="${escapeAttr(preset.id)}" ${locked ? "disabled" : ""}>
      <span></span>
      <div><b>${escapeHTML(preset.title)}</b><small>${preset.apps.length} apps / ${preset.websites.length} sites</small></div>
    </button>
  `).join("");
  $("appList").innerHTML = renderCleanList(shield.apps, "app", locked);
  $("siteList").innerHTML = renderCleanList(shield.websites, "site", locked);
  $("allowList").innerHTML = renderCleanList(shield.allow, "allow", locked);
  $("ruleList").innerHTML = shield.rules.map(rule => `
    <button type="button" class="ruleRow ${rule.enabled ? "enabled" : ""}" data-rule="${escapeAttr(rule.id)}" ${locked ? "disabled" : ""}>
      <span></span>
      <div><b>${escapeHTML(rule.title)}</b><small>${escapeHTML(rule.detail)}</small></div>
      <strong>+${rule.weight}</strong>
    </button>
  `).join("");

  document.querySelectorAll("[data-shield-preset]").forEach(button => button.onclick = () => applyShieldPreset(button.dataset.shieldPreset));
  document.querySelectorAll("[data-remove-item]").forEach(button => button.onclick = () => removeShieldItem(button.dataset.list, button.dataset.removeItem));
  document.querySelectorAll("[data-rule]").forEach(button => button.onclick = () => toggleShieldRule(button.dataset.rule));
}

function renderCleanList(items, type, locked){
  return items.length ? items.map(item => `
    <div class="cleanRow">
      <span></span>
      <b>${escapeHTML(item)}</b>
      <button type="button" data-list="${escapeAttr(type)}" data-remove-item="${escapeAttr(item)}" ${locked ? "disabled" : ""}>Remove</button>
    </div>
  `).join("") : `<div class="empty">None added.</div>`;
}

function renderQuiz(){
  const journey = activeJourney();
  const player = me();
  const quizzes = allGoalContexts(journey).filter(item => item.goal.kind === "quiz" && item.goal.quiz);
  let context = selectedQuizId ? findContext(selectedQuizId, journey) : null;
  if(!context || context.goal.kind !== "quiz"){
    context = quizzes.find(item => !isDone(item.goal, player, journey.id)) || quizzes[0] || null;
    selectedQuizId = context?.goal.id || "";
  }

  if(!context){
    $("quizContext").textContent = journey.title;
    $("quizTitle").textContent = "No quiz gates";
    $("quizQuestion").textContent = "Create a journey with quiz gates.";
    $("answerList").innerHTML = "";
  }else{
    const done = isDone(context.goal, player, journey.id);
    $("quizContext").textContent = `${context.subject.name} / ${context.unit.title}`;
    $("quizTitle").textContent = context.goal.title;
    $("quizQuestion").textContent = context.goal.quiz.question;
    $("answerList").innerHTML = context.goal.quiz.options.map((answer, index) => `
      <button type="button" class="${done && index === context.goal.quiz.answer ? "correct" : ""}" data-answer="${index}" data-quiz="${escapeAttr(context.goal.id)}">
        ${escapeHTML(answer)}
      </button>
    `).join("");
  }

  $("quizQueue").innerHTML = quizzes.length ? quizzes.map(item => `
    <button type="button" class="quizRow ${item.goal.id === selectedQuizId ? "active" : ""} ${isDone(item.goal, player, journey.id) ? "done" : ""}" data-quiz-jump="${escapeAttr(item.goal.id)}">
      <span></span>
      <div><b>${escapeHTML(item.goal.title)}</b><small>${escapeHTML(item.subject.name)} / ${escapeHTML(item.unit.title)}</small></div>
    </button>
  `).join("") : `<div class="empty">No quiz gates.</div>`;

  document.querySelectorAll("[data-answer]").forEach(button => {
    button.onclick = () => answerQuiz(button.dataset.quiz, Number(button.dataset.answer));
  });
  document.querySelectorAll("[data-quiz-jump]").forEach(button => {
    button.onclick = () => {
      const context = findContext(button.dataset.quizJump);
      if(context){
        selectedQuizId = context.goal.id;
        setCursor(context);
        render();
      }
    };
  });
}

function renderPublic(){
  const journey = activeJourney();
  const players = Object.values(state.players || {}).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  $("roomStats").innerHTML = detailRows([
    ["Journey", journey.title],
    ["Subjects", journey.subjects.length],
    ["Goals", allGoalContexts(journey).length],
    ["Mode", roomCode ? "Online" : "Local"]
  ]);
  $("players").innerHTML = players.length ? players.map(player => `
    <div class="playerRow">
      <div class="avatar" style="background:${escapeAttr(player.color)}">${escapeHTML(player.avatar || initials(player.name))}</div>
      <div><b>${escapeHTML(player.name || "Player")}${player.id === clientId ? " (you)" : ""}</b><small>${journeyPercent(player, journey)}% / ${player.xp || 0} XP / ${player.online ? "online" : "away"}</small></div>
    </div>
  `).join("") : `<div class="empty">No players yet.</div>`;
  $("activityFeed").innerHTML = state.activity.length ? state.activity.slice(0, 24).map(item => `
    <div class="activityRow"><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.text)}</small></div>
  `).join("") : `<div class="empty">No activity yet.</div>`;
}

function renderProfile(){
  setFieldValue("playerName", profile.display_name || "");
  setFieldValue("avatar", profile.avatar || "");
  setFieldValue("target", profile.target || "");
  setFieldValue("bio", profile.bio || "");
  $("avatarPreview").textContent = profile.avatar || initials(profile.display_name);
  $("profileNameView").textContent = profile.display_name || "Player";
  $("profileTargetView").textContent = profile.target || "Local player";
}

function detailRows(rows){
  return rows.map(([label, value]) => `<div><span>${escapeHTML(label)}</span><b>${escapeHTML(value)}</b></div>`).join("");
}

function setFieldValue(id, value){
  const field = $(id);
  if(field && document.activeElement !== field) field.value = value;
}

function rankFor(xp){
  const value = Number(xp || 0);
  if(value >= 2400) return "Legend";
  if(value >= 1500) return "Master";
  if(value >= 900) return "Ace";
  if(value >= 450) return "Ranger";
  if(value >= 160) return "Scout";
  return "Rookie";
}

function selectSubject(subjectId){
  const journey = activeJourney();
  const subject = journey.subjects.find(item => item.id === subjectId);
  if(!subject) return;
  selectedSubjectId = subject.id;
  const first = contextsForSubject(subject, journey).find(item => !isDone(item.goal, me(), journey.id)) || contextsForSubject(subject, journey)[0];
  if(first) setCursor(first);
  message(`${subject.name} selected.`);
  playSound("tap");
  render();
  pushState();
}

function selectUnit(unitId){
  const journey = activeJourney();
  const unit = journey.subjects.flatMap(subject => subject.units).find(item => item.id === unitId);
  if(!unit) return;
  const first = contextsForUnit(unit, journey).find(item => !isDone(item.goal, me(), journey.id)) || contextsForUnit(unit, journey)[0];
  if(first) setCursor(first);
  message(`${unit.title} selected.`);
  playSound("tap");
  render();
  pushState();
}

function selectGoal(goalId){
  const context = findContext(goalId);
  if(!context) return;
  setCursor(context);
  message(context.goal.title);
  playSound("tap");
  render();
  pushState();
}

function setCursor(context){
  selectedSubjectId = context.subject.id;
  selectedUnitId = context.unit.id;
  selectedGoalId = context.goal.id;
  if(context.goal.kind === "quiz") selectedQuizId = context.goal.id;
  progressFor(me(), context.journey.id).cursor = {
    subjectId: context.subject.id,
    unitId: context.unit.id,
    goalId: context.goal.id
  };
}

function completeSelectedGoal(){
  const context = selectedContext();
  if(!context) return;
  if(context.goal.kind === "quiz" && !isDone(context.goal, me(), context.journey.id)){
    selectedQuizId = context.goal.id;
    setPage("quiz");
    message("Clear the quiz gate.");
    return;
  }
  completeGoal(context);
}

function completeGoal(context){
  const player = me();
  const progress = progressFor(player, context.journey.id);
  if(progress.done.includes(context.goal.id)){
    message("Already clear.");
    return;
  }
  progress.done.push(context.goal.id);
  player.xp += context.goal.points || 12;
  player.coins += context.goal.kind === "quiz" ? 6 : 3;
  player.streak += 1;
  addActivity(`cleared ${context.goal.title}`);
  const next = nextOpenAfter(context) || firstOpenContext(player, context.journey);
  if(next) setCursor(next);
  if(journeyPercent(player, context.journey) === 100){
    pop("Journey Clear", `${context.journey.title} reached its final goal.`);
    addActivity(`finished ${context.journey.title}`);
    playSound("level");
    confetti(90);
  }else{
    playSound("complete");
    confetti(18);
  }
  render();
  pushState();
}

function nextOpenAfter(context){
  const contexts = allGoalContexts(context.journey);
  const index = contexts.findIndex(item => item.goal.id === context.goal.id);
  return contexts.slice(index + 1).find(item => !isDone(item.goal, me(), context.journey.id))
    || contexts.find(item => !isDone(item.goal, me(), context.journey.id))
    || null;
}

function resetProgress(){
  if(!confirm("Reset your progress on this journey?")) return;
  const player = me();
  const progress = progressFor(player, activeJourney().id);
  progress.done = [];
  progress.answers = {};
  progress.cursor = null;
  player.streak = 0;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  ensureSelection();
  message("Progress reset.");
  render();
  pushState();
}

function answerQuiz(goalId, answer){
  const context = findContext(goalId);
  if(!context?.goal.quiz) return;
  const progress = progressFor(me(), context.journey.id);
  progress.answers[goalId] = answer;
  if(answer === context.goal.quiz.answer){
    selectedQuizId = context.goal.id;
    setCursor(context);
    message("Correct.");
    completeGoal(context);
  }else{
    me().streak = 0;
    message("Not yet.");
    playSound("miss");
    render();
    pushState();
  }
}

function addPresetJourney(templateId){
  const template = journeyTemplates.find(item => item.templateId === templateId || item.id === templateId);
  if(!template) return;
  const duplicate = state.journeys.some(journey => journey.id === template.id);
  const journey = normalizeJourney({ ...clone(template), id: duplicate ? uid("journey") : template.id, createdAt: Date.now() });
  state.journeys.push(journey);
  state.activeJourneyId = journey.id;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  ensureSelection();
  addActivity(`added ${journey.title}`);
  setPage("map");
  message(`${journey.title} added.`);
  playSound("start");
  render();
  pushState();
}

function parseOutline(text){
  const subjects = [];
  let currentSubject = null;
  let currentUnit = null;
  const ensureSubject = () => {
    if(!currentSubject){
      currentSubject = subjectSeed("Main", "Clear this portion.", []);
      subjects.push(currentSubject);
    }
    return currentSubject;
  };
  const ensureUnit = () => {
    ensureSubject();
    if(!currentUnit){
      currentUnit = unitSeed("Starter Unit", "Finish the starter goals.", []);
      currentSubject.units.push(currentUnit);
    }
    return currentUnit;
  };

  String(text || "").split("\n").map(line => line.trim()).filter(Boolean).forEach(line => {
    const subjectMatch = line.match(/^subject\s*:\s*(.+)$/i);
    const unitMatch = line.match(/^unit\s*:\s*(.+)$/i);
    if(subjectMatch){
      currentSubject = subjectSeed(subjectMatch[1].trim(), `Complete ${subjectMatch[1].trim()} portion.`, []);
      currentUnit = null;
      subjects.push(currentSubject);
      return;
    }
    if(unitMatch){
      ensureSubject();
      currentUnit = unitSeed(unitMatch[1].trim(), `Finish ${unitMatch[1].trim()} goals.`, []);
      currentSubject.units.push(currentUnit);
      return;
    }
    if(line.startsWith("?")){
      const parts = line.slice(1).split("|").map(part => part.trim()).filter(Boolean);
      const title = parts[0] || "Quiz Gate";
      const question = parts[1] || title;
      const options = parts.slice(2, 5);
      const answer = Number(parts[5] || 0);
      ensureUnit().goals.push(quizSeed(title, question, options.length >= 2 ? options : ["Yes", "No"], Number.isFinite(answer) ? answer : 0));
      return;
    }
    const title = line.replace(/^[-*]\s*/, "");
    const kind = inferKind(title);
    ensureUnit().goals.push(goalSeed(title, kind, inferPoints(kind), `Clear this ${kind} node.`));
  });

  return subjects.map(subject => ({
    ...subject,
    units: subject.units.map(unit => ({ ...unit, goals: unit.goals.filter(Boolean) })).filter(unit => unit.goals.length)
  })).filter(subject => subject.units.length);
}

function inferKind(title){
  const text = String(title || "").toLowerCase();
  if(text.includes("2m")) return "2m";
  if(text.includes("5m")) return "5m";
  if(text.includes("diagram")) return "diagram";
  if(text.includes("map")) return "map";
  if(text.includes("recall")) return "recall";
  if(text.includes("formula")) return "formula";
  if(text.includes("practice") || text.includes("solve")) return "practice";
  if(text.includes("rule")) return "rule";
  return "task";
}

function createCustomJourney(){
  const subjects = parseOutline($("customOutline").value);
  if(!subjects.length){
    message("Add at least one subject, unit, and goal.");
    return;
  }
  const journey = normalizeJourney({
    id: uid("journey"),
    title: $("customTitle").value.trim() || "Custom Journey",
    goal: $("customGoal").value.trim() || "Finish every node.",
    theme: $("customTheme").value,
    createdAt: Date.now(),
    subjects
  });
  state.journeys.push(journey);
  state.activeJourneyId = journey.id;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  ensureSelection();
  addActivity(`published ${journey.title}`);
  setPage("map");
  message("Journey published.");
  playSound("complete");
  render();
  pushState();
}

function previewJourney(){
  const subjects = parseOutline($("customOutline").value);
  const unitCount = subjects.reduce((sum, subject) => sum + subject.units.length, 0);
  const goalCount = subjects.reduce((sum, subject) => sum + subject.units.reduce((inner, unit) => inner + unit.goals.length, 0), 0);
  $("shapePreview").innerHTML = detailRows([
    ["Subjects", subjects.length],
    ["Units", unitCount],
    ["Goals", goalCount],
    ["Shape", subjects.length ? "Ready" : "Incomplete"]
  ]);
  message(subjects.length ? "Shape ready." : "Shape incomplete.");
}

function loadOutline(){
  $("customTitle").value = "10th Portion Quest";
  $("customGoal").value = "Complete every subject, unit, answer frame, recall round, and quiz gate.";
  $("customTheme").value = "Class 10";
  $("customOutline").value = outlineSample;
  previewJourney();
}

function applyShieldPreset(presetId){
  const preset = shieldPresets.find(item => item.id === presetId);
  if(!preset || isShieldLocked()) return;
  const shield = me().shield;
  shield.apps = uniqueList([...shield.apps, ...preset.apps]);
  shield.websites = uniqueList([...shield.websites, ...preset.websites]);
  shield.allow = uniqueList([...shield.allow, ...preset.allow]);
  me().coins += 3;
  message(`${preset.title} applied.`);
  playSound("complete");
  render();
  pushState();
}

function addShieldItem(type, value){
  const clean = String(value || "").trim();
  if(!clean){
    message("Add a name first.");
    return;
  }
  if(isShieldLocked()){
    message("Strict shield is active.");
    return;
  }
  const shield = me().shield;
  const key = shieldKey(type);
  shield[key] = uniqueList([...shield[key], clean]);
  message(`${clean} added.`);
  playSound("tap");
  render();
  pushState();
}

function removeShieldItem(type, value){
  if(isShieldLocked()){
    message("Strict shield is active.");
    return;
  }
  const shield = me().shield;
  const key = shieldKey(type);
  shield[key] = shield[key].filter(item => item !== value);
  message(`${value} removed.`);
  playSound("tap");
  render();
  pushState();
}

function shieldKey(type){
  if(type === "site") return "websites";
  if(type === "allow") return "allow";
  return "apps";
}

function toggleShieldRule(ruleId){
  if(isShieldLocked()){
    message("Strict shield is active.");
    return;
  }
  const rule = me().shield.rules.find(item => item.id === ruleId);
  if(!rule) return;
  rule.enabled = !rule.enabled;
  message(`${rule.title} ${rule.enabled ? "on" : "off"}.`);
  playSound("tap");
  render();
  pushState();
}

function setStrictMode(enabled){
  if(isShieldLocked()){
    renderShield();
    message("Strict shield is active.");
    return;
  }
  me().shield.strict = Boolean(enabled);
  message(enabled ? "Strict mode on." : "Strict mode off.");
  playSound("tap");
  render();
  pushState();
}

function activateShield(){
  const player = me();
  if(player.shield.active) return;
  player.shield.active = true;
  player.shield.sessions += 1;
  const score = shieldScore(player.shield);
  player.xp += Math.max(10, Math.round(score / 2));
  player.coins += Math.max(2, Math.round(score / 24));
  addActivity("activated a distraction shield");
  message("Shield active.");
  playSound("level");
  confetti(28);
  render();
  pushState();
}

function endShield(){
  const shield = me().shield;
  if(!shield.active) return;
  shield.active = false;
  message("Shield ended.");
  playSound("pause");
  render();
  pushState();
}

function addActivity(text){
  state.activity.unshift({ id: uid("activity"), name: profile.display_name || "Player", text, at: Date.now() });
  state.activity = state.activity.slice(0, 80);
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

  const localPlayer = clone(me());
  const { data, error } = await supabase
    .from("game_rooms")
    .select("state,room_name")
    .eq("room_code", PUBLIC_PATH_CODE)
    .maybeSingle();
  if(error){
    message(error.message);
    return;
  }
  if(data?.state){
    syncingRemote = true;
    state = normalizeState(data.state);
    state.players[clientId] = mergePlayer(localPlayer, state.players?.[clientId]);
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

  ensureState();
  channel = supabase
    .channel(`journey:${PUBLIC_PATH_CODE}`, { config: { presence: { key: clientId } } })
    .on("presence", { event: "sync" }, () => {
      const online = Object.values(channel.presenceState()).flat();
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
      const local = clone(me());
      state = normalizeState(payload.new.state);
      state.players[clientId] = mergePlayer(local, state.players?.[clientId]);
      ensureState();
      syncingRemote = false;
      render();
    })
    .subscribe(async status => {
      if(status === "SUBSCRIBED"){
        await channel.track({ id: clientId, name: profile.display_name, at: Date.now() });
        lastOnlineCount = 1;
        addActivity("entered the public room");
        message("Entered public room.");
        playSound("online");
        render();
        pushState();
      }
    });
}

function mergePlayer(localPlayer, remotePlayer){
  const merged = { ...(remotePlayer || {}), ...(localPlayer || {}), id: clientId, online: true };
  normalizePlayer(merged);
  return merged;
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
  currentPage = pages.includes(pageAliases[page] || page) ? (pageAliases[page] || page) : "dashboard";
  document.querySelectorAll("[data-page]").forEach(section => {
    section.classList.toggle("active", section.dataset.page === currentPage);
  });
  if(push && window.location.hash !== `#${currentPage}`) history.pushState(null, "", `#${currentPage}`);
  renderShell();
}

function pageFromHash(){
  const page = window.location.hash.replace("#", "");
  return pageAliases[page] || (pages.includes(page) ? page : "dashboard");
}

function initials(name){
  return String(name || "NQ").trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "NQ";
}

function escapeHTML(str){
  return String(str ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function escapeAttr(str){
  return escapeHTML(str).replace(/`/g, "&#096;");
}

function message(text){
  $("message").textContent = text;
}

function pop(title, text){
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  $("modal").classList.add("show");
}

function confetti(count = 40){
  const box = $("confetti");
  const palette = ["#d97706", "#2563eb", "#7c3aed", "#0f766e", "#db2777", "#16a34a"];
  for(let i = 0; i < count; i++){
    const piece = document.createElement("i");
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = palette[Math.floor(Math.random() * palette.length)];
    piece.style.animationDelay = Math.random() * 0.35 + "s";
    box.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

function setSoundEnabled(enabled){
  soundEnabled = enabled;
  localStorage.setItem(storageKeys.sound, enabled ? "on" : "off");
  renderShell();
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
      toggle: [[440, 0.05], [660, 0.08]],
      tap: [[520, 0.04]],
      start: [[392, 0.05], [523, 0.06], [659, 0.09]],
      pause: [[330, 0.05], [247, 0.08]],
      complete: [[523, 0.05], [659, 0.07], [784, 0.12]],
      quiz: [[587, 0.05], [740, 0.08], [988, 0.1]],
      level: [[659, 0.07], [880, 0.08], [1175, 0.16], [1318, 0.18]],
      miss: [[220, 0.08], [174, 0.12]],
      online: [[440, 0.05], [554, 0.05], [659, 0.08]]
    };
    const notes = patterns[kind] || patterns.tap;
    let offset = 0;
    notes.forEach(([freq, duration]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "miss" ? "triangle" : kind === "quiz" ? "square" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + duration + 0.02);
      offset += duration * 0.82;
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

  $("completeGoal").onclick = completeSelectedGoal;
  $("mapCompleteGoal").onclick = completeSelectedGoal;
  $("mapResetProgress").onclick = resetProgress;
  $("createJourney").onclick = createCustomJourney;
  $("previewJourney").onclick = previewJourney;
  $("loadOutline").onclick = loadOutline;
  $("activateShield").onclick = activateShield;
  $("endShield").onclick = endShield;
  $("strictMode").onchange = event => setStrictMode(event.target.checked);
  $("addApp").onclick = () => {
    addShieldItem("app", $("appInput").value);
    $("appInput").value = "";
  };
  $("addSite").onclick = () => {
    addShieldItem("site", $("siteInput").value);
    $("siteInput").value = "";
  };
  $("addAllow").onclick = () => {
    addShieldItem("allow", $("allowInput").value);
    $("allowInput").value = "";
  };
  $("joinPublic").onclick = joinPublicPath;
  $("saveProfile").onclick = updateProfileFromInputs;
  $("soundToggle").onclick = () => setSoundEnabled(!soundEnabled);
  $("closeModal").onclick = () => $("modal").classList.remove("show");
}

bind();
setPage(currentPage, false);
render();
registerServiceWorker();
message(hasSupabase ? "Ready. Enter Public to sync Android and PC." : "Solo mode. Add Supabase env values for public sync.");
