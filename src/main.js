import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const PUBLIC_PATH_CODE = "PUBLIC-JOURNEY-PATH";
const colors = ["#2563eb", "#0f766e", "#7c3aed", "#d97706", "#db2777", "#16a34a", "#0891b2", "#dc2626"];
const pages = ["overview", "journeys", "quiz", "public", "profile"];
const pageAliases = { path: "overview", create: "journeys" };
const storageKeys = {
  client: "nqJourneyClientId",
  state: "nqJourneyState",
  profile: "nqJourneyProfile",
  sound: "nqJourneySound"
};

const outlineSample = `Subject: Biology
Unit: Life Processes
- 2m question: nutrition keywords
- 3m recall: respiration steps
- 5m answer frame: digestion
? Quiz | What carries oxygen in blood? | Red blood cells | Platelets | Starch | 0
Unit: Heredity
- 2m question: dominant trait
- 5m diagram: Mendel cross

Subject: Grammar
Unit: Tenses
- 2m drill: present perfect
- 5m worksheet: mixed tense edits
? Quiz | Which tense uses has or have? | Present perfect | Simple past | Future simple | 0`;

const journeyTemplates = [
  {
    id: "journey-10th-portion",
    templateId: "10th-portion",
    title: "10th Portion Quest",
    finalGoal: "Complete the full portion across subjects, units, 2m and 5m questions, recall rounds, and quiz gates.",
    theme: "Class 10",
    days: 45,
    subjects: [
      subject("Biology", "Finish diagrams, processes, keywords, and memory checks.", [
        unit("Life Processes", "Nutrition, respiration, transport, excretion", [
          task("2m question: nutrition keywords", "2m", 2, "Answer one tiny definition without opening notes.", 8),
          task("Diagram pass: digestive system labels", "diagram", 12, "Draw once, label once, hide labels once.", 18),
          task("3m recall: respiration steps", "recall", 6, "Speak the order before writing the full answer.", 12),
          task("5m answer frame: transport in humans", "5m", 15, "Write the skeleton first, then fill details.", 22),
          quizGoal("Bio quiz: oxygen carrier", "What carries oxygen in human blood?", ["Red blood cells", "Platelets", "Starch"], 0)
        ]),
        unit("Heredity", "Traits, variation, Mendel crosses", [
          task("2m question: dominant trait", "2m", 2, "Make one crisp definition card.", 8),
          task("Punnett square warmup", "practice", 10, "Solve one monohybrid cross slowly.", 16),
          task("3m recall: inherited vs acquired", "recall", 6, "Say the difference in your own words.", 12),
          task("5m answer frame: sex determination", "5m", 14, "Build the answer with labelled steps.", 22),
          quizGoal("Bio quiz: Mendel", "In a monohybrid cross, what does F1 usually show?", ["Dominant trait", "Both parents equally", "No trait"], 0)
        ]),
        unit("Environment", "Food chains, ecosystem balance, waste", [
          task("2m question: trophic level", "2m", 2, "Write one example chain.", 8),
          task("Map: producer to decomposer", "map", 8, "Make a tiny food web.", 14),
          task("3m recall: ozone protection", "recall", 6, "Explain the danger in two lines.", 12),
          task("5m answer frame: waste management", "5m", 14, "Point, reason, example.", 22),
          quizGoal("Bio quiz: energy flow", "Energy in a food chain mainly moves from:", ["Producers upward", "Carnivores downward", "Decomposers to sunlight"], 0)
        ])
      ]),
      subject("Physics", "Clear formulas, diagrams, numericals, and quick tests.", [
        unit("Light", "Reflection, refraction, mirrors, lenses", [
          task("2m question: laws of reflection", "2m", 2, "Write both laws from memory.", 8),
          task("Ray diagram: concave mirror", "diagram", 12, "Draw one case and label image position.", 18),
          task("Formula card: lens equation", "formula", 8, "Write formula, symbols, units.", 14),
          task("5m numerical: magnification", "5m", 14, "Solve with steps and final unit.", 22),
          quizGoal("Physics quiz: lens", "A convex lens generally:", ["Converges light", "Always absorbs light", "Splits magnets"], 0)
        ]),
        unit("Electricity", "Ohm law, resistance, power, circuits", [
          task("2m question: Ohm law", "2m", 2, "Write V, I, R relation with units.", 8),
          task("Circuit sketch: series vs parallel", "diagram", 10, "Draw both and mark current paths.", 18),
          task("3m recall: factors of resistance", "recall", 6, "List and explain one factor.", 12),
          task("5m numerical: electric power", "5m", 15, "Use P = VI and show substitution.", 22),
          quizGoal("Physics quiz: unit", "The SI unit of resistance is:", ["Ohm", "Watt", "Coulomb"], 0)
        ]),
        unit("Magnetic Effects", "Field lines, motor, generator, safety", [
          task("2m question: field line rule", "2m", 2, "State one property of magnetic field lines.", 8),
          task("Diagram: solenoid field", "diagram", 12, "Mark direction and poles.", 18),
          task("3m recall: Fleming rule", "recall", 6, "Use fingers and say each direction.", 12),
          task("5m answer frame: electric motor", "5m", 15, "Function, principle, parts, working.", 22),
          quizGoal("Physics quiz: field", "Magnetic field lines outside a magnet go from:", ["North to south", "South to north", "Center to edge"], 0)
        ])
      ]),
      subject("Prose", "Build chapter memory, themes, character points, and evidence.", [
        unit("Chapter Summaries", "Plot, speaker, turning points", [
          task("2m skim: chapter headings", "2m", 2, "Read only headings and first lines.", 8),
          task("Story spine: 5 beats", "map", 9, "Beginning, problem, turn, result, message.", 16),
          task("3m recall: main conflict", "recall", 6, "Say it without the book.", 12),
          task("5m answer frame: theme", "5m", 14, "Claim, scene, quote memory, explanation.", 22),
          quizGoal("Prose quiz: theme", "A theme answer should mainly include:", ["Message plus evidence", "Only plot names", "Only grammar rules"], 0)
        ]),
        unit("Characters", "Traits, changes, motives, evidence", [
          task("2m question: one trait", "2m", 2, "Pick one character and one trait.", 8),
          task("Evidence hunt: two moments", "evidence", 10, "Mark scenes that prove the trait.", 16),
          task("3m recall: motive chain", "recall", 6, "Why did the character act that way?", 12),
          task("5m answer frame: character sketch", "5m", 14, "Trait, proof, change, closing line.", 22),
          quizGoal("Prose quiz: evidence", "Good textual evidence is:", ["A relevant moment from the text", "A random opinion", "A spelling rule"], 0)
        ]),
        unit("Textual Answers", "Short answers, long answers, quote memory", [
          task("2m answer: direct question", "2m", 2, "Write one two-line answer.", 8),
          task("5m answer frame: value point", "5m", 15, "Make point, explain, connect to text.", 22),
          task("Quote memory: three anchors", "recall", 8, "Remember keywords, not full paragraphs.", 14),
          task("Self-check: underline command words", "review", 6, "Circle why, how, describe, compare.", 12),
          quizGoal("Prose quiz: command word", "If a question says compare, you should:", ["Show similarities and differences", "Write only one side", "Skip evidence"], 0)
        ])
      ]),
      subject("Grammar", "Turn rules into fast drills with feedback.", [
        unit("Tenses", "Present, past, future, perfect forms", [
          task("2m drill: present perfect", "2m", 2, "Make three has/have sentences.", 8),
          task("Rule card: signal words", "rule", 8, "Already, since, for, yesterday, tomorrow.", 14),
          task("3m recall: tense table", "recall", 6, "Say one example per tense.", 12),
          task("5m worksheet: mixed tense edits", "5m", 15, "Correct five sentences.", 22),
          quizGoal("Grammar quiz: perfect", "Which tense uses has or have plus past participle?", ["Present perfect", "Simple past", "Future simple"], 0)
        ]),
        unit("Voice and Speech", "Active/passive, direct/indirect", [
          task("2m question: object spotting", "2m", 2, "Find subject, verb, object in one line.", 8),
          task("Rule card: passive pattern", "rule", 8, "Object + be + V3 + by + subject.", 14),
          task("3m recall: reporting verbs", "recall", 6, "Said, told, asked, ordered.", 12),
          task("5m worksheet: transform five", "5m", 15, "Do two passive, three speech.", 22),
          quizGoal("Grammar quiz: passive", "In passive voice, the focus moves to the:", ["Receiver of action", "Dictionary meaning", "Punctuation only"], 0)
        ]),
        unit("Editing", "Error spotting, punctuation, sentence repair", [
          task("2m drill: article errors", "2m", 2, "Fix a/an/the in three lines.", 8),
          task("Rule card: subject-verb agreement", "rule", 8, "Singular with singular verb.", 14),
          task("3m recall: comma jobs", "recall", 6, "List two comma uses.", 12),
          task("5m worksheet: edit passage", "5m", 15, "Find five errors and label rule.", 22),
          quizGoal("Grammar quiz: agreement", "The sentence 'He go home' needs:", ["A singular verb form", "A new adjective", "No change"], 0)
        ])
      ]),
      subject("History", "Turn chapters into timelines, causes, effects, and maps.", [
        unit("Nationalism", "Events, leaders, causes, symbols", [
          task("2m question: one event", "2m", 2, "Write date, place, result.", 8),
          task("Timeline: five markers", "map", 10, "Order events left to right.", 16),
          task("3m recall: cause and effect", "recall", 6, "Say one cause and one result.", 12),
          task("5m answer frame: movement analysis", "5m", 15, "Cause, action, people, impact.", 22),
          quizGoal("History quiz: timeline", "A timeline mainly helps you see:", ["Order of events", "Only spelling", "Only diagrams"], 0)
        ]),
        unit("Industrialization", "Factories, workers, markets, change", [
          task("2m question: proto-industrialisation", "2m", 2, "Make one definition card.", 8),
          task("Map: old work to factory", "map", 10, "Draw a before/after flow.", 16),
          task("3m recall: worker condition", "recall", 6, "Say two problems workers faced.", 12),
          task("5m answer frame: impact", "5m", 15, "Economic, social, market points.", 22),
          quizGoal("History quiz: factories", "Industrialization is closely linked with:", ["Machine production", "Only farming rituals", "No markets"], 0)
        ]),
        unit("Print Culture", "Books, reform, debate, nationalism", [
          task("2m question: print revolution", "2m", 2, "Write one effect of printing.", 8),
          task("Timeline: print spread", "map", 9, "Mark invention, spread, impact.", 16),
          task("3m recall: reform debate", "recall", 6, "Say how print spread ideas.", 12),
          task("5m answer frame: nationalism link", "5m", 15, "Idea spread, public debate, identity.", 22),
          quizGoal("History quiz: print", "Print culture made it easier to:", ["Share ideas widely", "Stop all debate", "Erase books"], 0)
        ])
      ]),
      subject("Maths", "Keep formulas visible and make practice less scary.", [
        unit("Algebra", "Polynomials, pairs of equations, AP", [
          task("2m question: formula recall", "2m", 2, "Write one identity from memory.", 8),
          task("Warmup: two easy sums", "practice", 8, "Choose very low friction problems.", 14),
          task("3m recall: steps before solving", "recall", 6, "State method before numbers.", 12),
          task("5m problem: linear equations", "5m", 15, "Solve and check substitution.", 22),
          quizGoal("Math quiz: identity", "The identity (a+b)^2 equals:", ["a^2 + 2ab + b^2", "a^2 - 2ab + b^2", "a + b^2"], 0)
        ]),
        unit("Geometry", "Triangles, circles, constructions", [
          task("2m question: theorem name", "2m", 2, "Match theorem with one diagram.", 8),
          task("Diagram: similar triangles", "diagram", 10, "Mark equal angles and ratios.", 16),
          task("3m recall: proof steps", "recall", 6, "Speak proof order once.", 12),
          task("5m problem: circle tangent", "5m", 15, "Write given, to prove, construction.", 22),
          quizGoal("Math quiz: tangent", "A radius to a tangent at point of contact is:", ["Perpendicular", "Parallel", "Unrelated"], 0)
        ]),
        unit("Statistics", "Mean, median, mode, probability", [
          task("2m question: mean formula", "2m", 2, "Write formula and units.", 8),
          task("Table cleanup: grouped data", "practice", 10, "Mark class, frequency, midpoint.", 16),
          task("3m recall: median steps", "recall", 6, "Say cumulative frequency steps.", 12),
          task("5m problem: probability", "5m", 14, "Favorable over total, simplify.", 22),
          quizGoal("Math quiz: probability", "Probability is usually written as:", ["Favorable outcomes / total outcomes", "Total outcomes / marks", "Only a diagram"], 0)
        ])
      ])
    ]
  },
  {
    id: "journey-exam-rescue",
    templateId: "exam-rescue",
    title: "Exam Rescue Board",
    finalGoal: "Finish a compact revision loop with weak zones, practice, mistakes, and final recall.",
    theme: "Exam",
    days: 10,
    subjects: [
      subject("Sort", "Get the portion out of your head and onto a board.", [
        unit("Syllabus Sweep", "Know what exists", [
          task("2m dump: chapters you remember", "2m", 2, "Write rough chapter names.", 8),
          task("Mark red, yellow, green topics", "map", 12, "Red means unclear, yellow means shaky.", 18),
          task("Pick three danger zones", "choice", 5, "Choose by marks and fear level.", 12),
          quizGoal("Sort quiz", "The first useful move is to:", ["Name the next tiny action", "Wait for full motivation", "Rewrite everything"], 0)
        ])
      ]),
      subject("Practice", "Convert panic into visible attempts.", [
        unit("Question Run", "Easy, medium, timed", [
          task("Solve five easy questions", "practice", 12, "Use momentum questions first.", 16),
          task("Solve three medium questions", "practice", 18, "Stop after three, check errors.", 22),
          task("One timed mini set", "timer", 20, "Short enough to finish.", 24),
          quizGoal("Practice quiz", "After practice, the best check is:", ["Find one repeat mistake", "Count only effort", "Start a new chapter"], 0)
        ])
      ]),
      subject("Recall", "Remember without rewriting the whole book.", [
        unit("Final Loop", "Cards, mistakes, final gate", [
          task("Make five mistake cards", "review", 12, "Question on front, fix on back.", 18),
          task("3m blank-page recall", "recall", 6, "Write what you know before checking.", 12),
          task("Final scan: high-mark answers", "5m", 15, "Read answer frames only.", 22),
          quizGoal("Recall quiz", "Blank-page recall means:", ["Try memory before notes", "Copy full notes", "Avoid testing"], 0)
        ])
      ])
    ]
  },
  {
    id: "journey-daily-stabilizer",
    templateId: "daily-stabilizer",
    title: "Daily Stabilizer",
    finalGoal: "Turn a messy day into a visible chain of small wins.",
    theme: "Daily",
    days: 1,
    subjects: [
      subject("Reset", "Clear enough space to start.", [
        unit("Body and Desk", "Low friction first", [
          task("2m water and surface reset", "2m", 2, "Drink water and clear one small area.", 8),
          task("Park distracting thoughts", "capture", 5, "Write them down for later.", 10),
          task("Pick top three tasks", "choice", 6, "Only three. Not the whole universe.", 12),
          quizGoal("Reset quiz", "A parked distraction is:", ["Saved for later", "A task for now", "A failure"], 0)
        ])
      ]),
      subject("Focus", "Make the first block easier to enter.", [
        unit("One Block", "Start, continue, close", [
          task("2m starter on main task", "2m", 2, "Open the exact file/page/material.", 8),
          task("Focus block", "timer", 15, "Do the next visible piece.", 18),
          task("Send one pending message", "life", 8, "Short and done beats perfect.", 12),
          quizGoal("Focus quiz", "A good ADHD-friendly start is:", ["Tiny and visible", "Perfectly planned", "Delayed"], 0)
        ])
      ]),
      subject("Close", "Leave tomorrow less tangled.", [
        unit("Shutdown", "Review and reset", [
          task("3m done list", "recall", 3, "Write what actually moved.", 10),
          task("Choose tomorrow's first tile", "choice", 5, "Make it obvious.", 12),
          task("Reset one tool/material", "life", 5, "Put one thing where it belongs.", 10),
          quizGoal("Close quiz", "A shutdown list should mainly show:", ["What moved and what starts next", "Every unfinished thing", "Only guilt"], 0)
        ])
      ])
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
        <div class="sub">APK and PC public study world</div>
      </div>
    </div>
    <div class="statusPills">
      <span class="pill" id="connectionPill">LOCAL</span>
      <span class="pill" id="journeyPill">CLASS 10</span>
      <span class="pill" id="apkPill">APK READY</span>
      <button class="pill soundButton" id="soundToggle" type="button">SOUND OFF</button>
    </div>
  </header>

  <nav class="tabs" aria-label="Journey pages">
    <button type="button" data-page-link="overview">Overview</button>
    <button type="button" data-page-link="journeys">Journeys</button>
    <button type="button" data-page-link="quiz">Quiz</button>
    <button type="button" data-page-link="public">Public</button>
    <button type="button" data-page-link="profile">Profile</button>
  </nav>

  <div class="notice" id="message">Ready.</div>

  <main>
    <section class="page" data-page="overview">
      <section class="missionBand">
        <div class="missionCopy">
          <label id="journeyTheme">Class 10</label>
          <h2 id="journeyTitle">10th Portion Quest</h2>
          <p id="journeyGoal" class="muted"></p>
        </div>
        <div class="progressRing" id="progressRing"><b id="progressText">0%</b></div>
        <div class="statRack">
          <div><span>Cleared</span><b id="clearedGoals">0</b></div>
          <div><span>Total</span><b id="totalGoals">0</b></div>
          <div><span>Subjects</span><b id="subjectCount">0</b></div>
          <div><span>Time</span><b id="timeStatus">Day 1</b></div>
        </div>
      </section>

      <div class="meter timeMeter"><span id="timeFill"></span></div>
      <section class="journeyShelf" id="journeyShelf" aria-label="Journey selector"></section>

      <section class="studyGrid">
        <aside class="subjectRail" id="subjectRail" aria-label="Subjects"></aside>

        <section class="unitBoard">
          <div class="boardHead">
            <div>
              <label>Selected Portion</label>
              <h2 id="selectedSubjectTitle">Subject</h2>
              <p class="muted" id="selectedSubjectGoal"></p>
            </div>
            <span class="percentBadge" id="selectedSubjectProgress">0%</span>
          </div>
          <div class="unitStack" id="unitStack"></div>
        </section>

        <aside class="commandDeck">
          <div class="boardHead compact">
            <div>
              <label>Active Micro Goal</label>
              <h2 id="activeGoalTitle">Pick a goal</h2>
            </div>
            <span class="typeBadge" id="activeGoalKind">TASK</span>
          </div>
          <p class="activeDetail" id="activeGoalDetail"></p>
          <div class="activeMeta" id="activeGoalMeta"></div>

          <div class="focusTimer">
            <div id="timer">10:00</div>
            <div class="meter"><span id="timerFill"></span></div>
          </div>

          <div class="consoleActions">
            <button type="button" class="primary" id="startFocus">Start Focus</button>
            <button type="button" class="secondary" id="pauseFocus">Pause</button>
            <button type="button" class="success" id="completeGoal">Check Off</button>
            <button type="button" class="danger" id="resetProgress">Reset Mine</button>
          </div>

          <div class="scoreGrid">
            <div><span>XP</span><b id="xpView">0</b></div>
            <div><span>Coins</span><b id="coinView">0</b></div>
            <div><span>Streak</span><b id="streakView">0</b></div>
            <div><span>Focus</span><b id="focusView">0m</b></div>
          </div>
        </aside>
      </section>
    </section>

    <section class="page" data-page="journeys">
      <section class="builderGrid">
        <div class="toolPanel">
          <div class="boardHead compact">
            <div>
              <label>Presets</label>
              <h2>Journey library</h2>
            </div>
          </div>
          <div class="presetGrid" id="presetGrid"></div>
        </div>

        <div class="toolPanel builderPanel">
          <div class="boardHead compact">
            <div>
              <label>Custom Journey</label>
              <h2>Build a syllabus map</h2>
            </div>
            <button type="button" class="secondary small" id="loadTenOutline">Load 10th Shape</button>
          </div>

          <label>Journey Name</label>
          <input id="customTitle" placeholder="Example: 10th Midterm Portion" />

          <label>Final Goal</label>
          <textarea id="customGoal" placeholder="Example: Finish all subjects, units, 2m questions, and final recall."></textarea>

          <div class="two">
            <div>
              <label>Theme</label>
              <select id="customTheme">
                <option>Class 10</option>
                <option>Exam</option>
                <option>Daily</option>
                <option>Project</option>
                <option>Fitness</option>
                <option>Creative</option>
              </select>
            </div>
            <div>
              <label>Duration</label>
              <select id="customDays">
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="45" selected>45 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          <label>Syllabus Outline</label>
          <textarea id="customOutline" class="outlineInput">${escapeHTML(outlineSample)}</textarea>

          <div class="consoleActions">
            <button type="button" class="primary" id="createJourney">Publish Journey</button>
            <button type="button" class="secondary" id="previewCustom">Preview Shape</button>
          </div>
          <div class="outlinePreview" id="outlinePreview"></div>
        </div>
      </section>

      <section class="currentJourneys" id="currentJourneyList" aria-label="Current journeys"></section>
    </section>

    <section class="page" data-page="quiz">
      <section class="quizLayout">
        <div class="toolPanel quizPanel">
          <div class="boardHead compact">
            <div>
              <label id="quizContext">Quiz Gate</label>
              <h2 id="quizTitle">No quiz selected</h2>
            </div>
            <span class="typeBadge">QUIZ</span>
          </div>
          <p id="quizQuestionText" class="quizQuestion"></p>
          <div id="answerList" class="answerList"></div>
        </div>

        <aside class="toolPanel">
          <label>Quiz Queue</label>
          <div id="quizQueue" class="taskList"></div>
        </aside>
      </section>
    </section>

    <section class="page" data-page="public">
      <section class="publicLayout">
        <div class="toolPanel publicHero">
          <div class="boardHead compact">
            <div>
              <label>Public Room</label>
              <h2>Shared journey world</h2>
            </div>
            <button type="button" class="primary" id="joinPublic">Enter Public Path</button>
          </div>
          <div class="roomCode">${PUBLIC_PATH_CODE}</div>
          <div class="roomSummary" id="roomSummary"></div>
        </div>

        <div class="toolPanel">
          <label>Players</label>
          <div id="players" class="players"></div>
        </div>

        <div class="toolPanel">
          <label>Activity</label>
          <div id="activityFeed" class="activityFeed"></div>
        </div>
      </section>
    </section>

    <section class="page" data-page="profile">
      <section class="profileLayout">
        <div class="toolPanel builderPanel">
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
          <textarea id="bio" placeholder="Short public note"></textarea>
          <button type="button" class="success" id="saveProfile">Save Profile</button>
        </div>

        <div class="toolPanel">
          <label>Build Targets</label>
          <div class="installGrid">
            <div><b>Android</b><span>APK sideload wrapper</span></div>
            <div><b>PC</b><span>Vercel web app</span></div>
            <div><b>Sync</b><span>Supabase public room</span></div>
            <div><b>Offline</b><span>PWA shell metadata</span></div>
          </div>
        </div>
      </section>
    </section>
  </main>
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
let running = false;
let timerInterval = null;
let total = 10 * 60;
let left = total;
let soundEnabled = localStorage.getItem(storageKeys.sound) === "on";
let audioCtx = null;
let lastOnlineCount = 1;
let selectedSubjectId = "";
let selectedUnitId = "";
let selectedGoalId = "";
let selectedQuizId = "";

ensureState();

function subject(name, goal, units){
  return { name, goal, units };
}

function unit(title, target, goals){
  return { title, target, goals };
}

function task(title, kind = "task", minutes = 10, detail = "", points = 12){
  return { title, kind, minutes, detail, points };
}

function quizGoal(title, question, options, answer, detail = ""){
  return {
    title,
    kind: "quiz",
    minutes: 4,
    detail: detail || question,
    points: 18,
    quiz: { question, options, answer }
  };
}

function getClientId(){
  let id = localStorage.getItem(storageKeys.client);
  if(!id){
    id = uid("client");
    localStorage.setItem(storageKeys.client, id);
  }
  return id;
}

function uid(prefix = "id"){
  const value = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function slug(value){
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "item";
}

function clone(value){
  return JSON.parse(JSON.stringify(value));
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

function defaultJourneys(){
  return journeyTemplates.map(template => materializeTemplate(template, { clone: false }));
}

function freshState(){
  const journeys = defaultJourneys();
  return {
    version: 3,
    journeys,
    activeJourneyId: journeys[0].id,
    players: {},
    activity: [],
    updatedAt: Date.now()
  };
}

function materializeTemplate(template, { clone: shouldClone = false } = {}){
  const journeyId = shouldClone ? uid("journey") : template.id;
  return normalizeJourney({
    id: journeyId,
    templateId: template.templateId || template.id,
    title: template.title,
    finalGoal: template.finalGoal,
    theme: template.theme,
    days: template.days,
    createdAt: Date.now(),
    subjects: template.subjects
  });
}

function normalizeState(raw){
  const base = freshState();
  if(!raw || typeof raw !== "object") return base;

  let journeys;
  let activeJourneyId = raw.activeJourneyId;

  if(Array.isArray(raw.journeys)){
    journeys = raw.journeys.map((journey, index) => normalizeJourney(journey, index)).filter(Boolean);
  }else if(raw.journey){
    journeys = [normalizeJourney(raw.journey, 0), ...base.journeys];
    activeJourneyId = base.activeJourneyId;
  }else{
    journeys = base.journeys;
  }

  if(!journeys.length) journeys = base.journeys;

  const ids = new Set(journeys.map(journey => journey.id));
  base.journeys.forEach(journey => {
    if(!ids.has(journey.id)){
      journeys.push(journey);
      ids.add(journey.id);
    }
  });

  if(!journeys.some(journey => journey.id === activeJourneyId)){
    activeJourneyId = journeys[0].id;
  }

  const next = {
    version: 3,
    journeys,
    activeJourneyId,
    players: raw.players && typeof raw.players === "object" ? raw.players : {},
    activity: Array.isArray(raw.activity) ? raw.activity.slice(0, 60) : [],
    updatedAt: raw.updatedAt || Date.now()
  };

  Object.values(next.players).forEach(player => normalizePlayer(player));
  return next;
}

function normalizeJourney(journey, index = 0){
  if(!journey || typeof journey !== "object") return null;
  if(Array.isArray(journey.nodes)) return convertFlatJourney(journey, index);

  const id = journey.id || uid("journey");
  const subjects = Array.isArray(journey.subjects) ? journey.subjects : [];
  const normalizedSubjects = subjects.map((item, subjectIndex) => {
    const subjectId = item.id || `${id}-${slug(item.name)}-${subjectIndex}`;
    const units = Array.isArray(item.units) ? item.units : [];
    return {
      id: subjectId,
      name: item.name || `Subject ${subjectIndex + 1}`,
      goal: item.goal || "Clear this portion.",
      color: item.color || colors[subjectIndex % colors.length],
      units: units.map((unitItem, unitIndex) => {
        const unitId = unitItem.id || `${subjectId}-${slug(unitItem.title)}-${unitIndex}`;
        const goals = Array.isArray(unitItem.goals) ? unitItem.goals : [];
        return {
          id: unitId,
          title: unitItem.title || `Unit ${unitIndex + 1}`,
          target: unitItem.target || "Finish the unit goals.",
          goals: goals.map((goal, goalIndex) => ({
            id: goal.id || `${unitId}-${slug(goal.title)}-${goalIndex}`,
            title: goal.title || `Goal ${goalIndex + 1}`,
            kind: goal.kind || "task",
            minutes: Number(goal.minutes || inferMinutes(goal.title || goal.kind)),
            detail: goal.detail || "",
            points: Number(goal.points || inferPoints(goal.kind || goal.title)),
            quiz: goal.quiz ? normalizeQuiz(goal.quiz) : null
          }))
        };
      })
    };
  }).filter(item => item.units.length);

  return {
    id,
    templateId: journey.templateId || "",
    title: journey.title || "Custom Journey",
    finalGoal: journey.finalGoal || journey.goal || "Reach the final goal.",
    theme: journey.theme || "Study",
    days: Math.max(1, Number(journey.days || 7)),
    createdAt: journey.createdAt || Date.now(),
    subjects: normalizedSubjects.length ? normalizedSubjects : fallbackSubjects(id)
  };
}

function convertFlatJourney(oldJourney, index = 0){
  const id = oldJourney.id || `legacy-${index}`;
  const nodes = (oldJourney.nodes || []).filter(node => node.type !== "start");
  const groups = [];
  for(let i = 0; i < nodes.length; i += 4){
    groups.push(nodes.slice(i, i + 4));
  }
  return normalizeJourney({
    id,
    title: oldJourney.title || "Legacy Path",
    finalGoal: oldJourney.goal || "Finish the path.",
    theme: oldJourney.theme || "Study",
    days: oldJourney.days || 7,
    createdAt: oldJourney.createdAt || Date.now(),
    subjects: [{
      id: `${id}-path`,
      name: "Legacy Path",
      goal: oldJourney.goal || "Finish the path.",
      units: groups.map((group, groupIndex) => ({
        id: `${id}-unit-${groupIndex}`,
        title: `Gate Set ${groupIndex + 1}`,
        target: "Converted from the previous path map.",
        goals: group.map((node, nodeIndex) => ({
          id: node.id || `${id}-goal-${groupIndex}-${nodeIndex}`,
          title: node.title || `Gate ${nodeIndex + 1}`,
          kind: node.type === "quiz" ? "quiz" : node.type === "finish" ? "final" : "task",
          minutes: node.minutes || 10,
          detail: node.detail || "",
          points: node.points || 12,
          quiz: node.quiz || null
        }))
      }))
    }]
  });
}

function fallbackSubjects(journeyId){
  return [{
    id: `${journeyId}-main`,
    name: "Main",
    goal: "Clear the core tasks.",
    color: colors[0],
    units: [{
      id: `${journeyId}-main-unit`,
      title: "Starter Unit",
      target: "Make the journey playable.",
      goals: [
        { id: `${journeyId}-starter-1`, title: "2m starter", kind: "2m", minutes: 2, detail: "Do the smallest visible move.", points: 8, quiz: null },
        { id: `${journeyId}-starter-2`, title: "First proper task", kind: "task", minutes: 10, detail: "Finish one useful piece.", points: 12, quiz: null }
      ]
    }]
  }];
}

function normalizeQuiz(quiz){
  const options = Array.isArray(quiz.options) ? quiz.options.filter(Boolean) : [];
  return {
    question: quiz.question || "Quiz question",
    options: options.length >= 2 ? options : ["Yes", "No"],
    answer: Math.max(0, Math.min(options.length - 1, Number(quiz.answer || 0)))
  };
}

function inferMinutes(text){
  const value = String(text || "").match(/(\d+)\s*m/i);
  if(value) return Number(value[1]);
  return 10;
}

function inferPoints(kind){
  const key = String(kind || "").toLowerCase();
  if(key.includes("quiz")) return 18;
  if(key.includes("5m")) return 22;
  if(key.includes("2m")) return 8;
  if(key.includes("diagram") || key.includes("map")) return 16;
  return 12;
}

function saveLocal(){
  state.updatedAt = Date.now();
  localStorage.setItem(storageKeys.state, JSON.stringify(state));
  localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
  localStorage.setItem("nqPlayerName", profile.display_name);
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
  progressFor(state.players[clientId], activeJourney().id);
}

function normalizePlayer(player){
  player.id = player.id || uid("player");
  player.name = player.name || "Player";
  player.avatar = player.avatar || initials(player.name);
  player.color = player.color || colors[0];
  player.journeys = player.journeys && typeof player.journeys === "object" ? player.journeys : {};
  player.xp = Number(player.xp || 0);
  player.coins = Number(player.coins || 0);
  player.streak = Number(player.streak || 0);
  player.focus = Number(player.focus || 0);
  player.online = player.online !== false;
  player.active = player.active || false;
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

function progressFor(player = me(), journeyId = activeJourney().id){
  if(!player.journeys) player.journeys = {};
  if(!player.journeys[journeyId]){
    player.journeys[journeyId] = {
      completed: Array.isArray(player.completed) ? [...player.completed] : [],
      quizAnswers: {},
      cursor: null,
      focus: 0
    };
  }
  const progress = player.journeys[journeyId];
  progress.completed = Array.isArray(progress.completed) ? progress.completed : [];
  progress.quizAnswers = progress.quizAnswers && typeof progress.quizAnswers === "object" ? progress.quizAnswers : {};
  progress.focus = Number(progress.focus || 0);
  return progress;
}

function activeJourney(){
  if(!state.journeys?.length) state.journeys = defaultJourneys();
  return state.journeys.find(journey => journey.id === state.activeJourneyId) || state.journeys[0];
}

function allGoalContexts(journey = activeJourney()){
  const list = [];
  journey.subjects.forEach(subjectItem => {
    subjectItem.units.forEach(unitItem => {
      unitItem.goals.forEach(goal => list.push({ journey, subject: subjectItem, unit: unitItem, goal }));
    });
  });
  return list;
}

function goalContextsForSubject(subjectItem, journey = activeJourney()){
  return allGoalContexts(journey).filter(item => item.subject.id === subjectItem.id);
}

function goalContextsForUnit(unitItem, journey = activeJourney()){
  return allGoalContexts(journey).filter(item => item.unit.id === unitItem.id);
}

function completedSet(player = me(), journeyId = activeJourney().id){
  return new Set(progressFor(player, journeyId).completed);
}

function isGoalDone(goal, player = me(), journeyId = activeJourney().id){
  return completedSet(player, journeyId).has(goal.id);
}

function percentFor(contexts, player = me(), journeyId = activeJourney().id){
  if(!contexts.length) return 0;
  const done = contexts.filter(item => isGoalDone(item.goal, player, journeyId)).length;
  return Math.round(done / contexts.length * 100);
}

function journeyProgress(player = me(), journey = activeJourney()){
  return percentFor(allGoalContexts(journey), player, journey.id);
}

function firstOpenGoalContext(player = me(), journey = activeJourney()){
  const contexts = allGoalContexts(journey);
  return contexts.find(item => !isGoalDone(item.goal, player, journey.id)) || contexts[contexts.length - 1] || null;
}

function findGoalContext(goalId, journey = activeJourney()){
  return allGoalContexts(journey).find(item => item.goal.id === goalId) || null;
}

function selectedGoalContext(){
  const journey = activeJourney();
  return findGoalContext(selectedGoalId, journey) || firstOpenGoalContext(me(), journey);
}

function ensureSelection(){
  const journey = activeJourney();
  const player = state.players?.[clientId];
  const progress = player ? progressFor(player, journey.id) : null;
  const cursor = progress?.cursor;
  const cursorGoal = cursor?.goalId ? findGoalContext(cursor.goalId, journey) : null;
  const fallback = cursorGoal || firstOpenGoalContext(player || defaultPlayer(), journey) || allGoalContexts(journey)[0];
  if(!fallback) return;

  if(!selectedSubjectId || !journey.subjects.some(item => item.id === selectedSubjectId)){
    selectedSubjectId = fallback.subject.id;
  }

  const subjectItem = journey.subjects.find(item => item.id === selectedSubjectId) || fallback.subject;
  if(!selectedUnitId || !subjectItem.units.some(item => item.id === selectedUnitId)){
    selectedUnitId = fallback.subject.id === subjectItem.id ? fallback.unit.id : subjectItem.units[0]?.id;
  }

  const unitItem = subjectItem.units.find(item => item.id === selectedUnitId) || subjectItem.units[0];
  if(!selectedGoalId || !unitItem?.goals.some(item => item.id === selectedGoalId)){
    const firstInUnit = unitItem?.goals.find(goal => !isGoalDone(goal, player || me(), journey.id)) || unitItem?.goals[0];
    selectedGoalId = firstInUnit?.id || fallback.goal.id;
  }

  const quiz = allGoalContexts(journey).find(item => item.goal.kind === "quiz" && !isGoalDone(item.goal, player || me(), journey.id))
    || allGoalContexts(journey).find(item => item.goal.kind === "quiz");
  if(!selectedQuizId || !findGoalContext(selectedQuizId, journey)){
    selectedQuizId = quiz?.goal.id || "";
  }

  if(progress){
    progress.cursor = {
      journeyId: journey.id,
      subjectId: selectedSubjectId,
      unitId: selectedUnitId,
      goalId: selectedGoalId
    };
  }
}

function render(){
  ensureState();
  renderPills();
  renderProfile();
  renderOverview();
  renderJourneysPage();
  renderActiveConsole();
  renderQuiz();
  renderPublic();
  saveLocal();
}

function renderPills(){
  const journey = activeJourney();
  $("connectionPill").textContent = roomCode ? "ONLINE PUBLIC" : "LOCAL";
  $("journeyPill").textContent = String(journey.theme || "JOURNEY").toUpperCase();
  $("soundToggle").textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
  $("soundToggle").classList.toggle("active", soundEnabled);
}

function renderOverview(){
  const journey = activeJourney();
  const player = me();
  const contexts = allGoalContexts(journey);
  const doneCount = contexts.filter(item => isGoalDone(item.goal, player, journey.id)).length;
  const progress = journeyProgress(player, journey);

  $("journeyTheme").textContent = journey.theme;
  $("journeyTitle").textContent = journey.title;
  $("journeyGoal").textContent = journey.finalGoal;
  $("progressText").textContent = `${progress}%`;
  $("progressRing").style.setProperty("--progress", `${progress}%`);
  $("clearedGoals").textContent = doneCount;
  $("totalGoals").textContent = contexts.length;
  $("subjectCount").textContent = journey.subjects.length;

  const timePct = timeProgress(journey);
  $("timeFill").style.width = `${timePct}%`;
  const day = Math.min(journey.days, Math.max(1, Math.ceil(timePct / 100 * journey.days)));
  $("timeStatus").textContent = `Day ${day}/${journey.days}`;

  renderJourneyShelf();
  renderSubjectRail();
  renderUnitStack();
}

function renderJourneyShelf(){
  const player = me();
  $("journeyShelf").innerHTML = state.journeys.map(journey => {
    const progress = journeyProgress(player, journey);
    const contexts = allGoalContexts(journey);
    const units = journey.subjects.reduce((sum, item) => sum + item.units.length, 0);
    return `
      <button type="button" class="journeyCard ${journey.id === state.activeJourneyId ? "active" : ""}" data-journey="${escapeAttr(journey.id)}">
        <span>${escapeHTML(journey.theme)}</span>
        <b>${escapeHTML(journey.title)}</b>
        <small>${journey.subjects.length} subjects · ${units} units · ${contexts.length} goals</small>
        <div class="meter"><i style="width:${progress}%"></i></div>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-journey]").forEach(button => {
    button.onclick = () => setActiveJourney(button.dataset.journey);
  });
}

function renderSubjectRail(){
  const journey = activeJourney();
  const player = me();
  $("subjectRail").innerHTML = journey.subjects.map(subjectItem => {
    const contexts = goalContextsForSubject(subjectItem, journey);
    const progress = percentFor(contexts, player, journey.id);
    const complete = progress === 100;
    return `
      <button type="button" class="subjectCard ${subjectItem.id === selectedSubjectId ? "active" : ""} ${complete ? "done" : ""}"
        data-subject="${escapeAttr(subjectItem.id)}" style="--subject:${escapeAttr(subjectItem.color)}">
        <span class="subjectMark"></span>
        <div>
          <b>${escapeHTML(subjectItem.name)}</b>
          <small>${subjectItem.units.length} units · ${contexts.length} goals</small>
          <div class="subjectMiniPath">
            ${subjectItem.units.map(unitItem => `<i class="${percentFor(goalContextsForUnit(unitItem, journey), player, journey.id) === 100 ? "done" : ""}"></i>`).join("")}
          </div>
        </div>
        <strong>${progress}%</strong>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-subject]").forEach(button => {
    button.onclick = () => selectSubject(button.dataset.subject);
  });
}

function renderUnitStack(){
  const journey = activeJourney();
  const subjectItem = journey.subjects.find(item => item.id === selectedSubjectId) || journey.subjects[0];
  if(!subjectItem){
    $("unitStack").innerHTML = `<div class="empty">No subjects yet.</div>`;
    return;
  }

  const player = me();
  $("selectedSubjectTitle").textContent = subjectItem.name;
  $("selectedSubjectGoal").textContent = subjectItem.goal;
  $("selectedSubjectProgress").textContent = `${percentFor(goalContextsForSubject(subjectItem, journey), player, journey.id)}%`;

  $("unitStack").innerHTML = subjectItem.units.map((unitItem, unitIndex) => {
    const contexts = goalContextsForUnit(unitItem, journey);
    const progress = percentFor(contexts, player, journey.id);
    return `
      <article class="unitCard ${unitItem.id === selectedUnitId ? "active" : ""}">
        <button type="button" class="unitHead" data-unit="${escapeAttr(unitItem.id)}">
          <span>U${unitIndex + 1}</span>
          <div>
            <b>${escapeHTML(unitItem.title)}</b>
            <small>${escapeHTML(unitItem.target)}</small>
          </div>
          <strong>${progress}%</strong>
        </button>
        <div class="goalList">
          ${unitItem.goals.map(goal => renderGoalRow(goal, subjectItem, unitItem, journey, player)).join("")}
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-unit]").forEach(button => {
    button.onclick = () => selectUnit(button.dataset.unit);
  });
  document.querySelectorAll("[data-goal]").forEach(button => {
    button.onclick = () => selectGoal(button.dataset.goal);
  });
}

function renderGoalRow(goal, subjectItem, unitItem, journey, player){
  const done = isGoalDone(goal, player, journey.id);
  const selected = goal.id === selectedGoalId;
  const mark = done ? "OK" : goal.kind === "quiz" ? "?" : "GO";
  return `
    <button type="button" class="goalRow ${done ? "done" : ""} ${selected ? "selected" : ""}" data-goal="${escapeAttr(goal.id)}">
      <span class="goalDot">${mark}</span>
      <div>
        <b>${escapeHTML(goal.title)}</b>
        <small>${escapeHTML(unitItem.title)} · ${escapeHTML(goal.kind)} · ${goal.minutes}m</small>
      </div>
      <span class="goalPoints">+${goal.points}</span>
    </button>
  `;
}

function renderActiveConsole(){
  const context = selectedGoalContext();
  const player = me();
  if(!context){
    $("activeGoalTitle").textContent = "No goal";
    $("activeGoalDetail").textContent = "";
    $("activeGoalKind").textContent = "TASK";
    $("activeGoalMeta").innerHTML = "";
    return;
  }

  const { journey, subject: subjectItem, unit: unitItem, goal } = context;
  const done = isGoalDone(goal, player, journey.id);
  $("activeGoalTitle").textContent = goal.title;
  $("activeGoalKind").textContent = goal.kind.toUpperCase();
  $("activeGoalDetail").textContent = goal.detail || unitItem.target || subjectItem.goal;
  $("activeGoalMeta").innerHTML = `
    <span>${escapeHTML(subjectItem.name)}</span>
    <span>${escapeHTML(unitItem.title)}</span>
    <span>${goal.minutes}m</span>
    <span>${done ? "cleared" : "open"}</span>
  `;
  $("completeGoal").textContent = goal.kind === "quiz" && !done ? "Open Quiz" : done ? "Cleared" : "Check Off";
  $("xpView").textContent = player.xp;
  $("coinView").textContent = player.coins;
  $("streakView").textContent = player.streak;
  $("focusView").textContent = `${player.focus}m`;

  if(!running){
    total = Math.max(2, goal.minutes || 10) * 60;
    if(left <= 0 || left > total) left = total;
  }
  renderTimer();
}

function renderTimer(){
  const safeTotal = Math.max(1, total);
  $("timer").textContent = fmt(left);
  $("timerFill").style.width = `${100 - (left / safeTotal * 100)}%`;
}

function renderJourneysPage(){
  $("presetGrid").innerHTML = journeyTemplates.map(template => {
    const units = template.subjects.reduce((sum, item) => sum + item.units.length, 0);
    const goals = template.subjects.reduce((sum, item) => sum + item.units.reduce((unitSum, unitItem) => unitSum + unitItem.goals.length, 0), 0);
    return `
      <button type="button" class="presetCard" data-add-template="${escapeAttr(template.templateId)}">
        <span>${escapeHTML(template.theme)}</span>
        <b>${escapeHTML(template.title)}</b>
        <small>${template.subjects.length} subjects · ${units} units · ${goals} micro goals</small>
      </button>
    `;
  }).join("");

  $("currentJourneyList").innerHTML = state.journeys.map(journey => {
    const progress = journeyProgress(me(), journey);
    return `
      <button type="button" class="manageJourney ${journey.id === state.activeJourneyId ? "active" : ""}" data-manage-journey="${escapeAttr(journey.id)}">
        <span>${escapeHTML(journey.theme)}</span>
        <div>
          <b>${escapeHTML(journey.title)}</b>
          <small>${journey.subjects.length} subjects · ${allGoalContexts(journey).length} goals · ${progress}% mine</small>
        </div>
        <strong>Open</strong>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-add-template]").forEach(button => {
    button.onclick = () => addPresetJourney(button.dataset.addTemplate);
  });
  document.querySelectorAll("[data-manage-journey]").forEach(button => {
    button.onclick = () => {
      setActiveJourney(button.dataset.manageJourney);
      setPage("overview");
    };
  });
}

function renderQuiz(){
  const journey = activeJourney();
  const player = me();
  const quizzes = allGoalContexts(journey).filter(item => item.goal.kind === "quiz" && item.goal.quiz);
  let context = selectedQuizId ? findGoalContext(selectedQuizId, journey) : null;
  if(!context || context.goal.kind !== "quiz"){
    context = quizzes.find(item => !isGoalDone(item.goal, player, journey.id)) || quizzes[0] || null;
    selectedQuizId = context?.goal.id || "";
  }

  if(!context){
    $("quizTitle").textContent = "No quiz gates";
    $("quizContext").textContent = journey.title;
    $("quizQuestionText").textContent = "Create a journey with quiz lines or add a preset.";
    $("answerList").innerHTML = "";
  }else{
    const { subject: subjectItem, unit: unitItem, goal } = context;
    const done = isGoalDone(goal, player, journey.id);
    $("quizTitle").textContent = goal.title;
    $("quizContext").textContent = `${subjectItem.name} / ${unitItem.title}`;
    $("quizQuestionText").textContent = goal.quiz.question;
    $("answerList").innerHTML = goal.quiz.options.map((option, index) => `
      <button type="button" class="${done && index === goal.quiz.answer ? "correct" : ""}" data-answer="${index}" data-quiz-goal="${escapeAttr(goal.id)}">
        ${escapeHTML(option)}
      </button>
    `).join("");
    document.querySelectorAll("[data-answer]").forEach(button => {
      button.onclick = () => answerQuiz(button.dataset.quizGoal, Number(button.dataset.answer));
    });
  }

  $("quizQueue").innerHTML = quizzes.length ? quizzes.map(item => {
    const done = isGoalDone(item.goal, player, journey.id);
    return `
      <button type="button" class="taskRow ${done ? "done" : ""}" data-quiz-jump="${escapeAttr(item.goal.id)}">
        <span>${done ? "OK" : "?"}</span>
        <div>
          <b>${escapeHTML(item.goal.title)}</b>
          <small>${escapeHTML(item.subject.name)} · ${escapeHTML(item.unit.title)}</small>
        </div>
      </button>
    `;
  }).join("") : `<div class="empty">No quiz gates on this journey.</div>`;

  document.querySelectorAll("[data-quiz-jump]").forEach(button => {
    button.onclick = () => {
      const context = findGoalContext(button.dataset.quizJump, activeJourney());
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
  $("roomSummary").innerHTML = `
    <div><b>${escapeHTML(journey.title)}</b><span>Active public journey</span></div>
    <div><b>${journey.subjects.length}</b><span>Subjects</span></div>
    <div><b>${allGoalContexts(journey).length}</b><span>Micro goals</span></div>
  `;

  $("players").innerHTML = players.length ? players.map(player => `
    <div class="playerCard">
      <div class="avatar" style="background:${escapeAttr(player.color)}">${escapeHTML(player.avatar || initials(player.name))}</div>
      <div>
        <b>${escapeHTML(player.name || "Player")}${player.id === clientId ? " (you)" : ""}</b>
        <span>${journeyProgress(player, journey)}% · ${player.xp || 0} XP · ${player.online ? "online" : "away"}</span>
      </div>
    </div>
  `).join("") : `<div class="empty">No players yet.</div>`;

  $("activityFeed").innerHTML = state.activity.length ? state.activity.slice(0, 22).map(item => `
    <div class="activityItem">
      <b>${escapeHTML(item.name)}</b>
      <span>${escapeHTML(item.text)}</span>
    </div>
  `).join("") : `<div class="empty">No public activity yet.</div>`;
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

function setActiveJourney(journeyId){
  if(!state.journeys.some(journey => journey.id === journeyId)) return;
  state.activeJourneyId = journeyId;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  pauseFocus(false);
  ensureSelection();
  addActivity(`opened ${activeJourney().title}`);
  message(`${activeJourney().title} is active.`);
  playSound("tap");
  render();
  pushState();
}

function selectSubject(subjectId){
  const journey = activeJourney();
  const subjectItem = journey.subjects.find(item => item.id === subjectId);
  if(!subjectItem) return;
  selectedSubjectId = subjectItem.id;
  const firstContext = goalContextsForSubject(subjectItem, journey).find(item => !isGoalDone(item.goal, me(), journey.id))
    || goalContextsForSubject(subjectItem, journey)[0];
  if(firstContext) setCursor(firstContext);
  message(`${subjectItem.name} selected.`);
  playSound("tap");
  render();
  pushState();
}

function selectUnit(unitId){
  const journey = activeJourney();
  const subjectItem = journey.subjects.find(item => item.id === selectedSubjectId) || journey.subjects[0];
  const unitItem = subjectItem?.units.find(item => item.id === unitId);
  if(!unitItem) return;
  const firstContext = goalContextsForUnit(unitItem, journey).find(item => !isGoalDone(item.goal, me(), journey.id))
    || goalContextsForUnit(unitItem, journey)[0];
  if(firstContext) setCursor(firstContext);
  message(`${unitItem.title} selected.`);
  playSound("tap");
  render();
  pushState();
}

function selectGoal(goalId){
  const context = findGoalContext(goalId, activeJourney());
  if(!context) return;
  setCursor(context);
  message(`${context.goal.title} selected.`);
  playSound("tap");
  render();
  pushState();
}

function setCursor(context){
  selectedSubjectId = context.subject.id;
  selectedUnitId = context.unit.id;
  selectedGoalId = context.goal.id;
  if(context.goal.kind === "quiz") selectedQuizId = context.goal.id;
  const progress = progressFor(me(), context.journey.id);
  progress.cursor = {
    journeyId: context.journey.id,
    subjectId: context.subject.id,
    unitId: context.unit.id,
    goalId: context.goal.id
  };
}

function completeSelectedGoal(){
  const context = selectedGoalContext();
  if(!context) return;
  if(context.goal.kind === "quiz" && !isGoalDone(context.goal, me(), context.journey.id)){
    selectedQuizId = context.goal.id;
    setPage("quiz");
    message("Clear the quiz gate to check this off.");
    playSound("tap");
    render();
    return;
  }
  completeGoal(context);
}

function completeGoal(context){
  const player = me();
  const progress = progressFor(player, context.journey.id);
  if(progress.completed.includes(context.goal.id)){
    message("Already cleared.");
    playSound("tap");
    return;
  }

  progress.completed.push(context.goal.id);
  player.xp += context.goal.points || 12;
  player.coins += context.goal.kind === "quiz" ? 6 : 3;
  player.streak += 1;
  addActivity(`cleared ${context.goal.title} in ${context.subject.name}`);
  playSound(context.goal.kind === "quiz" ? "quiz" : "complete");

  const next = nextOpenAfter(context) || firstOpenGoalContext(player, context.journey);
  if(next) setCursor(next);

  if(journeyProgress(player, context.journey) === 100){
    pop("Journey Clear", `${context.journey.title} reached its final goal.`);
    addActivity(`finished ${context.journey.title}`);
    playSound("level");
    confetti(90);
  }else{
    confetti(18);
  }

  render();
  pushState();
}

function nextOpenAfter(context){
  const contexts = allGoalContexts(context.journey);
  const index = contexts.findIndex(item => item.goal.id === context.goal.id);
  const after = contexts.slice(index + 1).find(item => !isGoalDone(item.goal, me(), context.journey.id));
  return after || contexts.find(item => !isGoalDone(item.goal, me(), context.journey.id)) || null;
}

function answerQuiz(goalId, answer){
  const context = findGoalContext(goalId, activeJourney());
  if(!context?.goal.quiz) return;
  const player = me();
  const progress = progressFor(player, context.journey.id);
  progress.quizAnswers[goalId] = answer;
  if(answer === context.goal.quiz.answer){
    message("Correct. Quiz gate cleared.");
    setCursor(context);
    completeGoal(context);
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
  const context = selectedGoalContext();
  if(!context) return;
  total = Math.max(2, context.goal.minutes || 10) * 60;
  left = Math.min(left || total, total);
  running = true;
  me().active = { journeyId: context.journey.id, goalId: context.goal.id };
  message(`Focus started: ${context.goal.title}.`);
  playSound("start");
  render();
  pushState();
  timerInterval = setInterval(() => {
    left -= 1;
    renderTimer();
    if(left <= 0){
      pauseFocus(false);
      const minutes = Math.max(2, Math.round(total / 60));
      const player = me();
      const progress = progressFor(player, activeJourney().id);
      player.focus += minutes;
      progress.focus += minutes;
      player.coins += 3;
      addActivity(`finished a ${minutes} minute focus block`);
      message("Focus block finished.");
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
  if(state.players?.[clientId]) state.players[clientId].active = false;
  if(withSound) playSound("pause");
  renderTimer();
}

function resetMine(confirmFirst = true){
  if(confirmFirst && !confirm("Reset only your progress on this journey?")) return;
  const player = me();
  const progress = progressFor(player, activeJourney().id);
  progress.completed = [];
  progress.quizAnswers = {};
  progress.cursor = null;
  player.streak = 0;
  pauseFocus(false);
  left = total;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  ensureSelection();
  message("Your progress on this journey was reset.");
  render();
  pushState();
}

function addPresetJourney(templateId){
  const template = journeyTemplates.find(item => item.templateId === templateId || item.id === templateId);
  if(!template) return;
  const alreadyHasBase = state.journeys.some(journey => journey.id === template.id);
  const journey = materializeTemplate(template, { clone: alreadyHasBase });
  state.journeys.push(journey);
  state.activeJourneyId = journey.id;
  selectedSubjectId = "";
  selectedUnitId = "";
  selectedGoalId = "";
  selectedQuizId = "";
  ensureSelection();
  addActivity(`added ${journey.title}`);
  message(`${journey.title} added.`);
  playSound("start");
  render();
  pushState();
}

function createCustomJourney(){
  const title = $("customTitle").value.trim() || "Custom Journey";
  const finalGoal = $("customGoal").value.trim() || "Finish every subject, unit, and micro goal.";
  const subjects = parseOutline($("customOutline").value);
  if(!subjects.length){
    message("Add at least one subject, one unit, and two goals.");
    return;
  }

  const journey = normalizeJourney({
    id: uid("journey"),
    title,
    finalGoal,
    theme: $("customTheme").value,
    days: Number($("customDays").value),
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
  addActivity(`published ${title}`);
  setPage("overview");
  message("Custom public journey published.");
  playSound("complete");
  render();
  pushState();
}

function parseOutline(text){
  const subjects = [];
  let currentSubject = null;
  let currentUnit = null;

  const ensureSubject = () => {
    if(!currentSubject){
      currentSubject = subject("Main", "Clear this portion.", []);
      subjects.push(currentSubject);
    }
    return currentSubject;
  };

  const ensureUnit = () => {
    ensureSubject();
    if(!currentUnit){
      currentUnit = unit("Starter Unit", "Finish the starter goals.", []);
      currentSubject.units.push(currentUnit);
    }
    return currentUnit;
  };

  String(text || "").split("\n").map(line => line.trim()).filter(Boolean).forEach(line => {
    const subjectMatch = line.match(/^subject\s*:\s*(.+)$/i);
    const unitMatch = line.match(/^unit\s*:\s*(.+)$/i);
    if(subjectMatch){
      currentSubject = subject(subjectMatch[1].trim(), `Complete ${subjectMatch[1].trim()} portion.`, []);
      currentUnit = null;
      subjects.push(currentSubject);
      return;
    }
    if(unitMatch){
      ensureSubject();
      currentUnit = unit(unitMatch[1].trim(), `Finish ${unitMatch[1].trim()} goals.`, []);
      currentSubject.units.push(currentUnit);
      return;
    }
    if(line.startsWith("?")){
      const parts = line.slice(1).split("|").map(part => part.trim()).filter(Boolean);
      const title = parts[0] || "Quiz Gate";
      const question = parts[1] || title;
      const options = parts.slice(2, 5);
      const maybeAnswer = Number(parts[5] || 0);
      ensureUnit().goals.push(quizGoal(title, question, options.length >= 2 ? options : ["Yes", "No"], Number.isFinite(maybeAnswer) ? maybeAnswer : 0));
      return;
    }
    const clean = line.replace(/^[-*]\s*/, "");
    const kind = inferKind(clean);
    ensureUnit().goals.push(task(clean, kind, inferMinutes(clean), `Clear this ${kind} piece.`, inferPoints(kind)));
  });

  return subjects
    .map(subjectItem => ({
      ...subjectItem,
      units: subjectItem.units
        .map(unitItem => ({ ...unitItem, goals: unitItem.goals.filter(Boolean) }))
        .filter(unitItem => unitItem.goals.length)
    }))
    .filter(subjectItem => subjectItem.units.length);
}

function inferKind(title){
  const text = String(title || "").toLowerCase();
  if(text.includes("2m")) return "2m";
  if(text.includes("5m")) return "5m";
  if(text.includes("quiz")) return "quiz";
  if(text.includes("diagram")) return "diagram";
  if(text.includes("map")) return "map";
  if(text.includes("recall")) return "recall";
  if(text.includes("formula")) return "formula";
  if(text.includes("practice") || text.includes("solve")) return "practice";
  return "task";
}

function previewCustom(){
  const subjects = parseOutline($("customOutline").value);
  const unitCount = subjects.reduce((sum, subjectItem) => sum + subjectItem.units.length, 0);
  const goalCount = subjects.reduce((sum, subjectItem) => sum + subjectItem.units.reduce((goalSum, unitItem) => goalSum + unitItem.goals.length, 0), 0);
  $("outlinePreview").innerHTML = subjects.length ? `
    <b>${subjects.length} subjects</b>
    <span>${unitCount} units</span>
    <span>${goalCount} micro goals</span>
  ` : `<span>Add a subject, unit, and goals.</span>`;
  message(subjects.length ? "Outline shape is ready." : "Outline needs more structure.");
}

function loadTenOutline(){
  $("customTitle").value = "10th Portion Quest";
  $("customGoal").value = "Complete all subjects, units, 2m questions, 5m answers, recall rounds, and quiz gates.";
  $("customTheme").value = "Class 10";
  $("customDays").value = "45";
  $("customOutline").value = outlineSample;
  previewCustom();
}

function timeProgress(journey){
  const elapsed = Date.now() - (journey.createdAt || Date.now());
  const duration = Math.max(1, journey.days || 1) * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.min(100, elapsed / duration * 100));
}

function addActivity(text){
  state.activity.unshift({
    id: uid("activity"),
    name: profile.display_name || "Player",
    text,
    at: Date.now()
  });
  state.activity = state.activity.slice(0, 60);
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
        addActivity("entered the public path");
        message("Entered public journey path.");
        playSound("online");
        render();
        pushState();
      }
    });
}

function mergePlayer(localPlayer, remotePlayer){
  const merged = {
    ...(remotePlayer || {}),
    ...(localPlayer || {}),
    id: clientId,
    online: true
  };
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
  const normalized = pageAliases[page] || page;
  const next = pages.includes(normalized) ? normalized : "overview";
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
  return pageAliases[page] || (pages.includes(page) ? page : "overview");
}

function fmt(seconds){
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function initials(name){
  return String(name || "NQ").trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase()).join("") || "NQ";
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

  $("startFocus").onclick = startFocus;
  $("pauseFocus").onclick = () => pauseFocus(true);
  $("completeGoal").onclick = completeSelectedGoal;
  $("resetProgress").onclick = () => resetMine(true);
  $("joinPublic").onclick = joinPublicPath;
  $("createJourney").onclick = createCustomJourney;
  $("previewCustom").onclick = previewCustom;
  $("loadTenOutline").onclick = loadTenOutline;
  $("saveProfile").onclick = updateProfileFromInputs;
  $("soundToggle").onclick = () => setSoundEnabled(!soundEnabled);
  $("closeModal").onclick = () => $("modal").classList.remove("show");
}

bind();
setPage(pageFromHash(), false);
render();
registerServiceWorker();
message(hasSupabase ? "Ready. Enter the public path to sync Android and PC." : "Solo preview. Add Supabase env values for live public sync.");
