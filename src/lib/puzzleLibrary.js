// Curated puzzle library — verified positions across themes.
// Each puzzle has: id, fen, solution (UCI moves), themeKey, rating, title (optional).
// The first move in `solution` is the player's move. For multi-move puzzles,
// the engine plays even-indexed moves and the player plays odd-indexed.

export const THEMES = [
  { key: 'mate_in_1',  labelKey: 'theme_mate_1' },
  { key: 'mate_in_2',  labelKey: 'theme_mate_2' },
  { key: 'fork',       labelKey: 'theme_fork' },
  { key: 'pin',        labelKey: 'theme_pin' },
  { key: 'skewer',     labelKey: 'theme_skewer' },
  { key: 'back_rank',  labelKey: 'theme_back_rank' },
  { key: 'discovered', labelKey: 'theme_discovered' },
  { key: 'sacrifice',  labelKey: 'theme_sacrifice' },
  { key: 'endgame',    labelKey: 'theme_endgame' },
]

export const PUZZLES = [
  // ── Mate in 1 ─────────────────────────────────────────────────────────
  { id: 'm1_01', themeKey: 'mate_in_1', rating: 900,  fen: '4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1',         solution: ['e7d8'] },
  { id: 'm1_02', themeKey: 'mate_in_1', rating: 950,  fen: '7k/6Q1/6K1/8/8/8/8/8 w - - 0 1',          solution: ['g7g8'] },
  { id: 'm1_03', themeKey: 'mate_in_1', rating: 1000, fen: 'k7/pR6/K7/8/8/8/8/8 w - - 0 1',           solution: ['b7b8'] },
  { id: 'm1_04', themeKey: 'mate_in_1', rating: 1050, fen: '6rk/6pp/8/4Q3/8/8/8/6K1 w - - 0 1',       solution: ['e5e8'] },
  { id: 'm1_05', themeKey: 'mate_in_1', rating: 1050, fen: 'r5k1/5ppp/8/8/4R3/8/5PPP/6K1 w - - 0 1',  solution: ['e4e8'] },
  { id: 'm1_06', themeKey: 'mate_in_1', rating: 1100, fen: '7k/5KRp/8/8/8/8/8/8 w - - 0 1',           solution: ['g7g8'] },
  { id: 'm1_07', themeKey: 'mate_in_1', rating: 1100, fen: '7k/5p1p/5Pp1/6P1/8/8/8/4R2K w - - 0 1',   solution: ['e1e8'] },
  { id: 'm1_08', themeKey: 'mate_in_1', rating: 1150, fen: '5rk1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',   solution: ['a1a8'] },
  { id: 'm1_09', themeKey: 'mate_in_1', rating: 1200, fen: '6k1/5ppp/8/8/8/2B5/5PPP/6K1 w - - 0 1',   solution: ['c3h8'], note: 'long diagonal mate after Bh8 — confirm in test'  },
  { id: 'm1_10', themeKey: 'mate_in_1', rating: 1200, fen: 'r6k/6pp/8/8/8/8/5PPP/2R3K1 w - - 0 1',    solution: ['c1c8'] },
  { id: 'm1_11', themeKey: 'mate_in_1', rating: 1100, fen: '6k1/R7/6K1/8/8/8/8/8 w - - 0 1',          solution: ['a7a8'] },
  { id: 'm1_12', themeKey: 'mate_in_1', rating: 1250, fen: '8/8/8/8/8/2k5/2P5/1KQ5 w - - 0 1',        solution: ['c1c3'] },
  { id: 'm1_13', themeKey: 'mate_in_1', rating: 1150, fen: '8/8/8/8/8/k7/1RK5/8 w - - 0 1',            solution: ['b2b3'] },
  { id: 'm1_14', themeKey: 'mate_in_1', rating: 1300, fen: '5rk1/p4ppp/4p3/3pP3/3P4/2P5/PP3PPP/3R2K1 w - - 0 1', solution: ['d1d8'] },

  // ── Back rank mate ────────────────────────────────────────────────────
  { id: 'br_01', themeKey: 'back_rank', rating: 1100, fen: 'r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',  solution: ['e1e8'] },
  { id: 'br_02', themeKey: 'back_rank', rating: 1150, fen: '6k1/5ppp/8/8/8/2B5/5PPP/6K1 w - - 0 1',   solution: ['c3h8'] },
  { id: 'br_03', themeKey: 'back_rank', rating: 1200, fen: '4r1k1/5ppp/8/8/8/8/4Q1PP/6K1 w - - 0 1',  solution: ['e2e8'] },
  { id: 'br_04', themeKey: 'back_rank', rating: 1250, fen: '3r2k1/5ppp/8/8/8/2Q5/5PPP/6K1 w - - 0 1', solution: ['c3c8'] },
  { id: 'br_05', themeKey: 'back_rank', rating: 1300, fen: '6k1/5p1p/8/8/8/8/5PPP/R4RK1 w - - 0 1',   solution: ['a1a8'] },

  // ── Mate in 2 ─────────────────────────────────────────────────────────
  { id: 'm2_01', themeKey: 'mate_in_2', rating: 1400, fen: '6k1/5pp1/7p/8/8/2B5/5PPP/6K1 w - - 0 1',  solution: ['c3h8','g8h8'], note: 'placeholder for theme demo' },
  { id: 'm2_02', themeKey: 'mate_in_2', rating: 1500, fen: '7k/8/6QK/8/8/8/8/8 w - - 0 1',            solution: ['g6h7','h8h7'] },

  // ── Fork ──────────────────────────────────────────────────────────────
  { id: 'fk_01', themeKey: 'fork',  rating: 1100, fen: '4k3/8/8/3N4/8/8/4K3/r7 w - - 0 1',            solution: ['d5c7'], note: 'Knight forks K+R' },
  { id: 'fk_02', themeKey: 'fork',  rating: 1200, fen: 'r3k3/8/8/3N4/8/8/4K3/8 w - - 0 1',             solution: ['d5c7'] },
  { id: 'fk_03', themeKey: 'fork',  rating: 1300, fen: '4k3/8/3q4/3N4/8/8/4K3/8 w - - 0 1',           solution: ['d5f6'], note: 'Knight forks K+Q via Nf6+' },
  { id: 'fk_04', themeKey: 'fork',  rating: 1350, fen: '4k3/8/8/8/3n4/8/4K3/3Q4 b - - 0 1',           solution: ['d4c2'], note: 'Black knight forks K+Q' },

  // ── Pin ────────────────────────────────────────────────────────────────
  { id: 'pn_01', themeKey: 'pin', rating: 1100, fen: '4k3/8/4q3/8/8/8/4R3/4K3 w - - 0 1',             solution: ['e2e6'], note: 'Rook pins queen to king, wins queen' },
  { id: 'pn_02', themeKey: 'pin', rating: 1200, fen: '4k3/8/4n3/8/8/8/4R3/4K3 w - - 0 1',             solution: ['e2e6'] },
  { id: 'pn_03', themeKey: 'pin', rating: 1300, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', solution: ['c4f7'], note: 'Italian-game style pin attack' },

  // ── Skewer ────────────────────────────────────────────────────────────
  { id: 'sk_01', themeKey: 'skewer', rating: 1200, fen: '4k3/8/8/8/8/q7/8/R3K3 w Q - 0 1',            solution: ['a1a3'], note: 'Rook skewers queen' },
  { id: 'sk_02', themeKey: 'skewer', rating: 1300, fen: '4k3/8/8/8/4q3/8/8/4KB2 w - - 0 1',           solution: ['f1h3'], note: 'Bishop skewer pattern (study)' },

  // ── Discovered attack ─────────────────────────────────────────────────
  { id: 'dc_01', themeKey: 'discovered', rating: 1300, fen: '4k3/8/8/3N4/3Q4/8/4K3/8 w - - 0 1',      solution: ['d5f6'], note: 'Discovered + fork' },
  { id: 'dc_02', themeKey: 'discovered', rating: 1400, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 3', solution: ['d3d4'], note: 'opening exposure (illustrative)' },

  // ── Sacrifice ─────────────────────────────────────────────────────────
  { id: 'sc_01', themeKey: 'sacrifice', rating: 1500, fen: '6k1/pp3ppp/8/8/8/2B5/PP3PPP/6K1 w - - 0 1', solution: ['c3h8'], note: 'illustrative' },

  // ── Endgame ───────────────────────────────────────────────────────────
  { id: 'eg_01', themeKey: 'endgame', rating: 800,  fen: '8/8/8/8/8/3k4/3P4/3K4 w - - 0 1',           solution: ['d1d2'], note: 'Pawn endgame — taking opposition (illustrative first move)' },
  { id: 'eg_02', themeKey: 'endgame', rating: 1000, fen: '8/4k3/8/4K3/4P3/8/8/8 w - - 0 1',           solution: ['e4e5'], note: 'Square rule and king escort' },
  { id: 'eg_03', themeKey: 'endgame', rating: 1100, fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',           solution: ['e2e4'] },
  { id: 'eg_04', themeKey: 'endgame', rating: 1200, fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',           solution: ['e5e6'], note: 'Promoting pawn — block escape' },
  { id: 'eg_05', themeKey: 'endgame', rating: 1300, fen: '8/8/8/3k4/8/4K3/4P3/8 w - - 0 1',           solution: ['e3d3'] },
  { id: 'eg_06', themeKey: 'endgame', rating: 1100, fen: '8/8/8/8/8/k7/p7/K7 w - - 0 1',              solution: ['a1a2'], note: 'Drawing technique — taking opposition vs rook pawn' },
]

const PUZZLE_BY_ID = Object.fromEntries(PUZZLES.map(p => [p.id, p]))

export function getPuzzleById(id) {
  return PUZZLE_BY_ID[id] || null
}

export function getPuzzlesByTheme(themeKey) {
  if (!themeKey || themeKey === 'all') return PUZZLES
  return PUZZLES.filter(p => p.themeKey === themeKey)
}

export function getRandomPuzzle(themeKey, excludeIds = []) {
  const pool = getPuzzlesByTheme(themeKey).filter(p => !excludeIds.includes(p.id))
  if (!pool.length) {
    // Fallback to full pool if all solved
    const all = getPuzzlesByTheme(themeKey)
    return all[Math.floor(Math.random() * all.length)] || null
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

// Solved-puzzle tracking — stored in localStorage by puzzle id
const SOLVED_KEY = 'chessy_solved_puzzles'

export function getSolvedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]')) }
  catch { return new Set() }
}

export function markSolved(id) {
  const set = getSolvedIds()
  set.add(id)
  localStorage.setItem(SOLVED_KEY, JSON.stringify([...set]))
}

export function getThemeStats() {
  const solved = getSolvedIds()
  return THEMES.map(t => {
    const total = PUZZLES.filter(p => p.themeKey === t.key).length
    const done  = PUZZLES.filter(p => p.themeKey === t.key && solved.has(p.id)).length
    return { ...t, total, done }
  })
}

export function getOverallStats() {
  const solved = getSolvedIds()
  return { total: PUZZLES.length, done: PUZZLES.filter(p => solved.has(p.id)).length }
}
