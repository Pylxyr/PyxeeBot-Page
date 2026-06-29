import { useState, useEffect, useRef } from 'react'

const BASE = import.meta.env.BASE_URL

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEMO_TRACKS = [
  { title: 'Saturn',                artist: 'ZUTOMAYO',              dur: 250 },
  { title: 'Spring Thief',          artist: 'Yorushika',             dur: 290 },
  { title: 'Racing into the Night', artist: 'YOASOBI',               dur: 261 },
  { title: 'Pastel Rain',           artist: 'Sangatsu no Phantasia', dur: 212 },
  { title: 'Usseewa',               artist: 'Ado',                   dur: 204 },
]

const WAVEFORM_HEIGHTS = [3, 8, 14, 9, 5, 18, 12, 7, 16, 4, 11, 15, 6, 10, 13, 5]

const STATS = [
  { n: '124', label: 'tests passing' },
  { n: '20+', label: 'scoring signals' },
  { n: '64', label: 'kbps Opus' },
  { n: '3.11+', label: 'Python' },
]

const FEATURES = [
  {
    mark: 'Search', icon: '⊙',
    title: 'Custom Scoring Engine',
    desc: 'Each YouTube candidate is scored across 20+ factors — token overlap, sequence similarity, anchor phrases, uploader signals, live/cover penalties. You get the studio version, not the festival recording.',
  },
  {
    mark: 'Curation', icon: '≋',
    title: 'Last.fm Vibe Mode',
    desc: '`!vibe` discovers similar tracks via Last.fm\'s similarity API, sorted by match confidence. Review and deselect before queuing. Auto-refills when the queue runs low during an active vibe session.',
  },
  {
    mark: 'Pipeline', icon: '→',
    title: 'URL Pre-resolution',
    desc: 'The next track\'s stream URL is resolved in the background as soon as it\'s enqueued. No gap between tracks. The FFmpeg subprocess starts immediately before playback — no pre-buffering artifacts.',
  },
  {
    mark: 'Playback', icon: '▶',
    title: 'Live Now-Playing Panel',
    desc: 'A persistent embed with a real-time progress bar and inline controls — skip, pause, loop, queue view. Refreshes only when something visible actually changed.',
  },
  {
    mark: 'Persistence', icon: '◈',
    title: 'Queue Snapshots',
    desc: 'The queue is written to SQLite with a debounce on every mutation. Survives a restart. Per-guild prefix, DJ role, and playlist library stored alongside it.',
  },
  {
    mark: 'Debug', icon: '⌬',
    title: 'Score Transparency',
    desc: '`!why` shows exactly how the last search\'s candidates were ranked — every component score, DM-able as a full breakdown. Useful for tuning queries.',
  },
  {
    mark: 'Automation', icon: '↻',
    title: 'Autoplay Mode',
    desc: 'Enable per-server with `!autoplay`. When the queue empties, the bot silently fetches a similar track via Last.fm using the last completed track as the seed — no `!vibe` session required.',
  },
  {
    mark: 'Server', icon: '⬡',
    title: '24/7 & Per-server Controls',
    desc: '`!stay` keeps the bot connected even when the queue is empty. Per-server command prefix, DJ role, and all toggles survive restarts via SQLite.',
  },
]

const BOOST_SIGNALS = [
  { name: 'Token overlap',    desc: 'Query words found in title and uploader',             w: 90 },
  { name: 'Sequence ratio',   desc: 'Full string similarity via RapidFuzz',                w: 75 },
  { name: 'Anchor phrases',   desc: 'Artist name extracted via cross-candidate analysis',  w: 70 },
  { name: 'Topic channel',    desc: 'YouTube Music auto-channels — always studio version', w: 60 },
  { name: 'Label signals',    desc: 'Known uploaders: HYBE, SMTOWN, Avex, Victor, Lantis…',w: 50 },
  { name: 'JP original',      desc: 'Boosts CJK-title uploads for J-pop / anime searches', w: 45 },
  { name: 'View count',       desc: 'Log-scaled, capped to avoid pure popularity bias',    w: 35 },
]

