-- Кто есть в auth.users (с какими емэйлами)
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Какие профили существуют
SELECT id, username, is_admin FROM profiles ORDER BY created_at DESC LIMIT 20;
