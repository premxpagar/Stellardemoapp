import { useEffect, useRef, useState, useCallback } from 'react'
import PhaserGame from './PhaserGame'
import Creature from '../components/Creature'
import './KnightMode.css'

export default function KnightMode({ game, companion, onExit }) {
  const [hud, setHud] = useState({
    hp: 100, maxHp: 100, stardust: 0, xp: 0,
    companionEnergy: companion?.energy || 100,
    objective: 'Explore Moon Meadow',
    area: 'Moon Meadow',
    abilityCooldown: 0,
    playerLevel: game.playerLevel,
    enemiesDefeated: 0,
    bossDefeated: false,
    isPaused: false,
  })
  const [showMap, setShowMap] = useState(false)
  const [showPause, setShowPause] = useState(false)
  const [lootPopups, setLootPopups] = useState([])
  const [bossHud, setBossHud] = useState(null)
  const [victoryScreen, setVictoryScreen] = useState(null)
  const rewardsRef = useRef({
    stardust: 0, xp: 0, companionXp: 0, combatWins: 0, bossWins: 0,
    bondGain: 0, areasExplored: 0, items: [], questUpdates: {}, unlockedAreas: [],
  })

  const onHudUpdate = useCallback((data) => {
    setHud((prev) => ({ ...prev, ...data }))
  }, [])

  const onLoot = useCallback((loot) => {
    rewardsRef.current.stardust += loot.stardust || 0
    rewardsRef.current.xp += loot.xp || 0
    rewardsRef.current.companionXp += loot.companionXp || 0
    rewardsRef.current.combatWins += loot.combatWins || 0
    rewardsRef.current.bossWins += loot.bossWins || 0
    rewardsRef.current.bondGain += loot.bondGain || 0
    if (loot.items) rewardsRef.current.items.push(...loot.items)
    if (loot.questUpdates) Object.assign(rewardsRef.current.questUpdates, loot.questUpdates)
    if (loot.unlockedAreas) rewardsRef.current.unlockedAreas.push(...loot.unlockedAreas)

    if (loot.popupText) {
      const id = Date.now() + Math.random()
      setLootPopups((p) => [...p.slice(-4), { id, text: loot.popupText, rarity: loot.rarity || 'COMMON' }])
      setTimeout(() => setLootPopups((p) => p.filter((l) => l.id !== id)), 2500)
    }
  }, [])

  const onBossUpdate = useCallback((data) => {
    setBossHud(data)
  }, [])

  const onVictory = useCallback((data) => {
    setVictoryScreen(data)
    rewardsRef.current.bossWins += 1
  }, [])

  const handleExit = () => {
    rewardsRef.current.areasExplored = 1
    onExit(rewardsRef.current)
  }

  const togglePause = useCallback(() => {
    setShowPause((p) => !p)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') togglePause()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [togglePause])

  return (
    <div className="knight-mode">
      {/* Phaser Canvas */}
      <PhaserGame
        companion={companion}
        game={game}
        onHudUpdate={onHudUpdate}
        onLoot={onLoot}
        onBossUpdate={onBossUpdate}
        onVictory={onVictory}
        isPaused={showPause || showMap}
      />

      {/* HUD Overlay */}
      <div className="knight-hud">
        <div className="hud-left">
          <div className="hud-player-info">
            <span className="hud-level">Lv.{hud.playerLevel}</span>
            <div className="hud-hp-bar">
              <div className="hud-hp-fill" style={{ width: `${(hud.hp / hud.maxHp) * 100}%` }} />
              <span className="hud-hp-text">{Math.ceil(hud.hp)} / {hud.maxHp}</span>
            </div>
          </div>
          <div className="hud-companion">
            <div className="hud-companion-icon">
              <Creature c={companion} />
            </div>
            <div className="hud-companion-info">
              <b>{companion.name}</b>
              <div className="hud-energy-bar">
                <div className="hud-energy-fill" style={{ width: `${hud.companionEnergy}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="hud-center">
          <span className="hud-area">{hud.area}</span>
          <span className="hud-objective">{hud.objective}</span>
        </div>
        <div className="hud-right">
          <span className="hud-stardust">✦ {hud.stardust}</span>
          <button className="hud-btn" onClick={() => setShowMap(true)}>🗺</button>
          <button className="hud-btn" onClick={togglePause}>⏸</button>
        </div>
      </div>

      {/* Boss HP Bar */}
      {bossHud && (
        <div className="boss-hud">
          <span className="boss-name">{bossHud.name}</span>
          <div className="boss-hp-bar">
            <div className="boss-hp-fill" style={{ width: `${(bossHud.hp / bossHud.maxHp) * 100}%` }} />
          </div>
          <span className="boss-phase">Phase {bossHud.phase}</span>
        </div>
      )}

      {/* Loot Popups */}
      <div className="loot-popups">
        {lootPopups.map((l) => (
          <div className={`loot-popup loot-${l.rarity.toLowerCase()}`} key={l.id}>
            {l.text}
          </div>
        ))}
      </div>

      {/* Victory Screen */}
      {victoryScreen && (
        <div className="knight-overlay">
          <div className="victory-panel">
            <h2 className="victory-title">🏆 {victoryScreen.bossName} DEFEATED</h2>
            <div className="victory-rewards">
              {victoryScreen.rewards?.map((r, i) => (
                <div className="victory-reward" key={i}>{r.icon} {r.text}</div>
              ))}
            </div>
            <button className="primary" onClick={() => setVictoryScreen(null)}>Continue</button>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {showPause && (
        <div className="knight-overlay">
          <div className="pause-panel">
            <h2>Paused</h2>
            <p className="pause-area">{hud.area}</p>
            <div className="pause-stats">
              <span>Stardust: {hud.stardust}</span>
              <span>Enemies: {hud.enemiesDefeated}</span>
            </div>
            <button className="primary" onClick={togglePause}>Resume</button>
            <button className="soft-button" onClick={handleExit}>Return to Grove</button>
          </div>
        </div>
      )}

      {/* World Map */}
      {showMap && (
        <div className="knight-overlay">
          <div className="world-map-panel">
            <button className="close-quest" onClick={() => setShowMap(false)}>×</button>
            <h2>World Map</h2>
            <div className="world-map-graph">
              <div className="map-node map-grove">
                <span>⌂</span>
                <b>Stellar Grove</b>
              </div>
              <div className="map-connector" />
              <div className="map-node map-meadow map-unlocked">
                <span>🌙</span>
                <b>Moon Meadow</b>
              </div>
              <div className="map-branch">
                <div className="map-arm">
                  <div className="map-connector" />
                  <div className={`map-node map-forest ${(game.unlockedAreas || []).includes('nebula-forest') ? 'map-unlocked' : 'map-locked'}`}>
                    <span>🌲</span>
                    <b>Nebula Forest</b>
                    {!(game.unlockedAreas || []).includes('nebula-forest') && <small>Defeat 10 enemies</small>}
                  </div>
                </div>
                <div className="map-arm">
                  <div className="map-connector" />
                  <div className={`map-node map-valley ${(game.unlockedAreas || []).includes('meteor-valley') ? 'map-unlocked' : 'map-locked'}`}>
                    <span>☄</span>
                    <b>Meteor Valley</b>
                    {!(game.unlockedAreas || []).includes('meteor-valley') && <small>Player Level 5</small>}
                  </div>
                </div>
              </div>
              <div className="map-connector" />
              <div className={`map-node map-rift ${(game.unlockedAreas || []).includes('astral-rift') ? 'map-unlocked' : 'map-locked'}`}>
                <span>✦</span>
                <b>Astral Rift</b>
                {!(game.unlockedAreas || []).includes('astral-rift') && <small>Defeat Eclipse Guardian</small>}
              </div>
            </div>
            <button className="soft-button" onClick={() => setShowMap(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      <div className="mobile-controls">
        <div className="mobile-dpad">
          <button className="dpad-btn dpad-up" data-dir="up">▲</button>
          <button className="dpad-btn dpad-left" data-dir="left">◄</button>
          <button className="dpad-btn dpad-right" data-dir="right">►</button>
          <button className="dpad-btn dpad-down" data-dir="down">▼</button>
        </div>
        <div className="mobile-actions">
          <button className="action-btn action-attack" data-action="attack">⚔</button>
          <button className="action-btn action-dash" data-action="dash">💨</button>
          <button className="action-btn action-ability" data-action="ability">✦</button>
        </div>
      </div>
    </div>
  )
}
