import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

const BASE = import.meta.env.BASE_URL
const LOGO = `${BASE}assets/logo.png`

/* ------------------------------------------------------------------ */
/*  Project data — reviewed from each repository                      */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  {
    id: 'pyxeebot',
    name: 'PyxeeBot',
    tag: 'Discord',
    status: 'Stable',
    blurb: 'A self-hosted Discord music bot that respects the queue.',
    description:
      'Stream from YouTube, curate with Last.fm, keep the queue alive across restarts. Built for music communities that care about the right track — and for a single-core VPS that still has headroom left.',
    stack: ['Python 3.11+', 'discord.py', 'yt-dlp', 'aiosqlite'],
    repo: 'https://github.com/Pylxyr/PyxeeBot',
    accent: '#e8a04a',
    highlights: [
      {
        icon: '⌕',
        title: 'Search that works',
        text: '!play queues yt-dlp’s top match instantly. Wrong track? !search shows up to 10 candidates so you pick the right one.',
      },
      {
        icon: '✦',
        title: 'Last.fm curation',
        text: '!vibe builds a similar-track queue you can trim. !autoplay keeps the room alive when the list runs dry. Optional free API key.',
      },
      {
        icon: '◉',
        title: 'Survives restarts',
        text: 'Queues, playlists and per-server settings live in SQLite. Background prefetch and near-end preload keep gaps out of the set.',
      },
      {
        icon: '⚙',
        title: 'Server control',
        text: 'DJ roles, vote-skip, hybrid slash commands, per-server prefix, idle and empty-channel timeouts — all configurable.',
      },
    ],
    commands: [
      ['!play', 'Queue a URL, playlist or search'],
      ['!search', 'Browse results before queuing'],
      ['!vibe', 'Last.fm-curated similar tracks'],
      ['!nowplaying', 'Live panel with controls'],
      ['!queue', 'Show the current queue'],
      ['!skip', 'Vote-skip or force-skip'],
      ['!autoplay', 'Toggle similar-track refill'],
      ['!setdj', 'Assign a DJ role'],
    ],
    quickstart: [
      'git clone https://github.com/Pylxyr/PyxeeBot.git ~/musicbot',
      'cd ~/musicbot',
      'bash deploy/setup_oracle.sh   # or setup_gcp.sh / setup.sh',
    ],
    facts: [
      ['Target host', '1 core, 1 GB RAM — Oracle E2.1.Micro, GCP e2-micro'],
      ['Invite permissions', '3230720 — View, Send, Embed, History, Connect, Speak'],
      ['Safety', 'Private/LAN URLs refused; titles can never ping @everyone or roles'],
      ['systemd', 'MemoryMax=700M, no capabilities, read-only home'],
    ],
    specs: [
      ['64 kbps', 'Opus default'],
      ['128', 'Stream-URL cache entries'],
      ['25', 'Tracks per playlist URL'],
      ['30 min', 'Stream URL TTL'],
    ],
  },
  {
    id: 'twitch-bot',
    name: 'Pyxee Twitch Bot',
    tag: 'Twitch',
    status: 'Stable',
    blurb: 'Moderation, economy and engagement for your channel.',
    description:
      'A standalone Twitch chat bot with a points economy, AutoMod, custom commands, giveaways, predictions and a password-gated settings dashboard. Everything runs on your machine — no cloud account required.',
    stack: ['Python 3.11+', 'TwitchIO 3', 'SQLite', 'aiohttp'],
    repo: 'https://github.com/Pylxyr/pyxee-twitch-bot',
    accent: '#9146ff',
    highlights: [
      {
        icon: '◈',
        title: 'Points & ranks',
        text: 'Passive points and watch-time, ranks from Newcomer to Legend, !daily, !give, opt-in !gamble and !duel. Subs can earn at a higher rate.',
      },
      {
        icon: '🛡',
        title: 'AutoMod that listens',
        text: 'Link, caps and blocked-term filters with VIP/sub exemptions, !permit, warn-then-timeout escalation and optional message deletion.',
      },
      {
        icon: '⌘',
        title: 'Custom commands',
        text: 'Mod-managed with variables, cooldowns and role gates. Automatically listed on the public /commands reference page.',
      },
      {
        icon: '◎',
        title: 'Alerts & tools',
        text: 'Follow/sub/raid/cheer announcements, Hype Train, native Predictions, timers, counters, quotes, 8-ball, viewer queue and giveaways.',
      },
    ],
    commands: [
      ['!daily', 'Claim daily points'],
      ['!give', 'Transfer points'],
      ['!duel', 'PvP wager'],
      ['!quote', 'View or add quotes'],
      ['!8ball', 'Ask the magic ball'],
      ['!giveaway', 'Run a prize draw'],
      ['!predict', 'Start a Prediction'],
      ['!counter', 'Named counters'],
    ],
    quickstart: [
      'git clone https://github.com/Pylxyr/pyxee-twitch-bot.git',
      'cd pyxee-twitch-bot && bash ./deploy/setup.sh',
      'python bot.py --check-config   # validates .env, never touches Twitch',
    ],
    facts: [
      ['Required config', 'TWITCH_CLIENT_ID, _CLIENT_SECRET, _BOT_ID, _OWNER_ID'],
      ['HTTP', '127.0.0.1:8098 by default — publish through Caddy'],
      ['Health', '/healthz returns 503 when the database is down'],
      ['Backups', 'community.db daily, newest 7 kept'],
      ['Tests', '125 test functions across 22 files'],
    ],
    specs: [
      ['Local', 'No cloud'],
      ['/commands', 'Public reference'],
      ['/settings', 'Gated dashboard'],
      ['EventSub', 'Realtime alerts'],
    ],
  },
  {
    id: 'twitch-radio',
    name: 'Twitch Radio',
    tag: 'OBS · Stream',
    status: 'Stable',
    blurb: 'Song requests that play straight into OBS.',
    description:
      'Viewers type !sr in chat. The bot queues the track, serves one continuous Opus stream and a now-playing overlay. Runs entirely on your PC — 127.0.0.1 only, no telemetry, Windows installer or Linux from source.',
    stack: ['Python 3.11+', 'Electron', 'yt-dlp', 'ffmpeg', 'Opus'],
    repo: 'https://github.com/Pylxyr/Twitch-Radio',
    accent: '#ff4d6d',
    highlights: [
      {
        icon: '▶',
        title: 'One continuous stream',
        text: 'OBS Media Source points at http://127.0.0.1:8098/stream.opus. Gapless hand-over, silence when idle instead of a disconnect.',
      },
      {
        icon: '▣',
        title: 'Now-playing overlay',
        text: 'Transparent browser source at /overlay. Shows the current track and requester — size it however you like in OBS.',
      },
      {
        icon: '⚡',
        title: 'Stays out of the way',
        text: 'Lookups run in short-lived processes that exit after idle. Encoder only runs while something is listening. Under 100 MB when quiet.',
      },
      {
        icon: '🖥',
        title: 'Desktop app',
        text: 'Windows installer bundles ffmpeg. Close to tray and the window is truly gone — no hidden Chromium. Linux AppImage available.',
      },
    ],
    commands: [
      ['!sr', 'Request a song or YouTube link'],
      ['!sq', 'Show the song queue'],
      ['!skip', 'Skip (mods or requester)'],
      ['!radio', 'Toggle auto-radio mode'],
    ],
    quickstart: [
      '# Windows: run "Twitch Radio Setup x.y.z.exe" from Releases',
      'OBS Media Source   http://127.0.0.1:8098/stream.opus',
      'OBS Browser Source http://127.0.0.1:8098/overlay',
    ],
    facts: [
      ['Accounts', 'Two Twitch accounts: your channel + a bot account (mod it)'],
      ['OAuth redirect', 'http://localhost:4343/oauth/callback'],
      ['Lookups', '2 parallel, 45 s timeout, exit after 120 s idle'],
      ['Network', 'Out to Twitch, YouTube, GitHub (update checks) only'],
    ],
    specs: [
      ['127.0.0.1', 'Local only'],
      ['160 kbps', 'Opus default'],
      ['Gapless', 'Hand-over'],
      ['1.1.0', 'Desktop app'],
    ],
  },
  {
    id: 'pryxea',
    name: 'Pryxea',
    tag: 'Rust · WIP',
    status: 'In progress',
    blurb: 'Twitch Radio, rewritten for minimal footprint.',
    description:
      'A ground-up Rust rewrite of Twitch-Radio with one goal: minimal binary size and memory. One native binary, in-process Opus encode, no Electron, no bundled Python, no ffmpeg processes. Audio and lookups work today; the Twitch side is next.',
    stack: ['Rust 1.85+', 'tokio', 'hyper', 'symphonia', 'rustls', 'libopus'],
    repo: 'https://github.com/Pylxyr/Pryxea',
    accent: '#3ecf8e',
    highlights: [
      {
        icon: '◇',
        title: 'Tiny binary',
        text: 'Server binary ~0.76 MB. Full lookup + engine example ~2.23 MB. Idle RSS ~2.5 MB on one thread.',
      },
      {
        icon: '◎',
        title: 'In-process audio',
        text: 'Decode (Opus / AAC-LC), resample, encode and publish five 20 ms Opus packets per Ogg page — all inside the same process.',
      },
      {
        icon: '⛓',
        title: 'On-demand tools',
        text: 'yt-dlp and QuickJS are downloaded on first use, hash-checked, and killed with their process tree when a lookup finishes.',
      },
      {
        icon: '→',
        title: 'Roadmap',
        text: 'Steps 1–3 complete (config, audio engine, lookups). Twitch EventSub and the five chat commands are next, then queue persistence and packaging.',
      },
    ],
    commands: [
      ['!sr', 'Request a song (planned)'],
      ['!skip', 'Skip current (planned)'],
      ['!nowplaying', 'Current track (planned)'],
      ['!sq', 'Song queue (planned)'],
      ['!radio', 'Autoplay toggle (planned)'],
    ],
    quickstart: [
      'git clone https://github.com/Pylxyr/Pryxea.git && cd Pryxea',
      'cargo build --release   # needs Rust 1.85+ and cmake',
      'cargo run --release --example lookup -- "song name or YouTube URL"',
    ],
    facts: [
      ['Formats', 'Opus (WebM/MP4) and AAC-LC; HE-AAC, surround, live and HLS refused'],
      ['Peak RSS', '11 MB streaming, 5.4 MB with 20 WebSockets + 5 listeners'],
      ['Security', 'Loopback only; Host header checked against DNS rebinding'],
      ['Known diff', 'AAC keeps ~23 ms priming; Opus up to ~14 ms end padding'],
    ],
    roadmap: [
      ['Config, stores, command parser, Ogg hub, HTTP/WS, overlay', 'done'],
      ['Audio engine: decode, resample, Opus encode, gapless', 'done'],
      ['HTTPS client, yt-dlp lookups, tool installer, radio mix', 'done'],
      ['Twitch: OAuth, EventSub chat, five commands', 'next'],
      ['Queue, player loop, persistence, /settings', 'todo'],
      ['Tray icon, packaging, CI', 'todo'],
    ],
    specs: [
      ['0.76 MB', 'Binary'],
      ['2.5 MB', 'Idle RSS'],
      ['~1.2 %', 'CPU while playing'],
      ['Unlicense', 'Public domain'],
    ],
  },
]

