<<<<<<< HEAD
# Chessy

**RPG-шахматы для Казахстана.** Не ещё одна копия chess.com, а локальный шахматный продукт с классами героев, тренером на ИИ, школьным модулем, картой клубов и турнирами.

**Прод:** https://chess-legends-zeta.vercel.app

---

## Что это и для кого

Большинство шахматных платформ безличны: цифры, рейтинги, безликие аватары. Chessy берёт шахматы и пакует их в **RPG-обёртку с локальным контекстом Казахстана**.

**Аудитория:**
- Школьники и студенты, которым «классические» шахматы кажутся скучными — но RPG-классы и квесты вовлекают.
- Учителя шахмат и тренеры в РК — есть готовый «школьный кабинет» с домашкой.
- Любители, которые ищут офлайн-точки в своём городе — карта клубов и площадок.
- Игроки, которым важна локальная конкуренция — лидерборд по городам Казахстана.

---

## Ключевые фичи

### Игровое ядро
- **Полные правила шахмат** (chess.js): рокировка, взятие на проходе, мат/пат, троекратное повторение.
- **vs ai (Stockfish)** с 5 уровнями сложности от «новичок» до «гроссмейстер».
- **Локальный дуэт** на одном экране — 2 игрока без интернета.
- **Онлайн-дуэль по ссылке** — создаёшь приглашение, отправляешь другу, играете в реальном времени через Supabase Realtime.

### RPG-слой
- **Три класса героев** с пассивными бонусами:
  - *Агрессор* — +15% монет за победу
  - *Защитник* — нейтральный
  - *Тактик* — +10% опыта за все партии
- **Уровни / XP / монеты** — прокачка с каждой партией.
- **Достижения** — 8 ачивок (первая кровь, ветеран, легенда, тактик, богач, в огне, и др.).
- **Ежедневные квесты** — задания дня (играй N партий, выиграй, реши задачу) с наградой в монетах и XP.
- **Магазин фигур и досок** — внутриигровая валюта, разблокировки по уровню.

### AI Coach (Claude / Groq)
После каждой партии тренер на ИИ анализирует:
- общую оценку партии (0–100)
- критический момент (когда совершил ошибку)
- лучший ход в той позиции
- стилевую оценку игры
- персональный совет на основе твоего класса героя

Дальше можно **чатиться с тренером** — задавать вопросы по дебюту, эндшпилю, конкретным позициям.

### Социальный слой
- **Лидерборд по городам Казахстана** — топ Алматы, Астаны, Шымкента, Караганды.
- **Друзья** — поиск игроков, заявки в друзья, профили.
- **Турниры** — open-турниры с сеткой на выбывание, призовые в монетах. Любой пользователь может создать турнир.

### Школьный модуль
- Учитель создаёт класс → получает join code.
- Ученики присоединяются по коду.
- Учитель выдаёт **домашку** (выбирает из библиотеки задач).
- Видит таблицу прогресса — кто сделал, кто нет.

### Карта шахматных клубов KZ
- Интерактивная карта Казахстана (Leaflet + OSM).
- Метки клубов, секций, школ, уличных площадок, турниров.
- Пользователи могут добавлять свои локации.

### Pro-подписка (Stripe Checkout)
Платная подписка через Stripe (test mode):
- Безлимитный AI Coach (бесплатно — анализ стоит 10 монет за партию).
- Бейдж Pro в профиле.
- Эксклюзивные скины фигур.

### Прочее
- Тёмная и светлая темы.
- Полная локализация: русский и қазақша.
- Мобильная адаптация.

---

## Стек

- **Frontend:** React 19 + Vite + react-router
- **Chess engine:** chess.js (правила), Stockfish (AI)
- **БД / Auth / Realtime:** Supabase (Postgres + Row-Level Security)
- **AI Coach:** Anthropic Claude через Groq
- **Карты:** Leaflet + react-leaflet + OpenStreetMap
- **Платежи:** Stripe Checkout + Webhooks
- **Хостинг:** Vercel (статика + serverless functions)
- **Стиль:** инлайн-стили + CSS-переменные, рукописные SVG-иконки с feTurbulence-эффектом «дрожащей линии»

---

## Локальный запуск

```bash
git clone <repo>
cd chess-legends
npm install
cp .env.example .env       # вставить свои ключи
npm run dev
```

### Переменные окружения

