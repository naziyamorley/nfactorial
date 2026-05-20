const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

// Piece-square tables for positional bonus (white's perspective)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -100000 : 100000
  if (chess.isDraw()) return 0

  let score = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (!piece) continue
      const idx = piece.color === 'w' ? r * 8 + f : (7 - r) * 8 + f
      const base = PIECE_VALUE[piece.type] || 0
      const pos  = (PST[piece.type]?.[idx] || 0)
      score += piece.color === 'w' ? (base + pos) : -(base + pos)
    }
  }
  return score
}

function minimax(chess, depth, alpha, beta, maximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess)

  const moves = chess.moves({ verbose: true })
  // Move ordering: captures first
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0))

  if (maximizing) {
    let best = -Infinity
    for (const m of moves) {
      chess.move(m)
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false))
      chess.undo()
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      chess.move(m)
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true))
      chess.undo()
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

// skillLevel 1-20 → depth 0-4, randomness 0-100%
export function getBestMove(chess, skillLevel) {
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null

  // Level 1-3: mostly random
  if (skillLevel <= 3) {
    const randomness = 1 - (skillLevel - 1) * 0.15
    if (Math.random() < randomness) return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = skillLevel <= 5  ? 1
              : skillLevel <= 10 ? 2
              : skillLevel <= 15 ? 3
              : 4

  const isWhite = chess.turn() === 'w'
  let bestScore = isWhite ? -Infinity : Infinity
  let bestMoves = []

  for (const m of moves) {
    chess.move(m)
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite)
    chess.undo()

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMoves = [m]
    } else if (score === bestScore) {
      bestMoves.push(m)
    }
  }

  // Add slight randomness at lower levels
  const randomness = Math.max(0, (10 - skillLevel) * 0.08)
  if (Math.random() < randomness) return moves[Math.floor(Math.random() * moves.length)]

  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}
