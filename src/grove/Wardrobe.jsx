import Creature from '../components/Creature'
import { cosmetics } from '../game/data'

export default function Wardrobe({ selected, equipped, game, onItem }) {
  return (
    <section className="wardrobe scroll-panel">
      <p className="eyebrow">STYLE YOUR COMPANION</p>
      <h2>Small magic, worn well.</h2>
      <div className="wardrobe-layout">
        <div className="wardrobe-creature">
          <Creature c={selected} hat={equipped} large />
        </div>
        <div className="hat-list">
          {cosmetics.map((item) => {
            const owned = game.unlockedCosmetics.includes(item.id)
            return (
              <button className={equipped === item.id ? 'hat-card chosen' : 'hat-card'} onClick={() => onItem(item)} key={item.id}>
                <span>{item.icon}</span>
                <div><b>{item.name}</b><small>{item.description}</small></div>
                <em>{equipped === item.id ? 'Unequip' : owned ? 'Equip' : `${item.price} ✦`}</em>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
