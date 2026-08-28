import { useEffect, useRef, useState } from 'react'
import './App.css'

const BASE = import.meta.env.BASE_URL
const LOGO = `${BASE}assets/logo.png`
const REPO = 'https://github.com/Pylxyr/PyxeeBot'

/* ---------------------------------------------------------------------- */
/*  "Now playing" content for the hero mockup — real tracks, so the panel */
/*  reflects something a room might actually be listening to. Durations   */
/*  match each track's official release length.                          */
/* ---------------------------------------------------------------------- */
const tracks = [
  ['Saturn', 'ZUTOMAYO', '4:10'],
  ['Plover', 'Yorushika', '4:12'],
  ['Racing Into the Night', 'YOASOBI', '4:21'],
  ['No Title', 'Reol', '4:03'],
  ['Marigold', 'Aimyon', '5:08'],
]
const durations = [250, 252, 261, 243, 308]
const clock = (seconds) => Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')

const features = [
  [
    '⌕',
    'SEARCH',
    'A fast default, an easy fix.',
    '!play takes a URL or a search query and queues yt-dlp\u2019s top match right away \u2014 no picker in the way. Got the wrong one? !search lists up to 10 candidates so you can pick it yourself.',
  ],
  [
    '✦',
    'VIBE',
    'Curate the room, not just the queue.',
    '!vibe asks Last.fm what sounds like your seed track and builds a review queue you can trim before anything plays. It\u2019ll prompt a refill once things run low, or you can hand that off to !autoplay entirely. Optional \u2014 bring your own free Last.fm API key.',
  ],
  [
    '◉',
    'PLAYBACK',
    'Playback without the maintenance.',
    'Background prefetch and a near-end preload keep gaps out of the set. Queues and playlists live in SQLite, so a restart doesn\u2019t end the night.',
  ],
]

const extras = [
  ['DJ roles & vote-skip', '!setdj hands sensitive controls to a role \u2014 server managers keep them too; everyone else votes to skip.'],
  ['Slash commands included', 'Nearly every command is registered as a hybrid command \u2014 type ! or use /.'],
  ['Per-server prefix', '!setprefix changes it; ! still works as a permanent fallback.'],
  ['Auto-disconnect', 'Leaves voice when idle or when the channel empties out, on your timers.'],
]

const commands = [
  ['!play', 'Queue a URL, playlist, or search query'],
  ['!search', 'Browse results and pick before it queues'],
  ['!vibe', 'Build a Last.fm-curated queue from a seed track'],
  ['!nowplaying', 'Live panel: prev, pause/resume, skip, loop'],
  ['!queue', 'See what\u2019s coming up next'],
  ['!autoplay', 'Keep the queue topped up automatically'],
  ['!playlist', 'Save, load, and manage server playlists'],
  ['!setdj', 'Restrict sensitive controls to a DJ role'],
  ['!skip', 'Vote to skip \u2014 or force it instantly as DJ'],
]

const demoTracks = [
  ['ZUTOMAYO', 'Saturn'],
  ['Yorushika', 'Plover'],
  ['Reol', 'No Title'],
  ['Aimyon', 'Marigold'],
]

function useTheme() {
  const [theme, setThemeState] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('pyxeebot-theme', next)
    } catch {
      /* private browsing / storage disabled -- theme just won't persist */
    }
    setThemeState(next)
  }

  return [theme, toggle]
}

/* ---------------------------------------------------------------------- */
/*  Scroll-driven polish: reveal-on-scroll, active nav section, a thin    */
/*  progress bar, and a restrained tilt on the hero player. All of it     */
/*  backs off automatically under prefers-reduced-motion.                 */
/* ---------------------------------------------------------------------- */
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!els.length) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? h.scrollTop / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

