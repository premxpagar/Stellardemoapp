export default function AstralGate({ onEnter, game }) {
  const areasUnlocked = (game.unlockedAreas || ['moon-meadow']).length
  const enemiesDefeated = game.stats?.enemiesDefeated || 0
  const bossesDefeated = game.stats?.bossesDefeated || 0

  return (
    <section className="astral-gate scroll-panel">
      <div className="gate-portal">
        <div className="gate-ring gate-ring-outer" />
        <div className="gate-ring gate-ring-inner" />
        <div className="gate-core">⚝</div>
      </div>
      <h2>The Astral Gate</h2>
      <p className="gate-flavor">"The stars beyond the Grove are calling. Steel yourself, Stellar Knight."</p>

      <div className="gate-stats">
        <div className="gate-stat">
          <span>⚔</span>
          <div><b>{enemiesDefeated}</b><small>Enemies defeated</small></div>
        </div>
        <div className="gate-stat">
          <span>🗺</span>
          <div><b>{areasUnlocked}</b><small>Areas discovered</small></div>
        </div>
        <div className="gate-stat">
          <span>👑</span>
          <div><b>{bossesDefeated}</b><small>Bosses defeated</small></div>
        </div>
      </div>

      <button className="primary gate-enter" onClick={onEnter}>
        Enter Knight Mode <span>⚔</span>
      </button>

      <div className="gate-hints">
        <p><b>⌂</b> Your companion follows you into adventure</p>
        <p><b>✦</b> Stardust and loot earned returns to the Grove</p>
        <p><b>♡</b> Your companion grows stronger through battle</p>
      </div>
    </section>
  )
}
