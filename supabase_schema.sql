-- ==========================================
-- 🏆 REKREACIJSKA NOGOMETNA LIGA (MRL) - SUPABASE SHEMA
-- Zaženite ta SQL v Supabase SQL Editorju (1 klik)
-- ==========================================

-- 1. SEASONS
CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEAGUES
CREATE TABLE IF NOT EXISTS public.leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  target_teams INTEGER NOT NULL,
  season_id TEXT REFERENCES public.seasons(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo TEXT DEFAULT '⚽',
  league_id TEXT REFERENCES public.leagues(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  venue TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT true,
  founded_year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position TEXT NOT NULL,
  birth_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  registration_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  season_id TEXT REFERENCES public.seasons(id) ON DELETE CASCADE,
  league_id TEXT REFERENCES public.leagues(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  home_team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  home_score INTEGER,
  away_score INTEGER,
  home_halftime_score INTEGER,
  away_halftime_score INTEGER,
  organizer_notes TEXT,
  referee TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MATCH EVENTS
CREATE TABLE IF NOT EXISTS public.match_events (
  id TEXT PRIMARY KEY,
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id TEXT,
  minute INTEGER NOT NULL,
  type TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  date DATE NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  author TEXT DEFAULT 'Vodstvo tekmovanja',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RULES
CREATE TABLE IF NOT EXISTS public.rules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OMOGOČI RLS (Row Level Security) IN POLITIKE ZA JAVNO BRANJE IN PISANJE
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Politike za dostop
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['seasons', 'leagues', 'teams', 'players', 'matches', 'match_events', 'announcements', 'rules'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access %I" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;
