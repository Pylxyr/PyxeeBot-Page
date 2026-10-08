/* In-page UI mockups. Drawn with the site's tokens so they follow light/dark.
   Content mirrors the real interfaces (labels, layout, numbers) — it is not live data. */
const LOGO = `${import.meta.env.BASE_URL}assets/logo.png`
const Btn = ({ c = '', children }) => <span className={`mk-btn ${c}`}>{children}</span>
const Msg = ({ bot, name, time, children }) => (
  <div className="mk-line">
    {bot ? <img className="mk-av" src={LOGO} alt="" /> : <span className="mk-av">P</span>}
    <div>
      <b>{name}</b>{bot && <em>APP</em>}<i>{time}</i>
      {children}
    </div>
  </div>
)
const TITLE = 'ずっと真夜中でいいのに。『サターン』 (Audio Track)'

function DcNow() {
  return (
    <div className="mk">
      <Msg name="Pylxyr" time="8:51 AM"><p>!p zutomayo saturn</p></Msg>
      <Msg bot name="PyxeeBot" time="8:51 AM">
        <p>Queued <a>{TITLE}</a></p>
        <div className="mk-embed">
          <div className="mk-eh">♪ Now Playing · ▶ playing</div>
          <div className="mk-et">{TITLE}</div>
          <div className="mk-es">ZUTOMAYO · <code>4:10</code></div>
          <div className="mk-prog"><code>0:00</code><span className="mk-track"><i style={{ '--p': '3%' }} /></span><code>4:10</code></div>
          <div className="mk-ef">→ Off · req. Pylxyr · Track changed.</div>
        </div>
        <div className="mk-btns"><Btn>⏮</Btn><Btn>⏭</Btn><Btn c="on">❚❚</Btn><Btn>⟳</Btn></div>
        <div className="mk-btns"><Btn>Queue</Btn><Btn c="red">Close</Btn></div>
      </Msg>
    </div>
  )
}

const VIBE = [
  ['Yorushika', 'だから僕は音楽を辞めた'], ['Yorushika', '晴る'], ['Yorushika', 'ヒッチコック'],
  ['Atarayo', '夏霞'], ['ZUTOMAYO', '残機'], ['ZUTOMAYO', 'TAIDADA'], ['n-buna', '透明エレジー'],
]
function DcVibe() {
  return (
    <div className="mk">
      <Msg name="Pylxyr" time="8:52 AM"><p>!vb yorushika plover</p></Msg>
      <Msg bot name="PyxeeBot" time="8:52 AM">
        <p>Searching Last.fm for tracks similar to <code className="mk-pill">yorushika plover</code>…</p>
        <div className="mk-embed">
          <div className="mk-eh">Curated Playlist — yorushika plover</div>
          <ul className="mk-list">
            {VIBE.map(([a, t], i) => (
              <li key={t}><code>{String(i + 1).padStart(2, '0')}</code><b>{a}</b> — {t}</li>
            ))}
            <li className="mk-more">⋮ 17 more</li>
          </ul>
          <div className="mk-ef">24/25 tracks selected · use the dropdown to remove tracks</div>
        </div>
        <div className="mk-select"><span>Select tracks to remove…</span><span>⌄</span></div>
        <div className="mk-btns"><Btn c="grn">Queue All</Btn><Btn c="on">Save Playlist</Btn><Btn c="red">Cancel</Btn></div>
      </Msg>
    </div>
  )
}

const HEALTH = [
  ['Twitch chat', 'Connected'], ['Bot account sign-in', 'Authorized'], ['Broadcaster sign-in', 'Authorized'],
  ['Audio encoder', 'Starts with the first song', 1], ['Web server', '127.0.0.1:8098 (this PC only)'],
  ['yt-dlp workers', '1 running (up to 2)'], ['ffmpeg', 'Found'], ['JS runtime (node)', 'Found'],
]
const STATS = [['Uptime', '3m 19s', 'Since 08:50 AM'], ['Listeners', '0', 'OBS audio connections'], ['In queue', '1', 'Auto-radio is on'], ['Played · last hour', '2', '1 skipped · 0 failed']]