const PENALTY_SIGNALS = [
  { name: 'Live penalty',     desc: 'Suppresses festival recordings, BBC sessions, TV performances', w: 80 },
  { name: 'Cover penalty',    desc: 'Suppresses piano/guitar covers, karaoke, English covers',       w: 65 },
  { name: 'Duration sanity',  desc: 'Penalises >15 min compilations and <60 s clips',                w: 50 },
]

const PIPELINE_STEPS = [
  {
    n: '01', title: 'Query submitted',
    detail: ['!play ', 'the weeknd', '\nblinding lights'],
    hl: [0],
  },
  {
    n: '02', title: 'Fetch candidates',
    detail: ['yt-dlp flat search\n', '5 results', '\nflat_extract'],
    hl: [1],
  },
  {
    n: '03', title: 'Score & rank',
    detail: ['20+ signals\ntoken · anchor\n', 'live/cover', ' ✗'],
    hl: [1],
  },
  {
    n: '04', title: 'Pre-resolve URL',
    detail: ['stream ready\n', 'next track', '\nin background'],
    hl: [1],
  },
]

const COMMANDS = {
  playback: [
    { cmd: '!play',       args: '<query>',        alias: 'p',                    desc: 'Queue a URL, playlist, or search query. Text searches use the scoring engine.' },
    { cmd: '!playnext',   args: '<query>',        alias: 'pn · DJ only',         desc: 'Insert a track at the front of the queue.' },
    { cmd: '!search',     args: '<query>',        alias: 'find, s',              desc: 'Browse scored candidates and pick one manually from a dropdown.' },
    { cmd: '!skip',       args: '',               alias: 'next',                 desc: 'Vote-skip the current track. Force-skips if you have the DJ role.' },
    { cmd: '!forceskip',  args: '',               alias: 'fs · DJ only',         desc: 'Immediately skip regardless of votes.' },
    { cmd: '!prev',       args: '',               alias: 'previous, back',       desc: 'Return to the last completed track.' },
    { cmd: '!pause',      args: '',               alias: '',                     desc: 'Pause playback.' },
    { cmd: '!resume',     args: '',               alias: '',                     desc: 'Resume paused playback.' },
    { cmd: '!stop',       args: '',               alias: 'DJ only',              desc: 'Stop playback and clear loop mode.' },
    { cmd: '!nowplaying', args: '',               alias: 'np',                   desc: 'Open the live now-playing panel with inline controls.' },
    { cmd: '!loop',       args: '',               alias: 'DJ only',              desc: 'Cycle loop mode: off → single track → full queue → off.' },
    { cmd: '!replay',     args: '',               alias: 'DJ only',              desc: 'Re-queue the current track to play again next.' },
    { cmd: '!join',       args: '',               alias: 'summon',               desc: 'Join your current voice channel.' },
    { cmd: '!leave',      args: '',               alias: 'disconnect',           desc: 'Disconnect and clear the active session.' },
  ],
  queue: [
    { cmd: '!queue',         args: '',               alias: 'q',          desc: 'Show the current queue with pagination and total duration.' },
    { cmd: '!remove',        args: '<index>',        alias: '',           desc: 'Remove a track by its queue position.' },
    { cmd: '!clear',         args: '',               alias: 'DJ only',    desc: 'Flush all queued tracks.' },
    { cmd: '!shuffle',       args: '',               alias: 'DJ only',    desc: 'Randomise the upcoming queue.' },
    { cmd: '!move',          args: '<from> <to>',    alias: 'DJ only',    desc: 'Move a track from one position to another.' },
    { cmd: '!skipto',        args: '<position>',     alias: 'DJ only',    desc: 'Jump to a queue position, dropping everything before it.' },
    { cmd: '!qsearch',       args: '<keyword>',      alias: 'qs',         desc: 'Search for a keyword within the current queue.' },
    { cmd: '!history',       args: '',               alias: '',           desc: 'Show recently played tracks this session.' },
    { cmd: '!toptracks',     args: '',               alias: 'top',        desc: 'Show the all-time most-played tracks for this server.' },
    { cmd: '!toprequestors', args: '',               alias: 'topreqs',    desc: 'Show the all-time top track requestors for this server.' },
  ],
  playlists: [
    { cmd: '!playlist save',   args: '<name>', alias: '',        desc: 'Save the current queue as a named server playlist.' },
    { cmd: '!playlist load',   args: '<name>', alias: '',        desc: 'Load a saved playlist into the queue.' },
    { cmd: '!playlist list',   args: '',       alias: '',        desc: 'List all saved playlists for this server.' },
    { cmd: '!playlist show',   args: '<name>', alias: '',        desc: 'Show the tracks in a saved playlist.' },
    { cmd: '!playlist delete', args: '<name>', alias: 'DJ only', desc: 'Delete a saved playlist.' },
  ],
  curation: [
    { cmd: '!vibe',       args: '<query>', alias: 'vb · cooldown 15s/guild', desc: 'Discover similar tracks via Last.fm. Opens a curation panel to review before queuing. Requires a Last.fm API key.' },
    { cmd: '!vibe-save',  args: '<name>',  alias: 'vsave',                   desc: 'Save the active curation session as a named playlist.' },
    { cmd: '!vibe-load',  args: '<name>',  alias: 'vload',                   desc: 'Queue a saved curated playlist.' },
    { cmd: '!vibe-list',  args: '',        alias: 'vlist',                   desc: 'List all saved curated playlists.' },
  ],
  admin: [
    { cmd: '!setdj',    args: '<role>',   alias: 'Manage Server',         desc: 'Assign a role as the DJ role for protected commands.' },
    { cmd: '!cleardj',  args: '',         alias: 'Manage Server',         desc: 'Remove the configured DJ role.' },
    { cmd: '!dj',       args: '',         alias: '',                      desc: 'Show the current DJ role.' },
    { cmd: '!setprefix',args: '<prefix>', alias: 'Manage Server',         desc: 'Change the command prefix for this server.' },
    { cmd: '!stay',     args: '',         alias: 'Manage Server',         desc: 'Toggle 24/7 mode — bot stays connected when the queue empties.' },
    { cmd: '!autoplay', args: '',         alias: 'Manage Server',         desc: 'Toggle per-server autoplay — queues a similar track via Last.fm when the queue empties.' },
    { cmd: '!stats',    args: '',         alias: 'owner only',            desc: 'Show bot process stats: versions, guild count, voice connections, memory, latency.' },
    { cmd: '!why',      args: '',         alias: 'searchdebug, scorewhy', desc: 'Show how the last search\'s candidates were scored. DM yourself a full component-level breakdown.' },
    { cmd: '!ping',     args: '',         alias: '',                      desc: 'Check gateway latency.' },
    { cmd: '!commands', args: '',         alias: 'cmds',                  desc: 'Open the command help menu.' },
  ],
}

