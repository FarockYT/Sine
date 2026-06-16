
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL || "";
const VERCEL_URL = import.meta.env.VITE_VERCEL_PROJECT_URL || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const PUBLIC_ROOM_CODE = "PUBLIC-SERVER";
const ladders = {3:22,8:30,15:44,28:55,42:63,51:72,67:88,79:96};
const snakes = {18:7,35:14,49:33,61:41,74:52,86:57,92:68,99:81};
const treasures = [5,12,25,39,47,58,70,83,91,97];
const colors = ["#60a5fa","#a78bfa","#34d399","#fbbf24","#22d3ee","#fb7185","#f472b6","#c084fc"];
const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

const app = document.querySelector("#app");
app.innerHTML = `
<div class="shell">
  <header class="top">
    <div class="brand">
      <div class="logo">NQ</div>
      <div>
        <h1>NeuroQuest Focus Arcade</h1>
        <div class="sub">Short quests, arcade rewards, squad rooms, Vercel launch</div>
      </div>
    </div>
    <div class="pills">
      <div class="pill" id="modePill">SOLO</div>
      <div class="pill" id="roomPill">NO ROOM</div>
      <div class="pill" id="serverPill">SUPABASE OFF</div>
      <div class="pill" id="savePill">AUTO-SAVE</div>
    </div>
  </header>

  <nav class="pageNav" aria-label="NeuroQuest pages">
    <button class="navBtn" data-page-link="quest">Quest</button>
    <button class="navBtn" data-page-link="board">Board</button>
    <button class="navBtn" data-page-link="deck">Deck</button>
    <button class="navBtn" data-page-link="lab">Lab</button>
    <button class="navBtn" data-page-link="squad">Squad</button>
    <button class="navBtn" data-page-link="rooms">Rooms</button>
    <button class="navBtn" data-page-link="deploy">Deploy</button>
    <button class="navBtn" data-page-link="profile">Profile</button>
  </nav>

  <div class="msg statusMsg" id="message">Ready.</div>

  <main class="pages">
    <section class="page" data-page="quest">
      <div class="questLayout">
        <section class="panel focusPanel">
          <div class="panelHead">
            <div>
              <label>Current Quest</label>
              <h2 id="currentQuestTitle">Choose one tiny quest</h2>
            </div>
            <span class="stateBadge" id="questModeBadge">READY</span>
          </div>

          <div class="focusArena">
            <div class="focusPortal" id="focusPortal">
              <div class="portalTime" id="portalTime">15</div>
              <span>minutes</span>
            </div>
            <div class="bossCard">
              <label>Boss Gate</label>
              <h2 id="bossTitle">Impulse Gate</h2>
              <div class="bar danger"><div class="fill" id="bossFill"></div></div>
              <div class="bossMeta" id="bossMeta">100 HP · clear quests to break it</div>
            </div>
          </div>

          <section class="timerCard">
            <div class="timer" id="timer">15:00</div>
            <div class="bar"><div class="fill" id="timerFill"></div></div>
          </section>

          <div class="actionRow">
            <button class="green" id="start">Start Sprint</button>
            <button class="dark" id="pause">Pause</button>
            <button class="gold" id="complete">Complete Quest</button>
            <button class="red" id="miss">Miss</button>
          </div>

          <div class="microGrid">
            <div class="microCard"><span>Next step</span><b id="nextStepView">Name one action</b></div>
            <div class="microCard"><span>Focus fuel</span><b id="focusFuelView">15 min</b></div>
            <div class="microCard"><span>Reward</span><b id="rewardPreview">+50 XP</b></div>
          </div>

          <div class="inventoryStrip" id="inventoryStrip"></div>

          <div class="quickStarts">
            <button class="mini dark" data-preset="start">2-min start</button>
            <button class="mini dark" data-preset="body">Body double</button>
            <button class="mini dark" data-preset="boss">Boss quest</button>
          </div>

          <div class="breakDock">
            <button class="mini light" data-reset="breathe">Breathe</button>
            <button class="mini light" data-reset="water">Water</button>
            <button class="mini light" data-reset="move">Move</button>
          </div>
        </section>

        <section class="panel form questBuilder">
          <div class="panelHead compact">
            <div>
              <label>Quest Builder</label>
              <h2>Small win setup</h2>
            </div>
          </div>

          <label>Chapter</label>
          <input id="chapter" placeholder="Example: Physics - Kinematics" />

          <label>Quest</label>
          <textarea id="questText" placeholder="Example: Solve 12 projectile motion questions"></textarea>

          <div class="two">
            <div>
              <label>Stage</label>
              <select id="difficulty">
                <option value="1">Bronze</option>
                <option value="2" selected>Silver</option>
                <option value="3">Gold</option>
                <option value="4">Boss</option>
                <option value="5">Final Boss</option>
              </select>
            </div>
            <div>
              <label>Timer</label>
              <select id="minutes">
                <option value="2">02 min</option>
                <option value="5">05 min</option>
                <option value="10">10 min</option>
                <option value="15" selected>15 min</option>
                <option value="25">25 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
          </div>

          <label>Start Mode</label>
          <select id="energyMode">
            <option value="soft" selected>Low friction</option>
            <option value="steady">Steady</option>
            <option value="challenge">Challenge</option>
          </select>

          <div class="btns">
            <button class="purple" id="addQuest">Queue Quest</button>
            <button class="dark" id="resetTimer">Reset Timer</button>
            <button class="red" id="resetGame">Reset Run</button>
          </div>
        </section>
      </div>
    </section>

    <section class="page" data-page="board">
      <div class="boardLayout">
        <section class="panel boardPanel">
          <div class="stage">
            <div class="board" id="board"></div>
            <svg class="overlay" id="overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg>
            <div class="tokens" id="tokens"></div>
          </div>
        </section>

        <aside class="panel boardSide">
          <div class="rankBox">
            <div class="orb" id="rankOrb">I</div>
            <div class="rankMain">
              <div class="rankText"><span id="rankText">Rank I</span><span id="nextText">0 / 100 XP</span></div>
              <div class="bar"><div class="fill" id="rankFill"></div></div>
            </div>
          </div>

          <div class="stats">
            <div class="stat"><b id="posStat">1</b><span>Square</span></div>
            <div class="stat"><b id="xpStat">0</b><span>XP</span></div>
            <div class="stat"><b id="levelStat">1</b><span>Level</span></div>
            <div class="stat"><b id="comboStat">0</b><span>Combo</span></div>
            <div class="stat"><b id="focusStat">0</b><span>Minutes</span></div>
          </div>
        </aside>
      </div>
    </section>

    <section class="page" data-page="deck">
      <div class="split">
        <section class="panel">
          <div class="panelHead compact">
            <div>
              <label>Quest Deck</label>
              <h2>Queued missions</h2>
            </div>
          </div>
          <div class="deck" id="deck"></div>
        </section>

        <section class="panel">
          <div class="panelHead compact">
            <div>
              <label>Badges</label>
              <h2>Earned rewards</h2>
            </div>
          </div>
          <div class="chips" id="badges"></div>
        </section>
      </div>
    </section>

    <section class="page" data-page="lab">
      <div class="labLayout">
        <section class="panel labHero">
          <div class="panelHead">
            <div>
              <label>Arcade Lab</label>
              <h2>Experimental focus modes</h2>
            </div>
            <span class="stateBadge" id="labStateBadge">LAB READY</span>
          </div>

          <div class="experimentGrid">
            <button class="experimentCard" data-experiment="micro">
              <span>Micro Gate</span>
              <b>2 min</b>
            </button>
            <button class="experimentCard" data-experiment="chaos">
              <span>Chaos Roll</span>
              <b>Random</b>
            </button>
            <button class="experimentCard" data-experiment="bossrush">
              <span>Boss Rush</span>
              <b>25 min</b>
            </button>
          </div>

          <div class="arcadeMeters">
            <div class="meterTile">
              <span>Coins</span>
              <b id="coinView">0</b>
            </div>
            <div class="meterTile">
              <span>Energy</span>
              <b id="energyView">3 / 5</b>
            </div>
            <div class="meterTile">
              <span>Streak</span>
              <b id="streakView">0</b>
            </div>
          </div>

          <div class="labActions">
            <button class="gold" id="rollPower">Roll Power-Up</button>
            <button class="purple" id="claimLoot">Open Loot Chest</button>
          </div>
        </section>

        <section class="panel box">
          <div class="panelHead compact">
            <div>
              <label>Power-Ups</label>
              <h2>Inventory</h2>
            </div>
          </div>
          <div class="powerGrid" id="powerupDeck"></div>
        </section>

        <section class="panel box distractionPanel">
          <div class="panelHead compact">
            <div>
              <label>Distraction Vault</label>
              <h2>Park and return</h2>
            </div>
          </div>
          <div class="two">
            <input id="distractionText" placeholder="Thought, tab, idea, reminder" />
            <button class="dark" id="parkDistraction">Park</button>
          </div>
          <div class="deck compactDeck" id="distractionList"></div>
        </section>
      </div>
    </section>

    <section class="page" data-page="squad">
      <section class="panel">
        <div class="panelHead compact">
          <div>
            <label>Squad</label>
            <h2>Player board</h2>
          </div>
          <button class="gold mini" id="joinPublic">Join Public Server</button>
        </div>
        <div class="players" id="players"></div>
        <div class="small" id="publicInfo">Default global room: PUBLIC-SERVER</div>
      </section>
    </section>

    <section class="page" data-page="rooms">
      <div class="roomsLayout">
        <section class="panel box">
          <label>Create Room</label>
          <input id="newRoomName" placeholder="Room name" />
          <div class="two">
            <input id="newRoomCode" placeholder="Room code" />
            <select id="roomVisibility">
              <option value="public" selected>Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <button class="purple" id="createRoom">Create / Join Room</button>
        </section>

        <section class="panel box">
          <label>Join Room</label>
          <div class="two">
            <input id="roomCode" placeholder="Room code" />
            <button id="joinRoom">Join</button>
          </div>
        </section>

        <section class="panel box roomBrowser">
          <div class="panelHead compact">
            <div>
              <label>Lobby</label>
              <h2>Public rooms</h2>
            </div>
            <button class="dark mini" id="refreshLobby">Refresh</button>
          </div>
          <div class="rooms" id="rooms"></div>
        </section>

        <section class="panel box">
          <label>Repo / Deploy</label>
          <div class="chips" id="repoLinks"></div>
        </section>
      </div>
    </section>

    <section class="page" data-page="deploy">
      <div class="deployLayout">
        <section class="panel launchPanel">
          <div class="panelHead">
            <div>
              <label>Vercel Launch</label>
              <h2>Production readiness</h2>
            </div>
            <span class="stateBadge" id="deployBadge">VITE APP</span>
          </div>

          <div class="launchGrid">
            <div class="launchTile pass">
              <span>Framework</span>
              <b>Vite</b>
            </div>
            <div class="launchTile pass">
              <span>Output</span>
              <b>dist</b>
            </div>
            <div class="launchTile" id="supabaseLaunchTile">
              <span>Supabase</span>
              <b id="supabaseLaunchText">Local</b>
            </div>
            <div class="launchTile" id="vercelLaunchTile">
              <span>Vercel URL</span>
              <b id="vercelLaunchText">Not set</b>
            </div>
          </div>

          <div class="deployTrack" id="deployTrack"></div>
        </section>

        <section class="panel box">
          <label>Launch Links</label>
          <div class="chips" id="launchLinks"></div>
        </section>

        <section class="panel box">
          <label>Environment</label>
          <div class="envList" id="envList"></div>
        </section>
      </div>
    </section>

    <section class="page" data-page="profile">
      <div class="profileLayout">
        <section class="panel box">
        <label>Profile</label>
        <div class="profileCard">
          <div class="avatar" id="profileAvatarView">★</div>
          <div>
            <div class="playerName" id="profileNameView">Player</div>
            <div class="meta" id="profileMetaView">Local profile</div>
          </div>
        </div>

        <div class="two">
          <input id="playerName" placeholder="Name" />
          <input id="avatar" placeholder="Avatar ★" maxlength="2" />
        </div>
        <input id="target" placeholder="Target exam / goal" />
        <textarea id="bio" placeholder="Short profile bio"></textarea>
        <input id="githubUrl" placeholder="GitHub profile/repo URL" />
        <input id="vercelUrl" placeholder="Vercel project URL" />
        <button class="green" id="saveProfile">Save Profile</button>
        </section>

        <section class="panel box profileSummary">
          <label>Player Card</label>
          <div class="profileCard large">
            <div class="avatar" id="profileAvatarEcho">★</div>
            <div>
              <div class="playerName" id="profileNameEcho">Player</div>
              <div class="meta" id="profileTargetEcho">Local profile</div>
              <div class="meta" id="profileBioEcho"></div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</div>

<div class="modal" id="modal">
  <div class="modalBox">
    <h2 id="modalTitle">Level Up</h2>
    <p id="modalText">Rank increased.</p>
    <button id="closeModal">Continue</button>
  </div>
</div>
<div class="confetti" id="confetti"></div>
`;

