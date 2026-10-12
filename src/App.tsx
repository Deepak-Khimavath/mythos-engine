import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Choice = { title: string; detail: string }
type Scene = { eyebrow: string; title: string; body: string[]; choices: Choice[]; location: string; mood: string }
type LogEntry = { id: number; title: string; note: string }
type World = { id: string; title: string; premise: string; genre: string; mood: string; protagonist: string; characters: string[]; description: string; createdAt: number; updatedAt: number; chapter: number; startScene: Scene; scene: Scene; log: LogEntry[]; discovered: string[]; tension: number; warmth: number }
type WorldLibrary = { worlds: World[]; activeId: string }
type WorldDraft = { title: string; description: string; character: string; characters?: string[]; location: string; scene: Scene }

const opening: Scene = {
  eyebrow: 'CHAPTER ONE · THE CITY THAT FORGOT THE SUN', title: 'A knock from the other side',
  body: ['At 2:17 a.m., every window in the city turns black. Not dark—black, like the glass has become a hole cut through the world.', 'Then something knocks from inside the observatory wall. Three slow taps. A pause. Two quick ones. You know that rhythm. Your sister used it when you were children, before the sea took her ship seven years ago.', 'Mara Venn, the observatory’s night keeper, grips a brass lantern. Its flame burns blue. “That wall has been sealed since the Flood,” she whispers. “Tell me you heard something else.”'],
  choices: [{ title: 'Open the wall', detail: 'Trust the impossible rhythm. Find out who—or what—is calling.' }, { title: 'Ask Mara what she’s hiding', detail: 'The keeper’s hands are shaking. Start with the truth closest to you.' }, { title: 'Look through the black glass', detail: 'The city below is gone. Something moves where the stars should be.' }],
  location: 'North Observatory', mood: 'Something is listening'
}