const CONFIG_VARS = [
  { key: 'DISCORD_TOKEN',                  def: 'required', desc: 'Bot token from the Discord Developer Portal.' },
  { key: 'LASTFM_API_KEY',                 def: '—',        desc: 'Enables !vibe curation. Free key at last.fm/api.' },
  { key: 'DEFAULT_PREFIX',                 def: '!',        desc: 'Command prefix. Per-server override via !setprefix.' },
  { key: 'BOT_OWNERS',                     def: '—',        desc: 'Comma-separated owner IDs for elevated commands.' },
  { key: 'BOT_ACTIVITY_URL',               def: 'pylxyr.github.io/…', desc: 'Text shown in the bot\'s Discord status ("Watching …").' },
  { key: 'MAX_QUEUE_SIZE',                 def: '100',      desc: 'Maximum tracks allowed in the queue at once.' },
  { key: 'MAX_QUEUE_SIZE_PER_USER',        def: '0',        desc: 'Per-user track limit; 0 disables the limit.' },
  { key: 'MAX_PLAYLIST_SIZE',              def: '25',       desc: 'Maximum tracks loaded from a saved playlist.' },
  { key: 'IDLE_TIMEOUT_SECONDS',           def: '180',      desc: 'Disconnect after being idle this many seconds.' },
  { key: 'EMPTY_CHANNEL_TIMEOUT_SECONDS',  def: '60',       desc: 'Disconnect when alone in channel this long.' },
  { key: 'YTDLP_SEARCH_RESULTS',           def: '5',        desc: 'Candidates fetched per text search query.' },
  { key: 'YTDLP_EXTRACT_TIMEOUT_SECONDS',  def: '45',       desc: 'Abort yt-dlp extraction after this many seconds.' },
  { key: 'YTDLP_COOKIES_FILE',             def: '—',        desc: 'Netscape cookies file for age-restricted content.' },
  { key: 'OPUS_BITRATE_KBPS',              def: '64',       desc: 'Opus encoding bitrate for audio quality.' },
  { key: 'NP_AUTO_REFRESH',                def: 'false',    desc: 'Auto-refresh the NP embed on a timer.' },
  { key: 'NP_AUTO_REFRESH_INTERVAL',       def: '30',       desc: 'Seconds between auto-refresh edits when enabled.' },
  { key: 'LOG_LEVEL',                      def: 'INFO',     desc: 'Log verbosity: DEBUG / INFO / WARNING / ERROR.' },
  { key: 'LOG_TO_FILE',                    def: 'true',     desc: 'Write rotating log files to the LOG_DIR directory.' },
]

