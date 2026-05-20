import { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { IconFlag, IconHandshake, IconClipboard, IconCrown, IconSkull, IconRobot, IconLightning, IconKnight, IconSwords } from './Icons'
import Avatar from './Avatar'
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

  // Board size — recomputes on window resize. Reference layout: board fills width.
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    function onResize() { setViewport({ w: window.innerWidth, h: window.innerHeight }) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // Board adapts to viewport width; max 520 on desktop, full-width minus padding on mobile.
  const boardPx = Math.max(260, Math.min(520, viewport.w - 32))

  const resultConfig = {
    win:  { icon: <IconCrown size={28} />,     text: t('win_text'),  color: 'var(--accent-blue)', bg: 'var(--tint-blue)', border: 'var(--tint-blue-border)' },
    loss: { icon: <IconSkull size={28} />,     text: t('loss_text'), color: '#FA2D1A', bg: 'var(--tint-red)', border: 'var(--tint-red-border)' },
    draw: { icon: <IconHandshake size={28} />, text: t('draw_text'), color: 'var(--muted)', bg: 'var(--bg-card-soft)', border: 'var(--border)' },
  }[result] ?? {}

  const movePairs = []
  for (let i = 0; i < moveLog.length; i += 2)
    movePairs.push({ num: i / 2 + 1, w: moveLog[i], b: moveLog[i + 1] })

  const oppName = mode === 'vs_ai' ? `ai · ${t('level_short')} ${skillLevel}` : (isOnlineDuel ? '@opponent' : 'player 2')
  const oppRating = mode === 'vs_ai' ? 1000 + skillLevel * 60 : 1432

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '12px 16px 24px', width: '100%' }}>

      {/* Opponent panel */}
      <PlayerPanel
        name={oppName}
        rating={oppRating}
        title={mode === 'vs_ai' && skillLevel >= 15 ? 'gm' : null}
        active={!myTurn && !finished}
        myTurn={false}
      />

      {/* Board */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <Chessboard
          options={{
            id: 'chess-legends-board',
            position: game.fen(),
            boardOrientation: isOnlineDuel && myColor === 'b' ? 'black' : 'white',
            boardStyle: { borderRadius: 10, boxShadow: '0 12px 32px rgba(168,85,247,0.18)', width: boardPx, height: boardPx },
            lightSquareStyle: { backgroundColor: theme.light },
            darkSquareStyle:  { backgroundColor: theme.dark },
            customPieces,
            squareStyles: highlights,
            onSquareClick,
            onPieceDrop,
          }}
        />
      </div>

      {/* My panel */}
      <PlayerPanel
        name={profile?.username || 'you'}
        rating={profile?.rating || 1500}
        active={myTurn && !finished}
        myTurn={true}
      />

      {/* Status pill — when something to say */}
      {(waitingFor || thinking || finished) && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center', fontSize: 12, color: 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {waitingFor === 'opponent' ? <>{t('waiting_opponent')}</>
            : thinking ? <><IconRobot size={14} color="var(--primary)" /> {t('ai_thinking')}</>
            : <>{resultConfig.icon} <span style={{ color: resultConfig.color, fontWeight: 700 }}>{resultConfig.text}</span></>}
        </div>
      )}

      {/* Action buttons row — like reference */}
      {!finished && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <ActionBtn onClick={() => endGame(game, 'draw')} icon={<HalfIcon />} label={t('draw_offer')} />
          <ActionBtn onClick={() => endGame(game, 'loss')} icon={<IconFlag size={14} color="currentColor" />} label={t('resign')} accent="red" />
          <ActionBtn onClick={() => navigator.clipboard.writeText(game.pgn())} icon={<MoreIcon />} label={t('more') || '...'} />
        </div>
      )}

      {/* Tabs: moves / chat */}
      <div style={{ marginTop: 18, borderBottom: '1px solid var(--border)', display: 'flex', gap: 24, padding: '0 4px' }}>
        <Tab active>{t('moves_log')}</Tab>
        <Tab>{t('game_chat') || 'чат'}</Tab>
      </div>

      {/* Move list */}
      <div style={{ paddingTop: 8, maxHeight: 240, overflowY: 'auto' }}>
        {movePairs.length === 0 ? (
          <p style={{ color: 'var(--muted-soft)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>{t('first_move')}</p>
        ) : (
          movePairs.map(({ num, w, b }) => (
            <div key={num} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 24px 1fr 60px',
              alignItems: 'center', padding: '8px 4px',
              borderBottom: '1px solid var(--border-soft)',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--muted-soft)', fontFamily: 'monospace', fontSize: 11 }}>{num}</span>
              <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'monospace' }}>{w}</span>
              {b ? <IconArrowSmall /> : <span />}
              <span style={{ color: 'var(--muted)', fontWeight: 500, fontFamily: 'monospace' }}>{b || ''}</span>
              <span style={{ color: 'var(--muted-soft)', fontSize: 10, fontFamily: 'monospace', textAlign: 'right' }}>-00:0{num % 10}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Player panel (top opp, bottom me) ─────────────────────────────────────
function PlayerPanel({ name, rating, title, active, myTurn }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 14,
      background: 'var(--bg-card)', border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
      transition: 'border-color 0.15s',
    }}>
      <Avatar name={name} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, background: 'var(--primary)', color: '#FFFFFF', letterSpacing: 0.5 }}>{title.toUpperCase()}</span>}
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-soft)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 1, fontFamily: 'monospace' }}>
          <CrossSmall /> {rating}
        </div>
      </div>
      <div style={{
        padding: '6px 14px', borderRadius: 10,
        background: active ? 'var(--primary)' : 'var(--bg-tag)',
        color: active ? '#FFFFFF' : 'var(--muted)',
        fontSize: 18, fontWeight: 800, fontFamily: 'monospace',
        minWidth: 70, textAlign: 'center',
      }}>
        {active ? '29:59' : '29:57'}
      </div>
    </div>
  )
}

function ActionBtn({ onClick, icon, label, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 8px', borderRadius: 10,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      cursor: 'pointer', color: accent === 'red' ? 'var(--accent-red)' : 'var(--text)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12,
    }}>
      {icon} {label}
    </button>
  )
}

function Tab({ active, children }) {
  return (
    <button style={{
      padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer',
      borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
      color: active ? 'var(--text)' : 'var(--muted)',
      fontFamily: 'inherit', fontWeight: active ? 700 : 600, fontSize: 13,
    }}>
      {children}
    </button>
  )
}

function HalfIcon() {
  return <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>½</span>
}
function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  )
}
function IconArrowSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function CrossSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
    </svg>
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
