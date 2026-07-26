/**
 * Supabase client initialization & database helpers.
 * Falls back gracefully when env vars are not configured.
 */
import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

export function getSupabase() {
  if (supabaseClient) return supabaseClient

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  try {
    supabaseClient = createClient(url, key)
    return supabaseClient
  } catch {
    console.info('[Supabase] Could not initialize client.')
    return null
  }
}

/**
 * Check if Supabase is available.
 */
export function isSupabaseConfigured() {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

/**
 * Sync player profile and score to Supabase `profiles` table.
 * @param {object} game - Current game state
 * @param {string} [walletAddress] - Optional connected wallet address
 */
export async function syncProfileToSupabase(game, walletAddress = '') {
  const client = getSupabase()
  if (!client) return { success: false, reason: 'Supabase unconfigured' }

  try {
    const score = (
      (game.playerLevel || 1) * 100 +
      (game.companions?.length || 0) * 50 +
      (game.stats?.stardustEarned || 0) +
      (game.stats?.enemiesDefeated || 0) * 10 +
      (game.stats?.bossesDefeated || 0) * 200 +
      (game.stats?.fusions || 0) * 75 +
      (game.achievements?.length || 0) * 30
    )

    /* If authenticated or user session exists, update profile */
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return { success: false, reason: 'Guest player (not authenticated with Supabase)' }
    }

    const { error } = await client.from('profiles').upsert({
      id: user.id,
      username: game.username || 'Keeper',
      player_level: game.playerLevel || 1,
      player_xp: game.playerXp || 0,
      stardust: game.stardust || 0,
      score,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.warn('[Supabase Sync Error]', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Fetch top leaderboard entries from Supabase `profiles` table.
 */
export async function fetchGlobalLeaderboard() {
  const client = getSupabase()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('profiles')
      .select('username, player_level, score')
      .order('score', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('[Supabase Leaderboard Fetch Error]', err.message)
    return null
  }
}