function makeFallbackScene(choice: string, chapter: number): Scene {
  const seed = choice.toLowerCase()
  if (seed.includes('wall') || seed.includes('door') || seed.includes('open')) return {
    eyebrow: `CHAPTER ${chapter} · THE SEALED ROOM`, title: 'Salt on the other side', body: ['The old mortar gives way with a sound like a held breath finally released. Beyond it, a narrow stair curls down into the foundations. Saltwater beads on every stone, though the tide is miles below.', 'At the foot of the stair, a small brass compass spins wildly, then stops—pointing straight at you. A voice rises from the dark, softened by distance and years: “You took your time.”', 'Mara stays at your shoulder. She does not ask who spoke. She already knows.'], choices: [{ title: 'Go down alone', detail: 'Whatever is waiting called for you, not Mara.' }, { title: 'Take Mara with you', detail: 'Two witnesses are harder to rewrite than one.' }, { title: 'Answer the voice', detail: 'Ask the question that has followed you for seven years.' }], location: 'The Flooded Stair', mood: 'A memory answers'
  }
  if (seed.includes('mara') || seed.includes('ask') || seed.includes('truth')) return {
    eyebrow: `CHAPTER ${chapter} · AN OLD PROMISE`, title: 'The keeper’s confession', body: ['Mara looks at the lantern instead of you. “I was on the rescue crew,” she says. “We found your sister’s skiff. It was dry inside. The compass was still turning.”', 'She draws a folded chart from her coat. Ink has bled into the shape of a coastline that no map has ever shown. At its center, in your sister’s handwriting, is your name.', 'Outside, the black windows brighten—one by one, like eyes opening across the city.'], choices: [{ title: 'Demand the whole story', detail: 'No more guarded truths. Make her say what happened.' }, { title: 'Study the impossible chart', detail: 'Find the place your sister marked before the city wakes.' }, { title: 'Take the lantern downstairs', detail: 'The blue flame is leaning toward the sealed foundation.' }], location: 'Keeper’s Gallery', mood: 'Trust is a fragile map'
  }
  return {
    eyebrow: `CHAPTER ${chapter} · BEYOND THE WINDOWS`, title: 'A city reflected in stars', body: ['The glass shows a city beneath a violet ocean. Towers drift like kelp. Tiny lights move through the streets in patterns too deliberate to be fish. One rises toward the surface.', 'A face appears in the reflection: older, salt-pale, unmistakable. Your sister presses one palm to the other side of the glass. The pane stays cold, but a word blooms in the condensation: REMEMBER.', 'Mara says your name, sharply. The reflection turns to her—and smiles.'], choices: [{ title: 'Write back on the glass', detail: 'Ask her where she is, even if the answer changes everything.' }, { title: 'Break the window', detail: 'Refuse to let the reflection decide the rules.' }, { title: 'Show Mara the message', detail: 'Whatever this is, you should not face it alone.' }], location: 'The Star Window', mood: 'The impossible knows your name'
  }
}
const legacyWorld: World = { id: 'legacy-first-light', title: 'The City Beneath the Sun', premise: 'A city where the sun vanished beneath the sea', genre: 'Mythic fantasy', mood: 'Mysterious', protagonist: 'The returning cartographer', description: 'A drowned city, a vanished sister, and a voice behind a sealed wall.', characters: ['Mara Venn — The night keeper', 'Your sister — Lost at sea'], createdAt: Date.now(), updatedAt: Date.now(), chapter: 1, startScene: opening, scene: opening, log: [{ id: 1, title: 'The story begins', note: 'A knock from beyond the sealed wall.' }], discovered: ['The blue-flame lantern'], tension: 34, warmth: 52 }
function createStarterWorld(): World { return { ...legacyWorld, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now(), startScene: legacyWorld.scene } }
function loadLibrary(): WorldLibrary {
  try {
    const stored = localStorage.getItem('mythos-worlds')
    if (stored) {
      const parsed = JSON.parse(stored) as WorldLibrary
      if (Array.isArray(parsed.worlds) && parsed.worlds.length) {
        const worlds = parsed.worlds.filter(world => world && typeof world.id === 'string' && world.scene && Array.isArray(world.log))
        if (worlds.length) return { worlds, activeId: worlds.some(world => world.id === parsed.activeId) ? parsed.activeId : worlds[0].id }
      }
    }
    const saved = localStorage.getItem('mythos-world')
    if (saved) {
      const old = JSON.parse(saved) as Partial<World>
      if (old.scene && Array.isArray(old.log)) {
        const migrated: World = { ...legacyWorld, ...old, id: legacyWorld.id, title: legacyWorld.title, premise: old.premise || legacyWorld.premise, genre: old.genre || legacyWorld.genre, mood: old.mood || legacyWorld.mood, protagonist: old.protagonist || legacyWorld.protagonist, characters: old.characters || legacyWorld.characters, description: old.description || legacyWorld.description, createdAt: legacyWorld.createdAt, updatedAt: Date.now(), startScene: old.startScene || old.scene } as World
        return { worlds: [migrated], activeId: migrated.id }
      }
    }
  } catch { /* recover gracefully with the original included story */ }
  return { worlds: [legacyWorld], activeId: legacyWorld.id }
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  if (name === 'spark') return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>
  if (name === 'map') return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14m-7-7h14"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
  if (name === 'chevron') return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>
}

