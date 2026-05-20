-- Chess Legends Database Schema
-- Run this in Supabase SQL Editor.
-- Safe to re-run — uses IF NOT EXISTS / DROP IF EXISTS everywhere.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  class       TEXT CHECK (class IN ('attacker','defender','tactician')),  -- NULL = not onboarded yet
  xp          INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  coins       INTEGER NOT NULL DEFAULT 100,
  city        TEXT DEFAULT 'Алматы',
  is_pro      BOOLEAN NOT NULL DEFAULT false, 
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won   INTEGER NOT NULL DEFAULT 0,
  rating      INTEGER NOT NULL DEFAULT 1000,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
-- Resilient: handles duplicate usernames by appending a numeric suffix,
-- and NEVER aborts the signup if profile creation fails (errors go to Postgres log
-- and a placeholder profile is created so auth.users insert is never rolled back).
-- Notes:
--   - SECURITY DEFINER + explicit search_path = trigger runs as owner with access to public schema
--   - all logic wrapped in EXCEPTION block so signup always succeeds even if profiles insert fails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  base_name  TEXT;
  final_name TEXT;
  suffix     INT := 0;
  city_val   TEXT;
BEGIN
  BEGIN
    base_name := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'username', '')), '');
    IF base_name IS NULL THEN
      base_name := split_part(COALESCE(NEW.email, ''), '@', 1);
    END IF;
    IF base_name IS NULL OR base_name = '' THEN
      base_name := 'player_' || substr(NEW.id::text, 1, 8);
    END IF;

    final_name := base_name;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_name) LOOP
      suffix := suffix + 1;
      final_name := base_name || suffix::text;
    END LOOP;

    city_val := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'city', '')), '');

    INSERT INTO public.profiles (id, username, city)
    VALUES (NEW.id, final_name, COALESCE(city_val, 'Алматы'));

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user % (email=%): % / %',
      NEW.id, NEW.email, SQLSTATE, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Make sure the trigger runs as a high-privilege owner that can bypass RLS
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── GAMES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opponent    TEXT NOT NULL DEFAULT 'AI',           -- 'AI' or username
  mode        TEXT NOT NULL DEFAULT 'vs_ai' CHECK (mode IN ('vs_ai','duel','quick')),
  result      TEXT NOT NULL CHECK (result IN ('win','loss','draw')),
  pgn         TEXT NOT NULL DEFAULT '',
  analysis    JSONB,                                -- Claude AI analysis
  game_rating INTEGER,                             -- 0–100 score
  skill_level INTEGER DEFAULT 10,                  -- Stockfish level
  coins_delta INTEGER NOT NULL DEFAULT 0,
  xp_delta    INTEGER NOT NULL DEFAULT 0,
  duration_s  INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FRIENDSHIPS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('pending','accepted')) DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ─── TOURNAMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL DEFAULT 'Weekly Tournament',
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','active','finished')),
  max_players INT  NOT NULL DEFAULT 8,
  prize_coins INT  NOT NULL DEFAULT 500,
  winner_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  final_rank    INT,
  UNIQUE (tournament_id, player_id)
);

CREATE TABLE IF NOT EXISTS tournament_matches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round         INT  NOT NULL,
  bracket_slot  INT  NOT NULL,
  player1_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  player2_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  winner_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  duel_invite_code TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','finished')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tournament_id, round, bracket_slot)
);

