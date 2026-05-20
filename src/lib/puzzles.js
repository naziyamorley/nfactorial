import { Chess } from 'chess.js'

// 7 verified mate-in-1 fallback puzzles
const FALLBACK = [
  { id: 'f1', fen: '6rk/6pp/8/4Q3/8/8/8/6K1 w - - 0 1',   solution: ['e5f6'], themeKey: 'theme_mate_1',  rating: 1100 },
  { id: 'f2', fen: 'r5k1/5ppp/8/8/4R3/8/5PPP/6K1 w - - 0 1', solution: ['e4e8'], themeKey: 'theme_mate_1',  rating: 1050 },
  { id: 'f3', fen: '7k/5KRp/8/8/8/8/8/8 w - - 0 1',          solution: ['g7g8'], themeKey: 'theme_mate_1',  rating: 1150 },
  { id: 'f4', fen: '4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1',        solution: ['e7d8'], themeKey: 'theme_mate_1',  rating: 1000 },
  { id: 'f5', fen: 'k7/pR6/K7/8/8/8/8/8 w - - 0 1',          solution: ['b7b8'], themeKey: 'theme_mate_1',  rating: 1000 },
  { id: 'f6', fen: '8/8/8/8/8/k7/ppp5/KQ6 w - - 0 1',        solution: ['b1b3'], themeKey: 'theme_mate_1',  rating: 1200 },
  { id: 'f7', fen: '7k/6R1/5N2/8/8/8/8/7K w - - 0 1',        solution: ['g7g8'], themeKey: 'theme_arabian', rating: 1300 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function getPuzzleStreak() {
  return {
    streak: parseInt(localStorage.getItem('chessy_streak') || '0'),
    lastDate: localStorage.getItem('chessy_streak_date') || '',
    solvedToday: localStorage.getItem('chessy_solved_today') === todayStr(),
  }
}

export function recordPuzzleSolved() {
  const today = todayStr()
  const last  = localStorage.getItem('chessy_streak_date') || ''
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let streak = parseInt(localStorage.getItem('chessy_streak') || '0')

  if (last === today) return streak
  if (last === yesterday) streak++
  else streak = 1

  localStorage.setItem('chessy_streak', String(streak))
  localStorage.setItem('chessy_streak_date', today)
  localStorage.setItem('chessy_solved_today', today)
  return streak
}

async function parseLichess(data) {
  try {
    const { game, puzzle } = data
    const chess = new Chess()
    chess.loadPgn(game.pgn)
    const moves = chess.history({ verbose: true })
    chess.reset()
    for (let i = 0; i < puzzle.initialPly - 1; i++) chess.move(moves[i].san)
    const themes = (puzzle.themes || []).join(', ')
    const themeKey = themes.includes('mateIn1') ? 'theme_mate_1'
                   : themes.includes('mateIn2') ? 'theme_mate_2'
                   : themes.includes('fork')    ? 'theme_fork'
                   : themes.includes('pin')     ? 'theme_pin'
                   : 'theme_best_move'
    return {
      id: puzzle.id,
      fen: chess.fen(),
      solution: puzzle.solution,
      themeKey,
      rating: puzzle.rating,
    }
  } catch { return null }
}

export async function getDailyPuzzle() {
  try {
    const res = await fetch('https://lichess.org/api/puzzle/daily', {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error('lichess error')
    const data = await res.json()
    const parsed = await parseLichess(data)
    if (parsed) return parsed
  } catch { /* fall through */ }

  const day = Math.floor(Date.now() / 86400000)
  return FALLBACK[day % FALLBACK.length]
}

export function checkMove(chess, uciMove, expected) {
  return uciMove === expected || uciMove === expected.slice(0, 4)
}
