import Creature from '../components/Creature'
import { xpForLevel } from '../game/data'

const icons = { Lunar: '☾', Verdant: '☘', Solar: '☀', Astral: '✦' }

export default function Companions({ list, selected, hatFor, onSelect, filter, setFilter, sort, setSort }) {
  return (
    <>
      <section className="collection-toolbar scroll-panel">
        <div>
          <p className="eyebrow">COLLECTION</p>
          <h2>{list.length} / 12 companions discovered</h2>
        </div>
        <div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {['All', 'Lunar', 'Verdant', 'Solar', 'Astral'].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {['Level', 'Rarity', 'Name'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </section>
      <div className="companion-grid scroll-panel">
        {list.map((c) => (
          <button className={selected.id === c.id ? 'companion selected' : 'companion'} onClick={() => onSelect(c.id)} key={c.id}>
            <div className="animal-card-figure">
              <Creature c={c} hat={hatFor(c.id)} tired={c.energy < 25} />
            </div>
            <span className="rarity">{icons[c.rarity]} {c.rarity}</span>
            <b>{c.name} · Lv. {c.level}</b>
            <small>{c.species} · {c.mood}</small>
            <div className="tiny-meter"><i style={{ width: `${c.xp / xpForLevel(c.level) * 100}%` }} /></div>
            <small>{c.xp}/{xpForLevel(c.level)} XP · {c.energy} energy</small>
          </button>
        ))}
        {Array.from({ length: Math.max(0, 12 - list.length) }, (_, i) => (
          <div className="companion locked" key={`lock${i}`}>?<small>Unknown companion</small></div>
        ))}
      </div>
    </>
  )
}