const $ = id => document.getElementById(id);
const pages = ["quest","board","deck","lab","squad","rooms","deploy","profile"];
const stageLabels = ["","Bronze","Silver","Gold","Boss","Final Boss"];
const focusModeLabels = {
  soft: "Low friction",
  steady: "Steady",
  challenge: "Challenge"
};
const quickPresets = {
  start: {
    chapter: "Warm-up",
    text: "Open the material and finish the first tiny step",
    difficulty: "1",
    minutes: "2",
    energy: "soft"
  },
  body: {
    chapter: "Body double sprint",
    text: "Work quietly beside the squad for one focused block",
    difficulty: "2",
    minutes: "15",
    energy: "steady"
  },
  boss: {
    chapter: "Boss battle",
    text: "Finish the hardest useful task on the list",
    difficulty: "4",
    minutes: "25",
    energy: "challenge"
  }
};
const resetPrompts = {
  breathe: "Reset: breathe once slowly, then pick the next click.",
  water: "Reset: drink water, then restart with the smallest action.",
  move: "Reset: stand up, move for 30 seconds, then come back."
};
const experiments = {
  micro: {
    chapter: "Micro Gate",
    text: "Do one visible 2-minute starter action",
    difficulty: "1",
    minutes: "2",
    energy: "soft"
  },
  chaos: {
    chapter: "Chaos Roll",
    text: "Pick the first useful task you notice and complete one slice",
    difficulty: "3",
    minutes: "10",
    energy: "challenge"
  },
  bossrush: {
    chapter: "Boss Rush",
    text: "Attack the task you have been avoiding with one focused sprint",
    difficulty: "4",
    minutes: "25",
    energy: "challenge"
  }
};
const powerUps = [
  { code:"SHIELD", name:"Shield", effect:"Blocks one miss penalty" },
  { code:"BOOST", name:"XP Boost", effect:"Next completion gets +20 XP" },
  { code:"SPARK", name:"Spark Coins", effect:"+5 coins now" },
  { code:"COMPASS", name:"Compass", effect:"Loads a 2-minute starter" },
  { code:"BOSS", name:"Boss Breaker", effect:"Next completion hits harder" }
];