function App() {
  const [library, setLibrary] = useState<WorldLibrary>(loadLibrary)
  const [busy, setBusy] = useState(false)
  const [panel, setPanel] = useState<'world' | 'history' | 'library' | null>(null)
  const [notice, setNotice] = useState('')
  const [setup, setSetup] = useState(false)
  const [creating, setCreating] = useState(false)
  const [creatorError, setCreatorError] = useState('')
  const [draft, setDraft] = useState({ premise: '', genre: 'Fantasy', mood: 'Mysterious', protagonist: '' })
  const [customChoice, setCustomChoice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const world = library.worlds.find(item => item.id === library.activeId) ?? library.worlds[0] ?? createStarterWorld()
  useEffect(() => { try { localStorage.setItem('mythos-worlds', JSON.stringify(library)) } catch { console.warn('Mythos could not persist the world library; the stories remain available for this session.') } }, [library])
  useEffect(() => { if (!notice) return; const id = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(id) }, [notice])
  function updateWorld(updater: (current: World) => World, targetId = library.activeId) {
    setLibrary(current => ({ ...current, worlds: current.worlds.map(item => item.id === targetId ? updater(item) : item) }))
  }
  function selectWorld(id: string) {
    setLibrary(current => ({ ...current, activeId: id, worlds: current.worlds.map(item => item.id === id ? { ...item, updatedAt: Date.now() } : item) }))
    setPanel(null); setMobileMenu(false); setNotice('World opened. Your other stories are safe.')
  }
  const progress = useMemo(() => Math.min(100, 14 + (world.log.length - 1) * 13), [world.log.length])
  async function advance(choice: string) {
    if (busy) return
    setBusy(true)
    const requestWorldId = world.id
    const nextChapter = world.chapter + 1
    try {
      const response = await fetch('/api/scene', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ premise: world.premise, previousScene: world.scene, choice, chapter: nextChapter, history: world.log.slice(-5) }) })
      if (response.ok) {
        const data = await response.json() as { scene: Scene }
        updateWorld(current => ({ ...current, chapter: nextChapter, scene: data.scene, log: [...current.log, { id: Date.now(), title: choice, note: data.scene.title }], discovered: [...new Set([...current.discovered, data.scene.location])], tension: Math.min(95, Math.max(12, current.tension + (choice.length % 13) - 5)), warmth: Math.min(90, Math.max(18, current.warmth + (choice.length % 9) - 3)), updatedAt: Date.now() }), requestWorldId)
        setBusy(false); return
      }
    } catch { /* use the local narrative engine when the server is not running */ }
    await new Promise(resolve => window.setTimeout(resolve, 650))
    const scene = makeFallbackScene(choice, nextChapter)
    updateWorld(current => ({ ...current, chapter: nextChapter, scene, log: [...current.log, { id: Date.now(), title: choice, note: scene.title }], discovered: [...new Set([...current.discovered, scene.location])], tension: Math.min(95, Math.max(12, current.tension + (choice.length % 13) - 5)), warmth: Math.min(90, Math.max(18, current.warmth + (choice.length % 9) - 3)), updatedAt: Date.now() }), requestWorldId)
    setBusy(false)
  }
  async function startWorld() {
    if (!draft.premise.trim() || draft.premise.trim().length < 8) { setCreatorError('Give your world at least 8 characters so we have something to build on.'); return }
    setCreating(true); setCreatorError('')
    let generated: WorldDraft | null = null
    try {
      const response = await fetch('/api/world', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      if (response.ok) generated = (await response.json() as { world: WorldDraft }).world
      else { const error = await response.json().catch(() => null) as { error?: string } | null; setCreatorError(error?.error || 'Could not create the world. Please try again.'); setCreating(false); return }
    } catch { /* use the welcoming local starter if the server is unavailable */ }
    const premise = draft.premise.trim()
    const starter = createStarterWorld()
    const world: World = {
      ...starter,
      title: generated?.title || premise.split(/[.!?]/)[0].slice(0, 48) || 'A New World',
      premise, genre: draft.genre, mood: draft.mood, protagonist: draft.protagonist.trim() || generated?.character || 'A curious wanderer',
      description: generated?.description || `${draft.mood} ${draft.genre.toLowerCase()} · ${generated?.location || 'A world waiting to be discovered'}`,
      characters: generated?.characters?.length ? generated.characters : [`${draft.protagonist.trim() || generated?.character || 'A curious wanderer'} — Protagonist`],
      chapter: 1,
      startScene: generated?.scene ?? { ...opening, eyebrow: `CHAPTER ONE · ${draft.genre.toUpperCase()} · ${draft.mood.toUpperCase()}`, title: `The first door into ${premise.split(/[.!?]/)[0].slice(0, 36)}`, location: generated?.location || 'The First Threshold', mood: draft.mood, body: [`${premise}. In this ${draft.mood.toLowerCase()} ${draft.genre.toLowerCase()} world, something impossible happens at the precise moment your protagonist, ${draft.protagonist.trim() || 'a curious wanderer'}, enters the scene.`, `There is a sound no one else seems to hear. The air changes. Then, somewhere close by, a familiar voice calls your name—though you have never been here before.`, `The world waits for your first decision. What will you do?`], choices: [{ title: 'Follow the strange sound', detail: 'Trust your curiosity and discover what is calling.' }, { title: 'Find someone who can explain this place', detail: 'Look for a guide before stepping into the unknown.' }, { title: 'Make your own move', detail: 'Do something unexpected. This world is yours to shape.' }] },
      log: [{ id: Date.now(), title: 'A world takes shape', note: generated?.description || premise }],
      discovered: generated?.location ? [generated.location] : ['The First Threshold'], updatedAt: Date.now()
    }
    setLibrary(current => ({ worlds: [world, ...current.worlds], activeId: world.id }))
    setSetup(false); setDraft({ premise: '', genre: 'Fantasy', mood: 'Mysterious', protagonist: '' }); setCreating(false); setNotice('Your new world is ready. Your other stories are safe.')
  }
  function deleteWorld(id: string) {
    if (library.worlds.length <= 1) { setNotice('Keep at least one world in your library.'); return }
    const removed = library.worlds.find(item => item.id === id)
    if (!removed || !window.confirm(`Delete “${removed.title}” and its story progress? This cannot be undone.`)) return
    setLibrary(current => { const worlds = current.worlds.filter(item => item.id !== id); return { worlds, activeId: current.activeId === id ? worlds[0].id : current.activeId } })
    setNotice('World deleted.')
  }
  function resetWorld() { updateWorld(current => ({ ...current, chapter: 1, scene: current.startScene, log: [{ id: Date.now(), title: 'The story begins again', note: current.startScene.title }], discovered: [current.startScene.location], tension: 34, warmth: 52, updatedAt: Date.now() })); setPanel(null); setNotice('A fresh chapter begins in this world.') }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => { setPanel(null); setMobileMenu(false) }} aria-label="Mythos home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span className="brand-name">mythos<span>.</span></span></button>
      <div className="top-center"><span className="live-dot"/> A WORLD IS UNFOLDING <span className="top-divider">/</span> <span>{world.scene.location.toUpperCase()}</span></div>
      <div className="top-actions"><span className="autosave"><span className="save-dot"/> Saved</span><button className="icon-button mobile-trigger" aria-label="Open navigation" onClick={() => setMobileMenu(!mobileMenu)}><Icon name={mobileMenu ? 'close' : 'menu'}/></button><button className="avatar" aria-label="Player profile">D</button></div>
    </header>
    <div className="app-body">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="sidebar-main"><div className="side-label">YOUR STUDIO</div><button className={`side-item ${panel === null ? 'active' : ''}`} onClick={() => { setPanel(null); setMobileMenu(false) }}><span className="side-icon"><Icon name="spark" size={17}/></span> Story room <span className="side-now">NOW</span></button><button className={`side-item ${panel === 'library' ? 'selected' : ''}`} onClick={() => { setPanel('library'); setMobileMenu(false) }}><span className="side-icon"><Icon name="book" size={17}/></span> My worlds <span className="history-count">{library.worlds.length}</span></button><button className={`side-item ${panel === 'world' ? 'selected' : ''}`} onClick={() => { setPanel(panel === 'world' ? null : 'world'); setMobileMenu(false) }}><span className="side-icon"><Icon name="map" size={17}/></span> World bible</button><button className={`side-item ${panel === 'history' ? 'selected' : ''}`} onClick={() => { setPanel(panel === 'history' ? null : 'history'); setMobileMenu(false) }}><span className="side-icon"><Icon name="clock" size={17}/></span> Story history <span className="history-count">{world.log.length}</span></button></div>
        <div className="sidebar-bottom"><div className="sidebar-rule"/><button className="new-world" onClick={() => { setSetup(true); setPanel(null); setMobileMenu(false) }}><span className="new-icon"><Icon name="plus" size={16}/></span><span><strong>New world</strong><small>Start a fresh story</small></span><Icon name="chevron" size={15}/></button><div className="profile-row"><div className="profile-avatar">D</div><span className="profile-name">Deepak</span><span className="profile-status">THE AUTHOR</span></div></div>
      </aside>
      <main className="main-content"><div className="content-wrap">
        <div className="active-world-heading"><div className="world-identity"><span className="world-genre">{world.genre} <i>·</i> {world.mood}</span><span className="active-world-title">{world.title}</span></div><button className="switch-world-button" onClick={() => setPanel('library')}><Icon name="book" size={15}/> ALL WORLDS <Icon name="chevron" size={13}/></button></div><div className="chapter-row"><div><div className="chapter-kicker"><span className="chapter-spark">✳</span> {world.scene.eyebrow}</div><h1>{world.scene.title}</h1></div><div className="chapter-number"><span>YOUR STORY</span><strong>{String(world.chapter).padStart(2, '0')}</strong><small>/ ∞</small></div></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}/><span className="progress-label">STORY FLOW <b>{progress}%</b></span></div>
        <div className="story-layout"><section className="narrative-column">
          <article className="story-card"><div className="scene-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-moon"/><div className="art-horizon"/><div className="art-building building-one"/><div className="art-building building-two"/><div className="art-building building-three"/><div className="art-stairs"/><div className="art-glow"/><div className="art-caption"><span className="art-caption-dot"/> {world.scene.location.toUpperCase()} <span>·</span> 02:17 AM</div><div className="art-mark">M<br/><i>✳</i></div></div><div className="story-copy"><div className="narration-label"><span className="narration-line"/> THE STORY SO FAR <span className="narration-line"/></div>{world.scene.body.map((paragraph, index) => <p key={`${world.chapter}-${index}`} className={index === 0 ? 'lead-paragraph' : ''}>{paragraph}</p>)}<div className="story-signature"><span className="signature-rule"/><span>THE NIGHT IS STILL YOUNG</span><span className="signature-rule"/></div></div></article>
          <div className="choice-heading"><div><span className="choice-kicker">THE MOMENT IS YOURS</span><h2>What do you do?</h2></div><span className="choice-subtext">Choose a path. Change everything.</span></div>
          <div className="choices">{world.scene.choices.map((choice, index) => <button className="choice-card" key={choice.title} disabled={busy} onClick={() => void advance(choice.title)}><span className="choice-index">0{index + 1}</span><span className="choice-text"><strong>{choice.title}</strong><small>{choice.detail}</small></span><span className="choice-arrow"><Icon name="arrow" size={17}/></span></button>)}</div>
          <form className="custom-action" onSubmit={event => { event.preventDefault(); if (customChoice.trim()) { void advance(customChoice.trim()); setCustomChoice('') } }}><span className="custom-spark"><Icon name="spark" size={17}/></span><input aria-label="Write your own action" value={customChoice} onChange={event => setCustomChoice(event.target.value)} placeholder="Or write your own action..."/><button type="submit" aria-label="Submit your action" disabled={!customChoice.trim() || busy}><Icon name="arrow" size={17}/></button></form>
          <div className="bottom-note"><span>✳</span> YOUR CHOICES SHAPE THIS WORLD <span className="bottom-note-right">{busy ? <><span className="typing-dots"><i/><i/><i/></span> WRITING NEXT CHAPTER</> : 'NO TWO STORIES ARE THE SAME'}</span></div>
        </section>
        <aside className="right-rail">
          <div className="rail-section mood-section"><div className="rail-heading"><span>THE ATMOSPHERE</span><span className="rail-live">LIVE</span></div><div className="mood-orb"><div className="mood-globe"><div className="globe-shine"/><div className="globe-ring"/></div></div><div className="mood-title">{world.scene.mood}</div><div className="mood-caption">THE WORLD HOLDS ITS BREATH</div><div className="mood-stats"><div><span>THE TENSION</span><div className="mini-meter"><i style={{ width: `${world.tension}%` }}/></div></div><strong>{world.tension}<small>%</small></strong><div className="stat-divider"/><div><span>YOUR BOND</span><div className="mini-meter bond-meter"><i style={{ width: `${world.warmth}%` }}/></div></div><strong>{world.warmth}<small>%</small></strong></div></div>
          <div className="rail-section characters-section"><div className="rail-heading"><span>IN THIS STORY</span><button className="tiny-add" onClick={() => setNotice('Characters will emerge as your story grows.')} aria-label="Add a character"><Icon name="plus" size={14}/></button></div><div className="character-row"><div className="character-avatar mara-avatar">M</div><div className="character-info"><strong>Mara Venn</strong><small>THE NIGHT KEEPER</small></div><span className="character-status" title="Present"/></div><div className="character-row"><div className="character-avatar sister-avatar">?</div><div className="character-info"><strong>Your sister</strong><small>LOST AT SEA · UNKNOWN</small></div><span className="character-status unknown" title="Unknown"/></div><button className="text-link" onClick={() => setPanel('world')}>VIEW WORLD BIBLE <Icon name="arrow" size={14}/></button></div>
          <div className="rail-section discoveries-section"><div className="rail-heading"><span>FRAGMENTS FOUND</span><span className="fragment-count">{String(world.discovered.length).padStart(2, '0')}</span></div>{world.discovered.slice(-3).map((item, i) => <div className="fragment" key={item}><span className="fragment-symbol">{i === 0 ? '✳' : '◇'}</span>{item}<span className="fragment-new">NEW</span></div>)}<button className="text-link" onClick={() => setPanel('world')}>EXPLORE YOUR WORLD <Icon name="arrow" size={14}/></button></div>
          <div className="rail-quote"><span className="quote-mark">“</span><p>A story is a door you open from both sides.</p><span className="quote-by">— AN OLD AUTHOR’S SAYING</span></div>
        </aside></div>
        <footer className="app-footer"><span>MYTHOS <i>✳</i> ENGINE <span className="footer-sep">·</span> YOUR WORLD, YOUR RULES.</span><button onClick={() => setNotice('Every world starts with a single impossible thing.')}>HOW IT WORKS <Icon name="info" size={13}/></button><span className="footer-right">MADE OF CURIOSITY <i>✦</i></span></footer>
      </div></main>
    </div>
    {panel && <div className="panel-backdrop" onClick={() => setPanel(null)}><aside className={`info-panel ${panel === 'library' ? 'library-panel' : ''}`} onClick={event => event.stopPropagation()}><div className="panel-head"><div><span className="panel-eyebrow">{panel === 'library' ? 'YOUR STORIES, ALL IN ONE PLACE' : 'YOUR LIVING DOCUMENT'}</span><h2>{panel === 'world' ? 'World bible' : panel === 'history' ? 'Story history' : 'My worlds'}</h2></div><button className="icon-button" aria-label="Close panel" onClick={() => setPanel(null)}><Icon name="close"/></button></div>{panel === 'library' ? <><p className="library-intro">Every world keeps its own chapters and discoveries. Pick up where you left off, or dream up another.</p><button className="create-world-tile" onClick={() => { setDraft({ premise: '', genre: 'Fantasy', mood: 'Mysterious', protagonist: '' }); setCreatorError(''); setSetup(true); setPanel(null) }}><span className="create-world-icon"><Icon name="plus" size={19}/></span><span><strong>Create a new world</strong><small>Start with an idea. Mistral builds the doorway.</small></span><Icon name="arrow" size={17}/></button><div className="library-label">YOUR LIBRARY <span>{String(library.worlds.length).padStart(2, '0')} {library.worlds.length === 1 ? 'WORLD' : 'WORLDS'}</span></div><div className="world-library-list">{[...library.worlds].sort((a, b) => b.updatedAt - a.updatedAt).map((item, index) => <article className={`world-library-card ${item.id === world.id ? 'current-world' : ''}`} key={item.id}><button className="world-card-open" onClick={() => selectWorld(item.id)}><span className={`world-card-art world-art-${index % 4}`}><i>✳</i><small>{item.genre.toUpperCase()}</small></span><span className="world-card-copy"><span className="world-card-tags">{item.genre} <i>·</i> {item.mood}</span><strong>{item.title}</strong><small>{item.description}</small><span className="world-card-progress">CHAPTER {String(item.chapter).padStart(2, '0')} <i>·</i> {item.log.length} {item.log.length === 1 ? 'MOMENT' : 'MOMENTS'} {item.id === world.id && <b>PLAYING NOW</b>}</span></span></button><button className="world-delete" aria-label={`Delete ${item.title}`} title="Delete this world" onClick={() => deleteWorld(item.id)}><Icon name="close" size={15}/></button></article>)}</div><div className="library-footnote">SAVED IN THIS BROWSER · {library.worlds.length} {library.worlds.length === 1 ? 'WORLD' : 'WORLDS'} PRESERVED</div></> : panel === 'world' ? <><div className="panel-card"><span className="panel-label">THE WORLD</span><p>{world.description}</p></div><div className="panel-card"><span className="panel-label">THE PREMISE</span><p>{world.premise}</p></div><div className="panel-card"><span className="panel-label">KNOWN LOCATIONS</span>{world.discovered.map(place => <div className="panel-list-row" key={place}><span>◇</span>{place}</div>)}</div><div className="panel-card"><span className="panel-label">THE CAST</span>{world.characters.map((character, index) => <div className="panel-list-row" key={`${index}-${character}`}><span>◉</span>{character}</div>)}</div><div className="panel-card"><span className="panel-label">WHERE YOU LEFT OFF</span><p className="world-state-copy">Chapter {world.chapter}: {world.scene.title}. {world.scene.mood}</p></div><div className="panel-bottom"><button className="reset-button" onClick={resetWorld}><Icon name="refresh" size={15}/> Restart this world</button></div></> : <><div className="history-list">{[...world.log].reverse().map((entry, index) => <div className="history-item" key={entry.id}><span className="history-node">{String(world.log.length - index).padStart(2, '0')}</span><div><strong>{entry.title}</strong><small>{entry.note}</small></div></div>)}</div><div className="panel-bottom"><button className="reset-button" onClick={resetWorld}><Icon name="refresh" size={15}/> Restart this world</button></div></>}</aside></div>}
    {setup && <div className="modal-backdrop" onClick={() => !creating && setSetup(false)}><form className="setup-modal world-creator-modal" onSubmit={event => { event.preventDefault(); void startWorld() }}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => !creating && setSetup(false)}><Icon name="close"/></button><div className="modal-spark"><Icon name="spark" size={23}/></div><span className="panel-eyebrow">MISTRAL WORLD STUDIO</span><h2>Build a world that feels like yours.</h2><p>Give Mythos the ingredients. Mistral will create a setting, cast, and opening scene.</p><label className="creator-field"><span>THE WHAT-IF <b>REQUIRED</b></span><textarea autoFocus maxLength={500} minLength={8} required value={draft.premise} onChange={event => { setDraft(current => ({ ...current, premise: event.target.value })); setCreatorError('') }} placeholder="A city built on the back of a sleeping moon-whale…"/><small>{draft.premise.length}/500 · What makes this world impossible?</small></label><div className="creator-selects"><label className="creator-field"><span>GENRE</span><select value={draft.genre} onChange={event => setDraft(current => ({ ...current, genre: event.target.value }))}>{['Fantasy', 'Science fiction', 'Mystery', 'Horror', 'Romance', 'Adventure', 'Mythic fantasy', 'Other'].map(option => <option key={option}>{option}</option>)}</select></label><label className="creator-field"><span>MOOD</span><select value={draft.mood} onChange={event => setDraft(current => ({ ...current, mood: event.target.value }))}>{['Mysterious', 'Wonder-filled', 'Dark', 'Whimsical', 'Hopeful', 'Unsettling', 'Dreamlike', 'Other'].map(option => <option key={option}>{option}</option>)}</select></label></div><label className="creator-field"><span>YOUR PROTAGONIST <small>OPTIONAL</small></span><input maxLength={100} value={draft.protagonist} onChange={event => setDraft(current => ({ ...current, protagonist: event.target.value }))} placeholder="A retired star-cartographer…"/></label>{creatorError && <div className="creator-error" role="alert">{creatorError}</div>}<button type="submit" className="create-button" disabled={creating || draft.premise.trim().length < 8}>{creating ? <><span className="typing-dots"><i/><i/><i/></span> Mistral is imagining your world…</> : <>Create my world <Icon name="arrow" size={17}/></>}</button><div className="modal-foot">A NEW WORLD IS ADDED TO YOUR LIBRARY · EXISTING STORIES ARE NEVER REPLACED</div></form></div>}
    {notice && <div className="toast"><Icon name="spark" size={16}/>{notice}</div>}
  </div>
}
export default App
