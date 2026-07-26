export const enemies = {
  voidling: {
    id: 'voidling', name: 'Voidling', type: 'chaser',
    hp: 30, attack: 8, defense: 2, speed: 80, detectionRadius: 150, attackCooldown: 1200,
    color: 0x4a3666, size: 14, face: '◉_◉',
    behavior: 'chase', description: 'A restless wisp of corrupted darkness.',
    loot: [
      { item: 'stardust', qty: [3, 8], chance: 1 },
      { item: 'moon-crystal', qty: [1, 1], chance: 0.2 },
    ],
    xp: 12,
  },
  shadowBloom: {
    id: 'shadowBloom', name: 'Shadow Bloom', type: 'stationary',
    hp: 20, attack: 12, defense: 5, speed: 0, detectionRadius: 80, attackCooldown: 2000,
    color: 0x2d4a3a, size: 18, face: '❀',
    behavior: 'stationary', description: 'A toxic flower rooted in shadow.',
    loot: [
      { item: 'stardust', qty: [2, 5], chance: 1 },
      { item: 'nebula-essence', qty: [1, 1], chance: 0.1 },
    ],
    xp: 8,
  },
  meteorWisp: {
    id: 'meteorWisp', name: 'Meteor Wisp', type: 'ranged',
    hp: 22, attack: 10, defense: 1, speed: 50, detectionRadius: 200, attackCooldown: 1800,
    color: 0xd98a4a, size: 12, face: '◆',
    behavior: 'ranged', description: 'A fiery spirit that hurls molten sparks.',
    loot: [
      { item: 'stardust', qty: [4, 10], chance: 1 },
      { item: 'solar-fragment', qty: [1, 1], chance: 0.2 },
      { item: 'meteor-ore', qty: [1, 1], chance: 0.15 },
    ],
    xp: 15,
  },
  corruptedMoonpaw: {
    id: 'corruptedMoonpaw', name: 'Corrupted Moonpaw', type: 'chaser',
    hp: 45, attack: 14, defense: 4, speed: 95, detectionRadius: 170, attackCooldown: 1000,
    color: 0x6a4a8a, size: 16, face: '◕‿◕',
    behavior: 'chase', description: 'A twisted echo of a once-gentle companion.',
    loot: [
      { item: 'stardust', qty: [8, 15], chance: 1 },
      { item: 'moon-crystal', qty: [1, 2], chance: 0.35 },
      { item: 'aurora-catalyst', qty: [1, 1], chance: 0.03 },
    ],
    xp: 22,
  },
  astralSentinel: {
    id: 'astralSentinel', name: 'Astral Sentinel', type: 'guard',
    hp: 60, attack: 10, defense: 8, speed: 40, detectionRadius: 120, attackCooldown: 1500,
    color: 0x3a5a8a, size: 22, face: '◇',
    behavior: 'guard', description: 'An ancient guardian shielded by starlight.',
    loot: [
      { item: 'stardust', qty: [10, 20], chance: 1 },
      { item: 'astral-shard', qty: [1, 1], chance: 0.12 },
      { item: 'nebula-essence', qty: [1, 1], chance: 0.25 },
    ],
    xp: 28,
  },
}

export const eclipseGuardian = {
  id: 'eclipseGuardian', name: 'Eclipse Guardian', type: 'boss',
  hp: 300, attack: 18, defense: 6, speed: 60,
  color: 0x1a0a2e, size: 40, face: '◉',
  phases: [
    { hpThreshold: 1.0, attackSpeed: 1.0, pattern: 'basic', description: 'The Eclipse Guardian awakens.' },
    { hpThreshold: 0.6, attackSpeed: 1.4, pattern: 'fast', description: 'The shadows grow deeper!' },
    { hpThreshold: 0.3, attackSpeed: 1.8, pattern: 'corrupt', description: 'Astral corruption consumes the arena!' },
  ],
  loot: [
    { item: 'stardust', qty: [50, 100], chance: 1 },
    { item: 'void-crystal', qty: [1, 2], chance: 1 },
    { item: 'astral-shard', qty: [1, 1], chance: 0.5 },
    { item: 'void-catalyst', qty: [1, 1], chance: 0.15 },
    { item: 'celestial-catalyst', qty: [1, 1], chance: 0.05 },
  ],
  xp: 150,
}

export const areaEnemies = {
  'moon-meadow': ['voidling', 'shadowBloom'],
  'nebula-forest': ['voidling', 'shadowBloom', 'meteorWisp', 'corruptedMoonpaw'],
  'meteor-valley': ['meteorWisp', 'corruptedMoonpaw', 'astralSentinel'],
  'astral-rift': ['corruptedMoonpaw', 'astralSentinel'],
}