const clientId = getClientId();
let roomCode = "";
let roomName = "";
let channel = null;
let profileChannel = null;
let syncingRemote = false;
let pushTimer = null;
let running = false;
let timerInterval = null;
let total = 15 * 60;
let left = total;

let profile = loadProfile();
let state = loadState() || freshState();
ensurePlayer();

function getClientId(){
  let id = localStorage.getItem("nqClientId");
  if(!id){
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
    localStorage.setItem("nqClientId", id);
  }
  return id;
}

function loadProfile(){
  try{
    return JSON.parse(localStorage.getItem("nqProfile")) || defaultProfile();
  }catch(e){
    return defaultProfile();
  }
}

function defaultProfile(){
  return {
    client_id: clientId,
    display_name: localStorage.getItem("nqPlayerName") || "Player",
    avatar: "★",
    bio: "",
    target: "",
    github_url: REPO_URL,
    vercel_url: VERCEL_URL,
    color: colors[Math.floor(Math.random()*colors.length)]
  };
}

function saveProfileLocal(){
  localStorage.setItem("nqProfile", JSON.stringify(profile));
  localStorage.setItem("nqPlayerName", profile.display_name);
}

function freshState(){
  return {
    roomCode:"",
    roomName:"",
    quests:[],
    distractions:[],
    players:{},
    updatedAt:Date.now()
  };
}

function defaultPlayer(){
  return {
    id:clientId,
    name:profile.display_name || "Player",
    avatar:profile.avatar || "★",
    bio:profile.bio || "",
    target:profile.target || "",
    github_url:profile.github_url || "",
    vercel_url:profile.vercel_url || "",
    pos:1,
    xp:0,
    combo:0,
    focus:0,
    sessions:0,
    badges:[],
    coins:0,
    streak:0,
    energy:3,
    bossHp:100,
    shield:0,
    boosts:0,
    bossBreaker:0,
    powerups:[],
    color:profile.color || colors[Math.floor(Math.random()*colors.length)],
    selected:null,
    online:true,
    active:false
  };
}

function me(){
  ensurePlayer();
  return state.players[clientId];
}

function ensurePlayer(){
  if(!state.players) state.players = {};
  if(!state.distractions) state.distractions = [];
  if(!state.players[clientId]) state.players[clientId] = defaultPlayer();
  normalizePlayer(state.players[clientId]);
  syncProfileIntoPlayer();
}

