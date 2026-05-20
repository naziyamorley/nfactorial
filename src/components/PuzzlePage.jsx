import { useState, useEffect, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { getDailyPuzzle, getPuzzleStreak, recordPuzzleSolved, checkMove } from '../lib/puzzles'
import { getActiveSkin } from '../lib/skins'
import { getActivePieceSkin } from '../lib/pieceSkins'
import { createCustomPieces } from '../lib/pieceRenderers'
import { IconCrown, IconCoin, IconFlame } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }
const COIN_REWARD = 25

export default function PuzzlePage({ onEarnCoins }) {
  const { t } = useLang()
  const [puzzle, setPuzzle]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [game, setGame]       = useState(null)
  const [step, setStep]       = useState(0)
  const [status, setStatus]   = useState('idle')
  const [highlights, setHL]   = useState({})
  const [selSq, setSelSq]     = useState(null)
  const [streak, setStreak]   = useState(0)
  const [solvedToday, setSolvedToday] = useState(false)

  const theme        = getActiveSkin()
  const customPieces = createCustomPieces(getActivePieceSkin())

  useEffect(() => {
    const { streak, solvedToday } = getPuzzleStreak()
    setStreak(streak)
    setSolvedToday(solvedToday)
    loadPuzzle()
  }, [])

  async function loadPuzzle() {
    setLoading(true)
    const p = await getDailyPuzzle()
    setPuzzle(p)
    setGame(new Chess(p.fen))
    setStep(0)
    setStatus('idle')
    setHL({})
    setSelSq(null)
    setLoading(false)
  }

  function getHighlights(g, sq) {
    const moves = g.moves({ square: sq, verbose: true })
    if (!moves.length) return {}
    const hl = { [sq]: { background: 'rgba(250,45,26,0.5)' } }
    moves.forEach(m => {
      hl[m.to] = {
        background: g.get(m.to)
          ? 'radial-gradient(circle, rgba(250,45,26,0.6) 80%, transparent 80%)'
          : 'radial-gradient(circle, rgba(46,76,140,0.35) 28%, transparent 28%)',
        borderRadius: '50%',
      }
    })
    return hl
  }

  const applyMove = useCallback((from, to) => {
    if (!game || !puzzle || status === 'done') return false
    if (status === 'wrong') setStatus('idle')

    const expected = puzzle.solution[step]
    const uci = from + to

    const next = new Chess(game.fen())
    const moved = next.move({ from, to, promotion: 'q' })
    if (!moved) return false

    if (checkMove(next, uci, expected)) {
      setGame(next)
      setSelSq(null)
      setHL({ [from]: { background: 'rgba(46,76,140,0.3)' }, [to]: { background: 'rgba(46,76,140,0.3)' } })
      setStatus('correct')

      const nextStep = step + 1
      if (nextStep >= puzzle.solution.length) {
        setTimeout(() => {
          setStatus('done')
          if (!solvedToday) {
            const newStreak = recordPuzzleSolved()
            setStreak(newStreak)
            setSolvedToday(true)
            onEarnCoins?.(COIN_REWARD)
          }
        }, 600)
      } else {
        setTimeout(() => {
          const opponentUci = puzzle.solution[nextStep]
          const opp = new Chess(next.fen())
          opp.move({ from: opponentUci.slice(0, 2), to: opponentUci.slice(2, 4), promotion: 'q' })
          setGame(opp)
          setHL({})
          setStep(nextStep + 1)
          setStatus('idle')
        }, 700)
      }
    } else {
      setGame(new Chess(game.fen()))
      setStatus('wrong')
      setSelSq(null)
      setHL({})
      setTimeout(() => setStatus('idle'), 1200)
    }
    return true
  }, [game, puzzle, step, status, solvedToday, onEarnCoins])

  function onSquareClick({ square, piece }) {
    if (!game || status === 'done') return
    const playerTurn = puzzle?.solution[step]?.[0] === game.turn() ? game.turn() : null
    if (!playerTurn) return

    if (selSq) {
      if (applyMove(selSq, square)) return
    }
    if (piece && piece[0] === game.turn()) {
      setSelSq(square)
      setHL(getHighlights(game, square))
    } else {
      setSelSq(null)
      setHL({})
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    return applyMove(sourceSquare, targetSquare)
  }

  const boardPx = Math.min(480, window.innerWidth - 68 - 64, window.innerHeight - 220)
  const playerColor = game?.turn() === 'w' ? 'white' : 'black'

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('puzzle_title')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-soft)', marginTop: 2 }}>{t('puzzle_subtitle')}</div>
        </div>

        {/* Streak */}
        <div style={{ background: 'var(--text)', borderRadius: 16, padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ ...display, fontSize: 32, color: 'var(--bg)', lineHeight: 1 }}>{streak}</div>
          <div style={{ fontSize: 10, color: 'var(--bg)', opacity: 0.5, marginTop: 2 }}>{t('streak_label')}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--text)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Board */}
          <div style={{ flexShrink: 0 }}>
            {/* Info bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: boardPx }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: 'var(--text)', color: 'var(--bg)',
                  fontFamily: "'Oswald', sans-serif",
                }}>
                  {puzzle?.themeKey ? t(puzzle.themeKey) : ''}
                </span>
                {puzzle?.rating && (
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, background: 'var(--border)', color: 'var(--muted)', fontWeight: 600 }}>
                    ★ {puzzle.rating}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted-soft)' }}>
                {playerColor === 'white' ? t('white_turn') : t('black_turn')}
              </span>
            </div>

            <Chessboard
              options={{
                position: game?.fen(),
                boardOrientation: playerColor,
                boardStyle: { borderRadius: 12, boxShadow: '0 8px 32px rgba(26,26,26,0.15)', width: boardPx, height: boardPx },
                lightSquareStyle: { backgroundColor: theme.light },
                darkSquareStyle:  { backgroundColor: theme.dark },
                customPieces,
                squareStyles: highlights,
                onSquareClick,
                onPieceDrop,
              }}
            />

            {/* Status */}
            <div style={{ marginTop: 12, height: 48 }}>
              {status === 'wrong' && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', color: '#FA2D1A', fontSize: 13, fontWeight: 600 }}>
                  {t('wrong_move')}
                </div>
              )}
              {status === 'correct' && step < (puzzle?.solution?.length || 0) && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--tint-green)', border: '1.5px solid var(--tint-green-border)', color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>
                  {t('correct_move')}
                </div>
              )}
              {status === 'done' && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconCrown size={20} color="var(--bg)" />
                  {solvedToday ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {t('done')}! +{COIN_REWARD}
                      <IconCoin size={14} color="var(--bg)" />
                      · {t('streak_reward_label')} {streak}
                      <IconFlame size={14} color="var(--bg)" />
                    </span>
                  ) : t('already_solved')}
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px 18px', marginBottom: 12 }}>
              <div style={{ ...display, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>{t('reward_label')}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ ...display, fontSize: 28, color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    +{COIN_REWARD}<IconCoin size={18} color="currentColor" />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-soft)' }}>{t('coins_label')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-red)' }}><IconFlame size={28} color="currentColor" /></div>
                  <div style={{ fontSize: 10, color: 'var(--muted-soft)' }}>{t('streak_reward_label')}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px 18px' }}>
              <div style={{ ...display, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>{t('hint_label')}</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                {puzzle?.themeKey?.startsWith('theme_mate') || puzzle?.themeKey === 'theme_arabian' ? t('hint_checkmate') : t('hint_tactic')}
              </p>
            </div>

            {status === 'done' && (
              <button onClick={loadPuzzle} style={{
                marginTop: 12, width: '100%', padding: '12px',
                background: 'var(--text)', color: 'var(--bg)', border: 'none',
                borderRadius: 12, cursor: 'pointer',
                fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 16,
              }}>
                {t('next_puzzle')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
