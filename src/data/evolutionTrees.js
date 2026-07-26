export const evolutionTrees = {
  Moonpaw: {
    base: 'Moonpaw',
    branches: [
      {
        name: 'Lunara',
        path: 'explorer',
        description: 'A graceful lunar wanderer who reveals hidden paths.',
        requirements: { explorationCount: 15, rareStarsFound: 3 },
        statBonus: { energy: 20, luck: 15 },
        face: '◕ω◕',
        color: '#7a6fff',
        abilityUpgrade: 'Lunar Dash becomes Lunar Warp — teleports short distances.',
      },
      {
        name: 'Noctis',
        path: 'combat',
        description: 'A fierce nocturnal warrior cloaked in shadow.',
        requirements: { combatWins: 20, bossWins: 1 },
        statBonus: { attack: 15, defense: 10 },
        face: '◕‿◕',
        color: '#5a3d8a',
        abilityUpgrade: 'Lunar Dash becomes Shadow Strike — damages enemies on contact.',
      },
      {
        name: 'Celestis',
        path: 'support',
        description: 'A radiant healer who channels starlight to restore vitality.',
        requirements: { supportAbilitiesUsed: 25, bond: 60 },
        statBonus: { bond: 20, energy: 15 },
        face: '✦ᴗ✦',
        color: '#9aadff',
        abilityUpgrade: 'Lunar Dash becomes Starlight Heal — restores HP to player.',
      },
    ],
  },
  Mosslet: {
    base: 'Mosslet',
    branches: [
      {
        name: 'Thornveil',
        path: 'explorer',
        description: 'A cunning forest guardian who shapes the terrain.',
        requirements: { explorationCount: 15, rareStarsFound: 3 },
        statBonus: { defense: 15, energy: 15 },
        face: '•ᴗ•',
        color: '#3da87a',
        abilityUpgrade: 'Vine Bridge becomes Living Wall — blocks enemy projectiles.',
      },
      {
        name: 'Barkfang',
        path: 'combat',
        description: 'A fierce woodland predator wrapped in bark armor.',
        requirements: { combatWins: 20, bossWins: 1 },
        statBonus: { attack: 12, defense: 15 },
        face: '•‿•',
        color: '#2d6a4a',
        abilityUpgrade: 'Vine Bridge becomes Thorn Burst — area damage around player.',
      },
      {
        name: 'Bloomsage',
        path: 'support',
        description: 'A gentle sage who nurtures companions and grows rare flora.',
        requirements: { supportAbilitiesUsed: 25, bond: 60 },
        statBonus: { luck: 20, bond: 15 },
        face: '❀ᴗ❀',
        color: '#7acba0',
        abilityUpgrade: 'Vine Bridge becomes Bloom Field — increases loot drops temporarily.',
      },
    ],
  },
  Cloudfin: {
    base: 'Cloudfin',
    branches: [
      {
        name: 'Zephyrix',
        path: 'explorer',
        description: 'A swift aerial scout riding the cosmic wind.',
        requirements: { explorationCount: 15, rareStarsFound: 3 },
        statBonus: { speed: 20, energy: 10 },
        face: 'ᵔᴥᵔ',
        color: '#ffa870',
        abilityUpgrade: 'Wind Glide becomes Storm Ride — fly across the entire map briefly.',
      },
      {
        name: 'Tempest',
        path: 'combat',
        description: 'A fierce storm spirit that commands lightning.',
        requirements: { combatWins: 20, bossWins: 1 },
        statBonus: { attack: 18, speed: 10 },
        face: '⚡ᴥ⚡',
        color: '#d98a3a',
        abilityUpgrade: 'Wind Glide becomes Thunder Clap — stuns nearby enemies.',
      },
      {
        name: 'Mistweaver',
        path: 'support',
        description: 'A calming presence who weaves protective mist around allies.',
        requirements: { supportAbilitiesUsed: 25, bond: 60 },
        statBonus: { defense: 15, bond: 15 },
        face: '☁ᴥ☁',
        color: '#ffc8a0',
        abilityUpgrade: 'Wind Glide becomes Mist Shield — reduces incoming damage.',
      },
    ],
  },
  Stardew: {
    base: 'Stardew',
    branches: [
      {
        name: 'Novaflare',
        path: 'explorer',
        description: 'A blazing astral seeker who illuminates the unknown.',
        requirements: { explorationCount: 20, rareStarsFound: 5 },
        statBonus: { luck: 20, energy: 15 },
        face: '✦◡✦',
        color: '#f3c0df',
        abilityUpgrade: 'Astral Vision becomes Nova Sight — reveals entire map for a time.',
      },
      {
        name: 'Eclipsar',
        path: 'combat',
        description: 'A dark star warrior who harnesses both light and shadow.',
        requirements: { combatWins: 25, bossWins: 2 },
        statBonus: { attack: 20, defense: 10 },
        face: '◉◡◉',
        color: '#8a4aaa',
        abilityUpgrade: 'Astral Vision becomes Eclipse Beam — powerful ranged attack.',
      },
      {
        name: 'Starmother',
        path: 'support',
        description: 'A nurturing cosmic entity that births new stars.',
        requirements: { supportAbilitiesUsed: 30, fusionCount: 3, bond: 70 },
        statBonus: { bond: 25, luck: 20 },
        face: '✦ᴗ✦',
        color: '#f3d8ef',
        abilityUpgrade: 'Astral Vision becomes Star Blessing — boosts fusion outcomes.',
      },
    ],
  },
}

export const getEvolutionTree = (species) => evolutionTrees[species]

export const checkEvolutionReady = (companion) => {
  const tree = evolutionTrees[companion.species]
  if (!tree) return null
  const log = companion.behaviorLog || {}
  for (const branch of tree.branches) {
    const reqs = branch.requirements
    let met = true
    for (const [key, val] of Object.entries(reqs)) {
      if (key === 'bond') {
        if ((companion.bond || 0) < val) met = false
      } else if ((log[key] || 0) < val) {
        met = false
      }
    }
    if (met) return branch
  }
  return null
}
