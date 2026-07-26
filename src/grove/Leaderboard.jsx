import { useEffect, useState } from 'react'
import { fetchGlobalLeaderboard, isSupabaseConfigured } from '../services/supabase'

export default function Leaderboard({ game, onUpdateUsername }) {
  const [remoteEntries, setRemoteEntries] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [usernameInput, setUsernameInput] = useState(game.username || 'Keeper')

  const username = game.username || 'Keeper'
  const playerScore = calculateScore(game)

  useEffect(() => {
    if (isSupabaseConfigured()) {
      setLoading(true)
      fetchGlobalLeaderboard().then((data) => {
        if (data) setRemoteEntries(data)
        setLoading(false)
      })
    }
  }, [])

  const handleSaveUsername = (e) => {
    e.preventDefault()
    if (usernameInput.trim() && onUpdateUsername) {
      onUpdateUsername(usernameInput.trim())
    }
    setEditing(false)
  }

  const playerEntry = {
    rank: 1,
    name: username,
    level: game.playerLevel,
    companions: game.companions.length,
    score: playerScore,
    isPlayer: true,
  }

  const demoEntries = [
    { name: 'Starkeeper_Luna', level: 12, companions: 8, score: 2450 },
    { name: 'CosmicPip', level: 9, companions: 6, score: 1820 },
    { name: 'NoriDreamer', level: 7, companions: 5, score: 1340 },
    { name: 'AstralKnight42', level: 5, companions: 4, score: 890 },
    { name: 'VoidWalker', level: 3, companions: 3, score: 520 },
  ]

  let baseList = demoEntries
  if (remoteEntries && remoteEntries.length > 0) {
    baseList = remoteEntries.map((e) => ({
      name: e.username || 'Anonymous',
      level: e.player_level || 1,
      companions: e.companions || '—',
      score: e.score || 0,
    }))
  }

  const filteredBase = baseList.filter((e) => e.name !== username)
  const allEntries = [...filteredBase, playerEntry]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  return (
    <section className="leaderboard-panel scroll-panel">
      <p className="eyebrow">TOP STELLAR KNIGHTS</p>
      <h2>Leaderboard</h2>
      <p className="leaderboard-subtitle">Rankings are based on combined progression score.</p>

      {/* Compete Globally Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(156,232,255,0.15), rgba(123,120,187,0.25))',
        border: '1px solid rgba(156,232,255,0.3)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <b style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>
            🏆 Compete Globally as: <span style={{ color: '#9ce8ff' }}>{username}</span>
          </b>
          <small style={{ opacity: 0.8 }}>Your custom username represents you on the global leaderboard.</small>
        </div>

        {editing ? (
          <form onSubmit={handleSaveUsername} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter username"
              maxLength={24}
              autoFocus
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid #9ce8ff',
                color: '#fff',
                borderRadius: '6px',
                padding: '6px 12px',
              }}
            />
            <button type="submit" style={{ padding: '6px 14px', cursor: 'pointer' }}>Save</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <button
            onClick={() => { setUsernameInput(username); setEditing(true) }}
            style={{
              background: '#9ce8ff',
              color: '#0a0818',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Change Username
          </button>
        )}
      </div>

      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Level</span>
          <span>Companions</span>
          <span>Score</span>
        </div>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.8 }}>Loading global rankings…</div>
        ) : (
          allEntries.map((e) => (
            <div className={`leaderboard-row ${e.isPlayer ? 'leaderboard-self' : ''}`} key={e.name}>
              <span className="leaderboard-rank">
                {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : `#${e.rank}`}
              </span>
              <span className="leaderboard-name">{e.name} {e.isPlayer && ' (You)'}</span>
              <span>Lv. {e.level}</span>
              <span>{e.companions}</span>
              <span className="leaderboard-score">{e.score}</span>
            </div>
          ))
        )}
      </div>

      <p className="leaderboard-note">
        {isSupabaseConfigured()
          ? 'Connected to Supabase live global leaderboards.'
          : 'Supabase unconfigured. Currently showing local player score + demo leaderboard data.'}
      </p>
    </section>
  )
}

function calculateScore(game) {
  return (
    game.playerLevel * 100 +
    game.companions.length * 50 +
    (game.stats?.stardustEarned || 0) +
    (game.stats?.enemiesDefeated || 0) * 10 +
    (game.stats?.bossesDefeated || 0) * 200 +
    (game.stats?.fusions || 0) * 75 +
    game.achievements.length * 30
  )
}