-- Start bracket: shuffle participants, mark active, create round 1 matches
CREATE OR REPLACE FUNCTION public.start_tournament_bracket(p_tournament_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pids UUID[];
  total INT;
  i INT;
BEGIN
  SELECT array_agg(player_id ORDER BY random())
  INTO pids
  FROM tournament_participants
  WHERE tournament_id = p_tournament_id;

  total := COALESCE(array_length(pids, 1), 0);
  IF total < 2 THEN RETURN; END IF;

  -- Update tournament status only if currently open
  UPDATE tournaments
  SET status = 'active', started_at = NOW()
  WHERE id = p_tournament_id AND status = 'open';

  -- Skip if matches already created (idempotent)
  IF EXISTS (SELECT 1 FROM tournament_matches WHERE tournament_id = p_tournament_id) THEN
    RETURN;
  END IF;

  FOR i IN 1..(total / 2) LOOP
    INSERT INTO tournament_matches (tournament_id, round, bracket_slot, player1_id, player2_id)
    VALUES (p_tournament_id, 1, i - 1, pids[2*i - 1], pids[2*i]);
  END LOOP;
END;
$$;
ALTER FUNCTION public.start_tournament_bracket(UUID) OWNER TO postgres;

-- Advance: if all matches in current round are finished, generate next round OR finalize
CREATE OR REPLACE FUNCTION public.advance_tournament(p_tournament_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_round INT;
  pending_count INT;
  match_count   INT;
  next_round    INT;
  final_winner  UUID;
  prize         INT;
  pair_record   RECORD;
  i             INT;
BEGIN
  SELECT MAX(round) INTO current_round
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id;
  IF current_round IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO pending_count
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round = current_round
    AND status <> 'finished';
  IF pending_count > 0 THEN RETURN; END IF;

  SELECT COUNT(*) INTO match_count
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id AND round = current_round;

  -- Final round: 1 match remaining → award prize
  IF match_count = 1 THEN
    SELECT winner_id INTO final_winner
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id AND round = current_round
    LIMIT 1;

    SELECT prize_coins INTO prize FROM tournaments WHERE id = p_tournament_id;

    UPDATE tournaments
    SET status = 'finished', finished_at = NOW(), winner_id = final_winner
    WHERE id = p_tournament_id AND status = 'active';

    IF final_winner IS NOT NULL THEN
      UPDATE profiles SET coins = coins + COALESCE(prize, 0) WHERE id = final_winner;
    END IF;

    -- Auto-spawn next tournament
    INSERT INTO tournaments (name) VALUES ('Weekly Tournament');
    RETURN;
  END IF;

  -- Otherwise, create next-round matches by pairing winners of consecutive bracket slots
  next_round := current_round + 1;
  i := 0;
  FOR pair_record IN
    SELECT winner_id
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id AND round = current_round
    ORDER BY bracket_slot
  LOOP
    IF i % 2 = 0 THEN
      INSERT INTO tournament_matches (tournament_id, round, bracket_slot, player1_id)
      VALUES (p_tournament_id, next_round, i / 2, pair_record.winner_id);
    ELSE
      UPDATE tournament_matches
      SET player2_id = pair_record.winner_id
      WHERE tournament_id = p_tournament_id
        AND round = next_round
        AND bracket_slot = i / 2;
    END IF;
    i := i + 1;
  END LOOP;
END;
$$;
ALTER FUNCTION public.advance_tournament(UUID) OWNER TO postgres;

-- Trigger: when participant count reaches max → auto-start bracket
CREATE OR REPLACE FUNCTION public.check_tournament_full()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INT;
  cap           INT;
BEGIN
  SELECT COUNT(*), MAX(t.max_players)
  INTO current_count, cap
  FROM tournament_participants tp
  JOIN tournaments t ON t.id = tp.tournament_id
  WHERE tp.tournament_id = NEW.tournament_id;

  IF current_count >= cap THEN
    PERFORM start_tournament_bracket(NEW.tournament_id);
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.check_tournament_full() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_participant_joined ON tournament_participants;
CREATE TRIGGER on_participant_joined
  AFTER INSERT ON tournament_participants
  FOR EACH ROW EXECUTE FUNCTION check_tournament_full();

-- Trigger: when match winner is set → mark finished + advance
CREATE OR REPLACE FUNCTION public.on_match_winner_set()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
    UPDATE tournament_matches SET status = 'finished' WHERE id = NEW.id;
    PERFORM advance_tournament(NEW.tournament_id);
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.on_match_winner_set() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_tournament_match_winner ON tournament_matches;
CREATE TRIGGER on_tournament_match_winner
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW EXECUTE FUNCTION on_match_winner_set();

-- ─── SCHOOL (Classes / Homework) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  join_code  TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS class_homework (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  puzzle_key  TEXT NOT NULL,
  theme_key   TEXT,
  rating      INT,
  fen         TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, puzzle_key)
);

CREATE TABLE IF NOT EXISTS homework_submissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id  UUID NOT NULL REFERENCES class_homework(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (homework_id, student_id)
);

-- ─── ACTIVE DUELS (Realtime Multiplayer) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_duels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  player1_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player2_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  fen         TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn         TEXT NOT NULL DEFAULT '',
  turn        TEXT NOT NULL DEFAULT 'w',
  status      TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','finished')),
  winner_id   UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE games                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_duels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_homework          ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions    ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
DROP POLICY IF EXISTS "profiles_read_all"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Games: anyone can read, player owns insert/update
DROP POLICY IF EXISTS "games_read_all"   ON games;
DROP POLICY IF EXISTS "games_insert_own" ON games;
DROP POLICY IF EXISTS "games_update_own" ON games;
CREATE POLICY "games_read_all"   ON games FOR SELECT USING (true);
CREATE POLICY "games_insert_own" ON games FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "games_update_own" ON games FOR UPDATE USING (auth.uid() = player_id);

-- Duels: anyone can read/insert, players can update
DROP POLICY IF EXISTS "duels_read_all"       ON active_duels;
DROP POLICY IF EXISTS "duels_insert_auth"    ON active_duels;
DROP POLICY IF EXISTS "duels_update_players" ON active_duels;
CREATE POLICY "duels_read_all"    ON active_duels FOR SELECT USING (true);
CREATE POLICY "duels_insert_auth" ON active_duels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "duels_update_players" ON active_duels FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Tournaments: readable by everyone, write goes through triggers/functions only
DROP POLICY IF EXISTS "tournaments_read_all"         ON tournaments;
DROP POLICY IF EXISTS "participants_read_all"        ON tournament_participants;
DROP POLICY IF EXISTS "participants_insert_self"     ON tournament_participants;
DROP POLICY IF EXISTS "participants_delete_self"     ON tournament_participants;
DROP POLICY IF EXISTS "matches_read_all"             ON tournament_matches;
DROP POLICY IF EXISTS "matches_report_winner"        ON tournament_matches;

CREATE POLICY "tournaments_read_all"     ON tournaments             FOR SELECT USING (true);
CREATE POLICY "participants_read_all"    ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "participants_insert_self" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "participants_delete_self" ON tournament_participants FOR DELETE USING (auth.uid() = player_id);
CREATE POLICY "matches_read_all"         ON tournament_matches      FOR SELECT USING (true);
CREATE POLICY "matches_report_winner"    ON tournament_matches      FOR UPDATE
  USING ((auth.uid() = player1_id OR auth.uid() = player2_id) AND winner_id IS NULL)
  WITH CHECK (winner_id IN (player1_id, player2_id));

-- School: open for read (so members can see each other), teacher creates+owns class, students join via code
DROP POLICY IF EXISTS "classes_read_all"             ON classes;
DROP POLICY IF EXISTS "classes_insert_teacher"       ON classes;
DROP POLICY IF EXISTS "classes_delete_teacher"       ON classes;
DROP POLICY IF EXISTS "members_read_all"             ON class_members;
DROP POLICY IF EXISTS "members_insert_self"          ON class_members;
DROP POLICY IF EXISTS "members_delete_self_or_teacher" ON class_members;
DROP POLICY IF EXISTS "homework_read_all"            ON class_homework;
DROP POLICY IF EXISTS "homework_insert_teacher"      ON class_homework;
DROP POLICY IF EXISTS "homework_delete_teacher"      ON class_homework;
DROP POLICY IF EXISTS "submissions_read_all"         ON homework_submissions;
DROP POLICY IF EXISTS "submissions_insert_self"      ON homework_submissions;

CREATE POLICY "classes_read_all"        ON classes        FOR SELECT USING (true);
CREATE POLICY "classes_insert_teacher"  ON classes        FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "classes_delete_teacher"  ON classes        FOR DELETE USING (auth.uid() = teacher_id);

CREATE POLICY "members_read_all"        ON class_members  FOR SELECT USING (true);
CREATE POLICY "members_insert_self"     ON class_members  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "members_delete_self_or_teacher" ON class_members FOR DELETE
  USING (auth.uid() = student_id OR auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_members.class_id));

