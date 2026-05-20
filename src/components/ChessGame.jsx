import { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { IconFlag, IconHandshake, IconClipboard, IconCrown, IconSkull, IconRobot, IconLightning, IconKnight, IconSwords } from './Icons'
import { getActiveSkin } from '../lib/skins'
import { getActivePieceSkin } from '../lib/pieceSkins'
import { createCustomPieces } from '../lib/pieceRenderers'
import { supabase, supabaseConfigured, joinDuel, getDuel, updateDuel } from '../lib/supabase'
import { getBestMove } from '../lib/chessAI'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }


export default function ChessGame({ profile, mode = 'vs_ai', skillLevel = 10, inviteCode, onGameEnd }) {
  const { t }        = useLang()
  const theme        = getActiveSkin()
  const customPieces = createCustomPieces(getActivePieceSkin())

  const [game, setGame]         = useState(new Chess())
  const [selSq, setSelSq]       = useState(null)
  const [highlights, setHL]     = useState({})
  const [thinking, setThinking] = useState(false)
  const [finished, setFinished] = useState(false)
  const [result, setResult]     = useState(null)
  const [moveLog, setMoveLog]   = useState([])

  // Online duel state
  const [duelId, setDuelId]         = useState(null)
  const [myColor, setMyColor]       = useState('w') // 'w' or 'b'
  const [waitingFor, setWaitingFor] = useState(null) // 'opponent' | null
  const channelRef                  = useRef(null)
  const isOnlineDuel = mode === 'duel' && !!inviteCode && supabaseConfigured

  // ── Online duel setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnlineDuel) return

    async function setupDuel() {
      let duel = await getDuel(inviteCode)
      if (!duel) { console.warn('Duel not found'); return }

      const isPlayer1 = profile?.id === duel.player1_id
      const isPlayer2 = duel.player2_id && profile?.id === duel.player2_id

      if (!isPlayer1 && !isPlayer2 && !duel.player2_id) {
        // Join as player 2
        duel = await joinDuel(inviteCode, profile?.id)
        setMyColor('b')
      } else {
        setMyColor(isPlayer1 ? 'w' : 'b')
      }

      setDuelId(duel.id)
      if (duel.fen && duel.fen !== new Chess().fen()) {
        setGame(new Chess(duel.fen))
      }
      if (!duel.player2_id && isPlayer1) setWaitingFor('opponent')

      // Subscribe to realtime updates
      channelRef.current = supabase
        .channel(`duel-${duel.id}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'active_duels',
          filter: `id=eq.${duel.id}`,
        }, (payload) => {
          const d = payload.new
          if (d.player2_id) setWaitingFor(null)
          setGame(new Chess(d.fen || new Chess().fen()))
          if (d.status === 'finished') {
            const res = d.winner_id === profile?.id ? 'win' : d.winner_id ? 'loss' : 'draw'
            endGame(new Chess(d.fen), res)
          }
        })
        .subscribe()
    }

    setupDuel()
    return () => { channelRef.current?.unsubscribe() }
    // endGame and profile?.id are stable enough for this lifecycle —
    // the duel is set up once per invite code and shouldn't re-run if profile object identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnlineDuel, inviteCode])


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

  function endGame(g, res) {
    setFinished(true)
    setResult(res)
    const coins = { win: 50, draw: 15, loss: -10 }
    const xp    = { win: 80, draw: 20, loss: 10 }
    onGameEnd?.({ result: res, pgn: g.pgn(), coinsDelta: coins[res], xpDelta: xp[res], durationS: 0 })
  }

  function checkEnd(g) {
    if (!g.isGameOver()) return false
    endGame(g, g.isCheckmate() ? (g.turn() === 'b' ? 'win' : 'loss') : 'draw')
    return true
  }

  function doAiMove(g) {
    setThinking(true)
    setTimeout(() => {
      const next = new Chess(g.fen())
      const move = getBestMove(next, skillLevel)
      if (move) next.move({ from: move.from, to: move.to, promotion: 'q' })
      setGame(next)
      setMoveLog(prev => [...prev, next.history().at(-1)])
      setThinking(false)
      checkEnd(next)
    }, 300 + Math.random() * 400)
  }

  async function applyMove(from, to) {
    const next = new Chess(game.fen())
    const moved = next.move({ from, to, promotion: 'q' })
    if (!moved) return false
    setGame(next)
    setSelSq(null)
    setHL({})
    setMoveLog(prev => [...prev, moved.san])

    if (isOnlineDuel && duelId) {
      const isOver = next.isGameOver()
      await updateDuel(duelId, {
        fen: next.fen(),
        pgn: next.pgn(),
        turn: next.turn(),
        status: isOver ? 'finished' : 'active',
        winner_id: isOver && next.isCheckmate() ? profile?.id : null,
      })
    }

    if (!checkEnd(next) && mode === 'vs_ai') doAiMove(next)
    return true
  }

  // Whose turn is it from this player's perspective
  const myTurn = mode === 'vs_ai'
    ? game.turn() === 'w'
    : mode === 'duel'
    ? (isOnlineDuel ? game.turn() === myColor : true) // local duel: always allow
    : true

  function onSquareClick({ square, piece }) {
    if (thinking || finished || !myTurn || waitingFor) return
    if (selSq) { if (applyMove(selSq, square)) return }
    if (piece && piece[0] === game.turn()) {
      setSelSq(square)
      setHL(getHighlights(game, square))
    } else { setSelSq(null); setHL({}) }
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (thinking || finished || !myTurn || waitingFor) return false
    return applyMove(sourceSquare, targetSquare)
  }

  // Board size — recomputes on window resize.
  // 68 = nav width, 200 = right column (move log), 64 = horizontal padding
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    function onResize() { setViewport({ w: window.innerWidth, h: window.innerHeight }) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const hasSidebar = viewport.w >= 900
  const boardPx = Math.max(
    280,
    Math.min(540, viewport.w - 68 - (hasSidebar ? 200 : 0) - 64, viewport.h - 160)
  )

  const resultConfig = {
    win:  { icon: <IconCrown size={28} />,     text: t('win_text'),  color: 'var(--accent-blue)', bg: 'var(--tint-blue)', border: 'var(--tint-blue-border)' },
    loss: { icon: <IconSkull size={28} />,     text: t('loss_text'), color: '#FA2D1A', bg: 'var(--tint-red)', border: 'var(--tint-red-border)' },
    draw: { icon: <IconHandshake size={28} />, text: t('draw_text'), color: 'var(--muted)', bg: 'var(--bg-card-soft)', border: 'var(--border)' },
  }[result] ?? {}

  const movePairs = []
  for (let i = 0; i < moveLog.length; i += 2)
    movePairs.push({ num: i / 2 + 1, w: moveLog[i], b: moveLog[i + 1] })

  return (
    <div style={{ display: 'flex', gap: 14, padding: '24px 28px', alignItems: 'flex-start', justifyContent: 'center' }}>

      {/* Board column */}
      <div style={{ flexShrink: 0 }}>
        {/* Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, width: boardPx }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {mode === 'vs_ai'
              ? <><IconRobot size={14} color="var(--muted)" /> {t('vs_ai_label')} · {t('level_label')} {skillLevel}</>
              : isOnlineDuel
              ? <><IconSwords size={14} color="var(--muted)" /> {t('online_duel')} · {myColor === 'w' ? t('white_pieces') : t('black_pieces')}</>
              : <><IconSwords size={14} color="var(--muted)" /> {t('local_duel_label')}</>}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, padding: '5px 14px', borderRadius: 999, fontWeight: 700,
            fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5,
            background: waitingFor ? 'var(--bg-tag)' : thinking ? 'var(--tint-blue)' : finished ? 'var(--bg-card-soft)' : myTurn ? 'var(--tint-red)' : 'var(--tint-blue)',
            color: waitingFor ? 'var(--muted-soft)' : thinking ? '#2E4C8C' : finished ? 'var(--muted-soft)' : myTurn ? '#FA2D1A' : '#2E4C8C',
            border: `1.5px solid ${waitingFor ? 'var(--border)' : thinking ? 'var(--tint-blue-border)' : finished ? 'var(--border)' : myTurn ? 'var(--tint-red-border)' : 'var(--tint-blue-border)'}`,
          }}>
            {waitingFor === 'opponent'
              ? t('waiting_opponent')
              : thinking
              ? <><IconRobot size={13} color="var(--accent-blue)" /> {t('ai_thinking')}</>
              : finished
              ? <><IconFlag size={13} color="var(--muted-soft)" /> {t('game_over')}</>
              : myTurn
              ? <><IconLightning size={13} color="#FA2D1A" /> {mode === 'duel' && !isOnlineDuel ? (game.turn() === 'w' ? t('white_turn') : t('black_turn')) : t('your_turn')}</>
              : <><IconKnight size={13} color="var(--accent-blue)" /> {t('opponent_turn')}</>}
          </span>
        </div>

        {/* Board */}
        <Chessboard
          options={{
            id: 'chess-legends-board',
            position: game.fen(),
            boardOrientation: isOnlineDuel && myColor === 'b' ? 'black' : 'white',
            boardStyle: { borderRadius: 14, boxShadow: '0 8px 32px rgba(26,26,26,0.18)', width: boardPx, height: boardPx },
            lightSquareStyle: { backgroundColor: theme.light },
            darkSquareStyle:  { backgroundColor: theme.dark },
            customPieces,
            squareStyles: highlights,
            onSquareClick,
            onPieceDrop,
          }}
        />

        {/* Action buttons */}
        {!finished && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => endGame(game, 'loss')} style={{ ...btn('var(--tint-red)', '#FA2D1A', 'var(--tint-red-border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconFlag size={16} color="#FA2D1A" /> {t('resign')}
            </button>
            <button onClick={() => endGame(game, 'draw')} style={{ ...btn('var(--bg-card-soft)', 'var(--muted)', 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconHandshake size={16} color="var(--muted)" /> {t('draw_offer')}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 12, padding: '14px 20px', borderRadius: 14,
            background: resultConfig.bg, border: `1.5px solid ${resultConfig.border}`,
            color: resultConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            ...display, fontSize: 26,
          }}>
            {resultConfig.icon} {resultConfig.text}
          </div>
        )}
      </div>

      {/* Move log */}
      <div style={{
        width: 180, flexShrink: 0,
        background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16,
        padding: 16, display: 'flex', flexDirection: 'column',
        height: boardPx + 46,
      }}>
        <p style={{ ...display, fontSize: 18, color: 'var(--text)', margin: '0 0 12px' }}>{t('moves_log')}</p>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {movePairs.length === 0
            ? <p style={{ color: 'var(--muted-soft)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>{t('first_move')}</p>
            : movePairs.map(({ num, w, b }) => (
                <div key={num} style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: 'var(--muted-soft)', width: 22, textAlign: 'right', flexShrink: 0 }}>{num}.</span>
                  <span style={{ color: 'var(--text)', fontFamily: 'monospace', width: 52 }}>{w}</span>
                  {b && <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{b}</span>}
                </div>
              ))
          }
        </div>
        {finished && (
          <button onClick={() => navigator.clipboard.writeText(game.pgn())} style={{ ...btn('var(--bg-card-soft)', 'var(--muted)', 'var(--border)', '100%', 10), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IconClipboard size={16} color="var(--muted)" /> {t('copy_pgn')}
          </button>
        )}
      </div>
    </div>
  )
}

function btn(bg, color, border, width, mt = 0) {
  return {
    flex: width ? undefined : 1, width, marginTop: mt,
    padding: '10px 12px', background: bg, color,
    border: `1.5px solid ${border}`, borderRadius: 12,
    cursor: 'pointer', fontSize: 13, fontWeight: 700,
    fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5,
  }
}
