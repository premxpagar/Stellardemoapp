import { useState } from 'react'
import Modal from './Modal'

export default function SettingsModal({ game, updateGame, onReset, onClose }) {
  const [username, setUsername] = useState(game.username || 'Keeper')

  const handleSaveUsername = (e) => {
    e.preventDefault()
    if (username.trim()) {
      updateGame((s) => ({ ...s, username: username.trim() }))
    }
  }

  return (
    <Modal title="Settings & Profile" close={onClose}>
      <form onSubmit={handleSaveUsername} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #a0aec0)' }}>
          Player Username (Compete Globally)
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username…"
            maxLength={24}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#fff',
            }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Save</button>
        </div>
        <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
          Your username is displayed on the Stellar Leaderboard and Profile instead of raw wallet addresses.
        </small>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />

      <label className="toggle">
        Sound effects
        <input type="checkbox" checked={game.settings.sound} onChange={() => updateGame((s) => ({ ...s, settings: { ...s.settings, sound: !s.settings.sound } }))} />
      </label>
      <label className="toggle">
        Background music
        <input type="checkbox" checked={game.settings.music} onChange={() => updateGame((s) => ({ ...s, settings: { ...s.settings, music: !s.settings.music } }))} />
      </label>
      <label className="toggle">
        Reduced motion
        <input type="checkbox" checked={game.settings.reducedMotion || false} onChange={() => updateGame((s) => ({ ...s, settings: { ...s.settings, reducedMotion: !s.settings.reducedMotion } }))} />
      </label>
      <label className="toggle">
        Particles
        <input type="checkbox" checked={game.settings.particles !== false} onChange={() => updateGame((s) => ({ ...s, settings: { ...s.settings, particles: !s.settings.particles } }))} />
      </label>

      <button className="danger" onClick={onReset} style={{ marginTop: '16px' }}>Reset game progress</button>
    </Modal>
  )
}
