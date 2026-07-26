import { cosmetics } from '../game/data'

export default function Creature({ c, hat, large = false, tired = false }) {
  const item = cosmetics.find((x) => x.id === hat)
  return (
    <div className={`animal ${large ? 'giant' : ''} ${tired ? 'tired' : ''}`} style={{ '--animal-color': c.color }}>
      <span className="hat">{item?.icon}</span>
      <strong>{c.face}</strong>
      <i />
    </div>
  )
}
