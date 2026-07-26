import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createBootScene } from '../game/scenes/BootScene'
import { createMoonMeadowScene } from '../game/scenes/MoonMeadowScene'
import { createBossScene } from '../game/scenes/BossScene'

/**
 * PhaserGame manages the Phaser lifecycle.
 * Properly creates and destroys the game instance to prevent duplicate canvases.
 */
export default function PhaserGame({ companion, game, onHudUpdate, onLoot, onBossUpdate, onVictory, isPaused }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const callbacksRef = useRef({ onHudUpdate, onLoot, onBossUpdate, onVictory })

  /* Keep callbacks fresh without re-creating Phaser */
  useEffect(() => {
    callbacksRef.current = { onHudUpdate, onLoot, onBossUpdate, onVictory }
  }, [onHudUpdate, onLoot, onBossUpdate, onVictory])

  /* Pause/resume */
  useEffect(() => {
    if (!gameRef.current) return
    if (isPaused) {
      gameRef.current.scene.scenes.forEach((s) => { if (s.scene.isActive()) s.scene.pause() })
    } else {
      gameRef.current.scene.scenes.forEach((s) => { if (s.scene.isPaused()) s.scene.resume() })
    }
  }, [isPaused])

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const BootScene = createBootScene(callbacksRef)
    const MoonMeadowScene = createMoonMeadowScene(callbacksRef, companion, game)
    const BossScene = createBossScene(callbacksRef, companion)

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 640,
      backgroundColor: '#0a0818',
      pixelArt: false,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, MoonMeadowScene, BossScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        activePointers: 3,
      },
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="phaser-container" style={{ width: '100%', height: '100%' }} />
}
