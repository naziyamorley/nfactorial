import { useState, useEffect, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { getDailyPuzzle, getPuzzleStreak, recordPuzzleSolved, checkMove } from '../lib/puzzles'
import { THEMES, getRandomPuzzle, getSolvedIds, markSolved, getThemeStats, getOverallStats } from '../lib/puzzleLibrary'
import { getActiveSkin } from '../lib/skins'
import { getActivePieceSkin } from '../lib/pieceSkins'
import { createCustomPieces } from '../lib/pieceRenderers'
import { IconCrown, IconCoin, IconFlame, IconCheck } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }
const COIN_REWARD = 25

export default function PuzzlePage({ onEarnCoins }) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('daily') // 'daily' | theme.key
  const [puzzle, setPuzzle]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [game, setGame]       = useState(null)
  const [step, setStep]       = useState(0)
  const [status, setStatus]   = useState('idle')
  const [highlights, setHL]   = useState({})
  const [selSq, setSelSq]     = useState(null)
  const [streak, setStreak]   = useState(0)
  const [solvedToday, setSolvedToday] = useState(false)
  const [solvedTick, setSolvedTick]   = useState(0) // forces theme-stat refresh

  const theme        = getActiveSkin()
  const customPieces = createCustomPieces(getActivePieceSkin())
  const themeStats   = getThemeStats()
  const overall      = getOverallStats()

  useEffect(() => {
    const { streak, solvedToday } = getPuzzleStreak()
    setStreak(streak)
    setSolvedToday(solvedToday)
    loadPuzzle('daily')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPuzzle(tab = activeTab) {
    setLoading(true)
    let p
    if (tab === 'daily') {
      p = await getDailyPuzzle()
    } else {
      p = getRandomPuzzle(tab, [...getSolvedIds()])
    }
    setPuzzle(p)
    if (p) {
      setGame(new Chess(p.fen))
      setStep(0)
      setStatus('idle')
      setHL({})
      setSelSq(null)
    }
    setLoading(false)
  }

  function switchTab(tab) {
    setActiveTab(tab)
    loadPuzzle(tab)
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
          // Track per-puzzle solved (for library puzzles)
          if (puzzle.id && activeTab !== 'daily') {
            markSolved(puzzle.id)
            setSolvedTick(x => x + 1)
            onEarnCoins?.(Math.floor(COIN_REWARD / 2))
          }
          // Track daily streak (only for daily)
          if (activeTab === 'daily' && !solvedToday) {
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
  }, [game, puzzle, step, status, solvedToday, onEarnCoins, activeTab])

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

  const boardPx = Math.min(440, window.innerWidth - 68 - 64, window.innerHeight - 280)
  const playerColor = game?.turn() === 'w' ? 'white' : 'black'

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('puzzle_title')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-soft)', marginTop: 4 }}>
            {t('puzzle_subtitle')} · {overall.done}/{overall.total} {t('puzzle_solved_label')}
          </div>
        </div>

        {/* Streak */}
        <div style={{ background: 'var(--text)', borderRadius: 14, padding: '10px 18px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--bg)' }}><IconFlame size={20} color="currentColor" /></span>
          <div>
            <div style={{ ...display, fontSize: 24, color: 'var(--bg)', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 9, color: 'var(--bg)', opacity: 0.5, marginTop: 2, letterSpacing: 1 }}>{t('streak_label')}</div>
          </div>
        </div>
      </div>

      {/* Theme tabs — scrollable horizontal */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        <ThemeTab
          active={activeTab === 'daily'}
          label={t('puzzle_tab_daily')}
          onClick={() => switchTab('daily')}
        />
        {themeStats.map(ts => (
          <ThemeTab
            key={ts.key}
            active={activeTab === ts.key}
            label={t(ts.labelKey) !== ts.labelKey ? t(ts.labelKey) : ts.key}
            sub={`${ts.done}/${ts.total}`}
            done={ts.done === ts.total && ts.total > 0}
            onClick={() => switchTab(ts.key)}
          />
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--text)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : !puzzle ? (
        <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--muted)' }}>
          {t('puzzle_theme_complete')}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Board */}
          <div style={{ flexShrink: 0 }}>
            {/* Info bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: boardPx }}>
              <div style={{ display: 'flex', gap: 8 }}>
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {t('done')}!
                    {activeTab === 'daily' && (
                      <>+{COIN_REWARD}<IconCoin size={14} color="var(--bg)" />· {t('streak_reward_label')} {streak}<IconFlame size={14} color="var(--bg)" /></>
                    )}
                    {activeTab !== 'daily' && (
                      <>+{Math.floor(COIN_REWARD / 2)}<IconCoin size={14} color="var(--bg)" /></>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '18px 18px', marginBottom: 12 }}>
              <div style={{ ...display, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>{t('hint_label')}</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                {puzzle?.themeKey === 'mate_in_1' || puzzle?.themeKey === 'mate_in_2' || puzzle?.themeKey === 'back_rank'
                  ? t('hint_checkmate')
                  : puzzle?.themeKey === 'endgame'
                  ? t('hint_endgame')
                  : t('hint_tactic')}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '18px 18px', marginBottom: 12 }}>
              <div style={{ ...display, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{t('reward_label')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                {activeTab === 'daily'
                  ? <>{t('puzzle_daily_reward')}: <strong style={{ color: 'var(--accent-green)' }}>+{COIN_REWARD}</strong></>
                  : <>{t('puzzle_theme_reward')}: <strong style={{ color: 'var(--accent-green)' }}>+{Math.floor(COIN_REWARD/2)}</strong></>}
                <IconCoin size={12} color="var(--accent-amber)" style={{ marginLeft: 4, verticalAlign: 'middle' }} />
              </div>
            </div>

            {(status === 'done' || activeTab !== 'daily') && (
              <button onClick={() => loadPuzzle()} style={{
                width: '100%', padding: '12px',
                background: 'var(--text)', color: 'var(--bg)', border: 'none',
                borderRadius: 12, cursor: 'pointer',
                fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 0.5,
              }}>
                {t('next_puzzle')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* invisible mount hook to force theme stats refresh */}
      <span style={{ display: 'none' }}>{solvedTick}</span>
    </div>
  )
}

function ThemeTab({ active, label, sub, done, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
        border: active ? '1.5px solid var(--text)' : '1.5px solid var(--border)',
        background: active ? 'var(--text)' : 'var(--bg-card)',
        color: active ? 'var(--bg)' : 'var(--muted)',
        fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 0.3,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all 0.12s',
      }}
    >
      <span>{label}</span>
      {sub && (
        <span style={{
          fontSize: 10, opacity: active ? 0.6 : 0.5,
          fontFamily: 'monospace',
          background: active ? 'rgba(255,255,255,0.15)' : 'var(--border)',
          padding: '1px 6px', borderRadius: 4,
        }}>
          {sub}
        </span>
      )}
      {done && <span style={{ color: 'var(--accent-green)', display: 'inline-flex' }}><IconCheck size={11} color="currentColor" /></span>}
    </button>
  )
}
