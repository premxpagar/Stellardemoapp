import Phaser from 'phaser'
import { eclipseGuardian } from '../../data/enemies'

/**
 * BossScene — Eclipse Guardian boss fight.
 * 3 phases with escalating difficulty, telegraphed attacks, and satisfying defeat sequence.
 */
export function createBossScene(callbacksRef, companionData) {
  return class BossScene extends Phaser.Scene {
    constructor() {
      super('BossScene')
      this.playerHP = 100
      this.maxHP = 100
      this.playerAttack = 15
      this.playerDefense = 5
      this.playerSpeed = 170
      this.bossHP = eclipseGuardian.hp
      this.bossMaxHP = eclipseGuardian.hp
      this.currentPhase = 0
      this.isAttacking = false
      this.isDashing = false
      this.dashCooldown = 0
      this.abilityCooldown = 0
      this.invincible = false
      this.bossAttackTimer = 0
      this.bossPatternTimer = 0
    }

    create() {
      const W = 960
      const H = 640

      /* Arena background */
      const bg = this.add.graphics()
      bg.fillGradientStyle(0x0a0520, 0x0a0520, 0x1a0a2e, 0x1a0a2e, 1)
      bg.fillRect(0, 0, W, H)

      /* Arena border glow */
      const border = this.add.graphics()
      border.lineStyle(2, 0x4a2066, 0.5)
      border.strokeRect(40, 40, W - 80, H - 80)
      border.lineStyle(1, 0x8a4aaa, 0.3)
      border.strokeRect(50, 50, W - 100, H - 100)

      /* Arena particles */
      if (this.add.particles) {
        this.add.particles(0, 0, 'particle', {
          x: { min: 50, max: W - 50 },
          y: { min: 50, max: H - 50 },
          lifespan: 3000,
          speed: { min: 5, max: 15 },
          scale: { start: 0.3, end: 0 },
          alpha: { start: 0.3, end: 0 },
          tint: [0x8a4aaa, 0xe04848, 0x4a2066],
          quantity: 1,
          frequency: 300,
        })
      }

      /* Player */
      this.player = this.physics.add.sprite(W / 2, H - 100, 'player')
      this.player.setCollideWorldBounds(true)
      this.player.setDepth(10)
      this.player.setScale(1.2)

      /* Companion */
      this.companion = this.physics.add.sprite(W / 2 - 40, H - 80, 'companion')
      this.companion.setDepth(9)
      this.companion.setScale(0.9)
      if (companionData) {
        this.companion.setTint(Phaser.Display.Color.HexStringToColor(companionData.color).color)
      }

      /* Boss */
      this.boss = this.physics.add.sprite(W / 2, 120, 'boss')
      this.boss.setDepth(10)
      this.boss.setScale(1.5)
      this.boss.setCollideWorldBounds(true)

      /* Boss glow */
      this.bossGlow = this.add.graphics()
      this.bossGlow.setDepth(9)

      /* Attack groups */
      this.slashGroup = this.physics.add.group()
      this.bossProjectiles = this.physics.add.group()

      /* Hazard zones */
      this.hazardGroup = this.physics.add.group()

      /* Collisions */
      this.physics.add.overlap(this.slashGroup, this.boss, this.hitBoss, null, this)
      this.physics.add.overlap(this.player, this.bossProjectiles, this.playerHitByBoss, null, this)
      this.physics.add.overlap(this.player, this.hazardGroup, this.playerHitByHazard, null, this)

      /* Input */
      this.cursors = this.input.keyboard.createCursorKeys()
      this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' })
      this.attackKey = this.input.keyboard.addKey('SPACE')
      this.dashKey = this.input.keyboard.addKey('SHIFT')
      this.abilityKey = this.input.keyboard.addKey('Q')

      this.mobileInput = { up: false, down: false, left: false, right: false, attack: false, dash: false, ability: false }

      /* Boss intro */
      this.cameras.main.fadeIn(800)
      callbacksRef.current.onBossUpdate({
        name: eclipseGuardian.name,
        hp: this.bossHP,
        maxHp: this.bossMaxHP,
        phase: 1,
      })
      callbacksRef.current.onHudUpdate({
        hp: this.playerHP,
        maxHp: this.maxHP,
        area: 'Eclipse Arena',
        objective: 'Defeat the Eclipse Guardian!',
      })
    }

    update(time, delta) {
      if (!this.player?.active || !this.boss?.active) return

      this.handleMovement()
      this.handleAttack(time)
      this.handleDash(time, delta)
      this.handleAbility(time)
      this.updateCompanion()
      this.updateBoss(time, delta)
      this.updateCooldowns(delta)
      this.updateBossGlow()
    }

    handleMovement() {
      const speed = this.isDashing ? this.playerSpeed * 2.5 : this.playerSpeed
      let vx = 0, vy = 0
      if (this.cursors.left.isDown || this.wasd.left.isDown || this.mobileInput.left) vx = -speed
      else if (this.cursors.right.isDown || this.wasd.right.isDown || this.mobileInput.right) vx = speed
      if (this.cursors.up.isDown || this.wasd.up.isDown || this.mobileInput.up) vy = -speed
      else if (this.cursors.down.isDown || this.wasd.down.isDown || this.mobileInput.down) vy = speed
      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }
      this.player.setVelocity(vx, vy)
      if (vx < 0) this.player.setFlipX(true)
      else if (vx > 0) this.player.setFlipX(false)
    }

    handleAttack(time) {
      if (this.isAttacking) return
      if (Phaser.Input.Keyboard.JustDown(this.attackKey) || this.mobileInput.attack) {
        this.isAttacking = true
        this.mobileInput.attack = false
        const dir = this.player.flipX ? -1 : 1
        const slash = this.slashGroup.create(this.player.x + dir * 35, this.player.y, 'slash')
        slash.setDepth(11)
        slash.damage = this.playerAttack
        this.tweens.add({
          targets: slash, scale: 1.4, alpha: 0, angle: dir * 90, duration: 200,
          onComplete: () => slash.destroy()
        })
        this.cameras.main.shake(50, 0.002)
        this.time.delayedCall(300, () => { this.isAttacking = false })
      }
    }

    handleDash(time, delta) {
      if (this.isDashing || this.dashCooldown > 0) return
      if (Phaser.Input.Keyboard.JustDown(this.dashKey) || this.mobileInput.dash) {
        this.isDashing = true
        this.invincible = true
        this.mobileInput.dash = false
        this.player.setAlpha(0.5)
        this.time.delayedCall(200, () => {
          this.isDashing = false
          this.invincible = false
          this.player.setAlpha(1)
          this.dashCooldown = 800
        })
      }
    }

    handleAbility(time) {
      if (this.abilityCooldown > 0) return
      if (Phaser.Input.Keyboard.JustDown(this.abilityKey) || this.mobileInput.ability) {
        this.mobileInput.ability = false
        this.abilityCooldown = 5000
        /* Companion ability — powerful attack against boss */
        const burst = this.add.particles && this.add.particles(this.companion.x, this.companion.y, 'ability-orb', {
          speed: { min: 100, max: 250 }, scale: { start: 0.8, end: 0 }, lifespan: 400,
          quantity: 12, tint: 0xd9f36d, emitting: false,
        })
        burst?.explode()

        const dist = Phaser.Math.Distance.Between(this.companion.x, this.companion.y, this.boss.x, this.boss.y)
        if (dist < 200) {
          this.damageBoss(this.playerAttack * 2)
        }
      }
    }

    updateCompanion() {
      if (!this.companion?.active) return
      const tx = this.player.x - (this.player.flipX ? -35 : 35)
      const ty = this.player.y + 20
      const dist = Phaser.Math.Distance.Between(this.companion.x, this.companion.y, tx, ty)
      if (dist > 8) {
        const angle = Phaser.Math.Angle.Between(this.companion.x, this.companion.y, tx, ty)
        const speed = Math.min(dist * 3, this.playerSpeed * 0.8)
        this.companion.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
      } else {
        this.companion.setVelocity(0, 0)
      }
      this.companion.setFlipX(this.player.flipX)
    }

    updateBoss(time, delta) {
      /* Determine phase */
      const hpPercent = this.bossHP / this.bossMaxHP
      let phase = 0
      for (let i = eclipseGuardian.phases.length - 1; i >= 0; i--) {
        if (hpPercent <= eclipseGuardian.phases[i].hpThreshold) { phase = i; break }
      }
      if (phase !== this.currentPhase) {
        this.currentPhase = phase
        this.cameras.main.flash(300, 224, 72, 72)
        this.cameras.main.shake(300, 0.01)
        callbacksRef.current.onBossUpdate({
          name: eclipseGuardian.name,
          hp: this.bossHP,
          maxHp: this.bossMaxHP,
          phase: phase + 1,
        })
      }

      const phaseData = eclipseGuardian.phases[phase]
      const attackInterval = 2000 / phaseData.attackSpeed

      /* Boss movement — circle around arena */
      this.bossPatternTimer += delta
      const cx = 480, cy = 250
      const radius = 120 + Math.sin(this.bossPatternTimer * 0.001) * 60
      const angle = this.bossPatternTimer * 0.0008 * phaseData.attackSpeed
      const targetX = cx + Math.cos(angle) * radius
      const targetY = cy + Math.sin(angle) * radius * 0.5
      const moveAngle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, targetX, targetY)
      this.boss.setVelocity(Math.cos(moveAngle) * 60 * phaseData.attackSpeed, Math.sin(moveAngle) * 60 * phaseData.attackSpeed)

      /* Boss attacks */
      this.bossAttackTimer += delta
      if (this.bossAttackTimer > attackInterval) {
        this.bossAttackTimer = 0
        this.bossAttack(phaseData.pattern)
      }

      /* Phase 3: spawn hazard zones */
      if (phase === 2 && Math.random() < 0.003 * phaseData.attackSpeed) {
        this.spawnHazardZone()
      }
    }

    bossAttack(pattern) {
      switch (pattern) {
        case 'basic':
          this.bossShoot(1)
          break
        case 'fast':
          this.bossShoot(3)
          break
        case 'corrupt':
          this.bossShoot(5)
          if (Math.random() < 0.3) this.bossSlam()
          break
      }
    }

    bossShoot(count) {
      const angleToPlayer = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y)
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.2
        const proj = this.bossProjectiles.create(this.boss.x, this.boss.y, 'projectile')
        proj.setDepth(8)
        proj.setScale(1.2)
        proj.damage = eclipseGuardian.attack
        const a = angleToPlayer + spread
        proj.setVelocity(Math.cos(a) * 180, Math.sin(a) * 180)
        this.time.delayedCall(4000, () => { if (proj.active) proj.destroy() })
      }
    }

    bossSlam() {
      /* Telegraph */
      const warn = this.add.graphics()
      warn.fillStyle(0xe04848, 0.15)
      warn.fillCircle(this.player.x, this.player.y, 80)
      warn.setDepth(5)
      this.tweens.add({ targets: warn, alpha: 0.4, duration: 600, yoyo: true, onComplete: () => {
        /* Slam damage */
        const dist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y)
        if (dist < 120 && !this.invincible) {
          this.playerTakeDamage(eclipseGuardian.attack * 1.5)
        }
        warn.destroy()
        this.cameras.main.shake(200, 0.008)
      }})
    }

    spawnHazardZone() {
      const x = 60 + Math.random() * 840
      const y = 60 + Math.random() * 520
      const hazard = this.add.graphics()
      hazard.fillStyle(0x4a0a6e, 0.3)
      hazard.fillCircle(0, 0, 50)
      hazard.setPosition(x, y)
      hazard.setDepth(3)

      const zone = this.hazardGroup.create(x, y, 'particle')
      zone.setAlpha(0.01)
      zone.damage = 8
      zone.body.setSize(80, 80)
      zone.body.setOffset(-40, -40)

      this.time.delayedCall(4000, () => {
        hazard.destroy()
        zone.destroy()
      })

      this.tweens.add({ targets: hazard, alpha: 0.6, duration: 500, yoyo: true, repeat: 3 })
    }

    updateBossGlow() {
      this.bossGlow.clear()
      const phase = this.currentPhase
      const glowColor = [0x4a2066, 0x8a2040, 0xe04848][phase]
      const glowAlpha = 0.15 + Math.sin(Date.now() * 0.003) * 0.1
      this.bossGlow.fillStyle(glowColor, glowAlpha)
      this.bossGlow.fillCircle(this.boss.x, this.boss.y, 55 + phase * 10)
    }

    hitBoss(slash, boss) {
      this.damageBoss(slash.damage || this.playerAttack)
    }

    damageBoss(damage) {
      this.bossHP = Math.max(0, this.bossHP - damage)
      this.tweens.add({ targets: this.boss, tint: 0xffffff, duration: 60, yoyo: true, onYoyoComplete: () => this.boss.setTint(0xe04848) })
      this.boss.setTint(0xe04848)

      callbacksRef.current.onBossUpdate({
        name: eclipseGuardian.name,
        hp: this.bossHP,
        maxHp: this.bossMaxHP,
        phase: this.currentPhase + 1,
      })

      if (this.bossHP <= 0) {
        this.bossDefeated()
      }
    }

    playerHitByBoss(player, proj) {
      if (this.invincible) { proj.destroy(); return }
      this.playerTakeDamage(proj.damage || eclipseGuardian.attack)
      proj.destroy()
    }

    playerHitByHazard(player, hazard) {
      if (this.invincible) return
      this.playerTakeDamage(hazard.damage || 8)
    }

    playerTakeDamage(amount) {
      if (this.invincible) return
      const dmg = Math.max(1, amount - this.playerDefense)
      this.playerHP = Math.max(0, this.playerHP - dmg)
      this.invincible = true
      this.player.setTint(0xff4444)
      this.cameras.main.shake(80, 0.004)

      this.time.delayedCall(400, () => {
        this.invincible = false
        this.player.clearTint()
      })

      callbacksRef.current.onHudUpdate({ hp: this.playerHP, maxHp: this.maxHP })

      if (this.playerHP <= 0) {
        this.playerHP = this.maxHP * 0.3
        this.player.setPosition(480, 550)
        this.cameras.main.flash(500, 200, 50, 50)
        callbacksRef.current.onHudUpdate({ hp: this.playerHP, maxHp: this.maxHP })
      }
    }

    bossDefeated() {
      /* Epic defeat sequence */
      this.boss.setVelocity(0, 0)
      this.physics.pause()

      /* Clear all projectiles */
      this.bossProjectiles.clear(true, true)
      this.hazardGroup.clear(true, true)

      /* Explosion particles */
      if (this.add.particles) {
        for (let i = 0; i < 3; i++) {
          this.time.delayedCall(i * 300, () => {
            const burst = this.add.particles(
              this.boss.x + (Math.random() - 0.5) * 60,
              this.boss.y + (Math.random() - 0.5) * 60,
              'particle',
              {
                speed: { min: 60, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 800,
                quantity: 25, tint: [0xe04848, 0xd9f36d, 0x8f82d7], emitting: false,
              }
            )
            burst.explode()
          })
        }
      }

      this.cameras.main.shake(500, 0.015)
      this.cameras.main.flash(800, 217, 243, 109)

      /* Fade boss */
      this.tweens.add({
        targets: this.boss,
        alpha: 0, scale: 3, duration: 1500,
        onComplete: () => {
          this.boss.destroy()
          this.bossGlow.destroy()
        }
      })

      /* Generate loot */
      const rewards = []
      eclipseGuardian.loot.forEach((drop) => {
        if (Math.random() < drop.chance) {
          const qty = drop.qty[0] + Math.floor(Math.random() * (drop.qty[1] - drop.qty[0] + 1))
          rewards.push({ icon: drop.item === 'stardust' ? '✦' : '💎', text: `${qty}× ${drop.item.replace(/-/g, ' ')}` })
          callbacksRef.current.onLoot({
            stardust: drop.item === 'stardust' ? qty : 0,
            items: drop.item !== 'stardust' ? [{ id: drop.item, qty }] : [],
            popupText: `+${qty} ${drop.item.replace(/-/g, ' ')}`,
            rarity: drop.item.includes('catalyst') ? 'EPIC' : drop.item.includes('void') || drop.item.includes('astral') ? 'RARE' : 'UNCOMMON',
          })
        }
      })

      callbacksRef.current.onLoot({
        xp: eclipseGuardian.xp,
        companionXp: Math.floor(eclipseGuardian.xp * 0.7),
        bossWins: 1,
        bondGain: 5,
        questUpdates: { bossesDefeated: 1 },
      })

      callbacksRef.current.onBossUpdate(null) /* Clear boss HUD */

      /* Victory notification */
      this.time.delayedCall(2000, () => {
        callbacksRef.current.onVictory({
          bossName: eclipseGuardian.name,
          rewards: [
            { icon: '⭐', text: `${eclipseGuardian.xp} XP` },
            ...rewards,
          ],
        })
      })

      /* Return to meadow after a delay */
      this.time.delayedCall(8000, () => {
        this.scene.start('MoonMeadow')
      })
    }

    updateCooldowns(delta) {
      if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - delta)
      if (this.abilityCooldown > 0) this.abilityCooldown = Math.max(0, this.abilityCooldown - delta)
    }
  }
}