const INSTALL_STEPS = [
  {
    n: '1', title: 'Clone the repository',
    code: 'git clone https://github.com/Pylxyr/PyxeeBot.git\ncd PyxeeBot',
  },
  {
    n: '2', title: 'Create a virtual environment and install dependencies',
    code: 'python3 -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt',
  },
  {
    n: '3', title: 'Create your .env file',
    code: 'DISCORD_TOKEN=your_token_here\nLASTFM_API_KEY=optional_lastfm_key\nDEFAULT_PREFIX=!',
    note: 'lastfm',
  },
  {
    n: '4', title: 'Run',
    code: 'python bot.py',
    note: 'systemd',
  },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ─── ScrollProgress ───────────────────────────────────────────────────────────

function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setPct(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ theme, setTheme }) {
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return (
    <nav className="nav">
      <a href="#" className="nav-logo">
        <img src={`${BASE}assets/logo.png`} alt="PyxeeBot logo" />
        PyxeeBot
      </a>
      <div className="nav-right">
        <a href="#features" className="nav-link">Features</a>
        <a href="#commands" className="nav-link">Commands</a>
        <a href="#config"   className="nav-link">Config</a>
        <a href="#install"  className="nav-link">Install</a>
        <button className="theme-btn" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? '☀' : '☽'}
        </button>
      </div>
    </nav>
  )
}

// ─── Waveform ─────────────────────────────────────────────────────────────────

function Waveform({ playing }) {
  return (
    <div className={`waveform${playing ? ' playing' : ''}`} aria-hidden="true">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{ '--h': `${h}px`, '--i': i }}
        />
      ))}
    </div>
  )
}

// ─── NowPlayingMockup ─────────────────────────────────────────────────────────

