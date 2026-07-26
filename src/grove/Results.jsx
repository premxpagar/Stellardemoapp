import Creature from '../components/Creature'

export default function Results({ result, companion, onReplay, onReturn }) {
  return (
    <div className="quest-overlay">
      <section className="results">
        <p className="eyebrow">EXPLORATION COMPLETE</p>
        <h2>That was stellar!</h2>
        <Creature c={companion} large />
        <div className="result-grid">
          <span>Score <b>{result.score}</b></span>
          <span>Stardust <b>+{result.stardust} ✦</b></span>
          <span>XP <b>+{result.xp}</b></span>
          <span>Best combo <b>{result.combo}</b></span>
        </div>
        {result.gold > 0 && <p className="gold-note">Golden Touch! You caught {result.gold} rare golden star.</p>}
        <button className="primary" onClick={onReplay}>Play again</button>
        <button className="soft-button" onClick={onReturn}>Return to Grove</button>
      </section>
    </div>
  )
}
