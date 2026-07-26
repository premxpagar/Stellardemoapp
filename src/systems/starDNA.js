/**
 * Star DNA generation system.
 * Deterministic DNA generation from a seed, with trait inheritance for fusion.
 */

const ELEMENTS = ['Lunar', 'Verdant', 'Solar', 'Astral', 'Void', 'Crystal', 'Nebula']
const NATURES = ['Curious', 'Bold', 'Gentle', 'Fierce', 'Dreaming', 'Radiant', 'Mysterious', 'Calm']
const AURAS = ['Dream', 'Storm', 'Bloom', 'Ember', 'Frost', 'Twilight', 'Dawn', 'Cosmic']
const BODY_TYPES = ['Moonpaw', 'Mosslet', 'Cloudfin', 'Stardew', 'Voidkit', 'Crystalwing', 'Nebulite']
const EYE_TYPES = ['Celestial', 'Starlit', 'Ember', 'Frost', 'Void', 'Crystal', 'Nebula', 'Dawn']
const MUTATIONS = [null, null, null, null, null, 'Aurora', 'Void', 'Crystal', 'Nebula', 'Solar Flare', 'Celestial']

/* Simple seeded PRNG */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}

function statRoll(rng, base = 50, variance = 40) {
  return Math.min(100, Math.max(1, Math.round(base + (rng() - 0.5) * variance)))
}

/**
 * Generate a complete Star DNA for a new companion.
 * @param {string} seed - A unique string seed (e.g. companion ID + timestamp)
 * @param {object} [parentA] - DNA of first parent (for fusion)
 * @param {object} [parentB] - DNA of second parent (for fusion)
 * @param {string} [catalyst] - Mutation catalyst item ID
 * @returns {object} Star DNA object
 */
export function generateDNA(seed, parentA = null, parentB = null, catalyst = null) {
  const rng = seededRandom(hashString(seed))

  let element, nature, aura, body, eyes, energy, luck, bond, mutation

  if (parentA && parentB) {
    /* Fusion: inherit from parents */
    element = rng() < 0.5 ? parentA.element : parentB.element
    nature = rng() < 0.5 ? parentA.nature : parentB.nature
    aura = rng() < 0.5 ? parentA.aura : parentB.aura
    body = rng() < 0.5 ? parentA.body : parentB.body
    eyes = rng() < 0.5 ? parentA.eyes : parentB.eyes
    energy = Math.round((parentA.energy + parentB.energy) / 2 + (rng() - 0.5) * 20)
    luck = Math.round((parentA.luck + parentB.luck) / 2 + (rng() - 0.5) * 20)
    bond = Math.round((rng() * 30) + 10)

    /* Mutation check: ~8% base, catalysts force specific mutations */
    if (catalyst) {
      const catalystMap = {
        'aurora-catalyst': 'Aurora',
        'void-catalyst': 'Void',
        'crystal-catalyst': 'Crystal',
        'nebula-catalyst': 'Nebula',
        'solar-catalyst': 'Solar Flare',
        'celestial-catalyst': 'Celestial',
      }
      mutation = catalystMap[catalyst] || null
    } else {
      const mutationRoll = rng()
      if (mutationRoll < 0.08) {
        mutation = pick(MUTATIONS.filter(Boolean), rng)
      } else {
        mutation = null
      }
    }

    /* Rare element shift on mutation */
    if (mutation && rng() < 0.3) {
      const mutationElements = { Aurora: 'Astral', Void: 'Void', Crystal: 'Crystal', Nebula: 'Nebula', 'Solar Flare': 'Solar', Celestial: 'Astral' }
      element = mutationElements[mutation] || element
    }
  } else {
    /* Fresh companion: random DNA */
    element = pick(ELEMENTS.slice(0, 4), rng) /* Only basic elements for starters */
    nature = pick(NATURES, rng)
    aura = pick(AURAS, rng)
    body = pick(BODY_TYPES.slice(0, 4), rng)
    eyes = pick(EYE_TYPES, rng)
    energy = statRoll(rng, 65, 30)
    luck = statRoll(rng, 50, 40)
    bond = 0
    mutation = null
  }

  energy = Math.min(100, Math.max(1, energy))
  luck = Math.min(100, Math.max(1, luck))

  return {
    element,
    nature,
    aura,
    body,
    eyes,
    energy,
    luck,
    bond,
    mutation,
    seed,
  }
}

/**
 * Compute a DNA hash for provenance/blockchain registration.
 */
export function dnaHash(dna) {
  const str = JSON.stringify([dna.element, dna.nature, dna.aura, dna.body, dna.eyes, dna.energy, dna.luck, dna.mutation, dna.seed])
  return hashString(str).toString(16).padStart(8, '0')
}

/**
 * Determine companion rarity from DNA.
 */
export function rarityFromDNA(dna) {
  if (dna.mutation === 'Celestial') return 'ASTRAL'
  if (dna.mutation) return 'EPIC'
  const avgStat = (dna.energy + dna.luck) / 2
  if (avgStat >= 85) return 'RARE'
  if (avgStat >= 60) return 'UNCOMMON'
  return 'COMMON'
}

export { ELEMENTS, NATURES, AURAS, BODY_TYPES, EYE_TYPES, MUTATIONS }
