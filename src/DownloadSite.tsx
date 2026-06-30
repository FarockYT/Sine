import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  Laptop,
  LockKeyhole,
  PlayCircle,
  Shield,
  Smartphone,
  Sparkles,
  TimerReset,
  Zap
} from "lucide-react";
import "./download-site.css";

const updates = [
  "Realtime usage limits now use Android foreground events from today, not stale aggregate data.",
  "Always-on cloud sync keeps phone, PC Guard, schedules, alarms, limits, and Shield rules aligned.",
  "PC Guard now includes a local software UI with start/stop controls, cloud testing, and live logs.",
  "Download page rebuilt with setup tutorials, feature details, and update notes."
];

const tutorials = [
  {
    title: "Install Android APK",
    body: "Download the APK, install it, then enable Accessibility and Usage Access from Sine Inverse Settings."
  },
  {
    title: "Create a Cloud ID",
    body: "Use any private name, such as sugan-main-sync. Use the same Cloud ID on phone and PC."
  },
  {
    title: "Run PC Guard",
    body: "Download the PC package, open the UI launcher, enter your Cloud ID, test cloud, then start in preview or enforce mode."
  },
  {
    title: "Set daily limits",
    body: "Choose apps, set minutes per day, and Sine Inverse blocks them after today's realtime usage reaches the limit."
  }
];

const featureCards = [
  { icon: Shield, title: "App Shield", body: "Redirects locked Android apps back to Sine Inverse through the native Accessibility guard." },
  { icon: TimerReset, title: "Daily Usage Timer", body: "Allows apps for a specific time per day, then blocks them using realtime foreground events." },
  { icon: Laptop, title: "PC Guard", body: "Desktop companion for Linux, Windows, and macOS with app closing, daily limits, and optional website blocking." },
  { icon: AlarmClock, title: "Schedules And Alarms", body: "Focus schedules, native alarm helpers, reminders, and Calendar sync sit in one workflow." },
  { icon: BarChart3, title: "Stats", body: "Weekly reports show productivity, disturbance, screen-time, limits, and focus score." },
  { icon: Sparkles, title: "AI Commands", body: "Ask for limits, blocks, schedules, alarms, and cleanup actions in natural language." }
];

function DownloadSite() {
  return (
    <main className="download-site">
      <section className="download-hero">
        <div className="download-nav">
          <a className="download-brand" href="/">
            <img src="/app-icon.svg" alt="" />
            <span>Sine Inverse</span>
          </a>
          <div>
            <a href="#downloads">Downloads</a>
            <a href="#updates">Updates</a>
            <a href="#tutorials">Tutorials</a>
          </div>
        </div>

        <div className="download-hero-copy">
          <p className="download-eyebrow">Focus blocker for phone and PC</p>
          <h1>Sine Inverse</h1>
          <p>
            A focused life, reversed from distraction. Install the Android blocker, run the PC Guard software,
            and keep limits, schedules, alarms, and Shield rules synced through one Cloud ID.
          </p>
          <div className="download-actions" id="downloads">
            <a className="download-button primary" href="/downloads/sine-inverse.apk" download>
              <Smartphone size={20} />
              Download APK
            </a>
            <a className="download-button" href="/downloads/sine-inverse-pc-guard.zip" download>
              <Laptop size={20} />
              Download PC Guard
            </a>
          </div>
        </div>
      </section>

      <section className="download-band download-split">
        <div>
          <p className="download-eyebrow">About</p>
          <h2>Built for real blocking, not just pretty timers.</h2>
          <p>
            The phone app uses Android Accessibility for redirects and Usage Access for today's screen-time.
            The PC Guard package runs locally and watches desktop apps from the same cloud rules.
          </p>
        </div>
        <div className="download-proof-grid">
          <article><CheckCircle2 size={21} /><strong>Cloud synced</strong><span>Phone and PC use one Cloud ID.</span></article>
          <article><LockKeyhole size={21} /><strong>Native guard</strong><span>Blocks continue after closing the app.</span></article>
          <article><Zap size={21} /><strong>Realtime limits</strong><span>Today means today, from midnight to now.</span></article>
        </div>
      </section>

      <section className="download-band">
        <div className="download-section-head">
          <div>
            <p className="download-eyebrow">Features</p>
            <h2>Everything in the app package</h2>
          </div>
          <Shield size={28} />
        </div>
        <div className="download-feature-grid">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title}>
                <Icon size={24} />
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="download-band download-two" id="updates">
        <div>
          <p className="download-eyebrow">Latest updates</p>
          <h2>Version notes</h2>
          <div className="download-update-list">
            {updates.map((item) => (
              <article key={item}>
                <CheckCircle2 size={20} />
                <span>{item}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="download-release-card">
          <img src="/app-icon.svg" alt="" />
          <strong>Android APK 1.2</strong>
          <span>Realtime usage fix and PC Guard UI support.</span>
          <a href="/downloads/sine-inverse.apk" download>
            Get latest APK
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="download-band" id="tutorials">
        <div className="download-section-head">
          <div>
            <p className="download-eyebrow">Tutorials</p>
            <h2>Setup without guessing</h2>
          </div>
          <PlayCircle size={28} />
        </div>
        <div className="download-tutorial-grid">
          {tutorials.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="download-final">
        <div>
          <p className="download-eyebrow">Ready</p>
          <h2>Download the app, then let Shield do the work.</h2>
        </div>
        <div className="download-actions">
          <a className="download-button primary" href="/downloads/sine-inverse.apk" download>
            <Download size={20} />
            APK
          </a>
          <a className="download-button" href="/downloads/sine-inverse-pc-guard.zip" download>
            <Download size={20} />
            PC Guard
          </a>
        </div>
      </section>
    </main>
  );
}

export default DownloadSite;
