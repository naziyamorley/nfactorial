-- ─────────────────────────────────────────────────────────────────────────
-- DIAGNOSE — запускай ПО ОДНОМУ запросу за раз (выделяй блок и Run).
-- Ничего не меняет, только читает.
-- Скинь результаты всех 4 блоков.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Блок 1: все таблицы в public ──────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- ── Блок 2: колонки всех public-таблиц ────────────────────────────────────
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- ── Блок 3: RLS-политики ──────────────────────────────────────────────────
SELECT
  tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ── Блок 4: включён ли RLS на каждой таблице ──────────────────────────────
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