function Dash({ lite }) {
  return (
    <div className={`mk mk-dash${lite ? ' lite' : ''}`}>
      {!lite && (
        <aside className="mk-side">
          <b>Twitch Radio</b><span className="on">Dashboard</span><span>Logs</span><span>Settings</span>
          <small>Running · v1.1.0</small>
        </aside>
      )}
      <div className="mk-main">
        <div className="mk-stats">
          {STATS.map(([k, v, s]) => (
            <div key={k} className="mk-card"><h6>{k}</h6><div className="mk-big">{v}</div><small>{s}</small></div>
          ))}
        </div>
        <div className="mk-two">
          <div className="mk-card">
            <h6>Now playing</h6>
            <b>YOASOBI「怪物」Official Music Video</b>
            <div className="mk-es">YOASOBI</div>
            <div className="mk-prog"><code>0:17</code><span className="mk-track"><i style={{ '--p': '8%' }} /></span><code>3:28</code></div>
          </div>
          <div className="mk-card">
            <h6>Queue</h6>
            <div className="mk-qrow"><span>1 · [MV] REOL - No title</span><small>Pylxyr</small></div>
          </div>
        </div>
        {!lite && (
          <>
            <div className="mk-card">
              <h6>Connections &amp; health</h6>
              <div className="mk-health">
                {HEALTH.map(([k, v, idle]) => (
                  <div key={k}><i className={idle ? 'idle' : ''} />{k}<span>{v}</span></div>
                ))}
              </div>
            </div>
            <div className="mk-card">
              <h6>Add to OBS</h6>
              {[['Audio source · Media Source', 'stream.opus'], ['Now-playing overlay · Browser Source', 'overlay']].map(([k, u]) => (
                <div key={u} className="mk-obs"><div>{k}<code>http://127.0.0.1:8098/{u}</code></div><Btn>Copy</Btn></div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Overlay() {
  return (
    <div className="mk mk-ov">
      <img className="mk-cover" src={LOGO} alt="" />
      <div className="mk-ovm">
        <b>YOASOBI「怪物」Official Music Video</b>
        <div className="mk-es">requested by Radio Mix</div>
        <div className="mk-prog"><code>0:41</code><span className="mk-track"><i style={{ '--p': '20%' }} /></span><code>3:28</code></div>
      </div>
      <div className="mk-next"><small>Up next</small>[MV] REOL - No title</div>
    </div>
  )
}

const CHAT = [
  ['mira', 0, '!daily'], ['pyxee', 1, '@mira daily points claimed'],
  ['kenji', 0, '!deaths++'], ['pyxee', 1, 'deaths counter bumped'],
  ['mod_ren', 0, '!permit @sol', 1], ['pyxee', 1, '@sol may post one link'],
]
function Chat() {
  return (
    <div className="mk">
      <div className="mk-chead">Stream chat</div>
      {CHAT.map(([u, isBot, m, mod], i) => (
        <div key={i} className={`mk-cl${isBot ? ' bot' : ''}`}>
          {mod && <em className="mk-mod">MOD</em>}
          <b>{u}</b><span>{m}</span>
        </div>
      ))}
    </div>
  )
}

function Console({ cmds = [] }) {
  return (
    <div className="mk">
      <div className="mk-url">127.0.0.1:8098/commands</div>
      <div className="mk-trows">
        {cmds.slice(0, 7).map(([c, d]) => (
          <div key={c}><code>{c}</code><span>{d}</span></div>
        ))}
      </div>
    </div>
  )
}

const METER = [['Binary (server only)', '0.76 MB', 0.76], ['Idle RSS, 1 thread', '2.5 MB', 2.5], ['20 WebSockets + 5 listeners', '5.4 MB', 5.4], ['Streaming, peak RSS', '11 MB', 11]]
function Meter() {
  return (
    <div className="mk">
      <div className="mk-chead">Measured · Linux x86-64</div>
      {METER.map(([k, v, n]) => (
        <div key={k} className="mk-mrow">
          <div><span>{k}</span><b>{v}</b></div>
          <div className="mk-track"><i style={{ width: `${(n / 11) * 100}%`, '--p': 'auto' }} /></div>
        </div>
      ))}
    </div>
  )
}

const MOCKS = { dcNow: DcNow, dcVibe: DcVibe, dash: Dash, dashLite: (p) => <Dash {...p} lite />, overlay: Overlay, chat: Chat, console: Console, meter: Meter }

export function Mock({ id, cmds }) {
  const C = MOCKS[id]
  return C ? <C cmds={cmds} /> : null
}
