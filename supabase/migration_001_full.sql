-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 001 — полный фикс расхождений схемы
--
-- Создаёт все недостающие таблицы (tournaments, classes, friendships, …),
-- добавляет роль админа (is_admin в profiles), добавляет chess_locations
-- и location_requests (заявки на добавление мест), настраивает RLS так,
-- что только админ может создавать места / турниры, остальные подают заявки.
--
-- Безопасно перезапускать: всё через IF NOT EXISTS / DROP IF EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Шаг 1: накатить базовый schema.sql ──────────────────────────────────────
-- (этот блок дублирует содержимое supabase/schema.sql — выполни его сначала
--  скопировав весь schema.sql в Editor, ИЛИ просто запусти эту миграцию —
--  она ниже создаст всё, что нужно)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES: добавляем is_admin ────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles (is_admin) WHERE is_admin = true;

-- ── FRIENDSHIPS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('pending','accepted')) DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ── TOURNAMENTS ─────────────────────────────────────────────────────────────
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

-- ── SCHOOL (classes / homework) ─────────────────────────────────────────────
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

-- ── CHESS LOCATIONS (карта) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chess_locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('club','section','school','outdoor','tournament')),
  city        TEXT NOT NULL,
  address     TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lon         DOUBLE PRECISION NOT NULL,
  description TEXT,
  contact     TEXT,
  schedule    TEXT,
  verified    BOOLEAN NOT NULL DEFAULT false,
  added_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── LOCATION REQUESTS (заявки от пользователей) ─────────────────────────────
CREATE TABLE IF NOT EXISTS location_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('club','section','school','outdoor','tournament')),
  city         TEXT NOT NULL,
  address      TEXT NOT NULL,
  lat          DOUBLE PRECISION NOT NULL,
  lon          DOUBLE PRECISION NOT NULL,
  description  TEXT,
  contact      TEXT,
  schedule     TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_note  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ
);

-- ── ENABLE RLS ──────────────────────────────────────────────────────────────
ALTER TABLE friendships             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_homework          ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_requests       ENABLE ROW LEVEL SECURITY;

-- ── HELPER: is current user admin? ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- ── RLS POLICIES ────────────────────────────────────────────────────────────

-- Friendships
DROP POLICY IF EXISTS "friendships_select_own"        ON friendships;
DROP POLICY IF EXISTS "friendships_insert_requester"  ON friendships;
DROP POLICY IF EXISTS "friendships_update_addressee"  ON friendships;
DROP POLICY IF EXISTS "friendships_delete_party"      ON friendships;
CREATE POLICY "friendships_select_own"       ON friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_insert_requester" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update_addressee" ON friendships FOR UPDATE USING (auth.uid() = addressee_id);
CREATE POLICY "friendships_delete_party"     ON friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Tournaments: читать все, создавать ТОЛЬКО админ
DROP POLICY IF EXISTS "tournaments_read_all"     ON tournaments;
DROP POLICY IF EXISTS "tournaments_insert_admin" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_admin" ON tournaments;
DROP POLICY IF EXISTS "tournaments_delete_admin" ON tournaments;
CREATE POLICY "tournaments_read_all"     ON tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_insert_admin" ON tournaments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "tournaments_update_admin" ON tournaments FOR UPDATE USING (is_admin());
CREATE POLICY "tournaments_delete_admin" ON tournaments FOR DELETE USING (is_admin());

-- Tournament participants
DROP POLICY IF EXISTS "participants_read_all"    ON tournament_participants;
DROP POLICY IF EXISTS "participants_insert_self" ON tournament_participants;
DROP POLICY IF EXISTS "participants_delete_self" ON tournament_participants;
CREATE POLICY "participants_read_all"    ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "participants_insert_self" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "participants_delete_self" ON tournament_participants FOR DELETE USING (auth.uid() = player_id OR is_admin());

-- Tournament matches
DROP POLICY IF EXISTS "matches_read_all"      ON tournament_matches;
DROP POLICY IF EXISTS "matches_report_winner" ON tournament_matches;
CREATE POLICY "matches_read_all"      ON tournament_matches FOR SELECT USING (true);
CREATE POLICY "matches_report_winner" ON tournament_matches FOR UPDATE
  USING ((auth.uid() = player1_id OR auth.uid() = player2_id OR is_admin()) AND winner_id IS NULL)
  WITH CHECK (winner_id IN (player1_id, player2_id));