function normalizePlayer(p){
  p.pos = p.pos || 1;
  p.xp = p.xp || 0;
  p.combo = p.combo || 0;
  p.focus = p.focus || 0;
  p.sessions = p.sessions || 0;
  p.badges = p.badges || [];
  p.coins = p.coins || 0;
  p.streak = p.streak || 0;
  p.energy = typeof p.energy === "number" ? p.energy : 3;
  p.bossHp = typeof p.bossHp === "number" ? p.bossHp : 100;
  p.shield = p.shield || 0;
  p.boosts = p.boosts || 0;
  p.bossBreaker = p.bossBreaker || 0;
  p.powerups = p.powerups || [];
}

function syncProfileIntoPlayer(){
  if(!state.players?.[clientId]) return;
  const p = state.players[clientId];
  p.name = profile.display_name || p.name || "Player";
  p.avatar = profile.avatar || p.avatar || "★";
  p.bio = profile.bio || "";
  p.target = profile.target || "";
  p.github_url = profile.github_url || "";
  p.vercel_url = profile.vercel_url || "";
  p.color = profile.color || p.color || colors[0];
}

function loadState(){
  try{
    return JSON.parse(localStorage.getItem("nqState"));
  }catch(e){
    return null;
  }
}

function saveLocal(){
  localStorage.setItem("nqState", JSON.stringify(state));
  saveProfileLocal();
}

async function saveProfileRemote(){
  saveProfileLocal();
  syncProfileIntoPlayer();

  if(!hasSupabase) {
    message("Profile saved locally. Supabase not configured.");
    render();
    return;
  }

  const { error } = await supabase.from("profiles").upsert({
    client_id: clientId,
    display_name: profile.display_name,
    avatar: profile.avatar,
    bio: profile.bio,
    target: profile.target,
    github_url: profile.github_url,
    vercel_url: profile.vercel_url,
    color: profile.color,
    updated_at: new Date().toISOString()
  }, { onConflict: "client_id" });

  if(error) message(error.message);
  else message("Profile saved.");
  render();
  pushState();
}

function pushState(){
  saveLocal();
  if(!hasSupabase || !roomCode || syncingRemote) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const payload = {
      room_code: roomCode,
      room_name: roomName || roomCode,
      is_public: roomCode === PUBLIC_ROOM_CODE ? true : getCurrentRoomPublicFlag(),
      max_players: roomCode === PUBLIC_ROOM_CODE ? 100 : 12,
      state,
      updated_by: clientId,
      updated_at: new Date().toISOString()
    };
    await supabase.from("game_rooms").upsert(payload, { onConflict: "room_code" });
  }, 250);
}

function getCurrentRoomPublicFlag(){
  return localStorage.getItem(`nqRoomPublic:${roomCode}`) !== "false";
}

function cellNum(i){
  const rowTop = Math.floor(i/10);
  const rowBottom = 9-rowTop;
  const col = i%10;
  const base = rowBottom*10;
  return rowBottom%2===0 ? base+col+1 : base+(10-col);
}

function center(n){
  const rowBottom = Math.floor((n-1)/10);
  const rawCol = (n-1)%10;
  const col = rowBottom%2===0 ? rawCol : 9-rawCol;
  const rowTop = 9-rowBottom;
  return {x:(col+.5)*100,y:(rowTop+.5)*100};
}

function renderBoard(){
  $("board").innerHTML = "";
  for(let i=0;i<100;i++){
    const n = cellNum(i);
    const c = document.createElement("div");
    c.className = "cell" + ((i+n)%2 ? " alt" : "");
    if(ladders[n]) c.classList.add("ladder");
    if(snakes[n]) c.classList.add("snake");
    if(treasures.includes(n)) c.classList.add("treasure");

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = n;
    c.appendChild(num);

    const mark = document.createElement("div");
    mark.className = "mark";
    if(ladders[n]) mark.textContent = "▲";
    if(snakes[n]) mark.textContent = "▼";
    if(treasures.includes(n)) mark.textContent = "◆";
    c.appendChild(mark);

    $("board").appendChild(c);
  }
  renderOverlay();
}

function pathCurve(a,b,curve=80){
  const dx=b.x-a.x, dy=b.y-a.y;
  const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
  const len=Math.hypot(dx,dy)||1;
  const nx=-dy/len, ny=dx/len;
  return `M ${a.x} ${a.y} Q ${mx+nx*curve} ${my+ny*curve} ${b.x} ${b.y}`;
}

function renderOverlay(){
  const svg = $("overlay");
  svg.innerHTML = "";

  treasures.forEach(n=>{
    const p=center(n);
    const g=document.createElementNS("http://www.w3.org/2000/svg","circle");
    g.setAttribute("cx",p.x); g.setAttribute("cy",p.y); g.setAttribute("r",32);
    g.setAttribute("class","treasureGlow");
    svg.appendChild(g);
  });

  Object.entries(ladders).forEach(([from,to])=>{
    from=Number(from); to=Number(to);
    const a=center(from), b=center(to);
    const dx=b.x-a.x, dy=b.y-a.y;
    const len=Math.hypot(dx,dy)||1;
    const nx=-dy/len*14, ny=dx/len*14;

    for(const sign of [1,-1]){
      const side=document.createElementNS("http://www.w3.org/2000/svg","line");
      side.setAttribute("x1",a.x+nx*sign); side.setAttribute("y1",a.y+ny*sign);
      side.setAttribute("x2",b.x+nx*sign); side.setAttribute("y2",b.y+ny*sign);
      side.setAttribute("class","ladderSide");
      svg.appendChild(side);
    }

    for(let t=.18;t<.9;t+=.18){
      const x=a.x+dx*t, y=a.y+dy*t;
      const rung=document.createElementNS("http://www.w3.org/2000/svg","line");
      rung.setAttribute("x1",x+nx*1.3); rung.setAttribute("y1",y+ny*1.3);
      rung.setAttribute("x2",x-nx*1.3); rung.setAttribute("y2",y-ny*1.3);
      rung.setAttribute("class","ladderRung");
      svg.appendChild(rung);
    }
  });

  Object.entries(snakes).forEach(([from,to],idx)=>{
    const a=center(Number(from)), b=center(Number(to));
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",pathCurve(a,b,idx%2?85:-85));
    path.setAttribute("class","snakePath");
    svg.appendChild(path);
    const head=document.createElementNS("http://www.w3.org/2000/svg","circle");
    head.setAttribute("cx",a.x); head.setAttribute("cy",a.y); head.setAttribute("r",18);
    head.setAttribute("class","snakeHead");
    svg.appendChild(head);
  });
}

