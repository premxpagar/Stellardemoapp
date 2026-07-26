import Phaser from 'phaser'

/**
 * BootScene — creates all procedural textures and transitions to MoonMeadow.
 * All assets are generated programmatically (no external sprite files needed).
 */
export function createBootScene(callbacksRef) {
  return class BootScene extends Phaser.Scene {
    constructor() { super('Boot') }

    create() {
      this.createTextures()
      this.scene.start('MoonMeadow')
    }

    createTextures() {
      this.makeCircleTexture('player', 16, 0x8f82d7, 0xd9f36d)
      this.makeCircleTexture('companion', 12, 0x9a8cff, 0xffffff)
      this.makeCircleTexture('enemy-voidling', 14, 0x4a3666, 0x8a6aaa)
      this.makeCircleTexture('enemy-shadowbloom', 18, 0x2d4a3a, 0x5aaa7a)
      this.makeCircleTexture('enemy-meteorwisp', 12, 0xd98a4a, 0xffe0a0)
      this.makeCircleTexture('enemy-corrupted', 16, 0x6a4a8a, 0xc090e0)
      this.makeCircleTexture('enemy-sentinel', 22, 0x3a5a8a, 0x7abaff)
      this.makeCircleTexture('boss', 40, 0x1a0a2e, 0xe04848)
      this.makeCircleTexture('slash', 20, 0xd9f36d, 0xffffff)
      this.makeCircleTexture('projectile', 6, 0xe04848, 0xff6060)
      this.makeCircleTexture('ability-orb', 10, 0x8f82d7, 0xd8caff)
      this.makeCircleTexture('loot-stardust', 6, 0xd9f36d, 0xfff9a0)
      this.makeCircleTexture('loot-crystal', 8, 0x7abaff, 0xc0e0ff)
      this.makeCircleTexture('loot-rare', 8, 0xa364d4, 0xd4a8f0)
      this.makeCircleTexture('particle', 4, 0xffffff, 0xd8caff)
      this.makeTreeTexture()
      this.makeRockTexture()
      this.makeFlowerTexture()
      this.makePortalTexture()
    }

    makeCircleTexture(key, radius, colorInner, colorOuter) {
      const s = (radius + 4) * 2
      const g = this.make.graphics({ add: false })
      g.fillStyle(colorOuter, 0.3)
      g.fillCircle(radius + 4, radius + 4, radius + 3)
      g.fillStyle(colorInner)
      g.fillCircle(radius + 4, radius + 4, radius)
      g.fillStyle(colorOuter, 0.6)
      g.fillCircle(radius + 1, radius + 1, radius * 0.4)
      g.generateTexture(key, s, s)
      g.destroy()
    }

    makeTreeTexture() {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x3a2a1a)
      g.fillRect(12, 24, 8, 16)
      g.fillStyle(0x2d6a4a)
      g.fillCircle(16, 18, 14)
      g.fillStyle(0x3d8a5a, 0.6)
      g.fillCircle(14, 14, 8)
      g.generateTexture('tree', 32, 42)
      g.destroy()
    }

    makeRockTexture() {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x5a5570)
      g.fillRoundedRect(2, 6, 24, 18, 6)
      g.fillStyle(0x7a7590, 0.5)
      g.fillRoundedRect(4, 8, 10, 8, 3)
      g.generateTexture('rock', 28, 26)
      g.destroy()
    }

    makeFlowerTexture() {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0xf3a8df)
      g.fillCircle(8, 6, 5)
      g.fillCircle(14, 6, 5)
      g.fillCircle(11, 3, 5)
      g.fillStyle(0xffe781)
      g.fillCircle(11, 6, 3)
      g.generateTexture('flower', 20, 14)
      g.destroy()
    }

    makePortalTexture() {
      const g = this.make.graphics({ add: false })
      g.lineStyle(3, 0xd9f36d, 0.8)
      g.strokeCircle(20, 20, 16)
      g.lineStyle(2, 0x8f82d7, 0.5)
      g.strokeCircle(20, 20, 12)
      g.fillStyle(0x8f82d7, 0.3)
      g.fillCircle(20, 20, 10)
      g.generateTexture('portal', 40, 40)
      g.destroy()
    }
  }
}