CREATE POLICY "homework_read_all"       ON class_homework FOR SELECT USING (true);
CREATE POLICY "homework_insert_teacher" ON class_homework FOR INSERT
  WITH CHECK (auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_homework.class_id));
CREATE POLICY "homework_delete_teacher" ON class_homework FOR DELETE
  USING (auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_homework.class_id));

CREATE POLICY "submissions_read_all"    ON homework_submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert_self" ON homework_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Friendships: see if you're a party; insert as requester; only addressee can accept; either side can delete
DROP POLICY IF EXISTS "friendships_select_own"        ON friendships;
DROP POLICY IF EXISTS "friendships_insert_requester"  ON friendships;
DROP POLICY IF EXISTS "friendships_update_addressee"  ON friendships;
DROP POLICY IF EXISTS "friendships_delete_party"      ON friendships;
CREATE POLICY "friendships_select_own"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_insert_requester"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update_addressee"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);
CREATE POLICY "friendships_delete_party"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_games_player           ON games (player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rating        ON profiles (rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_city          ON profiles (city, rating DESC);
CREATE INDEX IF NOT EXISTS idx_duels_invite           ON active_duels (invite_code);
CREATE INDEX IF NOT EXISTS idx_friendships_requester  ON friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee  ON friendships (addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status     ON tournaments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tparticipants_tour     ON tournament_participants (tournament_id);
CREATE INDEX IF NOT EXISTS idx_tparticipants_player   ON tournament_participants (player_id);
CREATE INDEX IF NOT EXISTS idx_tmatches_tour          ON tournament_matches (tournament_id, round, bracket_slot);
CREATE INDEX IF NOT EXISTS idx_tmatches_player1       ON tournament_matches (player1_id);
CREATE INDEX IF NOT EXISTS idx_tmatches_player2       ON tournament_matches (player2_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher        ON classes (teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code           ON classes (join_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class    ON class_members (class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student  ON class_members (student_id);
CREATE INDEX IF NOT EXISTS idx_class_homework_class   ON class_homework (class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_homework   ON homework_submissions (homework_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student    ON homework_submissions (student_id);

-- ─── LEADERBOARD VIEW ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id, username, class, level, rating, xp,
  games_played, games_won, city, is_pro,
  CASE WHEN games_played > 0
    THEN ROUND(games_won::numeric / games_played * 100, 1)
    ELSE 0
  END AS winrate
FROM profiles
ORDER BY rating DESC;