function renderTokens(){
  const wrap = $("tokens");
  wrap.innerHTML = "";
  Object.values(state.players || {}).forEach(p=>{
    const pos = Math.max(1, Math.min(100, p.pos || 1));
    const c = center(pos);
    const t = document.createElement("div");
    t.className = "token" + (p.id===clientId ? " me" : "") + (p.active ? " active" : "");
    t.style.left = `${c.x/10}%`;
    t.style.top = `${c.y/10}%`;
    t.style.background = `radial-gradient(circle at 32% 24%,#fff 0 7%,transparent 8%), ${p.color || "#60a5fa"}`;
    t.title = p.name;
    t.textContent = p.avatar || initials(p.name);
    wrap.appendChild(t);
  });
}

function initials(name){
  return String(name || "P").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("") || "P";
}

function levelOf(p){ return Math.floor((p.xp || 0)/100)+1; }
function rankOf(p){ return roman[Math.min(roman.length-1,levelOf(p)-1)] || String(levelOf(p)); }
function stageName(diff){ return stageLabels[Number(diff)] || "Stage"; }
function focusModeName(){ return focusModeLabels[$("energyMode")?.value] || "Low friction"; }

function renderStats(){
  const p = me();
  $("posStat").textContent = p.pos || 1;
  $("xpStat").textContent = p.xp || 0;
  $("levelStat").textContent = levelOf(p);
  $("comboStat").textContent = p.combo || 0;
  $("focusStat").textContent = p.focus || 0;
  $("rankOrb").textContent = rankOf(p);
  $("rankText").textContent = `Rank ${rankOf(p)}`;
  const cur = (p.xp || 0) % 100;
  $("nextText").textContent = `${cur} / 100 XP`;
  $("rankFill").style.width = `${cur}%`;
}

function renderPlayers(){
  const box = $("players");
  box.innerHTML = "";
  Object.values(state.players || {})
    .sort((a,b)=>(b.xp||0)-(a.xp||0))
    .forEach(p=>{
      const card = document.createElement("div");
      card.className = "player";
      const links = [
        p.github_url ? `<a target="_blank" href="${safeUrl(p.github_url)}">GitHub</a>` : "",
        p.vercel_url ? `<a target="_blank" href="${safeUrl(p.vercel_url)}">Vercel</a>` : ""
      ].filter(Boolean).join(" · ");
      card.innerHTML = `
        <div>
          <div class="playerName">${escapeHTML(p.avatar || "★")} ${escapeHTML(p.name || "Player")} ${p.id===clientId ? "(you)" : ""}</div>
          <div class="meta">Square ${p.pos || 1} · ${p.xp || 0} XP · Rank ${rankOf(p)}${p.target ? " · " + escapeHTML(p.target) : ""}</div>
          ${links ? `<div class="meta">${links}</div>` : ""}
        </div>
        <div class="chip" style="border-color:${p.color};color:#fff">${p.active ? "RUN" : (p.online ? "ONLINE" : "IDLE")}</div>
      `;
      box.appendChild(card);
    });
}

function renderBadges(){
  const box = $("badges");
  box.innerHTML = "";
  const badges = me().badges || [];
  if(!badges.length){
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "NO BADGES";
    box.appendChild(chip);
    return;
  }
  badges.forEach(b=>{
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = b;
    box.appendChild(chip);
  });
}

function renderDeck(){
  const box = $("deck");
  box.innerHTML = "";
  if(!state.quests.length){
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.textContent = "No quests added.";
    box.appendChild(empty);
    return;
  }
  state.quests.forEach((q,i)=>{
    const card = document.createElement("div");
    card.className = "quest" + (q.done ? " done" : "");
    const stage = stageName(q.diff);
    card.innerHTML = `
      <div>
        <div class="questTitle">${escapeHTML(q.text)}</div>
        <div class="meta">${escapeHTML(q.chapter || "Study")} · ${stage} · ${q.min} min ${q.completedBy ? "· done by " + escapeHTML(q.completedBy) : ""}</div>
      </div>
    `;
    const btn = document.createElement("button");
    btn.className = "mini dark";
    btn.textContent = q.done ? "Done" : "Load";
    btn.disabled = q.done;
    btn.onclick = () => loadQuest(i);
    card.appendChild(btn);
    box.appendChild(card);
  });
}

function renderProfile(){
  $("playerName").value = profile.display_name || "";
  $("avatar").value = profile.avatar || "★";
  $("target").value = profile.target || "";
  $("bio").value = profile.bio || "";
  $("githubUrl").value = profile.github_url || "";
  $("vercelUrl").value = profile.vercel_url || "";
  $("profileAvatarView").textContent = profile.avatar || "★";
  $("profileNameView").textContent = profile.display_name || "Player";
  $("profileMetaView").textContent = profile.target || "Local profile";
  $("profileAvatarEcho").textContent = profile.avatar || "★";
  $("profileNameEcho").textContent = profile.display_name || "Player";
  $("profileTargetEcho").textContent = profile.target || "Local profile";
  $("profileBioEcho").textContent = profile.bio || "";
}