function fmt(s) {
  const sec = Math.floor(s)
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function NowPlayingMockup() {
  const [idx, setIdx]           = useState(0)
  const [progress, setProgress] = useState(27)
  const [playing, setPlaying]   = useState(true)
  const [loopOn, setLoopOn]     = useState(false)

  const track     = DEMO_TRACKS[idx]
  const nextTrack = DEMO_TRACKS[(idx + 1) % DEMO_TRACKS.length]
  const queueLeft = DEMO_TRACKS.length - 2
  const elapsed   = track.dur * progress / 100

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setIdx(i => (i + 1) % DEMO_TRACKS.length); return 0 }
        return p + 0.4
      })
    }, 120)
    return () => clearInterval(id)
  }, [playing])

  function skip() { setIdx(i => (i + 1) % DEMO_TRACKS.length); setProgress(0) }
  function prev() { setIdx(i => (i - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length); setProgress(0) }

  return (
    <div className="hero-right">
      <div className="discord-window">
        <div className="discord-titlebar">
          <span className="discord-dot red" />
          <span className="discord-dot yellow" />
          <span className="discord-dot green" />
          <span className="discord-titlebar-label">PyxeeBot — #music</span>
        </div>

        <div className="discord-body">
          <div className="discord-sidebar">
            <div className="discord-sidebar-icon">
              <img src={`${BASE}assets/logo.png`} alt="PyxeeBot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="discord-sidebar-icon small">+</div>
          </div>

          <div className="discord-channel-col">
            <div className="discord-channel-header">Text Channels</div>
            {['general', 'music', 'bot-spam'].map(ch => (
              <div key={ch} className={`discord-channel-item${ch === 'music' ? ' active' : ''}`}>
                <span className="discord-channel-hash">#</span>{ch}
              </div>
            ))}
          </div>

          <div className="discord-main">
            <div className="discord-main-header">
              <span className="discord-channel-hash">#</span>music
            </div>
            <div className="discord-messages">
              <div className="discord-msg">
                <div className="discord-avatar">
                  <img src={`${BASE}assets/logo.png`} alt="PyxeeBot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="discord-msg-body">
                  <div className="discord-msg-meta">
                    <span className="discord-bot-name">PyxeeBot</span>
                    <span className="discord-app-badge">APP</span>
                    <span className="discord-ts">Today at 11:42 PM</span>
                  </div>

                  <div className="discord-embed">
                    <div className="embed-title">
                      <Waveform playing={playing} />
                      <span style={{ marginLeft: '0.5rem' }}>Now Playing</span>
                      <span className="embed-note" style={{ marginLeft: 'auto' }}>
                        {playing ? '▶ playing' : '⏸ paused'}
                      </span>
                    </div>

                    <div className="embed-track-title">{track.title}</div>
                    <div className="embed-track-artist">{track.artist} · {fmt(track.dur)}</div>

                    <div className="embed-progress-track">
                      <div className="embed-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="embed-times">
                      <span>{fmt(elapsed)}</span>
                      <span>{fmt(track.dur)}</span>
                    </div>

                    <div className="embed-controls">
                      <button className="embed-ctrl" onClick={prev} title="Previous">⏮</button>
                      <button className="embed-ctrl primary" onClick={() => setPlaying(p => !p)}>
                        {playing ? '⏸' : '▶'}
                      </button>
                      <button className="embed-ctrl" onClick={skip} title="Skip">⏭</button>
                      <button
                        className={`embed-ctrl${loopOn ? ' primary' : ''}`}
                        onClick={() => setLoopOn(l => !l)}
                        title={loopOn ? 'Loop: on' : 'Loop: off'}
                      >⟳</button>
                      <button className="embed-ctrl" title="Queue">☰</button>
                    </div>

                    <div className="embed-queue-info">
                      <div className="embed-up-next">
                        Up next · <strong>{nextTrack.title}</strong> — {nextTrack.artist}
                      </div>
                      <div className="embed-queue-count">+ {queueLeft} more in queue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="hero">
      <div className="hero-left">
        <div className="hero-eyebrow">Self-hosted · Open source · Discord</div>
        <h1>Music that plays<br /><em>what you asked for.</em></h1>
        <p className="hero-desc">
          A Discord music bot with a custom multi-factor search scoring engine, Last.fm curation,
          queue persistence, and a live now-playing panel. Built for servers that care about
          getting the right track.
        </p>
        <div className="hero-actions">
          <a href="https://github.com/Pylxyr/PyxeeBot" className="btn btn-primary"
             target="_blank" rel="noreferrer">View on GitHub ↗</a>
          <a href="#install" className="btn btn-ghost">Get started</a>
        </div>
        <div className="hero-meta">
          <div className="meta-item ok"><div className="meta-dot" /> Python 3.11+</div>
          <div className="meta-item ok"><div className="meta-dot" /> discord.py 2.7.1</div>
          <div className="meta-item ok"><div className="meta-dot" /> yt-dlp 2026.06.09</div>
          <div className="meta-item"><div className="meta-dot" /> MIT License</div>
          <div className="meta-item"><div className="meta-dot" /> Self-hosted</div>
        </div>
      </div>
      <NowPlayingMockup />
    </section>
  )
}

// ─── StatsRow ─────────────────────────────────────────────────────────────────

