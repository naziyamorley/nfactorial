import { getLangFromStorage } from './i18n'

const ACHIEVEMENTS_RAW = [
  { id: 'first_win', icon: '⚔️',  name_ru: 'первая кровь', name_kz: 'алғашқы қан',  desc_ru: 'выиграй первую партию',         desc_kz: 'алғашқы партияны жең',         check: (p) => p.games_won >= 1 },
  { id: 'veteran',   icon: '🎖️',  name_ru: 'ветеран',      name_kz: 'ардагер',      desc_ru: 'сыграй 10 партий',              desc_kz: '10 ойын ойна',                 check: (p) => p.games_played >= 10 },
  { id: 'legend',    icon: '👑',  name_ru: 'легенда',      name_kz: 'аңыз',         desc_ru: 'достигни 10 уровня',            desc_kz: '10 деңгейге жет',              check: (p) => p.level >= 10 },
  { id: 'tactician', icon: '🧠',  name_ru: 'тактик',       name_kz: 'тактикшы',     desc_ru: 'получи оценку 80+ от ai coach', desc_kz: 'ai coach-тан 80+ баға ал',    check: (p, last) => last?.gameRating >= 80 },
  { id: 'rich',      icon: '💰',  name_ru: 'богач',        name_kz: 'бай',          desc_ru: 'накопи 500 монет',              desc_kz: '500 монета жина',              check: (p) => p.coins >= 500 },
  { id: 'rated',     icon: '📈',  name_ru: 'рейтинговый',  name_kz: 'рейтингті',    desc_ru: 'набери рейтинг 1100+',          desc_kz: '1100+ рейтинг жина',           check: (p) => p.rating >= 1100 },
  { id: 'streak3',   icon: '🔥',  name_ru: 'в огне',       name_kz: 'отта',         desc_ru: 'реши задачу 3 дня подряд',      desc_kz: '3 күн қатарынан тапсырма шеш', check: (p, last, streak) => streak >= 3 },
  { id: 'collector', icon: '🎨',  name_ru: 'коллекционер', name_kz: 'жинаушы',      desc_ru: 'купи 2 скина фигурок',          desc_kz: '2 фигура скинін сатып ал',     check: () => {
    try { return JSON.parse(localStorage.getItem('chessy_purchased_skins') || '[]').length >= 3 }
    catch { return false }
  }},
]

function translate(a) {
  const lang = getLangFromStorage()
  return {
    ...a,
    name: lang === 'kz' ? a.name_kz : a.name_ru,
    desc: lang === 'kz' ? a.desc_kz : a.desc_ru,
  }
}

export const ACHIEVEMENTS = new Proxy([], {
  get(_target, prop) {
    const arr = ACHIEVEMENTS_RAW.map(translate)
    if (prop === Symbol.iterator) return arr[Symbol.iterator].bind(arr)
    const v = arr[prop]
    return typeof v === 'function' ? v.bind(arr) : v
  },
})

export function getUnlockedAchievements() {
  try { return JSON.parse(localStorage.getItem('chessy_achievements') || '[]') }
  catch { return [] }
}

export function checkAndUnlockAchievements(profile, lastGameData = {}, puzzleStreak = 0) {
  const unlocked = getUnlockedAchievements()
  const newlyUnlocked = []

  for (const a of ACHIEVEMENTS_RAW) {
    if (unlocked.includes(a.id)) continue
    if (a.check(profile, lastGameData, puzzleStreak)) {
      unlocked.push(a.id)
      newlyUnlocked.push(translate(a))
    }
  }

  if (newlyUnlocked.length > 0) {
    localStorage.setItem('chessy_achievements', JSON.stringify(unlocked))
  }
  return newlyUnlocked
}