function useTilt(ref, maxDeg = 5) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg)`
    }
    const handleLeave = () => {
      el.style.transform = ''
    }
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [ref, maxDeg])
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4.6" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
          <path d="M20.4 14.7A8.6 8.6 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1Z" />
        </svg>
      )}
    </button>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [playing, setPlaying] = useState(true)
  const [active, setActive] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const playerRef = useRef(null)

  useScrollReveal()
  useTilt(playerRef)
  const activeSection = useActiveSection(['top', 'why', 'commands'])
  const progress = useScrollProgress()

  useEffect(() => {
    setElapsed(0)
  }, [active])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onPointerDown = (e) => {
      if (!e.target.closest('.nav, #mobile-menu')) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= durations[active]) {
          setActive((index) => (index + 1) % tracks.length)
          return 0
        }
        return value + 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [playing, active])

  const next = () => setActive((active + 1) % tracks.length)
  const prev = () => setActive((active + tracks.length - 1) % tracks.length)

  const copyInstall = () => {
    navigator.clipboard?.writeText('git clone https://github.com/Pylxyr/PyxeeBot.git')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />

      <nav className="nav">
        <div className="nav-inner shell">
          <a className="brand" href="#top">
            <img className="brand-logo" src={LOGO} alt="PyxeeBot" width="29" height="29" />
            <span>
              Pyxee<span>Bot</span>
            </span>
          </a>
          <div className="links">
            <a href="#why" className={activeSection === 'why' ? 'active' : ''}>
              Why Pyxee
            </a>
            <a href="#commands" className={activeSection === 'commands' ? 'active' : ''}>
              Commands
            </a>
            <a href={REPO} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
          <div className="nav-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a className="nav-cta" href={`${REPO}#local-setup`} target="_blank" rel="noopener noreferrer">
              Get started ↗
            </a>
            <button
              className={`menu-toggle${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div id="mobile-menu" className={`nav-mobile${menuOpen ? ' open' : ''}`}>
        <a href="#why" onClick={() => setMenuOpen(false)}>
          Why Pyxee
        </a>
        <a href="#commands" onClick={() => setMenuOpen(false)}>
          Commands
        </a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
          GitHub ↗
        </a>
        <a
          className="nav-mobile-cta"
          href={`${REPO}#local-setup`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          Get started ↗
        </a>
      </div>

      <section id="top" className="hero shell">
        <div>
          <div className="kicker reveal">
            <i /> SELF-HOSTED · OPEN SOURCE · DISCORD MUSIC
          </div>
          <h1 className="reveal delay-1">
            A music bot that
            <br />
            <em>respects the queue.</em>
          </h1>
          <p className="lede reveal delay-2">
            PyxeeBot is a self-hosted Discord bot for communities that want the right track on the first
            try, a queue that survives a restart, and a room that doesn&rsquo;t need babysitting.
          </p>
          <div className="actions reveal delay-3">
            <a className="button" href={`${REPO}#local-setup`} target="_blank" rel="noopener noreferrer">
              Install PyxeeBot ↗
            </a>
            <a href="#why" className="text-link">
              See how it works ↓
            </a>
          </div>
          <div className="meta reveal delay-4">
            <span>
              <b>MIT</b> LICENSED
            </span>
            <span>
              <b>PYTHON 3.11+</b>
            </span>
            <span>
              <b>1-CORE</b> VPS READY
            </span>
          </div>
        </div>

        <div className="player-wrap" ref={playerRef}>
          <div className="badge one">
            <span>SQLite queue</span>survives a restart
          </div>
          <div className="badge two">
            <span>128-entry cache</span>fewer repeat lookups
          </div>

          <div className="player">
            <header>
              <b>
                <span className="eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                NOW PLAYING
              </b>
              <span># late-night-radio</span>
            </header>
            <div className="art">
              <small>PYXEE / LIVE SET</small>
              <strong>{active === 0 ? '風' : active === 1 ? '月' : '夜'}</strong>
            </div>
            <div className="track">
              <div>
                <h2>{tracks[active][0]}</h2>
                <p>{tracks[active][1]}</p>
              </div>
              <span>{tracks[active][2]}</span>
            </div>
            <div className="bar">
              <i style={{ width: Math.min(100, (elapsed / durations[active]) * 100) + '%' }} />
            </div>
            <div className="clock">
              <span>{clock(elapsed)}</span>
              <span>{tracks[active][2]}</span>
            </div>
            <div className="controls">
              <button aria-label="Previous track" onClick={prev}>
                ‹
              </button>
              <button
                aria-label={playing ? 'Pause' : 'Play'}
                className="play"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? 'Ⅱ' : '▶'}
              </button>
              <button aria-label="Next track" onClick={next}>
                ›
              </button>
              <span>◖━━━━</span>
            </div>
            <div className="upnext">
              UP NEXT <small>{tracks.length - 1} TRACKS</small>
            </div>
            {tracks
              .filter((_, i) => i !== active)
              .map((t, i) => (
                <button className="queue" key={t[0]} onClick={() => setActive(tracks.indexOf(t))}>
                  <small>0{i + 1}</small>
                  <span>
                    <b>{t[0]}</b>
                    <em>{t[1]}</em>
                  </span>
                  <small>{t[2]}</small>
                </button>
              ))}
          </div>
        </div>
      </section>

      <div className="ticker">
        DISCORD.PY　✦　YT-DLP　✦　FFMPEG　✦　SQLITE　✦　LAST.FM (OPTIONAL)　✦　DISCORD.PY　✦　YT-DLP
      </div>

      <section id="why" className="section shell">
        <div className="kicker reveal">01 / THE DIFFERENCE</div>
        <h2 className="reveal delay-1">
          Better discovery.
          <br />
          <em>Fewer corrections.</em>
        </h2>
        <p className="intro reveal delay-2">
          Most music bots make you work for the moment. PyxeeBot is built around what happens after
          someone types a song: a good result, a queue you can actually shape, and controls that make
          sense in the middle of a conversation.
        </p>
        <div className="features">
          {features.map((f, i) => (
            <article key={f[1]} className="reveal">
              <strong>{f[0]}</strong>
              <small>
                0{i + 1} / {f[1]}
              </small>
              <h3>{f[2]}</h3>
              <p>{f[3]}</p>
              <a href="#commands">Explore {f[1].toLowerCase()} ↗</a>
            </article>
          ))}
        </div>
        <div className="extras">
          {extras.map((e) => (
            <div key={e[0]} className="extra reveal">
              <b>{e[0]}</b>
              <p>{e[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="demo">
        <div className="shell demo-grid">
          <div className="reveal">
            <div className="kicker">02 / IN THE CHANNEL</div>
            <h2>
              Simple enough
              <br />
              <em>to disappear.</em>
            </h2>
            <p>
              Every command works as a familiar <code>!command</code> and as a native Discord slash
              command. The useful stuff stays one message away, with interactive panels for the moments
              that deserve more control.
            </p>
            <a className="button outline" href={`${REPO}#commands`} target="_blank" rel="noopener noreferrer">
              Read all commands ↗
            </a>
          </div>

          <div className="terminal reveal delay-1">
            <header>
              ●　discord / # music <b>● LIVE</b>
            </header>
            <div className="msg">
              <i>M</i>
              <span>
                <b>
                  mika <small>today at 23:41</small>
                </b>
                <br />
                !vibe yoasobi — racing into the night
              </span>
            </div>
            <div className="msg">
              <i className="bot">P</i>
              <span>
                <b>
                  PyxeeBot <small>APP</small>
                </b>
                <div className="embed">
                  <small>CURATED PLAYLIST · YOASOBI — RACING INTO THE NIGHT</small>
                  <h4>Here&rsquo;s a queue built from that seed.</h4>
                  <p>
                    {demoTracks.map((t, i) => (
                      <span key={t[1]} className="embed-line">
                        {String(i + 1).padStart(2, '0')}　{t[0]} — {t[1]}
                        <br />
                      </span>
                    ))}
                  </p>
                  <small className="embed-footer">4/25 tracks selected · use the dropdown to remove tracks</small>
                  <div className="embed-buttons">
                    <button className="b-success">Queue All</button>
                    <button className="b-primary">Save Playlist</button>
                    <button className="b-danger">Cancel</button>
                  </div>
                </div>
              </span>
            </div>
            <div className="input">
              Message #music <b>➤</b>
            </div>
          </div>
        </div>
      </section>

      <section id="commands" className="section shell">
        <div className="kicker reveal">03 / QUICK REFERENCE</div>
        <h2 className="reveal delay-1">
          A command for
          <br />
          <em>every mood.</em>
        </h2>
        <div className="commands">
          {commands.map((c) => (
            <a href={`${REPO}#commands`} target="_blank" rel="noopener noreferrer" key={c[0]} className="reveal">
              <code>{c[0]}</code>
              <span>{c[1]}</span>
              <b>↗</b>
            </a>
          ))}
        </div>
        <p className="fine-print">
          This is a working subset — the full command list, every alias, and DJ-only flags live in the{' '}
          <a href={`${REPO}#commands`} target="_blank" rel="noopener noreferrer">
            README
          </a>
          .
        </p>
      </section>

      <section className="infra">
        <div className="shell infra-grid">
          <div className="reveal">
            <div className="kicker">04 / BUILT FOR THE REAL WORLD</div>
            <h2>
              Focused systems.
              <br />
              <em>Low overhead.</em>
            </h2>
          </div>
          <div className="reveal delay-1">
            <p>
              Designed for a single-core shared VPS: one yt-dlp extraction slot by default, 64 kbps Opus
              encoding, and a SQLite snapshot that survives restarts. Idle and empty-channel timeouts
              release the voice connection when nobody&rsquo;s listening.
            </p>
            <div className="specs">
              <b>
                64<small>KBPS OPUS</small>
              </b>
              <b>
                128<small>TRACK CACHE</small>
              </b>
              <b>
                25<small>PLAYLIST LIMIT</small>
              </b>
              <b>
                30m<small>URL TTL</small>
              </b>
            </div>
            <p className="infra-note">Every one of those is a setting in .env — turn it up if your VPS can take it.</p>
          </div>
        </div>
      </section>

      <section className="closing shell reveal">
        <div className="mark">
          <img src={LOGO} alt="PyxeeBot" />
        </div>
        <div className="kicker">YOUR SERVER, YOUR SOUND</div>
        <h2>
          A dependable music layer
          <br />
          <em>for your server.</em>
        </h2>
        <p>Open source, self-hosted, and free to run.</p>
        <div className="actions">
          <a className="button" href={`${REPO}#local-setup`} target="_blank" rel="noopener noreferrer">
            Start building ↗
          </a>
          <button className="copy" onClick={copyInstall}>
            {copied ? 'Copied ✓' : 'Copy install command'}
          </button>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top">
          <img className="brand-logo" src={LOGO} alt="PyxeeBot" width="29" height="29" />
          <span>
            Pyxee<span>Bot</span>
          </span>
        </a>
        <span>Made for the late-night queue.</span>
        <div>
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
            MIT License
          </a>
        </div>
      </footer>
    </main>
  )
}
