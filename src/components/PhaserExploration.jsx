import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

export default function PhaserExploration({ onFinish, onExit }) {
  const host = useRef(null); const game = useRef(null); const [hud, setHud] = useState({ time: 35, score: 0, combo: 0 })
  useEffect(() => {
    let ended = false
    class MeadowScene extends Phaser.Scene {
      constructor() { super('meadow'); this.score = 0; this.combo = 0; this.best = 0; this.gold = 0; this.timeLeft = 35 }
      create() {
        const { width, height } = this.scale
        const sky = this.add.graphics(); sky.fillGradientStyle(0x9eaae4, 0x9eaae4, 0x46395f, 0x46395f, 1); sky.fillRect(0, 0, width, height)
        const hill = this.add.graphics(); hill.fillStyle(0x4f8f78, 1); hill.fillCircle(width * .52, height + 135, width * .72); hill.fillStyle(0x34705f, 1); hill.fillCircle(width * .15, height + 125, width * .52)
        this.add.text(width - 100, 28, '☾', { fontSize: '64px', color: '#fff3d1' })
        this.stars = this.physics.add.group(); this.makeTexture()
        this.spawnLoop = this.time.addEvent({ delay: 720, callback: this.spawn, callbackScope: this, loop: true })
        this.tick = this.time.addEvent({ delay: 1000, callback: () => { this.timeLeft -= 1; this.report(); if (this.timeLeft <= 0) this.end() }, loop: true })
        this.input.on('gameobjectdown', (_, star) => this.collect(star))
        this.report()
      }
      makeTexture() { const g = this.make.graphics({ x: 0, y: 0, add: false }); g.fillStyle(0xffffff); g.fillCircle(16, 16, 15); g.generateTexture('star', 32, 32); g.destroy() }
      spawn() { if (this.timeLeft <= 0) return; const golden = Math.random() < .12; const star = this.stars.create(45 + Math.random() * (this.scale.width - 90), -24, 'star'); star.setTint(golden ? 0xffd34d : Math.random() < .3 ? 0x9ce8ff : 0xf3d4ff); star.setScale(golden ? 1.22 : .9 + Math.random()*.28); star.setInteractive({ useHandCursor: true }); star.golden = golden; star.points = golden ? 25 : Math.random() < .25 ? 16 : 8; star.body.setVelocity((Math.random()-.5)*42, 58 + Math.min(105, (35-this.timeLeft)*4)); star.rotation = Math.random()*6; this.tweens.add({ targets: star, angle: 360, duration: 1200, repeat: -1 }) }
      collect(star) { if (!star.active) return; this.combo += 1; this.best = Math.max(this.best, this.combo); const multiplier = Math.min(4, 1 + Math.floor(this.combo / 5)); this.score += star.points * multiplier; if (star.golden) this.gold += 1; const burst = this.add.particles(star.x, star.y, 'star', { speed: { min: 35, max: 150 }, scale: { start: .35, end: 0 }, lifespan: 430, quantity: 13, tint: star.golden ? 0xffd34d : 0xf6e5ff, emitting: false }); burst.explode(); star.destroy(); this.cameras.main.shake(star.golden ? 110 : 45, star.golden ? .006 : .002); this.report() }
      update() { this.stars.getChildren().forEach((s) => { if (s.y > this.scale.height + 30) { s.destroy(); this.combo = 0; this.report() } }) }
      report() { setHud({ time: Math.max(0, this.timeLeft), score: this.score, combo: this.combo }) }
      end() { if (ended) return; ended = true; this.spawnLoop.remove(); this.tick.remove(); this.time.delayedCall(500, () => onFinish({ score: this.score, stardust: Math.max(12, Math.floor(this.score / 8)), xp: Math.max(15, Math.floor(this.score / 6)), combo: this.best, gold: this.gold })) }
    }
    game.current = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, width: 760, height: 430, backgroundColor: '#7b78bb', scene: MeadowScene, physics: { default: 'arcade', arcade: { gravity: { y: 15 }, debug: false } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } })
    return () => { game.current?.destroy(true); game.current = null }
  }, [onFinish])
  return <div className="quest-overlay phaser-overlay"><section className="explore-game phaser-game"><button className="close-quest" onClick={onExit}>×</button><div className="game-top"><div><p className="eyebrow">WHISPERING MEADOW · PHASER EXPEDITION</p><b>{hud.time}s</b></div><div>Score <strong>{hud.score}</strong></div><div>Combo <strong>x{Math.min(4, 1 + Math.floor(hud.combo / 5))}</strong></div></div><div className="phaser-host" ref={host} /><p className="game-help">Tap or click falling stars. Gold stars are rare and award bonus Stardust.</p></section></div>
}
