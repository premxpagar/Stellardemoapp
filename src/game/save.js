import { companions } from './data'

const KEY = 'stellar-grove-save-v3'
const OLD_KEY = 'stellar-grove-save-v2'

export const freshSave = () => ({
  companions: companions.map((c) => ({
    ...c,
    bond: 0,
    generation: 1,
    dna: null,
    behaviorLog: { explorationCount: 0, combatWins: 0, supportAbilitiesUsed: 0, rareStarsFound: 0, bossWins: 0 },
    stellarRegistered: false,
    stellarTxHash: null,
  })),
  username: 'Keeper',
  selectedId: 'momo',
  stardust: 120,
  playerXp: 0,
  playerLevel: 1,
  unlockedCosmetics: ['moon-cap'],
  equipped: { momo: 'moon-cap' },
  achievements: [],
  claimedDaily: '',
  stats: { explorations: 0, stardustEarned: 0, goldStars: 0, fusions: 0, enemiesDefeated: 0, bossesDefeated: 0 },
  lastEnergyAt: Date.now(),
  objectCooldowns: {},
  settings: { sound: true, music: true, reducedMotion: false, particles: true },
  dailySeed: '',
  /* New fields for Knights of the Astral Rift */
  inventory: {},
  questProgress: {},
  unlockedAreas: ['moon-meadow'],
  knightStats: {
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 5,
    speed: 160,
  },
  cosmicEvent: null,
  lastCloudSave: null,
})

/**
 * Migrate old save format to new format.
 */
function migrateSave(raw) {
  const data = JSON.parse(raw)
  const fresh = freshSave()

  /* Merge known fields, preserving player progress */
  const merged = { ...fresh, ...data }

  /* Ensure new fields exist */
  merged.username = merged.username || 'Keeper'
  merged.inventory = merged.inventory || {}
  merged.questProgress = merged.questProgress || {}
  merged.unlockedAreas = merged.unlockedAreas || ['moon-meadow']
  merged.knightStats = merged.knightStats || fresh.knightStats
  merged.stats = { ...fresh.stats, ...merged.stats }
  merged.settings = { ...fresh.settings, ...merged.settings }

  /* Ensure companions have new fields */
  merged.companions = merged.companions.map((c) => ({
    bond: 0,
    generation: 1,
    dna: null,
    behaviorLog: { explorationCount: 0, combatWins: 0, supportAbilitiesUsed: 0, rareStarsFound: 0, bossWins: 0 },
    stellarRegistered: false,
    stellarTxHash: null,
    ...c,
  }))

  return merged
}

export function loadSave() {
  try {
    /* Try new key first */
    let raw = localStorage.getItem(KEY)
    if (raw) return migrateSave(raw)

    /* Try old key and migrate */
    raw = localStorage.getItem(OLD_KEY)
    if (raw) {
      const migrated = migrateSave(raw)
      saveGame(migrated)
      return migrated
    }

    return freshSave()
  } catch {
    return freshSave()
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch { /* storage can be unavailable */ }
}

export function clearSave() {
  localStorage.removeItem(KEY)
  localStorage.removeItem(OLD_KEY)
}

export function applyEnergyRegen(state) {
  const elapsed = Math.floor((Date.now() - state.lastEnergyAt) / 60000)
  if (!elapsed) return state
  return {
    ...state,
    companions: state.companions.map((c) => ({ ...c, energy: Math.min(100, c.energy + elapsed * 3) })),
    lastEnergyAt: Date.now(),
  }
}
