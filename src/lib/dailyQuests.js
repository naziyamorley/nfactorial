import { getLangFromStorage } from './i18n'

const QUEST_POOL = [
  { id: 'play2',   title: 'Сыграй 2 партии',    title_kz: '2 ойын ойна',              desc: 'сыграй любые 2 партии',          desc_kz: 'кез келген 2 ойын ойна',         goal: 2, reward: { coins: 30, xp: 20 }, track: 'games_played_today' },
  { id: 'win1',    title: 'Одержи победу',        title_kz: 'Жеңіс қаз',                desc: 'выиграй хотя бы 1 партию',       desc_kz: 'кемінде 1 ойын жеңіп шық',       goal: 1, reward: { coins: 40, xp: 30 }, track: 'wins_today' },
  { id: 'puzzle1', title: 'Реши задачу дня',      title_kz: 'Күнделікті тапсырма',      desc: 'реши ежедневный пазл',           desc_kz: 'күнделікті тапсырманы шеш',       goal: 1, reward: { coins: 25, xp: 15 }, track: 'puzzles_today' },
  { id: 'ai_hard', title: 'Победи ИИ уровня 7+',  title_kz: 'AI деңгей 7+ жеңу',        desc: 'обыграй компьютер на уровне ≥7', desc_kz: 'компьютерді ≥7 деңгейде жеңіп шық', goal: 1, reward: { coins: 60, xp: 50 }, track: 'ai_hard_wins_today' },
  { id: 'play3',   title: 'Сыграй 3 партии',      title_kz: '3 ойын ойна',              desc: 'сыграй любые 3 партии',          desc_kz: 'кез келген 3 ойын ойна',         goal: 3, reward: { coins: 45, xp: 25 }, track: 'games_played_today' },
  { id: 'win2',    title: 'Две победы подряд',     title_kz: 'Екі жеңіс',                desc: 'выиграй 2 партии за день',       desc_kz: 'күніне 2 ойын жеңіп шық',        goal: 2, reward: { coins: 70, xp: 50 }, track: 'wins_today' },
  { id: 'rated1',  title: 'Рейтинговая партия',    title_kz: 'Рейтингтік ойын',          desc: 'сыграй рейтинговую партию',      desc_kz: 'рейтингтік ойын ойна',            goal: 1, reward: { coins: 35, xp: 20 }, track: 'rated_today' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function pickDailyQuests() {
  const day = Math.floor(Date.now() / 86400000)
  const seed = day % QUEST_POOL.length
  const indices = [seed, (seed + 2) % QUEST_POOL.length, (seed + 4) % QUEST_POOL.length]
  return indices.map(i => QUEST_POOL[i])
}

function applyLang(quests) {
  const lang = getLangFromStorage()
  return quests.map(q => {
    const base = QUEST_POOL.find(p => p.id === q.id) || {}
    return {
      ...q,
      title: lang === 'kz' ? (base.title_kz || q.title) : (base.title || q.title),
      desc:  lang === 'kz' ? (base.desc_kz  || q.desc)  : (base.desc  || q.desc),
    }
  })
}

export function getDailyQuests() {
  const today = todayStr()
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('chessy_daily_quests') || 'null') } catch { return null }
  })()

  if (stored?.date === today) {
    return applyLang(stored.quests)
  }

  const quests = pickDailyQuests().map(q => ({ ...q, progress: 0, claimed: false }))
  localStorage.setItem('chessy_daily_quests', JSON.stringify({ date: today, quests }))
  return applyLang(quests)
}

function saveQuests(quests) {
  const plain = quests.map(({ title_kz: _tk, desc_kz: _dk, ...rest }) => rest)
  localStorage.setItem('chessy_daily_quests', JSON.stringify({ date: todayStr(), quests: plain }))
}

export function incrementQuestTrack(track, amount = 1) {
  const quests = getDailyQuests()
  let changed = false
  for (const q of quests) {
    if (q.track === track && !q.claimed && q.progress < q.goal) {
      q.progress = Math.min(q.goal, q.progress + amount)
      changed = true
    }
  }
  if (changed) saveQuests(quests)
  return quests
}

export function claimQuestReward(questId) {
  const quests = getDailyQuests()
  const q = quests.find(q => q.id === questId)
  if (!q || q.claimed || q.progress < q.goal) return null
  q.claimed = true
  saveQuests(quests)
  return q.reward
}
