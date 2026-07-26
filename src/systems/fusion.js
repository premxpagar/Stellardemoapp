/**
 * Procedural fusion system.
 * Replaces the hardcoded Aster-only fusion with genetic inheritance.
 */

import { generateDNA, rarityFromDNA, dnaHash } from './starDNA'

const SPECIES_POOL = ['Moonpaw', 'Mosslet', 'Cloudfin', 'Stardew', 'Voidkit', 'Crystalwing', 'Nebulite', 'Astralynx', 'Duskpetal', 'Starfawn']
const FACE_POOL = ['◕ᴗ◕', '•ᴗ•', 'ᵔᴥᵔ', '✦ᴗ✦', '◕‿◕', '◉ᴗ◉', '❀ᴗ❀', '☆ᴗ☆', '◇ᴗ◇', '♦ᴗ♦']
const COLOR_POOL = ['#9a8cff', '#69cba7', '#ffb58c', '#f3a8df', '#7accf7', '#c4a8f3', '#f7d76a', '#6af7c4', '#f76a9a', '#a8c4f3']
const NAME_PREFIXES = ['Lu', 'Mo', 'As', 'Ze', 'No', 'Pi', 'El', 'Ky', 'So', 'Vi', 'Au', 'Ne', 'Ce', 'Or', 'Ri', 'St', 'Da', 'Fe']
const NAME_SUFFIXES = ['ra', 'ri', 'na', 'ko', 'xi', 'la', 'te', 'va', 'mos', 'rin', 'lia', 'pha', 'zel', 'dor', 'nis', 'tis']

function seededRng(seed) {
  let s = typeof seed === 'string' ? hashStr(seed) : seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}
function hashStr(str) {
  let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }; return Math.abs(h)
}
function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)] }

/**
 * Generate a name for a new companion based on parents.
 */
function generateName(parentA, parentB, rng) {
  /* Mix parent name fragments or generate fresh */
  if (rng() < 0.3 && parentA?.name && parentB?.name) {
    const a = parentA.name.slice(0, Math.ceil(parentA.name.length / 2))
    const b = parentB.name.slice(Math.floor(parentB.name.length / 2))
    return a + b.toLowerCase()
  }
  return pick(NAME_PREFIXES, rng) + pick(NAME_SUFFIXES, rng)
}

/**
 * Perform a fusion between two companions.
 * @param {object} parentA - First companion object
 * @param {object} parentB - Second companion object
 * @param {string} [catalystId] - Optional mutation catalyst item ID
 * @returns {object} New companion object with inherited DNA
 */
export function performFusion(parentA, parentB, catalystId = null) {
  const seed = `${parentA.id}-${parentB.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const rng = seededRng(seed)

  /* Generate inherited DNA */
  const dna = generateDNA(seed, parentA.dna, parentB.dna, catalystId)

  /* Derive species from parents */
  let species
  if (dna.mutation) {
    /* Mutations can produce exotic species */
    const exoticSpecies = ['Voidkit', 'Crystalwing', 'Nebulite', 'Astralynx', 'Duskpetal', 'Starfawn']
    species = pick(exoticSpecies, rng)
  } else {
    species = rng() < 0.5 ? parentA.species : parentB.species
  }

  /* Determine color */
  let color
  if (dna.mutation) {
    const mutationColors = {
      'Aurora': '#7accf7',
      'Void': '#4a3666',
      'Crystal': '#c4e8f3',
      'Nebula': '#8a5aaa',
      'Solar Flare': '#f7a04a',
      'Celestial': '#f3d8ef',
    }
    color = mutationColors[dna.mutation] || pick(COLOR_POOL, rng)
  } else {
    /* Blend parent colors */
    color = rng() < 0.5 ? parentA.color : parentB.color
  }

  const generation = Math.max(parentA.generation || 1, parentB.generation || 1) + 1
  const rarity = rarityFromDNA(dna)
  const name = generateName(parentA, parentB, rng)
  const face = pick(FACE_POOL, rng)

  const newCompanion = {
    id: `companion-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    species,
    rarity,
    level: 1,
    xp: 0,
    color,
    face,
    mood: 'Newborn',
    trait: `Born from ${parentA.name} × ${parentB.name}`,
    energy: 100,
    bond: 0,
    generation,
    dna,
    dnaHash: dnaHash(dna),
    parentA: { id: parentA.id, name: parentA.name, species: parentA.species },
    parentB: { id: parentB.id, name: parentB.name, species: parentB.species },
    thoughts: [
      'The world is so bright and new!',
      `I can feel ${parentA.name} and ${parentB.name} in my heart.`,
      'What adventures await us?',
      'The stars sang when I was born.',
    ],
    behaviorLog: {
      explorationCount: 0,
      combatWins: 0,
      supportAbilitiesUsed: 0,
      rareStarsFound: 0,
      bossWins: 0,
    },
    stellarRegistered: false,
    stellarTxHash: null,
    createdAt: Date.now(),
  }

  return {
    companion: newCompanion,
    fusionResult: {
      name,
      species,
      generation,
      rarity,
      mutation: dna.mutation,
      dna,
      dnaHash: dnaHash(dna),
      parentAName: parentA.name,
      parentBName: parentB.name,
    },
  }
}
