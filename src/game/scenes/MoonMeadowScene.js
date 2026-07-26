import Phaser from 'phaser'
import { enemies as enemyData, eclipseGuardian } from '../../data/enemies'

/**
 * MoonMeadowScene — the first playable Knight Mode area.
 * Features: tile-based world, player movement, companion follower, enemies, combat, loot, boss portal.
 */
export function createMoonMeadowScene(callbacksRef, companionData, gameState) {
  return class MoonMeadowScene extends Phaser.Scene {
    constructor() {
      super('MoonMeadow')
      this.playerHP = 100
      this.maxHP = 100
      this.playerAttack = gameState?.knightStats?.attack || 15
      this.playerDefense = gameState?.knightStats?.defense || 5
      this.playerSpeed = gameState?.knightStats?.speed || 160
      this.stardustCollected = 0
      this.xpCollected = 0
      this.enemiesDefeated = 0
      this.isAttacking = false
      this.isDashing = false
      this.dashCooldown = 0
      this.abilityCooldown = 0
      this.invincible = false
      this.lootItems = []
    }

    create() {
      const W = 2400
      const H = 1800
      this.physics.world.setBounds(0, 0, W, H)
      this.cameras.main.setBounds(0, 0, W, H)

      /* Sky & ground */
      this.createEnvironment(W, H)

      /* Player */
      this.player = this.physics.add.sprite(200, 900, 'player')
      this.player.setCollideWorldBounds(true)
      this.player.setDepth(10)
      this.player.setScale(1.2)

      /* Companion follower */
      this.companion = this.physics.add.sprite(180, 920, 'companion')
      this.companion.setDepth(9)
      this.companion.setScale(0.9)
      this.companionTarget = { x: 180, y: 920 }
      if (companionData) {
        this.companion.setTint(Phaser.Display.Color.HexStringToColor(companionData.color).color)
      }

      /* Camera */
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
      this.cameras.main.setZoom(1.1)

      /* Enemies */
      this.enemyGroup = this.physics.add.group()
      this.spawnEnemies()

      /* Loot group */
      this.lootGroup = this.physics.add.group()

      /* Collision: player picks up loot */
      this.physics.add.overlap(this.player, this.lootGroup, this.collectLoot, null, this)

      /* Slash group (player attacks) */
      this.slashGroup = this.physics.add.group()
      this.physics.add.overlap(this.slashGroup, this.enemyGroup, this.hitEnemy, null, this)

      /* Enemy projectiles */
      this.enemyProjectiles = this.physics.add.group()
      this.physics.add.overlap(this.player, this.enemyProjectiles, this.playerHit, null, this)

      /* Boss portal */
      this.bossPortal = this.physics.add.sprite(W - 200, H / 2, 'portal')
      this.bossPortal.setScale(1.5)
      this.bossPortal.setDepth(5)
      this.tweens.add({ targets: this.bossPortal, angle: 360, duration: 4000, repeat: -1 })
      this.physics.add.overlap(this.player, this.bossPortal, this.enterBoss, null, this)

      /* Stardust pickups scattered around */
      this.spawnStardust(W, H)

      /* Flower interactions */
      this.spawnFlowers(W, H)

      /* Input */
      this.cursors = this.input.keyboard.createCursorKeys()
      this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' })
      this.attackKey = this.input.keyboard.addKey('SPACE')
      this.dashKey = this.input.keyboard.addKey('SHIFT')
      this.abilityKey = this.input.keyboard.addKey('Q')
      this.interactKey = this.input.keyboard.addKey('E')

      /* Mobile controls */
      this.setupMobileControls()

      /* Initial HUD update */
      this.updateHUD()

      /* Ambient particles */
      if (this.add.particles) {
        this.ambientParticles = this.add.particles(0, 0, 'particle', {
          x: { min: 0, max: W },
          y: { min: 0, max: H },
          lifespan: 4000,
          speed: { min: 5, max: 20 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.4, end: 0 },
          quantity: 1,
          frequency: 400,
        })
        this.ambientParticles.setDepth(1)
      }
    }

    createEnvironment(W, H) {
      /* Background gradient */
      const bg = this.add.graphics()
      bg.fillGradientStyle(0x1a1040, 0x1a1040, 0x0d2a1a, 0x0d2a1a, 1)
      bg.fillRect(0, 0, W, H)
      bg.setDepth(0)

      /* Ground layer */
      const ground = this.add.graphics()
      ground.fillStyle(0x1a3a2a, 1)
      ground.fillRect(0, H * 0.55, W, H * 0.45)
      ground.fillStyle(0x142e22, 1)
      ground.fillRect(0, H * 0.6, W, H * 0.4)
      ground.setDepth(0)

      /* Moon */
      const moon = this.add.graphics()
      moon.fillStyle(0xfff4d8, 0.8)
      moon.fillCircle(W - 300, 150, 60)
      moon.fillStyle(0xfff4d8, 0.2)
      moon.fillCircle(W - 300, 150, 80)
      moon.setDepth(0)
      moon.setScrollFactor(0.3)

      /* Trees */
      this.obstacleGroup = this.physics.add.staticGroup()
      const treePositions = []
      for (let i = 0; i < 40; i++) {
        const tx = 100 + Math.random() * (W - 200)
        const ty = 100 + Math.random() * (H - 200)
        /* Keep trees away from spawn */
        if (Math.hypot(tx - 200, ty - 900) < 200) continue
        treePositions.push({ x: tx, y: ty })
        const tree = this.obstacleGroup.create(tx, ty, 'tree')
        tree.setDepth(ty > this.player?.y ? 11 : 3)
        tree.refreshBody()
        tree.body.setSize(12, 10)
        tree.body.setOffset(10, 30)
      }

      /* Rocks */
      for (let i = 0; i < 20; i++) {
        const rx = 80 + Math.random() * (W - 160)
        const ry = 80 + Math.random() * (H - 160)
        if (Math.hypot(rx - 200, ry - 900) < 150) continue
        const rock = this.obstacleGroup.create(rx, ry, 'rock')
        rock.setDepth(3)
        rock.refreshBody()
        rock.body.setSize(20, 14)
        rock.body.setOffset(4, 10)
      }

      this.physics.add.collider(this.player, this.obstacleGroup)
    }

    spawnEnemies() {
      const spawnDefs = [
        { type: 'voidling', x: 600, y: 800 },
        { type: 'voidling', x: 800, y: 600 },
        { type: 'voidling', x: 1000, y: 1000 },
        { type: 'voidling', x: 1200, y: 700 },
        { type: 'voidling', x: 1400, y: 1100 },
        { type: 'shadowBloom', x: 700, y: 1200 },
        { type: 'shadowBloom', x: 1100, y: 500 },
        { type: 'shadowBloom', x: 1500, y: 900 },
        { type: 'voidling', x: 1600, y: 1300 },
        { type: 'voidling', x: 1800, y: 800 },
        { type: 'shadowBloom', x: 1900, y: 1100 },
        { type: 'voidling', x: 2000, y: 600 },
      ]

      spawnDefs.forEach((def) => {
        const data = enemyData[def.type]
        if (!data) return
        const textureKey = def.type === 'voidling' ? 'enemy-voidling' :
                           def.type === 'shadowBloom' ? 'enemy-shadowbloom' : 'enemy-voidling'
        const enemy = this.enemyGroup.create(def.x, def.y, textureKey)
        enemy.setDepth(8)
        enemy.enemyData = { ...data }
        enemy.currentHP = data.hp
        enemy.maxHP = data.hp
        enemy.lastAttack = 0
        enemy.spawnX = def.x
        enemy.spawnY = def.y
        enemy.setCollideWorldBounds(true)

        /* HP bar background */
        enemy.hpBarBg = this.add.graphics()
        enemy.hpBar = this.add.graphics()
        enemy.hpBarBg.setDepth(12)
        enemy.hpBar.setDepth(13)
      })
    }

    spawnStardust(W, H) {
      for (let i = 0; i < 30; i++) {
        const sx = 100 + Math.random() * (W - 200)
        const sy = 100 + Math.random() * (H - 200)
        const loot = this.lootGroup.create(sx, sy, 'loot-stardust')
        loot.setDepth(4)
        loot.lootData = { type: 'stardust', amount: 2 + Math.floor(Math.random() * 5) }
        this.tweens.add({ targets: loot, y: sy - 6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
    }

    spawnFlowers(W, H) {
      for (let i = 0; i < 12; i++) {
        const fx = 150 + Math.random() * (W - 300)
        const fy = 150 + Math.random() * (H - 300)
        const flower = this.add.sprite(fx, fy, 'flower')
        flower.setDepth(3)
        flower.setScale(0.8 + Math.random() * 0.4)
      }
    }

    setupMobileControls() {
      this.mobileInput = { up: false, down: false, left: false, right: false, attack: false, dash: false, ability: false }

      /* Listen for mobile button presses */
      const btnHandler = (action, state) => (e) => {
        e.preventDefault()
        if (action === 'attack') this.mobileInput.attack = state
        else if (action === 'dash') this.mobileInput.dash = state
        else if (action === 'ability') this.mobileInput.ability = state
        else this.mobileInput[action] = state
      }

      this.game.canvas.parentElement?.parentElement?.querySelectorAll('.dpad-btn').forEach((btn) => {
        const dir = btn.dataset.dir
        btn.addEventListener('pointerdown', btnHandler(dir, true))
        btn.addEventListener('pointerup', btnHandler(dir, false))
        btn.addEventListener('pointerleave', btnHandler(dir, false))
      })
      this.game.canvas.parentElement?.parentElement?.querySelectorAll('.action-btn').forEach((btn) => {
        const action = btn.dataset.action
        btn.addEventListener('pointerdown', btnHandler(action, true))
        btn.addEventListener('pointerup', btnHandler(action, false))
        btn.addEventListener('pointerleave', btnHandler(action, false))
      })
    }

    update(time, delta) {
      if (!this.player?.active) return
      this.handleMovement(delta)
      this.handleAttack(time)
      this.handleDash(time)
      this.handleAbility(time)
      this.updateCompanion(delta)
      this.updateEnemies(time, delta)
      this.updateCooldowns(delta)
    }

    handleMovement(delta) {
      const speed = this.isDashing ? this.playerSpeed * 2.5 : this.playerSpeed
      let vx = 0, vy = 0

      if (this.cursors.left.isDown || this.wasd.left.isDown || this.mobileInput.left) vx = -speed
      else if (this.cursors.right.isDown || this.wasd.right.isDown || this.mobileInput.right) vx = speed
      if (this.cursors.up.isDown || this.wasd.up.isDown || this.mobileInput.up) vy = -speed
      else if (this.cursors.down.isDown || this.wasd.down.isDown || this.mobileInput.down) vy = speed

      /* Normalize diagonal */
      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }

      this.player.setVelocity(vx, vy)

      /* Flip sprite based on direction */
      if (vx < 0) this.player.setFlipX(true)
      else if (vx > 0) this.player.setFlipX(false)
    }

    handleAttack(time) {
      if (this.isAttacking) return
      if (Phaser.Input.Keyboard.JustDown(this.attackKey) || this.mobileInput.attack) {
        this.isAttacking = true
        this.mobileInput.attack = false

        /* Create slash hitbox in front of player */
        const dir = this.player.flipX ? -1 : 1
        const slash = this.slashGroup.create(
          this.player.x + dir * 35,
          this.player.y,
          'slash'
        )
        slash.setDepth(11)
        slash.damage = this.playerAttack
        slash.setScale(0.8)
        slash.setAlpha(0.8)

        this.tweens.add({
          targets: slash,
          scale: 1.4,
          alpha: 0,
          angle: dir * 90,
          duration: 200,
          onComplete: () => { slash.destroy() }
        })

        this.cameras.main.shake(50, 0.002)

        this.time.delayedCall(300, () => { this.isAttacking = false })
      }
    }

    handleDash(time) {
      if (this.isDashing || this.dashCooldown > 0) return
      if (Phaser.Input.Keyboard.JustDown(this.dashKey) || this.mobileInput.dash) {
        this.isDashing = true
        this.invincible = true
        this.mobileInput.dash = false
        this.player.setAlpha(0.5)

        /* Dash trail effect */
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 30, () => {
            if (!this.player?.active) return
            const trail = this.add.sprite(this.player.x, this.player.y, 'player')
            trail.setAlpha(0.3).setDepth(9).setScale(1.2)
            this.tweens.add({ targets: trail, alpha: 0, scale: 0.5, duration: 300, onComplete: () => trail.destroy() })
          })
        }

        this.time.delayedCall(200, () => {
          this.isDashing = false
          this.invincible = false
          this.player.setAlpha(1)
          this.dashCooldown = 1000
        })
      }
    }

    handleAbility(time) {
      if (this.abilityCooldown > 0) return
      if (Phaser.Input.Keyboard.JustDown(this.abilityKey) || this.mobileInput.ability) {
        this.mobileInput.ability = false
        this.abilityCooldown = 5000

        /* Companion ability based on species */
        const species = companionData?.species || 'Moonpaw'
        switch (species) {
          case 'Moonpaw':
            this.abilityLunarDash()
            break
          case 'Mosslet':
            this.abilityVineBridge()
            break
          case 'Cloudfin':
            this.abilityWindGlide()
            break
          case 'Stardew':
            this.abilityAstralVision()
            break
          default:
            this.abilityLunarDash()
        }

        callbacksRef.current.onHudUpdate({ abilityCooldown: 5000 })
      }
    }

    abilityLunarDash() {
      /* Quick teleport dash through obstacles */
      const dir = this.player.flipX ? -1 : 1
      const targetX = this.player.x + dir * 150
      this.player.setPosition(
        Phaser.Math.Clamp(targetX, 30, 2370),
        this.player.y
      )
      this.cameras.main.flash(150, 140, 130, 215)

      /* Damage enemies along path */
      this.enemyGroup.getChildren().forEach((e) => {
        if (!e.active) return
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y)
        if (dist < 80) this.damageEnemy(e, this.playerAttack * 1.5)
      })
    }

    abilityVineBridge() {
      /* Area damage + slow around player */
      const burst = this.add.particles(this.player.x, this.player.y, 'particle', {
        speed: { min: 30, max: 100 }, scale: { start: 0.8, end: 0 }, lifespan: 600,
        quantity: 20, tint: 0x69cba7, emitting: false,
      })
      burst.explode()
      this.enemyGroup.getChildren().forEach((e) => {
        if (!e.active) return
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y)
        if (dist < 120) {
          this.damageEnemy(e, this.playerAttack * 0.8)
          e.body?.setVelocity(0, 0)
        }
      })
    }

    abilityWindGlide() {
      /* Speed boost */
      this.playerSpeed *= 2
      this.invincible = true
      this.player.setTint(0xffb58c)
      this.time.delayedCall(2000, () => {
        this.playerSpeed = gameState?.knightStats?.speed || 160
        this.invincible = false
        this.player.clearTint()
      })
    }

    abilityAstralVision() {
      /* Reveal nearby loot and spawn bonus stardust */
      this.cameras.main.flash(200, 200, 180, 255)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const lx = this.player.x + Math.cos(angle) * 100
        const ly = this.player.y + Math.sin(angle) * 100
        const loot = this.lootGroup.create(lx, ly, 'loot-stardust')
        loot.setDepth(4)
        loot.lootData = { type: 'stardust', amount: 3 + Math.floor(Math.random() * 5) }
        this.tweens.add({ targets: loot, y: ly - 6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
    }

    updateCompanion(delta) {
      if (!this.companion?.active || !this.player?.active) return
      const targetX = this.player.x - (this.player.flipX ? -40 : 40)
      const targetY = this.player.y + 25
      const dist = Phaser.Math.Distance.Between(this.companion.x, this.companion.y, targetX, targetY)

      if (dist > 10) {
        const angle = Phaser.Math.Angle.Between(this.companion.x, this.companion.y, targetX, targetY)
        const speed = Math.min(dist * 3, this.playerSpeed * 0.8)
        this.companion.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
      } else {
        this.companion.setVelocity(0, 0)
      }

      /* Companion faces same direction */
      this.companion.setFlipX(this.player.flipX)
    }

    updateEnemies(time, delta) {
      this.enemyGroup.getChildren().forEach((enemy) => {
        if (!enemy.active) return
        const data = enemy.enemyData
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)

        /* Update HP bars */
        this.drawEnemyHP(enemy)

        /* AI behavior */
        if (dist > data.detectionRadius * 2) {
          /* Return to spawn */
          const spawnDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.spawnX, enemy.spawnY)
          if (spawnDist > 10) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.spawnX, enemy.spawnY)
            enemy.setVelocity(Math.cos(angle) * data.speed * 0.5, Math.sin(angle) * data.speed * 0.5)
          } else {
            enemy.setVelocity(0, 0)
          }
          return
        }

        if (dist > data.detectionRadius) {
          enemy.setVelocity(0, 0)
          return
        }

        switch (data.behavior) {
          case 'chase':
            this.enemyChase(enemy, data, dist, time)
            break
          case 'stationary':
            this.enemyStationary(enemy, data, dist, time)
            break
          case 'ranged':
            this.enemyRanged(enemy, data, dist, time)
            break
          case 'guard':
            this.enemyGuard(enemy, data, dist, time)
            break
        }
      })
    }

    enemyChase(enemy, data, dist, time) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
      enemy.setVelocity(Math.cos(angle) * data.speed, Math.sin(angle) * data.speed)

      if (dist < 30 && time - enemy.lastAttack > data.attackCooldown) {
        this.playerTakeDamage(data.attack)
        enemy.lastAttack = time
      }
    }

    enemyStationary(enemy, data, dist, time) {
      enemy.setVelocity(0, 0)
      if (dist < 60 && time - enemy.lastAttack > data.attackCooldown) {
        this.playerTakeDamage(data.attack)
        enemy.lastAttack = time
        /* Visual pulse */
        this.tweens.add({ targets: enemy, scale: 1.3, duration: 100, yoyo: true })
      }
    }

    enemyRanged(enemy, data, dist, time) {
      /* Keep distance */
      if (dist < 80) {
        const away = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y)
        enemy.setVelocity(Math.cos(away) * data.speed, Math.sin(away) * data.speed)
      } else if (dist > 160) {
        const toward = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
        enemy.setVelocity(Math.cos(toward) * data.speed * 0.5, Math.sin(toward) * data.speed * 0.5)
      } else {
        enemy.setVelocity(0, 0)
      }

      if (time - enemy.lastAttack > data.attackCooldown) {
        this.fireProjectile(enemy, data)
        enemy.lastAttack = time
      }
    }

    enemyGuard(enemy, data, dist, time) {
      if (dist < 100) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
        enemy.setVelocity(Math.cos(angle) * data.speed * 0.3, Math.sin(angle) * data.speed * 0.3)
      } else {
        enemy.setVelocity(0, 0)
      }

      if (dist < 40 && time - enemy.lastAttack > data.attackCooldown) {
        this.playerTakeDamage(data.attack)
        enemy.lastAttack = time
        this.cameras.main.shake(80, 0.003)
      }
    }

    fireProjectile(enemy, data) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
      const proj = this.enemyProjectiles.create(enemy.x, enemy.y, 'projectile')
      proj.setDepth(8)
      proj.damage = data.attack
      proj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200)
      this.time.delayedCall(3000, () => { if (proj.active) proj.destroy() })
    }

    drawEnemyHP(enemy) {
      const barWidth = 30
      const barHeight = 3
      const x = enemy.x - barWidth / 2
      const y = enemy.y - 25

      enemy.hpBarBg.clear()
      enemy.hpBar.clear()

      if (enemy.currentHP < enemy.maxHP) {
        enemy.hpBarBg.fillStyle(0x1a1628)
        enemy.hpBarBg.fillRect(x, y, barWidth, barHeight)
        enemy.hpBar.fillStyle(0xe04848)
        enemy.hpBar.fillRect(x, y, barWidth * (enemy.currentHP / enemy.maxHP), barHeight)
      }
    }

    hitEnemy(slash, enemy) {
      if (!enemy.active) return
      this.damageEnemy(enemy, slash.damage || this.playerAttack)
    }

    damageEnemy(enemy, damage) {
      const actualDmg = Math.max(1, damage - (enemy.enemyData.defense || 0))
      enemy.currentHP -= actualDmg
      this.tweens.add({ targets: enemy, tint: 0xffffff, duration: 80, yoyo: true, onYoyoComplete: () => enemy.clearTint() })

      if (enemy.currentHP <= 0) {
        this.killEnemy(enemy)
      }
    }

    killEnemy(enemy) {
      /* Particles */
      if (this.add.particles) {
        const burst = this.add.particles(enemy.x, enemy.y, 'particle', {
          speed: { min: 40, max: 130 }, scale: { start: 0.6, end: 0 }, lifespan: 500,
          quantity: 15, tint: enemy.enemyData.color, emitting: false,
        })
        burst.explode()
      }

      /* Drop loot */
      const data = enemy.enemyData
      data.loot?.forEach((drop) => {
        if (Math.random() < drop.chance) {
          const qty = drop.qty[0] + Math.floor(Math.random() * (drop.qty[1] - drop.qty[0] + 1))
          const loot = this.lootGroup.create(
            enemy.x + (Math.random() - 0.5) * 30,
            enemy.y + (Math.random() - 0.5) * 30,
            drop.item === 'stardust' ? 'loot-stardust' : drop.item.includes('astral') || drop.item.includes('catalyst') ? 'loot-rare' : 'loot-crystal'
          )
          loot.setDepth(4)
          loot.lootData = { type: drop.item, amount: qty }
          this.tweens.add({ targets: loot, y: loot.y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }
      })

      /* XP */
      this.xpCollected += data.xp
      this.enemiesDefeated++

      /* Clean up HP bars */
      enemy.hpBarBg?.destroy()
      enemy.hpBar?.destroy()
      enemy.destroy()

      /* Notify React */
      callbacksRef.current.onLoot({
        xp: data.xp,
        companionXp: Math.floor(data.xp * 0.5),
        combatWins: 1,
        bondGain: 1,
        popupText: `${data.name} defeated! +${data.xp} XP`,
        rarity: 'UNCOMMON',
        questUpdates: data.id === 'voidling' ? { voidlingsDefeated: this.enemiesDefeated } : {},
      })

      callbacksRef.current.onHudUpdate({
        xp: this.xpCollected,
        enemiesDefeated: this.enemiesDefeated,
      })
    }

    collectLoot(player, loot) {
      if (!loot.lootData) return
      const data = loot.lootData

      if (data.type === 'stardust') {
        this.stardustCollected += data.amount
        callbacksRef.current.onLoot({
          stardust: data.amount,
          popupText: `+${data.amount} ✦ Stardust`,
          rarity: 'COMMON',
        })
      } else {
        callbacksRef.current.onLoot({
          items: [{ id: data.type, qty: data.amount }],
          popupText: `+${data.amount} ${data.type.replace(/-/g, ' ')}`,
          rarity: data.type.includes('catalyst') ? 'EPIC' : data.type.includes('astral') || data.type.includes('void') ? 'RARE' : 'UNCOMMON',
        })
      }

      callbacksRef.current.onHudUpdate({ stardust: this.stardustCollected })
      loot.destroy()
    }

    playerHit(player, projectile) {
      if (this.invincible) { projectile.destroy(); return }
      this.playerTakeDamage(projectile.damage || 5)
      projectile.destroy()
    }

    playerTakeDamage(amount) {
      if (this.invincible) return
      const actualDmg = Math.max(1, amount - this.playerDefense)
      this.playerHP = Math.max(0, this.playerHP - actualDmg)
      this.invincible = true
      this.player.setTint(0xff4444)
      this.cameras.main.shake(100, 0.004)

      this.time.delayedCall(500, () => {
        this.invincible = false
        this.player.clearTint()
      })

      callbacksRef.current.onHudUpdate({ hp: this.playerHP, maxHp: this.maxHP })

      if (this.playerHP <= 0) {
        this.playerDeath()
      }
    }

    playerDeath() {
      /* Reset HP and return to spawn */
      this.playerHP = this.maxHP * 0.5
      this.player.setPosition(200, 900)
      this.cameras.main.fade(500, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.cameras.main.fadeIn(500)
          callbacksRef.current.onHudUpdate({ hp: this.playerHP, maxHp: this.maxHP })
        }
      })
    }

    enterBoss(player, portal) {
      if (this._enteringBoss) return
      this._enteringBoss = true
      this.cameras.main.fade(800, 20, 10, 45)
      this.time.delayedCall(900, () => {
        this.scene.start('BossScene')
      })
    }

    updateCooldowns(delta) {
      if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - delta)
      if (this.abilityCooldown > 0) {
        this.abilityCooldown = Math.max(0, this.abilityCooldown - delta)
        callbacksRef.current.onHudUpdate({ abilityCooldown: this.abilityCooldown })
      }
    }

    updateHUD() {
      callbacksRef.current.onHudUpdate({
        hp: this.playerHP,
        maxHp: this.maxHP,
        stardust: this.stardustCollected,
        xp: this.xpCollected,
        companionEnergy: companionData?.energy || 100,
        area: 'Moon Meadow',
        objective: 'Explore and find the boss portal',
        enemiesDefeated: this.enemiesDefeated,
        playerLevel: gameState?.playerLevel || 1,
      })
    }
  }
}
