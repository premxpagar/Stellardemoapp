import { useState } from 'react'
import Creature from '../components/Creature'
import { isContractConfigured } from '../services/stellarService'

export default function PlayerProfile({ game, wallet, onUpdateUsername, onRegisterCompanion }) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(game.username || 'Keeper')
  const [registeringId, setRegisteringId] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')

  const username = game.username || 'Keeper'
  const totalXp = game.stats?.stardustEarned || 0
  const score = (
    game.playerLevel * 100 +
    game.companions.length * 50 +
    totalXp +
    (game.stats?.enemiesDefeated || 0) * 10 +
    (game.stats?.bossesDefeated || 0) * 200 +
    (game.stats?.fusions || 0) * 75 +
    game.achievements.length * 30
  )

  const handleSaveName = (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (trimmed && onUpdateUsername) {
      onUpdateUsername(trimmed)
    }
    setEditingName(false)
  }

  const handleRegister = async (companion) => {
    if (!onRegisterCompanion) return
    setRegisteringId(companion.id)
    setStatusMsg('')
    const res = await onRegisterCompanion(companion)
    setRegisteringId(null)
    if (res?.error) {
      setStatusMsg(`Registration: ${res.error}`)
    } else if (res?.success) {
      setStatusMsg(`Registered ${companion.name} on Stellar Testnet! Tx: ${res.txHash?.slice(0, 8)}…`)
    }
  }

  return (
    <section className="profile-panel scroll-panel">
      <p className="eyebrow">STELLAR KNIGHT PROFILE</p>
      <div className="profile-header">
        <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
        <div>
          {editingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={24}
                autoFocus
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '1.2rem',
                }}
              />
              <button type="submit" style={{ padding: '4px 12px' }}>Save</button>
              <button type="button" onClick={() => setEditingName(false)}>Cancel</button>
            </form>
          ) : (
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {username} · Level {game.playerLevel}
              <button
                onClick={() => { setNameInput(username); setEditingName(true) }}
                title="Edit Username"
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, fontSize: '0.9em' }}
              >
                ✏️
              </button>
            </h2>
          )}
          <p className="profile-score">Progression Score: {score}</p>
        </div>
      </div>

      {/* Wallet Details Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '12px 16px',
        margin: '16px 0',
      }}>
        <small style={{ textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, fontSize: '0.75rem' }}>
          Wallet Connection Details
        </small>
        {wallet ? (
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              <strong>Address:</strong> <code style={{ color: '#9ce8ff' }}>{wallet.full || wallet.truncated}</code>
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
              Network: Stellar Testnet · Soroban: {isContractConfigured() ? 'Contract Configured' : 'No Contract ID in .env'}
            </p>
          </div>
        ) : (
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
            No wallet connected. Playing as guest offline. Connect Freighter wallet in the sidebar to interact with Stellar Testnet.
          </p>
        )}
      </div>

      {statusMsg && (
        <div style={{
          background: 'rgba(156, 232, 255, 0.15)',
          border: '1px solid #9ce8ff',
          padding: '8px 12px',
          borderRadius: '8px',
          margin: '12px 0',
          fontSize: '0.9rem'
        }}>
          ✦ {statusMsg}
        </div>
      )}

      <div className="profile-stats-grid">
        <div className="profile-stat">
          <b>{game.companions.length}</b>
          <small>Companions</small>
        </div>
        <div className="profile-stat">
          <b>{game.stats?.stardustEarned || 0}</b>
          <small>Stardust Earned</small>
        </div>
        <div className="profile-stat">
          <b>{game.stats?.explorations || 0}</b>
          <small>Explorations</small>
        </div>
        <div className="profile-stat">
          <b>{game.stats?.enemiesDefeated || 0}</b>
          <small>Enemies Defeated</small>
        </div>
        <div className="profile-stat">
          <b>{game.stats?.bossesDefeated || 0}</b>
          <small>Bosses Defeated</small>
        </div>
        <div className="profile-stat">
          <b>{game.stats?.fusions || 0}</b>
          <small>Fusions</small>
        </div>
        <div className="profile-stat">
          <b>{game.achievements.length}</b>
          <small>Achievements</small>
        </div>
        <div className="profile-stat">
          <b>{(game.unlockedAreas || ['moon-meadow']).length}</b>
          <small>Areas Discovered</small>
        </div>
      </div>

      <h3>Companion Provenance & Collection</h3>
      <div className="profile-companions">
        {game.companions.map((c) => (
          <div className="profile-companion-card" key={c.id}>
            <Creature c={c} hat={game.equipped[c.id]} />
            <b>{c.name}</b>
            <small>Lv. {c.level} · {c.species}</small>
            
            {c.stellarRegistered ? (
              <span style={{ fontSize: '0.75rem', color: '#8df4a4', marginTop: '4px' }}>
                ✓ Stellar Registered
              </span>
            ) : (
              <button
                disabled={registeringId === c.id}
                onClick={() => handleRegister(c)}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {registeringId === c.id ? 'Registering…' : 'Register on Stellar'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