function StatsRow() {
  const [ref, visible] = useReveal(0.2)
  return (
    <div ref={ref} className={`stats-row reveal${visible ? ' visible' : ''}`}>
      {STATS.map((s, i) => (
        <div key={s.label} className="stat-item" style={{ '--delay': `${i * 0.07}s` }}>
          <span className="stat-n">{s.n}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function Pipeline() {
  const [ref, visible] = useReveal()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % PIPELINE_STEPS.length), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="pipeline" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">How it works</div>
        <h2>From query to audio in four steps.</h2>
        <p style={{ maxWidth: 520 }}>
          Every <code style={{ color: 'var(--accent)', fontSize: '0.9em', fontFamily: 'var(--font-mono)' }}>!play</code> command
          runs through the same pipeline — scoring filters out live recordings,
          covers, and compilations before the stream URL ever resolves.
        </p>
      </div>

      <div className={`pipeline-steps reveal${visible ? ' visible delay-1' : ''}`}>
        {PIPELINE_STEPS.map((step, i) => (
          <div
            key={step.n}
            className={`pipeline-step${active === i ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            <div className="pipeline-num">{step.n}</div>
            <div className="pipeline-title">{step.title}</div>
            <div className="pipeline-detail">
              {step.detail.map((seg, j) =>
                step.hl.includes(j)
                  ? <span key={j} className="hl">{seg}</span>
                  : <span key={j}>{seg}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const [ref, visible] = useReveal()
  return (
    <section id="features" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">What it does</div>
        <h2>Built around one thing.</h2>
        <p>Getting the right track, not just the most-viewed result.</p>
      </div>

      <div className={`features-grid reveal${visible ? ' visible delay-1' : ''}`}>
        {FEATURES.map(f => (
          <div key={f.mark} className="feature-card">
            <div className="feature-card-header">
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-mark">{f.mark}</span>
            </div>
            <h3>{f.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: f.desc.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function SignalBar({ weight, type, visible }) {
  return (
    <div className="signal-bar-track">
      <div
        className={`signal-bar-fill ${type}`}
        style={{ width: visible ? `${weight}%` : '0%' }}
      />
    </div>
  )
}

function Scoring() {
  const [ref, visible] = useReveal()
  return (
    <section id="scoring" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">Scoring engine</div>
        <h2>Every candidate is ranked, not just picked.</h2>
        <p style={{ maxWidth: 560 }}>
          The engine runs each YouTube result through boost and penalty signals simultaneously.
          Use <code style={{ color: 'var(--accent)', fontSize: '0.9em', fontFamily: 'var(--font-mono)' }}>!why</code> after
          any search to see the full component-level breakdown for your last query.
        </p>
      </div>

      <div className={`signals-grid reveal${visible ? ' visible delay-1' : ''}`}>
        <div>
          <span className="signals-col-label boost">↑ Boost signals</span>
          {BOOST_SIGNALS.map(s => (
            <div key={s.name} className="signal-row">
              <span className="signal-dot boost" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="signal-name-row">
                  <span className="signal-name">{s.name}</span>
                </div>
                <div className="signal-desc">{s.desc}</div>
                <SignalBar weight={s.w} type="boost" visible={visible} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="signals-col-label penalty">↓ Penalty signals</span>
          {PENALTY_SIGNALS.map(s => (
            <div key={s.name} className="signal-row">
              <span className="signal-dot penalty" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="signal-name-row">
                  <span className="signal-name">{s.name}</span>
                </div>
                <div className="signal-desc">{s.desc}</div>
                <SignalBar weight={s.w} type="penalty" visible={visible} />
              </div>
            </div>
          ))}
          <div className="curation-note">
            <div className="curation-note-label">Curation mode</div>
            <div className="curation-note-body">
              When <code>!vibe</code> is active, live/session/festival tokens carry <strong>3× the penalty weight</strong> to keep discovered tracks studio-quality.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Commands ─────────────────────────────────────────────────────────────────

const CMD_TABS = ['playback', 'queue', 'playlists', 'curation', 'admin']

function Commands() {
  const [ref, visible]    = useReveal()
  const [tab, setTab]     = useState('playback')
  const [query, setQuery] = useState('')

  const rows     = COMMANDS[tab] || []
  const term     = query.trim().toLowerCase().replace(/^!/, '')
  const filtered = term
    ? rows.filter(r =>
        r.cmd.toLowerCase().includes(term) ||
        (r.alias || '').toLowerCase().includes(term) ||
        r.desc.toLowerCase().includes(term)
      )
    : rows

  function switchTab(t) { setTab(t); setQuery('') }

  return (
    <section id="commands" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">Reference</div>
        <h2>Commands</h2>
        <p>Default prefix is <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>!</code>. Configurable per server.</p>
      </div>

      <div className={`reveal${visible ? ' visible delay-1' : ''}`}>
        <div className="cmd-search-wrap">
          <span className="cmd-search-label">Filter</span>
          <div className="cmd-search-inner">
            <span className="cmd-search-prefix">!</span>
            <input
              className="cmd-search-input"
              type="text"
              placeholder="search commands…"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="cmd-tabs">
          {CMD_TABS.map(t => (
            <button
              key={t}
              className={`cmd-tab${tab === t ? ' active' : ''}`}
              onClick={() => switchTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="cmd-count-badge">({COMMANDS[t].length})</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && term && (
          <p className="cmd-no-results">No commands match "{term}".</p>
        )}

        {filtered.map(r => (
          <div key={r.cmd} className="cmd-row">
            <div className="cmd-name">
              {r.cmd}{' '}
              {r.args && <span className="cmd-args">{r.args}</span>}
              {r.alias && <div className="cmd-alias">{r.alias}</div>}
            </div>
            <div className="cmd-desc">{r.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Install ──────────────────────────────────────────────────────────────────

function CopyBtn({ code }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copy}>
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

function StepNote({ noteKey }) {
  if (noteKey === 'lastfm') return (
    <div className="env-note">
      <code>LASTFM_API_KEY</code> is optional — only needed for <code>!vibe</code> curation.
      Get a free key at <a href="https://www.last.fm/api" target="_blank" rel="noreferrer">last.fm/api</a>.
    </div>
  )
  if (noteKey === 'systemd') return (
    <div className="env-note">
      On Ubuntu/Oracle Cloud: <code>bash deploy/setup_oracle.sh</code> handles this step automatically — it installs the service, enables it, and starts the bot. For manual setup, the service file is at{' '}
      <code>deploy/musicbot.service</code> and documented in the{' '}
      <a href="https://github.com/Pylxyr/PyxeeBot#readme" target="_blank" rel="noreferrer">README</a>.
    </div>
  )
  return null
}

function Install() {
  const [ref, visible] = useReveal()
  return (
    <section id="install" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">Setup</div>
        <h2>Self-host in four steps.</h2>
        <p>Requires Python 3.11+, FFmpeg on your PATH, and a Discord bot token.</p>
      </div>

      <div className={`install-steps reveal${visible ? ' visible delay-1' : ''}`}>
        {INSTALL_STEPS.map(step => (
          <div key={step.n} className="install-step">
            <div className="step-num">{step.n}</div>
            <div className="step-body">
              <h3>{step.title}</h3>
              <pre>
                <code>{step.code}</code>
                <CopyBtn code={step.code} />
              </pre>
              {step.note && <StepNote noteKey={step.note} />}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Config ───────────────────────────────────────────────────────────────────

function Config() {
  const [ref, visible] = useReveal()
  return (
    <section id="config" className="section">
      <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>
        <div className="section-label">Configuration</div>
        <h2>All environment variables.</h2>
        <p className="config-note">
          Copy <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>.env.example</code> from
          the repo root and fill in your values. Only <code style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>DISCORD_TOKEN</code> is required.
        </p>
      </div>

      <div className={`table-wrap reveal${visible ? ' visible delay-1' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {CONFIG_VARS.map(v => (
              <tr key={v.key}>
                <td>{v.key}</td>
                <td className={v.def === 'required' ? 'required' : ''}>{v.def}</td>
                <td>{v.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer>
      <div className="footer-left"><span>PyxeeBot</span> — MIT License</div>
      <div className="footer-links">
        <a href="https://github.com/Pylxyr/PyxeeBot"        target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://github.com/Pylxyr/PyxeeBot#readme" target="_blank" rel="noreferrer">README</a>
        <a href="https://github.com/Pylxyr/PyxeeBot/issues" target="_blank" rel="noreferrer">Issues</a>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <>
      <ScrollProgress />
      <Nav theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <StatsRow />
        <Pipeline />
        <Features />
        <Scoring />
        <Commands />
        <Install />
        <Config />
      </main>
      <Footer />
    </>
  )
}
