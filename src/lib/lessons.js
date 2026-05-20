// Curated lessons — bite-sized chess theory with diagrams.
// Each lesson has sections; each section can include an interactive FEN.

export const LESSONS = [
  {
    id: 'opening_principles',
    titleKey: 'lesson_opening_title',
    descKey:  'lesson_opening_desc',
    levelKey: 'level_novice',
    sections: [
      {
        titleKey: 'lesson_opening_s1_title',
        bodyKey:  'lesson_opening_s1_body',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
      {
        titleKey: 'lesson_opening_s2_title',
        bodyKey:  'lesson_opening_s2_body',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      },
      {
        titleKey: 'lesson_opening_s3_title',
        bodyKey:  'lesson_opening_s3_body',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
      },
      {
        titleKey: 'lesson_opening_s4_title',
        bodyKey:  'lesson_opening_s4_body',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5',
      },
    ],
  },
  {
    id: 'basic_tactics',
    titleKey: 'lesson_tactics_title',
    descKey:  'lesson_tactics_desc',
    levelKey: 'level_amateur',
    sections: [
      {
        titleKey: 'lesson_tactics_s1_title',
        bodyKey:  'lesson_tactics_s1_body',
        fen: '4k3/8/3q4/3N4/8/8/4K3/8 w - - 0 1',
      },
      {
        titleKey: 'lesson_tactics_s2_title',
        bodyKey:  'lesson_tactics_s2_body',
        fen: '4k3/8/4q3/8/8/8/4R3/4K3 w - - 0 1',
      },
      {
        titleKey: 'lesson_tactics_s3_title',
        bodyKey:  'lesson_tactics_s3_body',
        fen: '4k3/8/8/8/8/q7/8/R3K3 w Q - 0 1',
      },
      {
        titleKey: 'lesson_tactics_s4_title',
        bodyKey:  'lesson_tactics_s4_body',
        fen: 'r5k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
      },
    ],
  },
  {
    id: 'king_and_pawn',
    titleKey: 'lesson_kp_title',
    descKey:  'lesson_kp_desc',
    levelKey: 'level_amateur',
    sections: [
      {
        titleKey: 'lesson_kp_s1_title',
        bodyKey:  'lesson_kp_s1_body',
        fen: '8/8/8/8/8/3k4/3P4/3K4 w - - 0 1',
      },
      {
        titleKey: 'lesson_kp_s2_title',
        bodyKey:  'lesson_kp_s2_body',
        fen: '8/4k3/8/4K3/4P3/8/8/8 w - - 0 1',
      },
      {
        titleKey: 'lesson_kp_s3_title',
        bodyKey:  'lesson_kp_s3_body',
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
      },
    ],
  },
  {
    id: 'pawn_structure',
    titleKey: 'lesson_pawns_title',
    descKey:  'lesson_pawns_desc',
    levelKey: 'level_semipro',
    sections: [
      {
        titleKey: 'lesson_pawns_s1_title',
        bodyKey:  'lesson_pawns_s1_body',
        fen: '4k3/pp3ppp/8/8/8/8/PP3PPP/4K3 w - - 0 1',
      },
      {
        titleKey: 'lesson_pawns_s2_title',
        bodyKey:  'lesson_pawns_s2_body',
        fen: '4k3/p1p2pp1/1p3p1p/8/8/8/PPPPPPPP/4K3 w - - 0 1',
      },
      {
        titleKey: 'lesson_pawns_s3_title',
        bodyKey:  'lesson_pawns_s3_body',
        fen: '4k3/8/3p4/3P4/8/8/8/4K3 w - - 0 1',
      },
    ],
  },
  {
    id: 'attacking_castle',
    titleKey: 'lesson_attack_title',
    descKey:  'lesson_attack_desc',
    levelKey: 'level_semipro',
    sections: [
      {
        titleKey: 'lesson_attack_s1_title',
        bodyKey:  'lesson_attack_s1_body',
        fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 6',
      },
      {
        titleKey: 'lesson_attack_s2_title',
        bodyKey:  'lesson_attack_s2_body',
        fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 6',
      },
    ],
  },
  {
    id: 'kz_history',
    titleKey: 'lesson_kz_title',
    descKey:  'lesson_kz_desc',
    levelKey: 'level_novice',
    sections: [
      {
        titleKey: 'lesson_kz_s1_title',
        bodyKey:  'lesson_kz_s1_body',
      },
      {
        titleKey: 'lesson_kz_s2_title',
        bodyKey:  'lesson_kz_s2_body',
      },
      {
        titleKey: 'lesson_kz_s3_title',
        bodyKey:  'lesson_kz_s3_body',
      },
    ],
  },
]

const LESSON_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]))

export function getLessonById(id) {
  return LESSON_BY_ID[id] || null
}

const DONE_KEY = 'chessy_done_lessons'

export function getDoneLessons() {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')) }
  catch { return new Set() }
}

export function markLessonDone(id) {
  const set = getDoneLessons()
  set.add(id)
  localStorage.setItem(DONE_KEY, JSON.stringify([...set]))
}