-- Classes (school): создавать может админ ИЛИ учитель (teacher_id = auth.uid())
DROP POLICY IF EXISTS "classes_read_all"            ON classes;
DROP POLICY IF EXISTS "classes_insert_teacher"      ON classes;
DROP POLICY IF EXISTS "classes_delete_teacher"      ON classes;
CREATE POLICY "classes_read_all"        ON classes FOR SELECT USING (true);
CREATE POLICY "classes_insert_teacher"  ON classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "classes_delete_teacher"  ON classes FOR DELETE USING (auth.uid() = teacher_id OR is_admin());

DROP POLICY IF EXISTS "members_read_all"               ON class_members;
DROP POLICY IF EXISTS "members_insert_self"            ON class_members;
DROP POLICY IF EXISTS "members_delete_self_or_teacher" ON class_members;
CREATE POLICY "members_read_all"               ON class_members FOR SELECT USING (true);
CREATE POLICY "members_insert_self"            ON class_members FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "members_delete_self_or_teacher" ON class_members FOR DELETE
  USING (auth.uid() = student_id OR auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_members.class_id) OR is_admin());

DROP POLICY IF EXISTS "homework_read_all"       ON class_homework;
DROP POLICY IF EXISTS "homework_insert_teacher" ON class_homework;
DROP POLICY IF EXISTS "homework_delete_teacher" ON class_homework;
CREATE POLICY "homework_read_all"       ON class_homework FOR SELECT USING (true);
CREATE POLICY "homework_insert_teacher" ON class_homework FOR INSERT
  WITH CHECK (auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_homework.class_id));
CREATE POLICY "homework_delete_teacher" ON class_homework FOR DELETE
  USING (auth.uid() = (SELECT teacher_id FROM classes WHERE id = class_homework.class_id) OR is_admin());

DROP POLICY IF EXISTS "submissions_read_all"    ON homework_submissions;
DROP POLICY IF EXISTS "submissions_insert_self" ON homework_submissions;
CREATE POLICY "submissions_read_all"    ON homework_submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert_self" ON homework_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Chess locations: ЧИТАТЬ ВСЕ, создавать/удалять/менять — ТОЛЬКО админ
DROP POLICY IF EXISTS "locations_read_all"      ON chess_locations;
DROP POLICY IF EXISTS "locations_insert_admin"  ON chess_locations;
DROP POLICY IF EXISTS "locations_update_admin"  ON chess_locations;
DROP POLICY IF EXISTS "locations_delete_admin"  ON chess_locations;
CREATE POLICY "locations_read_all"     ON chess_locations FOR SELECT USING (true);
CREATE POLICY "locations_insert_admin" ON chess_locations FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "locations_update_admin" ON chess_locations FOR UPDATE USING (is_admin());
CREATE POLICY "locations_delete_admin" ON chess_locations FOR DELETE USING (is_admin());

-- Location requests: юзер видит свои + админ видит все; юзер создаёт свои;
-- админ обновляет (approve/reject)
DROP POLICY IF EXISTS "loc_req_select_own_or_admin" ON location_requests;
DROP POLICY IF EXISTS "loc_req_insert_self"         ON location_requests;
DROP POLICY IF EXISTS "loc_req_update_admin"        ON location_requests;
DROP POLICY IF EXISTS "loc_req_delete_admin"        ON location_requests;
CREATE POLICY "loc_req_select_own_or_admin" ON location_requests FOR SELECT
  USING (auth.uid() = requested_by OR is_admin());
CREATE POLICY "loc_req_insert_self"         ON location_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "loc_req_update_admin"        ON location_requests FOR UPDATE USING (is_admin());
CREATE POLICY "loc_req_delete_admin"        ON location_requests FOR DELETE USING (is_admin());

-- ── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_friendships_requester  ON friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee  ON friendships (addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status     ON tournaments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tparticipants_tour     ON tournament_participants (tournament_id);
CREATE INDEX IF NOT EXISTS idx_tparticipants_player   ON tournament_participants (player_id);
CREATE INDEX IF NOT EXISTS idx_tmatches_tour          ON tournament_matches (tournament_id, round, bracket_slot);
CREATE INDEX IF NOT EXISTS idx_chess_locations_city   ON chess_locations (city);
CREATE INDEX IF NOT EXISTS idx_chess_locations_type   ON chess_locations (type);
CREATE INDEX IF NOT EXISTS idx_location_requests_status ON location_requests (status, created_at DESC);

-- ── LEADERBOARD VIEW ────────────────────────────────────────────────────────
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

-- ── ПОМЕТИТЬ АДМИНА ─────────────────────────────────────────────────────────
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'naziya.kalym@gmail.com');

-- Покажи кто теперь админ (sanity-check)
SELECT id, username, is_admin
FROM profiles
WHERE is_admin = true;
