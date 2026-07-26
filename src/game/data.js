export const companions = [
  { id: 'momo', name: 'Momo', species: 'Moonpaw', rarity: 'Lunar', level: 1, xp: 0, color: '#9a8cff', face: '◕ᴗ◕', mood: 'Curious', trait: 'Moonlit finder', energy: 100, thoughts: ['Something is glowing nearby...', 'The stars feel different tonight.', 'I want to chase the moonbeam!'] },
  { id: 'pip', name: 'Pip', species: 'Mosslet', rarity: 'Verdant', level: 1, xp: 0, color: '#69cba7', face: '•ᴗ•', mood: 'Cozy', trait: 'Dew keeper', energy: 100, thoughts: ['This moss is extra soft.', 'Let us find something tiny!', 'I saved a little sparkle for later.'] },
  { id: 'nori', name: 'Nori', species: 'Cloudfin', rarity: 'Solar', level: 1, xp: 0, color: '#ffb58c', face: 'ᵔᴥᵔ', mood: 'Dreaming', trait: 'Sunset singer', energy: 100, thoughts: ['The clouds look like snacks.', 'A quiet adventure sounds lovely.', 'I can hear a star humming.'] },
]

export const fusionReward = { id: 'aster', name: 'Aster', species: 'Stardew', rarity: 'Astral', level: 1, xp: 0, color: '#f3a8df', face: '✦ᴗ✦', mood: 'Radiant', trait: 'Comet bloom', energy: 100, thoughts: ['I arrived on a soft comet!', 'Let us make the grove brighter.', 'I was born from a wish.'] }

export const cosmetics = [
  { id: 'moon-cap', icon: '🌙', name: 'Moon Cap', price: 0, description: 'A crescent cap for nightly strolls.' },
  { id: 'leaf-crown', icon: '🌿', name: 'Leaf Crown', price: 45, description: 'Freshly woven from grove leaves.' },
  { id: 'star-halo', icon: '💫', name: 'Star Halo', price: 110, description: 'A ring of tiny drifting lights.' },
  { id: 'explorer-scarf', icon: '🧣', name: 'Explorer Scarf', price: 80, description: 'Perfect for meadow expeditions.' },
  { id: 'cosmic-glasses', icon: '🕶️', name: 'Cosmic Glasses', price: 160, description: 'For spotting distant constellations.' },
  { id: 'knight-crown', icon: '👑', name: 'Knight Crown', price: 0, description: 'Awarded for defeating the Eclipse Guardian.', requirement: 'eclipse-breaker' },
]

export const achievementList = [
  { id: 'first-steps', title: 'First Steps', description: 'Complete an exploration.', check: (s) => s.stats.explorations >= 1 },
  { id: 'star-catcher', title: 'Star Catcher', description: 'Collect 50 Stardust.', check: (s) => s.stats.stardustEarned >= 50 },
  { id: 'cosmic-collector', title: 'Cosmic Collector', description: 'Collect 500 Stardust.', check: (s) => s.stats.stardustEarned >= 500 },
  { id: 'best-friends', title: 'Best Friends', description: 'Reach companion level 5.', check: (s) => s.companions.some((c) => c.level >= 5) },
  { id: 'starweaver', title: 'Starweaver', description: 'Perform a Starweave fusion.', check: (s) => s.stats.fusions >= 1 },
  { id: 'fashionable', title: 'Fashionable', description: 'Equip a cosmetic.', check: (s) => Object.keys(s.equipped).length > 0 },
  { id: 'golden-touch', title: 'Golden Touch', description: 'Catch a golden star.', check: (s) => s.stats.goldStars >= 1 },
  /* New achievements for Knight Mode */
  { id: 'first-knight', title: 'First Steps', description: 'Defeat your first enemy in Knight Mode.', check: (s) => (s.stats.enemiesDefeated || 0) >= 1 },
  { id: 'knight-of-grove', title: 'Knight of the Grove', description: 'Defeat 25 enemies.', check: (s) => (s.stats.enemiesDefeated || 0) >= 25 },
  { id: 'eclipse-breaker', title: 'Eclipse Breaker', description: 'Defeat the Eclipse Guardian.', check: (s) => (s.stats.bossesDefeated || 0) >= 1 },
  { id: 'star-hunter-100', title: 'Star Hunter', description: 'Collect 100 Stardust total.', check: (s) => s.stats.stardustEarned >= 100 },
  { id: 'mutation', title: 'Mutation!', description: 'Discover a mutation through fusion.', check: (s) => s.companions.some((c) => c.dna?.mutation) },
  { id: 'genesis', title: 'Genesis', description: 'Create an Astral-rarity companion.', check: (s) => s.companions.some((c) => c.rarity === 'ASTRAL' || c.rarity === 'Astral') },
  { id: 'celestial-bond', title: 'Celestial Bond', description: 'Reach maximum Bond (100) with a companion.', check: (s) => s.companions.some((c) => (c.bond || 0) >= 100) },
]

export const xpForLevel = (level) => 55 + level * 25