function renderRepoLinks(){
  const box = $("repoLinks");
  box.innerHTML = "";
  const links = [
    ["GitHub Repo", REPO_URL || profile.github_url],
    ["Vercel App", VERCEL_URL || profile.vercel_url],
    ["Supabase", hasSupabase ? SUPABASE_URL : ""]
  ];
  links.forEach(([name,url])=>{
    const chip = document.createElement("span");
    chip.className = "chip";
    if(url){
      chip.innerHTML = `<a href="${safeUrl(url)}" target="_blank">${name}</a>`;
    }else{
      chip.textContent = `${name}: not set`;
    }
    box.appendChild(chip);
  });
}

function fmt(sec){
  const m = Math.floor(sec/60), s = sec%60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function renderTimer(){
  $("timer").textContent = fmt(left);
  $("timerFill").style.width = `${100 - (left/total*100)}%`;
}

function renderQuestFocus(){
  const text = $("questText").value.trim();
  const chapter = $("chapter").value.trim();
  const stage = stageName($("difficulty").value);
  const minutes = Number($("minutes").value || 15);
  const reward = Number($("difficulty").value || 1) * 25;

  $("currentQuestTitle").textContent = text || "Choose one tiny quest";
  $("questModeBadge").textContent = running ? "SPRINTING" : "READY";
  $("questModeBadge").classList.toggle("live", running);
  $("nextStepView").textContent = text ? (chapter || "Start now") : "Name one action";
  $("focusFuelView").textContent = `${minutes} min · ${focusModeName()}`;
  $("rewardPreview").textContent = `${stage} · +${reward} XP`;
}

function renderPills(){
  $("modePill").textContent = roomCode ? "MULTIPLAYER" : "SOLO";
  $("roomPill").textContent = roomCode ? `ROOM ${roomCode}` : "NO ROOM";
  $("serverPill").textContent = hasSupabase ? "SUPABASE ON" : "SUPABASE OFF";
}

function render(){
  ensurePlayer();
  renderTokens();
  renderStats();
  renderPlayers();
  renderBadges();
  renderDeck();
  renderProfile();
  renderRepoLinks();
  renderTimer();
  renderQuestFocus();
  renderPills();
  saveLocal();
}

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}

