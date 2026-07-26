import { useState } from 'react'
import { executeRealTestnetTransaction } from '../services/stellarService'

export default function AstralGate({ onEnter, game, wallet }) {
  const [loading, setLoading] = useState(false)
  const [txMsg, setTxMsg] = useState('')

  const areasUnlocked = (game.unlockedAreas || ['moon-meadow']).length
  const enemiesDefeated = game.stats?.enemiesDefeated || 0
  const bossesDefeated = game.stats?.bossesDefeated || 0

  const handleTestnetEnter = async () => {
    if (!wallet?.full) return
    setLoading(true)
    setTxMsg('Opening Freighter popup to approve 0.1 XLM Testnet expedition fee…')

    const res = await executeRealTestnetTransaction(wallet.full, 'Knight Mode Expedition', '0.1')
    setLoading(false)

    if (res.success) {
      setTxMsg(`✓ 0.1 XLM Testnet deducted from Freighter! Tx Hash: ${res.txHash.slice(0, 8)}…`)
      setTimeout(() => {
        onEnter({ testnetBoost: true })
      }, 1200)
    } else {
      setTxMsg(`✕ ${res.error}`)
    }
  }

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

      {txMsg && (
        <div style={{
          background: 'rgba(156, 232, 255, 0.12)',
          border: '1px solid #9ce8ff',
          padding: '10px 16px',
          borderRadius: '8px',
          margin: '16px auto',
          maxWidth: '460px',
          fontSize: '0.85rem',
          color: '#e2e8f0',
        }}>
          ✦ {txMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
        <button className="primary gate-enter" onClick={() => onEnter()} disabled={loading}>
          Enter Knight Mode <span>⚔</span>
        </button>

        {wallet?.full && (
          <button
            onClick={handleTestnetEnter}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #8f82d7, #454061)',
              color: '#fff',
              border: '1px solid #9ce8ff',
              borderRadius: '9px',
              padding: '13px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 15px rgba(143, 130, 215, 0.3)',
            }}
          >
            {loading ? 'Processing Freighter Tx…' : 'Spend 0.1 Testnet XLM (+50% Boost) ⚡'}
          </button>
        )}
      </div>

      <div className="gate-hints">
        <p><b>⌂</b> Your companion follows you into adventure</p>
        <p><b>✦</b> Stardust and loot earned returns to the Grove</p>
        <p><b>⚡</b> Connect Freighter wallet to spend real Testnet XLM for boosted rewards</p>
      </div>
    </section>
  )
}
