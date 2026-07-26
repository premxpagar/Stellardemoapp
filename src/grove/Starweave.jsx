import Creature from '../components/Creature'
import { fusionReward } from '../game/data'

export default function Starweave({ game, picks, setPicks, stage, onFuse, onWelcome }) {
  const toggle = (id) => setPicks((x) => x.includes(id) ? x.filter((p) => p !== id) : x.length < 2 ? [...x, id] : x)
  const chosen = game.companions.filter((c) => picks.includes(c.id))

  return (
    <section className={`fusion-card scroll-panel ${stage}`}>
      <p className="eyebrow">TWO BECOME ONE</p>
      <h2>{stage === 'reveal' ? 'New companion discovered!' : 'Weave a new constellation.'}</h2>
      {stage === 'reveal' ? (
        <>
          <Creature c={fusionReward} large />
          <h3>Aster · Astral</h3>
          <p>Stardew · Level 1 · Comet Bloom trait</p>
          <button className="primary" onClick={onWelcome}>Welcome Aster</button>
        </>
      ) : (
        <>
          <p>Choose two companions. Aster can only be discovered once.</p>
          <div className="fusion-picker">
            {game.companions.map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)} className={picks.includes(c.id) ? 'picked' : ''}>
                <Creature c={c} />
                <b>{c.name}</b>
              </button>
            ))}
          </div>
          <div className="fusion-orbs">
            {chosen.map((c) => <Creature c={c} key={c.id} />)}
            <span>+</span>
            <div className="mystery">?</div>
          </div>
          <button className="primary" disabled={stage === 'weaving'} onClick={onFuse}>
            {stage === 'weaving' ? 'Weaving starlight…' : 'Begin Starweave ✦'}
          </button>
        </>
      )}
    </section>
  )
}