function safeUrl(url){
  const text = String(url || "");
  if(text.startsWith("http://") || text.startsWith("https://")) return text.replace(/"/g, "%22");
  return "#";
}

function message(text){ $("message").textContent = text; }

function pageFromHash(){
  const page = window.location.hash.replace("#", "");
  return pages.includes(page) ? page : "quest";
}

function setPage(page, push = true){
  const next = pages.includes(page) ? page : "quest";
  document.querySelectorAll("[data-page]").forEach(section => {
    section.classList.toggle("active", section.dataset.page === next);
  });
  document.querySelectorAll("[data-page-link]").forEach(button => {
    const active = button.dataset.pageLink === next;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  if(push && window.location.hash !== `#${next}`){
    history.pushState(null, "", `#${next}`);
  }
}

function applyPreset(name){
  const preset = quickPresets[name];
  if(!preset) return;
  $("chapter").value = preset.chapter;
  $("questText").value = preset.text;
  $("difficulty").value = preset.difficulty;
  $("minutes").value = preset.minutes;
  $("energyMode").value = preset.energy;
  localStorage.setItem("nqChapter", preset.chapter);
  localStorage.setItem("nqQuestText", preset.text);
  localStorage.setItem("nqDifficulty", preset.difficulty);
  localStorage.setItem("nqMinutes", preset.minutes);
  localStorage.setItem("nqEnergyMode", preset.energy);
  setDuration();
  message("Preset loaded.");
}

function resetCue(name){
  message(resetPrompts[name] || "Reset, then start again.");
}

function gainXP(p, amount){
  const before = levelOf(p);
  p.xp = (p.xp || 0) + amount;
  const after = levelOf(p);
  if(after > before){
    pop("Level Up", `Rank ${rankOf(p)} reached.`);
    confetti();
  }
}

function addBadge(p, b){
  if(!p.badges) p.badges = [];
  if(!p.badges.includes(b)) p.badges.push(b);
}

function checkBadges(p){
  if((p.sessions||0)>=1) addBadge(p,"FIRST RUN");
  if((p.sessions||0)>=5) addBadge(p,"5 RUNS");
  if((p.sessions||0)>=10) addBadge(p,"10 RUNS");
  if((p.combo||0)>=3) addBadge(p,"COMBO III");
  if((p.combo||0)>=7) addBadge(p,"COMBO VII");
  if((p.focus||0)>=60) addBadge(p,"60 MIN");
  if((p.focus||0)>=180) addBadge(p,"180 MIN");
  if((p.xp||0)>=500) addBadge(p,"500 XP");
  if((p.xp||0)>=1000) addBadge(p,"1000 XP");
}

function start(){
  if(!$("questText").value.trim()){
    message("Enter a quest.");
    return;
  }
  if(running) return;
  running = true;
  me().active = true;
  message("Running.");
  render();
  pushState();

  timerInterval = setInterval(()=>{
    left--;
    renderTimer();
    if(left <= 0){
      clearInterval(timerInterval);
      timerInterval = null;
      running = false;
      const p = me();
      p.active = false;
      p.focus = (p.focus || 0) + Number($("minutes").value);
      p.sessions = (p.sessions || 0) + 1;
      gainXP(p, Number($("minutes").value)*2);
      checkBadges(p);
      left = total;
      message("Session complete.");
      chime();
      render();
      pushState();
    }
  },1000);
}

function pause(){
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  running = false;
  me().active = false;
  message("Paused.");
  render();
  pushState();
}

function resetTimer(){
  pause();
  total = Number($("minutes").value)*60;
  left = total;
  render();
  message("Timer reset.");
}

function complete(){
  if(!$("questText").value.trim()){
    message("Enter a quest.");
    return;
  }
  pause();

  const p = me();
  const move = Number($("difficulty").value);
  const old = p.pos || 1;

  p.combo = (p.combo || 0) + 1;
  gainXP(p, move * 25);

  p.pos = Math.min(100, old + move);
  let extra = "";

  if(ladders[p.pos]){
    const from = p.pos;
    p.pos = ladders[from];
    gainXP(p, 30);
    extra = ` Ladder ${from} → ${p.pos}.`;
    confetti(28);
  } else if(snakes[p.pos]){
    const from = p.pos;
    p.pos = snakes[from];
    p.combo = 0;
    extra = ` Snake ${from} → ${p.pos}.`;
  } else if(treasures.includes(p.pos)){
    gainXP(p, 20);
    extra = " Treasure +20 XP.";
    confetti(18);
  }

  const selected = p.selected;
  if(selected !== null && state.quests[selected]){
    state.quests[selected].done = true;
    state.quests[selected].completedBy = p.name;
  }

  if(p.pos >= 100){
    p.pos = 100;
    addBadge(p,"BOARD CLEAR");
    pop("Board Clear", "Square 100 reached.");
    confetti(80);
  }

  checkBadges(p);
  message(`Moved ${old} → ${p.pos}.${extra}`);
  render();
  pushState();
}

function miss(){
  pause();
  const p = me();
  p.combo = 0;
  p.xp = Math.max(0, (p.xp || 0) - 10);
  p.pos = Math.max(1, (p.pos || 1) - 1);
  message("Miss registered. -10 XP. -1 square.");
  render();
  pushState();
}

function addQuest(){
  const text = $("questText").value.trim();
  if(!text){
    message("Enter a quest.");
    return;
  }
  state.quests.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text,
    chapter: $("chapter").value.trim(),
    diff: Number($("difficulty").value),
    min: Number($("minutes").value),
    done:false,
    createdAt:Date.now()
  });
  me().selected = 0;
  message("Quest added.");
  render();
  pushState();
}

function loadQuest(i){
  const q = state.quests[i];
  if(!q) return;
  $("chapter").value = q.chapter || "";
  $("questText").value = q.text || "";
  $("difficulty").value = String(q.diff || 2);
  $("minutes").value = String(q.min || 15);
  total = Number($("minutes").value)*60;
  left = total;
  me().selected = i;
  message("Quest loaded.");
  render();
  pushState();
}

function setDuration(){
  if(running) return;
  total = Number($("minutes").value)*60;
  left = total;
  render();
}

async function joinPublicServer(){
  await joinRoom(PUBLIC_ROOM_CODE, "Public Study Server", true, 100);
}

async function createRoom(){
  const code = ($("newRoomCode").value.trim() || makeRoomCode()).toUpperCase();
  const name = $("newRoomName").value.trim() || "Study Room";
  const isPublic = $("roomVisibility").value === "public";
  localStorage.setItem(`nqRoomPublic:${code}`, isPublic ? "true" : "false");
  await joinRoom(code, name, isPublic, 12);
}

async function joinRoomFromInput(){
  const code = $("roomCode").value.trim().toUpperCase();
  if(!code){
    message("Enter a room code.");
    return;
  }
  await joinRoom(code, code, false, 12);
}

function makeRoomCode(){
  return "ROOM-" + Math.random().toString(36).slice(2,7).toUpperCase();
}

async function joinRoom(code, name = code, isPublic = false, maxPlayers = 12){
  if(!hasSupabase){
    message("Supabase keys are missing. Add .env values, run SQL, then deploy.");
    return;
  }

  await saveProfileRemote();

  roomCode = code.toUpperCase();
  roomName = name || roomCode;
  localStorage.setItem("nqRoomCode", roomCode);
  localStorage.setItem(`nqRoomPublic:${roomCode}`, isPublic ? "true" : "false");

  if(channel){
    await supabase.removeChannel(channel);
    channel = null;
  }

  const localPlayer = structuredClone(me());

  const { data, error } = await supabase
    .from("game_rooms")
    .select("state,room_name,is_public,max_players")
    .eq("room_code", roomCode)
    .maybeSingle();

  if(error){
    message(error.message);
    return;
  }

  if(data?.state){
    syncingRemote = true;
    state = {
      ...freshState(),
      ...data.state,
      roomCode,
      roomName: data.room_name || roomName,
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
  } else {
    state = freshState();
    state.roomCode = roomCode;
    state.roomName = roomName;
    state.players[clientId] = localPlayer;
    syncProfileIntoPlayer();

    const { error: insertError } = await supabase.from("game_rooms").insert({
      room_code: roomCode,
      room_name: roomName,
      is_public: isPublic,
      max_players: maxPlayers,
      state,
      created_by: clientId,
      updated_by: clientId
    });

    if(insertError){
      message(insertError.message);
      return;
    }
  }

  syncProfileIntoPlayer();

  channel = supabase
    .channel(`neuroquest-room:${roomCode}`, { config: { presence: { key: clientId } } })
    .on("presence", { event: "sync" }, () => {
      const presence = channel.presenceState();
      Object.values(state.players || {}).forEach(p => p.online = false);
      Object.values(presence).flat().forEach(pres => {
        if(state.players[pres.id]) state.players[pres.id].online = true;
      });
      render();
    })
    .on("postgres_changes", {
      event:"*",
      schema:"public",
      table:"game_rooms",
      filter:`room_code=eq.${roomCode}`
    }, payload => {
      if(payload.new?.updated_by === clientId) return;
      if(!payload.new?.state) return;
      syncingRemote = true;
      const local = structuredClone(me());
      state = payload.new.state;
      if(!state.players) state.players = {};
      state.players[clientId] = {
        ...local,
        ...(state.players[clientId] || {}),
        online:true
      };
      syncProfileIntoPlayer();
      syncingRemote = false;
      render();
    })
    .subscribe(async status => {
      if(status === "SUBSCRIBED"){
        await channel.track({ id:clientId, name:profile.display_name, onlineAt:Date.now() });
        message(`Joined ${roomName}.`);
        render();
        pushState();
        refreshLobby();
      }
    });
}

async function refreshLobby(){
  const box = $("rooms");
  box.innerHTML = `<div class="meta">Loading...</div>`;

  if(!hasSupabase){
    box.innerHTML = `<div class="meta warn">Supabase not configured. Lobby unavailable.</div>`;
    return;
  }

  const { data, error } = await supabase
    .from("game_rooms")
    .select("room_code,room_name,is_public,max_players,state,updated_at")
    .eq("is_public", true)
    .order("updated_at", { ascending:false })
    .limit(20);

  if(error){
    box.innerHTML = `<div class="meta warn">${escapeHTML(error.message)}</div>`;
    return;
  }

  box.innerHTML = "";
  if(!data?.length){
    box.innerHTML = `<div class="meta">No public rooms yet.</div>`;
    return;
  }

  data.forEach(room=>{
    const players = Object.keys(room.state?.players || {}).length;
    const card = document.createElement("div");
    card.className = "roomCard";
    card.innerHTML = `
      <div>
        <div class="roomTitle">${escapeHTML(room.room_name || room.room_code)}</div>
        <div class="meta">${escapeHTML(room.room_code)} · ${players}/${room.max_players || 12} players</div>
      </div>
    `;
    const btn = document.createElement("button");
    btn.className = "mini";
    btn.textContent = "Join";
    btn.onclick = () => joinRoom(room.room_code, room.room_name, true, room.max_players || 12);
    card.appendChild(btn);
    box.appendChild(card);
  });
}

function updateProfileFromInputs(){
  profile.display_name = $("playerName").value.trim() || "Player";
  profile.avatar = $("avatar").value.trim() || "★";
  profile.target = $("target").value.trim();
  profile.bio = $("bio").value.trim();
  profile.github_url = $("githubUrl").value.trim();
  profile.vercel_url = $("vercelUrl").value.trim();
}

function resetGame(){
  if(!confirm("Reset full game for this browser/player?")) return;
  pause();
  const currentRoom = roomCode;
  const currentRoomName = roomName;
  state = freshState();
  state.roomCode = currentRoom;
  state.roomName = currentRoomName;
  state.players[clientId] = defaultPlayer();
  $("questText").value = "";
  $("chapter").value = "";
  total = Number($("minutes").value)*60;
  left = total;
  message("Game reset.");
  render();
  pushState();
}

function pop(title,text){
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  $("modal").classList.add("show");
}

function confetti(count=45){
  const box = $("confetti");
  const palette = ["#fbbf24","#60a5fa","#a78bfa","#34d399","#22d3ee","#fb7185"];
  for(let i=0;i<count;i++){
    const piece = document.createElement("i");
    piece.style.left = Math.random()*100 + "vw";
    piece.style.background = palette[Math.floor(Math.random()*palette.length)];
    piece.style.animationDelay = Math.random()*0.35 + "s";
    piece.style.transform = `rotate(${Math.random()*180}deg)`;
    box.appendChild(piece);
    setTimeout(()=>piece.remove(),2200);
  }
}

function chime(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 660;
    g.gain.value = .045;
    o.start();
    setTimeout(()=>o.frequency.value = 880, 100);
    setTimeout(()=>{ o.stop(); ctx.close(); }, 260);
  }catch(e){}
}

function initFields(){
  $("chapter").value = localStorage.getItem("nqChapter") || "";
  $("questText").value = localStorage.getItem("nqQuestText") || "";
  $("difficulty").value = localStorage.getItem("nqDifficulty") || "2";
  $("minutes").value = localStorage.getItem("nqMinutes") || "15";
  $("energyMode").value = localStorage.getItem("nqEnergyMode") || "soft";
  $("roomCode").value = localStorage.getItem("nqRoomCode") || "";
  total = Number($("minutes").value) * 60;
  left = total;
  renderProfile();
}

function bindNavigation(){
  document.querySelectorAll("[data-page-link]").forEach(button => {
    button.onclick = () => setPage(button.dataset.pageLink);
  });
  window.addEventListener("hashchange", () => setPage(pageFromHash(), false));
  setPage(pageFromHash(), false);
}

function bind(){
  bindNavigation();

  $("joinPublic").onclick = joinPublicServer;
  $("createRoom").onclick = createRoom;
  $("joinRoom").onclick = joinRoomFromInput;
  $("refreshLobby").onclick = refreshLobby;
  $("saveProfile").onclick = async () => {
    updateProfileFromInputs();
    await saveProfileRemote();
  };

  $("start").onclick = start;
  $("pause").onclick = pause;
  $("complete").onclick = complete;
  $("miss").onclick = miss;
  $("addQuest").onclick = addQuest;
  $("resetTimer").onclick = resetTimer;
  $("resetGame").onclick = resetGame;
  $("closeModal").onclick = () => $("modal").classList.remove("show");

  $("minutes").onchange = () => {
    localStorage.setItem("nqMinutes", $("minutes").value);
    setDuration();
  };
  $("difficulty").onchange = () => {
    localStorage.setItem("nqDifficulty", $("difficulty").value);
    renderQuestFocus();
  };
  $("energyMode").onchange = () => {
    localStorage.setItem("nqEnergyMode", $("energyMode").value);
    renderQuestFocus();
  };
  $("chapter").oninput = () => {
    localStorage.setItem("nqChapter", $("chapter").value);
    renderQuestFocus();
  };
  $("questText").oninput = () => {
    localStorage.setItem("nqQuestText", $("questText").value);
    renderQuestFocus();
  };

  document.querySelectorAll("[data-preset]").forEach(button => {
    button.onclick = () => applyPreset(button.dataset.preset);
  });
  document.querySelectorAll("[data-reset]").forEach(button => {
    button.onclick = () => resetCue(button.dataset.reset);
  });

  ["playerName","avatar","target","bio","githubUrl","vercelUrl"].forEach(id=>{
    $(id).oninput = () => {
      updateProfileFromInputs();
      saveProfileLocal();
      syncProfileIntoPlayer();
      render();
    };
  });
}

initFields();
bind();
renderBoard();
render();
refreshLobby();
message(hasSupabase ? "Ready." : "Solo mode. Add Supabase env values for public lobby.");