const LINKS = [
  ['Twitch Radio', 'Pryxea', 'Pryxea is a ground-up Rust rewrite of Twitch Radio. Same chat commands, same OBS endpoints, and an existing .env carries over.'],
  ['Pyxee Twitch Bot', 'Twitch Radio', 'Both build on TwitchIO 3.3.2 and aiohttp, and each serves its own local web UI on port 8098 by default. Pick the moderation bot, the radio, or both.'],
  ['PyxeeBot', 'Twitch Radio', 'Same playback core idea: yt-dlp finds the stream, Opus carries it. On Discord it goes through FFmpeg at 64 kbps; on Twitch, one 160 kbps stream into OBS.'],
]

/* Hero mock tracks for the player widget */
const TRACKS = [
  ['Saturn', 'ZUTOMAYO', '4:10'],
  ['Plover', 'Yorushika', '4:12'],
  ['Racing Into the Night', 'YOASOBI', '4:21'],
  ['No Title', 'Reol', '4:03'],
  ['Marigold', 'Aimyon', '5:08'],
]
const DURATIONS = [250, 252, 261, 243, 308]
const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')

/* ------------------------------------------------------------------ */
/*  Theme toggle                                                      */
/* ------------------------------------------------------------------ */
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light' : 'Dark'}
    >
      <span className="theme-icon" data-theme={theme}>
        {theme === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return document.documentElement.getAttribute('data-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [activeProject, setActiveProject] = useState('pyxeebot')
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('')
  const [playing, setPlaying] = useState(true)
  const [active, setActive] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [copied, setCopied] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  const project = PROJECTS.find((p) => p.id === activeProject) || PROJECTS[0]

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('pyxeebot-theme', next)
      } catch {}
      return next
    })
  }, [])

  /* Scroll progress + section observer */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? window.scrollY / h : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.getAttribute('data-section') || '')
        })
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [activeProject])

  /* Reveal on scroll */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0.12 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [activeProject])

  /* Mobile menu */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    const onPointer = (e) => {
      if (!e.target.closest('.nav-mobile') && !e.target.closest('.menu-toggle')) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  /* Hero player */
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setElapsed((v) => {
        if (v + 1 >= DURATIONS[active]) {
          setActive((i) => (i + 1) % TRACKS.length)
          return 0
        }
        return v + 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [playing, active])

  const selectProject = (id) => {
    setActiveProject(id)
    setTabVisible(false)
    requestAnimationFrame(() => {
      setTabVisible(true)
      const el = document.getElementById('project-detail')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const copyClone = () => {
    navigator.clipboard?.writeText(`git clone ${project.repo}.git`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner shell">
          <a className="brand" href="#top">
            <img className="brand-logo" src={LOGO} alt="Pyxee" width="29" height="29" />
            <span>
              Pyxee<span>Suite</span>
            </span>
          </a>
          <div className="links">
            <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>
              Projects
            </a>
            <a href="#project-detail" className={activeSection === 'detail' ? 'active' : ''}>
              Details
            </a>
            <a href="https://github.com/Pylxyr" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
          <div className="nav-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a className="nav-cta" href={project.repo} target="_blank" rel="noopener noreferrer">
              Open repo ↗
            </a>
            <button
              className={`menu-toggle${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-mobile${menuOpen ? ' open' : ''}`}>
        <a href="#projects" onClick={() => setMenuOpen(false)}>
          Projects
        </a>
        <a href="#project-detail" onClick={() => setMenuOpen(false)}>
          Details
        </a>
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            className={p.id === activeProject ? 'active' : ''}
            onClick={() => {
              selectProject(p.id)
              setMenuOpen(false)
            }}
          >
            {p.name}
          </button>
        ))}
        <a href="https://github.com/Pylxyr" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
          GitHub ↗
        </a>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <header className="hero shell" id="top" data-section="hero">
        <div className="hero-copy reveal">
          <div className="kicker">OPEN SOURCE · SELF-HOSTED</div>
          <h1>
            Music &amp; chat tools
            <br />
            <em>that stay out of the way.</em>
          </h1>
          <p className="lede">
            Four focused projects for Discord and Twitch — from a Discord music bot that respects the
            queue, to a full Twitch chat suite, a song-request radio for OBS, and its minimal Rust
            rewrite.
          </p>
          <div className="hero-actions">
            <a className="button" href="#projects">
              Explore projects
            </a>
            <a className="button ghost" href="https://github.com/Pylxyr" target="_blank" rel="noopener noreferrer">
              View on GitHub ↗
            </a>
          </div>
        </div>

        <div className="hero-visual reveal delay-1">
          <div className="player">
            <div className="art">
              <img src={LOGO} alt="" />
              <div className="eq">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="meta">
              <div className="track-title">{TRACKS[active][0]}</div>
              <div className="track-artist">{TRACKS[active][1]}</div>
              <div className="progress-row">
                <span>{clock(elapsed)}</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${(elapsed / DURATIONS[active]) * 100}%` }}
                  />
                </div>
                <span>{TRACKS[active][2]}</span>
              </div>
              <div className="controls">
                <button onClick={() => setActive((active + TRACKS.length - 1) % TRACKS.length)} aria-label="Previous">
                  ‹
                </button>
                <button className="play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? '❚❚' : '▶'}
                </button>
                <button onClick={() => setActive((active + 1) % TRACKS.length)} aria-label="Next">
                  ›
                </button>
              </div>
            </div>
            <div className="queue-list">
              {TRACKS.map((t, i) => (
                <div key={t[0]} className={`queue${i === active ? ' current' : ''}`}>
                  <span className="q-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="q-title">{t[0]}</span>
                  <span className="q-artist">{t[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Project cards ───────────────────────────────────── */}
      <section className="projects shell" id="projects" data-section="projects">
        <div className="section-head reveal">
          <div className="kicker">01 / THE SUITE</div>
          <h2>
            Four tools.
            <br />
            <em>One philosophy.</em>
          </h2>
          <p>
            Self-hosted, open source, and built to run on the hardware you already have. No accounts,
            no telemetry, no mandatory cloud.
          </p>
        </div>

        <div className="project-grid">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              className={`project-card reveal delay-${Math.min(i + 1, 3)}${p.id === activeProject ? ' active' : ''}`}
              style={{ '--accent': p.accent }}
              onClick={() => selectProject(p.id)}
            >
              <div className="card-top">
                <span className="card-tag">{p.tag}</span>
                <span className={`card-status status-${p.status === 'Stable' ? 'stable' : 'wip'}`}>
                  {p.status}
                </span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <div className="card-stack">
                {p.stack.slice(0, 3).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="card-footer">
                <span className="card-cta">View details →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Project detail ──────────────────────────────────── */}
      <section
        className={`detail shell${tabVisible ? ' visible' : ''}`}
        id="project-detail"
        data-section="detail"
        key={activeProject}
      >
        <div className="detail-tabs reveal">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              className={p.id === activeProject ? 'active' : ''}
              style={p.id === activeProject ? { '--accent': p.accent } : undefined}
              onClick={() => selectProject(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="detail-hero reveal">
          <div>
            <div className="kicker" style={{ color: project.accent }}>
              {project.tag} · {project.status}
            </div>
            <h2>{project.name}</h2>
            <p className="detail-lede">{project.description}</p>
            <div className="detail-actions">
              <a className="button" href={project.repo} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
              <button className="copy" onClick={copyClone}>
                {copied ? 'Copied ✓' : 'Copy clone command'}
              </button>
            </div>
            <div className="stack-row">
              {project.stack.map((s) => (
                <span key={s} className="stack-pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="spec-grid">
            {project.specs.map(([val, label]) => (
              <div key={label} className="spec-cell">
                <b>{val}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="highlights">
          {project.highlights.map((h, i) => (
            <div key={h.title} className={`highlight reveal delay-${Math.min(i + 1, 3)}`}>
              <div className="h-icon" style={{ color: project.accent }}>
                {h.icon}
              </div>
              <div>
                <h4>{h.title}</h4>
                <p>{h.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ops reveal">
          <div className="terminal" style={{ '--accent': project.accent }}>
            <div className="terminal-bar"><i /><i /><i /><span>quickstart</span></div>
            <pre>{project.quickstart.map((l, i) => (
              <div key={i} className={l.startsWith('#') ? 'dim' : undefined}>
                {!l.startsWith('#') && !l.startsWith('OBS') && <b>$ </b>}{l}
              </div>
            ))}</pre>
          </div>
          <dl className="facts">
            {project.facts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        {project.roadmap && (
          <ol className="roadmap reveal" style={{ '--accent': project.accent }}>
            {project.roadmap.map(([t, st], i) => (
              <li key={t} className={`rm-${st}`}>
                <span className="rm-n">{i + 1}</span>
                <span className="rm-t">{t}</span>
                <span className="rm-s">{st}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="commands-block reveal">
          <div className="kicker">COMMANDS</div>
          <h3>What you type in chat</h3>
          <div className="cmd-grid">
            {project.commands.map(([cmd, desc]) => (
              <div key={cmd} className="cmd-row">
                <code>{cmd}</code>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lineage ─────────────────────────────────────────── */}
      <section className="lineage shell" data-section="lineage">
        <div className="reveal">
          <div className="kicker">02 / HOW THEY FIT</div>
          <h2>Two platforms.<br /><em>One shared engine room.</em></h2>
        </div>
        <div className="lineage-grid reveal">
          {LINKS.map(([a, b, why]) => (
            <div key={a + b} className="link-row">
              <button onClick={() => selectProject(PROJECTS.find((p) => p.name === a).id)}>{a}</button>
              <span className="link-arrow">⟷</span>
              <button onClick={() => selectProject(PROJECTS.find((p) => p.name === b).id)}>{b}</button>
              <p>{why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Philosophy ──────────────────────────────────────── */}
      <section className="philosophy shell" data-section="philosophy">
        <div className="reveal">
          <div className="kicker">03 / APPROACH</div>
          <h2>
            Built for the machine
            <br />
            <em>you already own.</em>
          </h2>
        </div>
        <div className="philo-grid">
          <div className="philo-card reveal delay-1">
            <h4>Local first</h4>
            <p>
              Everything runs on your hardware. Discord bots on a free-tier VPS, Twitch tools on the
              same PC you stream from. No mandatory accounts, no cloud dependency.
            </p>
          </div>
          <div className="philo-card reveal delay-2">
            <h4>Respect the queue</h4>
            <p>
              Persistence, prefetch, gapless hand-over and clear skip rules. The music keeps going
              when the process restarts or the network hiccups.
            </p>
          </div>
          <div className="philo-card reveal delay-3">
            <h4>Minimal footprint</h4>
            <p>
              From a Discord bot that fits in 1 GB RAM to a Rust radio aiming for single-digit
              megabytes idle — the goal is headroom left for everything else.
            </p>
          </div>
        </div>
      </section>

      {/* ── Closing ─────────────────────────────────────────── */}
      <section className="closing shell reveal">
        <div className="mark">
          <img src={LOGO} alt="Pyxee" />
        </div>
        <div className="kicker">OPEN SOURCE · MIT / UNLICENSE</div>
        <h2>
          Pick a tool.
          <br />
          <em>Make it yours.</em>
        </h2>
        <p>Clone any repo, follow the README, run it on your terms.</p>
        <div className="actions">
          <a className="button" href={project.repo} target="_blank" rel="noopener noreferrer">
            Open {project.name} ↗
          </a>
          <a className="button ghost" href="https://github.com/Pylxyr" target="_blank" rel="noopener noreferrer">
            All repositories
          </a>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top">
          <img className="brand-logo" src={LOGO} alt="Pyxee" width="29" height="29" />
          <span>
            Pyxee<span>Suite</span>
          </span>
        </a>
        <span>Made for late-night queues and live chats.</span>
        <div>
          <a href="https://github.com/Pylxyr" target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href="https://github.com/Pylxyr/PyxeeBot/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            Licenses
          </a>
        </div>
      </footer>
    </main>
  )
}
