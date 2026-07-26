import Creature from '../components/Creature'

export default function Grove({ selected, hat, onExplore, onRest, onDaily, onObject, dailyClaimed }) {
  return (
    <>
      <section className="hero-card scroll-flight">
        <div className="aurora" />
        <div className="hero-copy">
          <p className="eyebrow">{selected.rarity} COMPANION · LV {selected.level}</p>
          <h2>Ready for a little wonder?</h2>
          <p>{selected.name} feels {selected.mood.toLowerCase()} today. Explore the meadow, collect Stardust, and grow closer together.</p>
          <div className="energy-line">
            <span>Energy</span>
            <div><i style={{ width: `${selected.energy}%` }} /></div>
            <b>{selected.energy}/100</b>
          </div>
          <button className="primary" onClick={onExplore}>Explore meadow <span>→</span></button>
          <button className="soft-button" onClick={onRest}>Rest +28 energy</button>
        </div>
        <div className="hero-creature">
          <div className="moon">☾</div>
          <Creature c={selected} hat={hat} large tired={selected.energy < 25} />
          <div className="grass">⌇⌇⌇⌇⌇⌇⌇</div>
        </div>
      </section>
      <section className="grove-actions scroll-panel">
        <button onClick={onDaily} className={dailyClaimed ? 'world-object used' : 'world-object'}>
          <span>🌸</span><b>Moonflower</b><small>{dailyClaimed ? 'Tomorrow' : 'Daily +35'}</small>
        </button>
        <button onClick={() => onObject('Fountain', 8, 'The Stardust Fountain sang softly.')} className="world-object">
          <span>⛲</span><b>Fountain</b><small>Make a wish</small>
        </button>
        <button onClick={() => onObject('Crystal', 12, 'A crystal chimed and released a hidden sparkle!')} className="world-object">
          <span>💎</span><b>Crystal</b><small>Tap gently</small>
        </button>
        <button onClick={() => onObject('Mystery Bush', 6, 'A shy critter left Stardust beneath the bush.')} className="world-object">
          <span>🌿</span><b>Mystery bush</b><small>Rustle leaves</small>
        </button>
        <button onClick={() => onObject('Meteor', 15, 'A tiny meteor landed with a glittery thump!')} className="world-object">
          <span>☄️</span><b>Tiny meteor</b><small>Make a wish</small>
        </button>
      </section>
    </>
  )
}
