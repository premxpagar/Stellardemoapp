-- Stellar Grove: Knights of the Astral Rift
-- Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the backend tables.

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  player_level INTEGER DEFAULT 1,
  player_xp INTEGER DEFAULT 0,
  stardust INTEGER DEFAULT 120,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Companions
CREATE TABLE IF NOT EXISTS companions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  rarity TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 100,
  bond INTEGER DEFAULT 0,
  generation INTEGER DEFAULT 1,
  dna JSONB,
  dna_hash TEXT,
  mutation TEXT,
  equipped_cosmetic TEXT,
  parent_a JSONB,
  parent_b JSONB,
  stellar_registered BOOLEAN DEFAULT false,
  stellar_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  UNIQUE(user_id, item_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Game Progress
CREATE TABLE IF NOT EXISTS game_progress (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  unlocked_areas JSONB DEFAULT '["moon-meadow"]'::jsonb,
  quest_progress JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  equipped JSONB DEFAULT '{}'::jsonb,
  unlocked_cosmetics JSONB DEFAULT '["moon-cap"]'::jsonb,
  last_save TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/write their own data
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own companions" ON companions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own inventory" ON inventory
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own progress" ON game_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Leaderboard: Public read access for safe fields only
CREATE POLICY "Public leaderboard read" ON profiles
  FOR SELECT USING (true);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_score ON profiles(score DESC);
CREATE INDEX IF NOT EXISTS idx_companions_user ON companions(user_id);
