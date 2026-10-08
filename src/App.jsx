import { useEffect, useState, useCallback } from 'react'
import './App.css'

import { Mock } from './Mockups'

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
    blurb: 'Self-hosted music bot for Discord.',
    description:
      'Plays YouTube audio in Discord voice channels. Builds similar-track queues from Last.fm and restores the queue after a restart. Runs on a single-core VPS with 1 GB of RAM.',
    stack: ['Python 3.11+', 'discord.py', 'yt-dlp', 'aiosqlite'],
    repo: 'https://github.com/Pylxyr/PyxeeBot',
    highlights: [
      {
        title: 'Search',
        text: '!play queues yt-dlp’s top match. !search lists up to 10 candidates so you can pick the right one.',
      },
      {
        title: 'Last.fm curation',
        text: '!vibe builds a similar-track queue you can trim before adding. !autoplay queues a similar track when the queue runs empty. Both need a free Last.fm API key; the bot runs without one.',
      },
      {
        title: 'Persistence',
        text: 'Queues, playlists and per-server settings are stored in SQLite. Background prefetch and near-end preload reduce gaps between tracks.',
      },
      {
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
    previews: [
      { m: 'dcNow', wide: false, cap: '!p zutomayo saturn queues the top yt-dlp match. The panel carries transport buttons, Queue and Close, and shows who requested the track.' },
      { m: 'dcVibe', wide: false, cap: '!vb yorushika plover asks Last.fm for similar tracks. Here 24 of 25 are selected; trim from the dropdown, then Queue All, Save Playlist or Cancel.' },
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
    blurb: 'Chat bot for Twitch: points, moderation and commands.',
    description:
      'A standalone Twitch chat bot with a points economy, AutoMod, custom commands, giveaways, predictions and a password-gated settings dashboard. Everything runs on your machine — no cloud account required.',
    stack: ['Python 3.11+', 'TwitchIO 3', 'SQLite', 'aiohttp'],
    repo: 'https://github.com/Pylxyr/pyxee-twitch-bot',
    highlights: [
      {
        title: 'Points & ranks',
        text: 'Passive points and watch-time, ranks from Newcomer to Legend, !daily, !give, opt-in !gamble and !duel. Subs can earn at a higher rate.',
      },
      {
        title: 'AutoMod',
        text: 'Link, caps and blocked-term filters with VIP/sub exemptions, !permit, warn-then-timeout escalation and optional message deletion.',
      },
      {
        title: 'Custom commands',
        text: 'Mod-managed with variables, cooldowns and role gates. Automatically listed on the public /commands reference page.',
      },
      {
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
    previews: [
      { m: 'chat', wide: false, cap: 'Points, quotes and moderation run from chat; the bot answers as itself.' },
      { m: 'console', wide: false, cap: 'The local web server (127.0.0.1:8098 by default) lists every command and serves /healthz.' },
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
    blurb: 'Song requests for Twitch, played into OBS.',
    description:
      'Viewers type !sr in chat. The bot queues the track, serves one continuous Opus stream and a now-playing overlay. Runs entirely on your PC — 127.0.0.1 only, no telemetry, Windows installer or Linux from source.',
    stack: ['Python 3.11+', 'Electron', 'yt-dlp', 'ffmpeg', 'Opus'],
    repo: 'https://github.com/Pylxyr/Twitch-Radio',
    highlights: [
      {
        title: 'One continuous stream',
        text: 'OBS Media Source points at http://127.0.0.1:8098/stream.opus. Gapless hand-over, silence when idle instead of a disconnect.',
      },
      {
        title: 'Now-playing overlay',
        text: 'Transparent browser source at /overlay. Shows the current track and requester — size it however you like in OBS.',
      },
      {
        title: 'Resource use',
        text: 'Lookups run in short-lived processes that exit after idle. Encoder only runs while something is listening. Under 100 MB when quiet.',
      },
      {
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
    previews: [
      { m: 'dash', wide: true, cap: 'The desktop dashboard (v1.1.0): uptime, OBS listeners, queue, per-component health checks, and the OBS source URLs with copy buttons.' },
      { m: 'overlay', wide: false, cap: 'The overlay Browser Source: current track, who requested it, and what is up next.' },
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
    blurb: 'Rust rewrite of Twitch Radio.',
    description:
      'A Rust rewrite of Twitch Radio aimed at minimal binary size and memory use. One native binary, in-process Opus encode, no Electron, no bundled Python, no ffmpeg processes. Audio and lookups work today; the Twitch side is next.',
    stack: ['Rust 1.85+', 'tokio', 'hyper', 'symphonia', 'rustls', 'libopus'],
    repo: 'https://github.com/Pylxyr/Pryxea',
    highlights: [
      {
        title: 'Binary size',
        text: 'Server binary ~0.76 MB. Full lookup + engine example ~2.23 MB. Idle RSS ~2.5 MB on one thread.',
      },
      {
        title: 'In-process audio',
        text: 'Decode (Opus / AAC-LC), resample, encode and publish five 20 ms Opus packets per Ogg page — all inside the same process.',
      },
      {
        title: 'On-demand tools',
        text: 'yt-dlp and QuickJS are downloaded on first use, hash-checked, and killed with their process tree when a lookup finishes.',
      },
      {
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
    previews: [
      { m: 'meter', wide: false, cap: 'Measured on Linux x86-64: binary size and resident memory from idle to a full streaming load.' },
      { m: 'overlay', wide: false, cap: 'The overlay and WebSocket hub are already implemented (roadmap step 1); Twitch comes next.' },
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
  ['PyxeeBot', 'Twitch Radio', 'Both use yt-dlp to find the stream and Opus to carry it. On Discord the audio goes through FFmpeg at 64 kbps; on Twitch it is one 160 kbps stream into OBS.'],
]

/* Hero preview data (demo content, shaped like each project's real commands) */
const PV = {
  pyxeebot: { chip: 'Discord · now-playing panel', hero: ['dcNow'] },
  'twitch-radio': { chip: 'Desktop dashboard + OBS overlay', hero: ['dashLite', 'overlay'] },
  'twitch-bot': { chip: 'Twitch · chat', hero: ['chat'] },
  pryxea: { chip: 'Rust · measured footprint', hero: ['meter'] },
}

const GITHUB = 'https://github.com/Pylxyr'

const APPROACH = [
  [
    'Local first',
    'Everything runs on your hardware. Discord bots on a free-tier VPS, Twitch tools on the same PC you stream from. No mandatory accounts, no cloud dependency.',
  ],
  [
    'Playback continuity',
    'Queue persistence, prefetch, gapless hand-over and explicit skip rules. Playback resumes after a restart.',
  ],
  [
    'Small footprint',
    'The Discord bot targets a host with 1 GB of RAM. The Rust radio idles at about 2.5 MB.',
  ],
]

/* ------------------------------------------------------------------ */
/*  Small pieces                                                      */
/* ------------------------------------------------------------------ */
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}

function Brand({ logo = true }) {
  return (
    <a className="brand" href="#top">
      {logo && <img className="brand-logo" src={LOGO} alt="" width="22" height="22" />}
      <span>
        Pyxee<span>Suite</span>
      </span>
    </a>
  )
}

/* Label rail (cols 1–3) + content (cols 4–12) */
function Section({ n, label, className = '', children, ...rest }) {
  return (
    <section className={`section shell ${className}`} {...rest}>
      <div className="rail">
        <span className="idx">{n}</span>
        <span>{label}</span>
      </div>
      <div className="body">{children}</div>
    </section>
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
  const [activeSection, setActiveSection] = useState('')
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

  /* Section observer (nav highlight) */
  useEffect(() => {
    let raf = 0
    const calc = () => {
      raf = 0
      const els = [...document.querySelectorAll('[data-section]')]
      const line = window.innerHeight * 0.35
      let cur = ''
      els.forEach((el) => { if (el.getBoundingClientRect().top <= line) cur = el.dataset.section })
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && els.length) cur = els[els.length - 1].dataset.section
      setActiveSection(cur)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])

  /* Reveal on scroll */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0, rootMargin: '0px 0px 160px 0px' },
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

  /* One path for every project control. scroll:false keeps the viewer on the hero preview. */
  const selectProject = (id, { scroll = true } = {}) => {
    setActiveProject(id)
    if (!scroll) return
    setTabVisible(false)
    requestAnimationFrame(() => {
      setTabVisible(true)
      document.getElementById('project-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const copyClone = () => {
    navigator.clipboard?.writeText(`git clone ${project.repo}.git`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main>
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner shell">
          <Brand />
          <div className="links">
            <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>
              Projects
            </a>
            <a href="#project-detail" className={activeSection === 'detail' ? 'active' : ''}>
              Details
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
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
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
          GitHub ↗
        </a>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <header className="hero shell" id="top" data-section="hero">
        <div className="hero-head reveal">
          <div className="label">Open source · Self-hosted</div>
          <h1>Self-hosted music and chat tools for Discord and Twitch.</h1>
        </div>

        <div className="hero-side reveal">
          <p className="lede">
            Four open-source projects: a Discord music bot, a Twitch chat bot, a song-request radio
            for OBS, and a Rust rewrite of that radio. Each one runs on your own machine.
          </p>
          <div className="hero-actions">
            <a className="button" href="#projects">
              View projects
            </a>
            <a className="button ghost" href={GITHUB} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="hero-switch" role="tablist" aria-label="Preview project">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={p.id === activeProject}
                className={p.id === activeProject ? 'on' : ''}
                onClick={() => selectProject(p.id, { scroll: false })}
              >
                {p.name.replace('Pyxee ', '')}
              </button>
            ))}
          </div>
          <div className="preview" key={project.id}>
            <div className="pv-head">
              <span>{PV[project.id].chip}</span>
              <a className="pv-demo" href="#project-detail">Details ↓</a>
            </div>
            <div className="pv-body">
              {PV[project.id].hero.map((id) => (
                <Mock key={id} id={id} cmds={project.commands} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Projects ────────────────────────────────────────── */}
      <Section n="01" label="Projects" id="projects" data-section="projects" className="projects">
        <div className="section-head reveal">
          <h2>Four projects</h2>
          <p className="prose">
            Self-hosted and open source. No Pyxee account, no telemetry, no required cloud service.
          </p>
        </div>

        <div className="index reveal">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              className={`index-row${p.id === activeProject ? ' active' : ''}`}
              onClick={() => selectProject(p.id)}
            >
              <span className="ix-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="ix-main">
                <b>{p.name}</b>
                <span>{p.blurb}</span>
              </span>
              <span className="ix-stack">{p.stack.slice(0, 3).join(' · ')}</span>
              <span className={`status ${p.status === 'Stable' ? 'stable' : 'wip'}`}>{p.status}</span>
              <span className="ix-go">Details →</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Project detail ──────────────────────────────────── */}
      <section
        className={`section detail shell${tabVisible ? ' visible' : ''}`}
        id="project-detail"
        data-section="detail"
        key={activeProject}
      >
        <div className="rail">
          <div>
            <span className="idx">02</span> <span>Details</span>
          </div>
          <div className="detail-tabs" role="group" aria-label="Project">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                className={p.id === activeProject ? 'active' : ''}
                aria-current={p.id === activeProject ? 'true' : undefined}
                onClick={() => selectProject(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="body">
          <div className="detail-head reveal">
            <div className="label">
              {project.tag} · {project.status}
            </div>
            <h2>{project.name}</h2>
            <p className="detail-lede">{project.description}</p>
            <div className="detail-actions">
              <a className="button" href={project.repo} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
              <button className="button ghost" onClick={copyClone}>
                {copied ? 'Copied' : 'Copy clone command'}
              </button>
            </div>
            <div className="stack-row">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>

          <div className="specs reveal">
            {project.specs.map(([val, label]) => (
              <div key={label} className="spec">
                <b>{val}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="highlights">
            {project.highlights.map((h) => (
              <div key={h.title} className="highlight reveal">
                <h4>{h.title}</h4>
                <p>{h.text}</p>
              </div>
            ))}
          </div>

          <div className="sub reveal">
            <span className="label">Setup</span>
            <div className="ops">
              <div>
                <h5>Quickstart</h5>
                <div className="terminal">
                  <pre>{project.quickstart.map((l, i) => (
                    <div key={i} className={l.startsWith('#') ? 'dim' : undefined}>
                      {!l.startsWith('#') && !l.startsWith('OBS') && <b>$ </b>}{l}
                    </div>
                  ))}</pre>
                </div>
              </div>
              <div>
                <h5>Facts</h5>
                <dl className="facts">
                  {project.facts.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {project.roadmap && (
            <div className="sub reveal">
              <span className="label">Roadmap</span>
              <ol className="roadmap">
                {project.roadmap.map(([t, st], i) => (
                  <li key={t} className={`rm-${st}`}>
                    <span className="rm-n">{i + 1}</span>
                    <span className="rm-t">{t}</span>
                    <span className="rm-s">{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {project.previews && (
            <div className="sub shots reveal">
              <span className="label">Interface · redrawn from the real UI</span>
              <div className="shots-grid">
                {project.previews.map((pv) => (
                  <figure key={pv.m} className={pv.wide ? 'wide' : undefined}>
                    <Mock id={pv.m} cmds={project.commands} />
                    <figcaption>{pv.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="sub reveal">
            <span className="label">Commands</span>
            <div className="cmd-grid">
              {project.commands.map(([cmd, desc]) => (
                <div key={cmd} className="cmd-row">
                  <code>{cmd}</code>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Relationships ───────────────────────────────────── */}
      <Section n="03" label="Relationships" data-section="lineage" className="lineage">
        <div className="section-head reveal">
          <h2>How the projects relate</h2>
        </div>
        <div className="lineage-grid reveal">
          {LINKS.map(([a, b, why]) => (
            <div key={a + b} className="link-row">
              <div className="link-pair">
                <button className="link" onClick={() => selectProject(PROJECTS.find((p) => p.name === a).id)}>{a}</button>
                <span className="link-arrow">↔</span>
                <button className="link" onClick={() => selectProject(PROJECTS.find((p) => p.name === b).id)}>{b}</button>
              </div>
              <p>{why}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Approach ────────────────────────────────────────── */}
      <Section n="04" label="Approach" data-section="philosophy" className="approach">
        <div className="section-head reveal">
          <h2>Runs on hardware you already have</h2>
        </div>
        <div className="reveal">
          {APPROACH.map(([title, text]) => (
            <div key={title} className="principle">
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Closing ─────────────────────────────────────────── */}
      <Section n="05" label="Source" className="closing reveal">
        <div className="section-head">
          <h2>Get the code</h2>
          <p className="prose">Clone a repository and follow its README. Licensed MIT or Unlicense, depending on the project.</p>
        </div>
        <div className="actions">
          <a className="button" href={project.repo} target="_blank" rel="noopener noreferrer">
            Open {project.name} ↗
          </a>
          <a className="button ghost" href={GITHUB} target="_blank" rel="noopener noreferrer">
            All repositories ↗
          </a>
        </div>
      </Section>

      <footer className="footer shell">
        <Brand />
        <span>Open-source projects by Pylxyr.</span>
        <div>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">
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
