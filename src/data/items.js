const itemDatabase = {
  /* Materials */
  'stardust': { id: 'stardust', name: 'Stardust', category: 'Materials', rarity: 'COMMON', icon: '✦', description: 'The universal currency of the cosmos.' },
  'moon-crystal': { id: 'moon-crystal', name: 'Moon Crystal', category: 'Materials', rarity: 'UNCOMMON', icon: '🌙', description: 'A shimmering crystal harvested from moonlit soil.' },
  'solar-fragment': { id: 'solar-fragment', name: 'Solar Fragment', category: 'Materials', rarity: 'UNCOMMON', icon: '☀', description: 'A warm shard radiating gentle sunlight.' },
  'void-crystal': { id: 'void-crystal', name: 'Void Crystal', category: 'Materials', rarity: 'RARE', icon: '💎', description: 'Born from the defeat of the Eclipse Guardian.' },
  'nebula-essence': { id: 'nebula-essence', name: 'Nebula Essence', category: 'Materials', rarity: 'RARE', icon: '🌌', description: 'Distilled mist from the depths of the Nebula Forest.' },
  'astral-shard': { id: 'astral-shard', name: 'Astral Shard', category: 'Materials', rarity: 'EPIC', icon: '⭐', description: 'A fragment of pure astral energy.' },
  'meteor-ore': { id: 'meteor-ore', name: 'Meteor Ore', category: 'Materials', rarity: 'UNCOMMON', icon: '☄', description: 'Heavy metal from a fallen meteor.' },

  /* Mutation Catalysts */
  'aurora-catalyst': { id: 'aurora-catalyst', name: 'Aurora Catalyst', category: 'Catalysts', rarity: 'EPIC', icon: '🌈', description: 'Forces an Aurora mutation during fusion.' },
  'void-catalyst': { id: 'void-catalyst', name: 'Void Catalyst', category: 'Catalysts', rarity: 'EPIC', icon: '🕳', description: 'Forces a Void mutation during fusion.' },
  'crystal-catalyst': { id: 'crystal-catalyst', name: 'Crystal Catalyst', category: 'Catalysts', rarity: 'EPIC', icon: '💠', description: 'Forces a Crystal mutation during fusion.' },
  'nebula-catalyst': { id: 'nebula-catalyst', name: 'Nebula Catalyst', category: 'Catalysts', rarity: 'EPIC', icon: '🌀', description: 'Forces a Nebula mutation during fusion.' },
  'solar-catalyst': { id: 'solar-catalyst', name: 'Solar Catalyst', category: 'Catalysts', rarity: 'EPIC', icon: '🔥', description: 'Forces a Solar Flare mutation during fusion.' },
  'celestial-catalyst': { id: 'celestial-catalyst', name: 'Celestial Catalyst', category: 'Catalysts', rarity: 'ASTRAL', icon: '✨', description: 'Forces a Celestial mutation during fusion.' },

  /* Quest Items */
  'grove-map': { id: 'grove-map', name: 'Grove Map', category: 'Quest', rarity: 'COMMON', icon: '🗺', description: 'A hand-drawn map of the surrounding areas.' },
  'eclipse-key': { id: 'eclipse-key', name: 'Eclipse Key', category: 'Quest', rarity: 'RARE', icon: '🔑', description: 'Opens the path to the Eclipse Guardian.' },
  'rift-compass': { id: 'rift-compass', name: 'Rift Compass', category: 'Quest', rarity: 'EPIC', icon: '🧭', description: 'Points toward the Astral Rift.' },
}

export const items = itemDatabase
export const getItem = (id) => itemDatabase[id]
export const itemsByCategory = (category) => Object.values(itemDatabase).filter((i) => i.category === category)

export const rarityColors = {
  COMMON: '#9e9bab',
  UNCOMMON: '#5fa87a',
  RARE: '#6c7fd9',
  EPIC: '#a364d4',
  ASTRAL: '#d4a832',
}

export const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'ASTRAL']
