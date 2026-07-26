import { items, getItem, rarityColors } from '../data/items'

export default function Inventory({ game }) {
  const inv = game.inventory || {}
  const entries = Object.entries(inv).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...getItem(id), qty })).filter(Boolean)
  const categories = ['Materials', 'Catalysts', 'Quest']

  if (entries.length === 0) {
    return (
      <section className="inventory-panel scroll-panel">
        <p className="eyebrow">SUPPLIES</p>
        <h2>Your pack is empty.</h2>
        <p className="inventory-hint">Explore Knight Mode to find materials, defeat enemies for rare drops, and discover mutation catalysts.</p>
      </section>
    )
  }

  return (
    <section className="inventory-panel scroll-panel">
      <p className="eyebrow">SUPPLIES</p>
      {categories.map((cat) => {
        const catItems = entries.filter((e) => e.category === cat)
        if (catItems.length === 0) return null
        return (
          <div key={cat} className="inventory-category">
            <h3>{cat === 'Quest' ? 'Quest Items' : cat}</h3>
            <div className="inventory-grid">
              {catItems.map((item) => (
                <div className="inventory-item" key={item.id} style={{ '--rarity-color': rarityColors[item.rarity] }}>
                  <span className="inventory-icon">{item.icon}</span>
                  <div className="inventory-info">
                    <b>{item.name}</b>
                    <small>{item.description}</small>
                  </div>
                  <span className="inventory-qty">×{item.qty}</span>
                  <span className="inventory-rarity">{item.rarity}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
