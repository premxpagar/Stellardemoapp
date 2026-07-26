import { useEffect, useState } from 'react'
import Creature from '../components/Creature'

export default function Exploration({ companion, hat, onFinish, onExit }) {
  const [time, setTime] = useState(35)
  const [stars, setStars] = useState([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(0)
  const [gold, setGold] = useState(0)
  const [burst, setBurst] = useState([])

  useEffect(() => {
    const spawn = () => setStars((s) => [...s.slice(-7), {
      id: Date.now() + Math.random(),
      x: 8 + Math.random() * 84,
      y: 12 + Math.random() * 70,
      gold: Math.random() < .12,
      type: Math.random() < .12 ? 3 : Math.random() < .35 ? 2 : 1
    }])
    const a = setInterval(spawn, 680)
    const b = setInterval(() => setTime((t) => t - 1), 1000)
    spawn()
    return () => { clearInterval(a); clearInterval(b) }
  }, [])

  useEffect(() => {
    if (time > 0) return
    onFinish({ score, stardust: Math.max(12, Math.floor(score / 8)), xp: Math.max(15, Math.floor(score / 6)), combo: best, gold })
  }, [time, score, best, gold, onFinish])

  const catchStar = (star) => {
    const mult = Math.min(4, 1 + Math.floor(combo / 5))
    const points = (star.gold ? 25 : star.type * 8) * mult
    setScore((x) => x + points)
    setCombo((x) => { const n = x + 1; setBest((b) => Math.max(b, n)); return n })
    if (star.gold) setGold((x) => x + 1)
    setBurst((x) => [...x, { ...star, id: star.id + 'b' }])
    setStars((x) => x.filter((s) => s.id !== star.id))
    setTimeout(() => setBurst((x) => x.filter((b) => b.id !== star.id + 'b')), 450)
  }

  return (
    <div className="quest-overlay">
      <section className="explore-game">
        <button className="close-quest" onClick={onExit}>×</button>
        <div className="game-top">
          <div><p className="eyebrow">WHISPERING MEADOW</p><b>{time}s</b></div>
          <div>Score <strong>{score}</strong></div>
          <div>Combo <strong>x{Math.min(4, 1 + Math.floor(combo / 5))}</strong></div>
        </div>
        <div className="meadow-board long">
          <div className="meadow-moon">☾</div>
          {stars.map((s) => (
            <button key={s.id} className={`catch-star ${s.gold ? 'gold' : ''} t${s.type}`}
              onPointerDown={() => catchStar(s)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              {s.gold ? '✦' : '✧'}
            </button>
          ))}
          {burst.map((b) => (
            <span key={b.id} className="burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>✦ +</span>
          ))}
          <div className="quest-friend">
            <div className="animal-card-figure">
              <Creature c={companion} hat={hat} />
            </div>
          </div>
        </div>
        <p className="game-help">Catch every floating star. Golden stars are rare and worth a big bonus.</p>
      </section>
    </div>
  )
}