`.env` (фронтенд):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GROQ_API_KEY=gsk_...                 # для AI Coach
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # для Pro-подписки
```

Серверные ключи (Vercel env, не в `.env` клиента):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...                 # ID цены из Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_...           # подпись вебхука
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # для обновления is_pro из вебхука
```

### Настройка Stripe (test mode)

1. Зарегистрируйся на https://dashboard.stripe.com — бесплатно.
2. Включи **Test mode** (тумблер сверху).
3. *Developers → API keys* — скопируй publishable и secret keys.
4. *Products → Add product* — создай «Chess Legends Pro» с recurring ценой (например $4.99/мес). Скопируй Price ID.
5. *Developers → Webhooks → Add endpoint*:
   - URL: `https://chess-legends-zeta.vercel.app/api/stripe-webhook`
   - События: `checkout.session.completed`, `customer.subscription.deleted`
   - Скопируй webhook signing secret.
6. Добавь все ключи в Vercel: *Settings → Environment Variables*.
7. Передеплой: `vercel --prod --force`.

Тестовая карта: `4242 4242 4242 4242`, любой будущий срок, любой CVC.

---

## Сборка и деплой

```bash
npm run build        # билд в dist/
vercel --prod        # деплой на Vercel
```

Vercel автоматически деплоит `/api/*.js` как Node-функции. Маршруты SPA настроены в `vercel.json` (rewrites исключают `/api/*`).

---

## Архитектурные решения

- **Без отдельного backend-сервера.** Всё через Supabase (БД + Auth + Realtime) и Vercel serverless functions.
- **Realtime через Supabase channels** для онлайн-дуэлей — не нужен отдельный WebSocket-сервер.
- **Stockfish — Web Worker** в браузере, не нагружает сервер.
- **Code-split** для тяжёлых модулей (Leaflet, AI Coach).
- **Rate limit-friendly** — AI Coach анализ стоит 10 монет (для бесплатных), безлимит для Pro.

---

## Структура проекта

```
src/
├── components/
│   ├── Auth.jsx              вход / регистрация
│   ├── ClassSelector.jsx     выбор RPG-класса
│   ├── Navbar.jsx            сайдбар
│   ├── Dashboard.jsx         главная — режимы игры, статы, квесты
│   ├── ChessGame.jsx         доска + Stockfish + управление
│   ├── AICoach.jsx           модалка анализа после партии
│   ├── CoachChat.jsx         диалог с тренером
│   ├── Leaderboard.jsx       рейтинг по городам
│   ├── TournamentPage.jsx    турниры с сеткой
│   ├── SchoolPage.jsx        учитель ↔ ученик
│   ├── MapPage.jsx           карта шахматных локаций
│   ├── FriendsPage.jsx       друзья / поиск
│   ├── PuzzlePage.jsx        задача дня
│   ├── Profile.jsx           своя страница / чужая
│   ├── UpgradePro.jsx        Stripe checkout
│   ├── SkinSelector.jsx      доски
│   ├── PieceShop.jsx         скины фигур
│   ├── DailyQuests.jsx       ежедневные задания
│   ├── Competitions.jsx      реальные турниры (внешние)
│   └── Icons.jsx             рукописные SVG
├── hooks/
│   ├── useUser.js            supabase auth + профиль
│   └── useStockfish.js       AI Web Worker
└── lib/
    ├── supabase.js           все запросы к БД
    ├── claude.js             AI Coach
    ├── stripe.js             Stripe Checkout helper
    ├── puzzles.js            задачи
    ├── dailyQuests.js        квесты
    ├── achievements.js       ачивки
    ├── skins.js              доски
    ├── pieceSkins.js         фигуры
    ├── pieceRenderers.jsx    рендер фигур
    ├── chessAI.js            простой AI fallback
    └── i18n.js               локализация ru / kz

api/
├── create-checkout-session.js   создаёт Stripe Checkout
└── stripe-webhook.js            обновляет is_pro в Supabase
```

---

## Roadmap

- [ ] Push-уведомления о ходе соперника в онлайн-дуэли
- [ ] Турниры с входной платой в монетах
- [ ] Ставки на исход партии
- [ ] Видео-уроки в школьном модуле
- [ ] PWA / offline режим

---

Сделано в рамках спринта nFactorial 2026.
=======
# nfactorial
>>>>>>> 7712e7c0a8bb22e5bc4620e423aaf70c8c04d33b
