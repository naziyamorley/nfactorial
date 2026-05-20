import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDuel, getPlayerGames } from '../lib/supabase'
import {
  IconChessRook, IconChessKing, IconTrophy, IconScroll, IconBook, IconRobot,
  IconStar, IconArrowRight, IconCrown, IconSkull, IconHandshake,
  IconSwords, IconShield, IconKnight, IconSprout, IconTarget, IconLightning, IconFlame, IconDiamond,
  IconCoin,
} from './Icons'
import Avatar from './Avatar'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: '-0.01em' }

const AI_LEVEL_DEFS = [
  { level: 1,  key: 'level_novice',   icon: <IconSprout size={18} /> },
  { level: 5,  key: 'level_amateur',  icon: <IconTarget size={18} /> },
  { level: 10, key: 'level_semipro',  icon: <IconLightning size={18} /> },
  { level: 15, key: 'level_advanced', icon: <IconFlame size={18} /> },
  { level: 20, key: 'level_gm',       icon: <IconDiamond size={18} /> },
]

export default function Dashboard({ profile, onStartGame, onSpendCoins }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [showNewGame, setShowNewGame] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(10)

  useEffect(() => {
    if (!profile?.id) return
    getPlayerGames(profile.id, 5).then(setGames).catch(() => setGames([]))
  }, [profile?.id])

  if (showNewGame) {
    return (
      <NewGameFlow
        profile={profile}
        onStart={(opts) => { setShowNewGame(false); onStartGame(opts) }}
        onBack={() => setShowNewGame(false)}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        t={t}
      />
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px 32px', width: '100%' }}>
      {/* ── 2 big hero tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <HeroTile
          title={t('home_tile_new_game')}
          onClick={() => setShowNewGame(true)}
          accent="var(--primary)"
          decoration={
            <ChessBoardArt />
          }
        />
        <HeroTile
          title={t('home_tile_tournaments')}
          onClick={() => navigate('/tournament')}
          accent="var(--accent-amber)"
          decoration={
            <TrophyArt />
          }
        />
      </div>

      {/* ── Row of 4 quick tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <QuickTile to="/profile" label={t('quick_history')} icon={<HistoryIcon />} />
        <QuickTile to="/lessons" label={t('quick_learn')}   icon={<IconBook size={22} color="currentColor" />} />
        <QuickTile to="/coach"   label={t('quick_chat')}    icon={<IconRobot size={22} color="currentColor" />} />
        <QuickTile to="/leaderboard" label={t('quick_rank')} icon={<IconCrown size={22} color="currentColor" />} badge={profile?.level} />
      </div>

      {/* ── Premium banner ── */}
      {profile && !profile.is_pro && (
        <Link to="/pro" style={{
          display: 'block', textDecoration: 'none',
          background: 'linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)',
          borderRadius: 16, padding: '14px 16px', marginBottom: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -8, bottom: -8, color: 'rgba(255,255,255,0.18)' }}>
            <IconChessKing size={90} color="currentColor" />
          </div>
          <div style={{ position: 'relative', maxWidth: '70%' }}>
            <div style={{ ...display, fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>
              {t('home_pro_title')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 1.35 }}>
              {t('home_pro_desc')}
            </div>
          </div>
        </Link>
      )}

      {/* ── History section ── */}
      <SectionHeader title={t('home_history_title')} to="/profile" t={t} />
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
        {games.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted-soft)', fontSize: 13 }}>
            {t('no_games')}
          </div>
        ) : games.slice(0, 4).map((g, i) => (
          <GameRow key={g.id || i} game={g} isLast={i === games.slice(0, 4).length - 1} t={t} />
        ))}
      </div>

      {/* ── Tournaments link row ── */}
      <Link to="/tournament" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderRadius: 16,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        textDecoration: 'none', color: 'var(--text)',
      }}>
        <span style={{ ...display, fontSize: 15 }}>{t('home_my_tournaments')}</span>
        <IconArrowRight size={18} color="var(--muted)" />
      </Link>
    </div>
  )
}

// ── Hero tile with big card + decoration ───────────────────────────────────
function HeroTile({ title, onClick, decoration, accent }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', overflow: 'hidden',
      aspectRatio: '1 / 1.05',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '14px 14px 16px',
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      color: 'var(--text)', fontFamily: 'inherit',
      transition: 'transform 0.15s ease, border-color 0.15s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {decoration}
      </div>
      <div style={{ position: 'relative', ...display, fontSize: 18, fontWeight: 800 }}>{title}</div>
    </button>
  )
}

function QuickTile({ to, label, icon, badge }) {
  return (
    <Link to={to} style={{
      aspectRatio: '1 / 1',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      textDecoration: 'none', color: 'var(--text)',
      position: 'relative',
    }}>
      {badge !== undefined && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          minWidth: 16, height: 16, padding: '0 5px', borderRadius: 8,
          background: 'var(--primary)', color: '#FFFFFF',
          fontSize: 9, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{badge}</span>
      )}
      <span style={{ color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.1 }}>{label}</span>
    </Link>
  )
}

function SectionHeader({ title, to, t }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderRadius: '16px 16px 0 0',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderBottom: 'none',
      textDecoration: 'none', color: 'var(--text)', marginBottom: 0,
      marginTop: 2,
    }}>
      <span style={{ ...display, fontSize: 15 }}>{title}</span>
      <IconArrowRight size={18} color="var(--muted)" />
    </Link>
  )
}

function GameRow({ game, isLast, t }) {
  const RESULT_META = {
    win:  { label: t('result_win_label'),  color: 'var(--accent-green)', sign: '+' },
    loss: { label: t('result_loss_label'), color: 'var(--accent-red)',   sign: '' },
    draw: { label: t('result_draw_label'), color: 'var(--muted)',        sign: '' },
  }
  const res = RESULT_META[game.result] || RESULT_META.draw
  const opponent = game.opponent || (game.mode === 'vs_ai' ? `ai ${game.skill_level || ''}` : '@player')
  const date = game.created_at ? new Date(game.created_at).toLocaleDateString('ru') : ''

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderTop: '1px solid var(--border-soft)',
      borderRadius: isLast ? '0 0 16px 16px' : 0,
    }}>
      <Avatar name={opponent} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {opponent}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginTop: 1 }}>{date}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 6,
          background: 'transparent', border: `1px solid ${res.color}40`,
          fontSize: 11, fontWeight: 700, color: res.color,
        }}>
          {res.label}
        </span>
        {game.game_rating !== undefined && game.game_rating !== null && (
          <div style={{ fontSize: 11, color: res.color, fontWeight: 700, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
            {res.sign}{game.coins_delta || 0}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Decorative chess board image ──────────────────────────────────────────
function ChessBoardArt() {
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const dark = (r + c) % 2 === 1
      cells.push(<div key={`${r}-${c}`} style={{
        width: 26, height: 26,
        background: dark ? 'var(--board-dark)' : 'var(--board-light)',
      }} />)
    }
  }
  return (
    <div style={{
      transform: 'rotate(-8deg) translateY(-6px)',
      display: 'grid', gridTemplateColumns: 'repeat(4, 26px)',
      borderRadius: 6, overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
    }}>
      {cells}
    </div>
  )
}

function TrophyArt() {
  return (
    <div style={{
      transform: 'translateY(-4px)', color: 'var(--accent-amber)',
      filter: 'drop-shadow(0 8px 16px rgba(245,165,36,0.35))',
    }}>
      <IconTrophy size={88} color="currentColor" />
    </div>
  )
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}

// ── New Game flow (inline) ─────────────────────────────────────────────────
function NewGameFlow({ profile, onStart, onBack, selectedLevel, setSelectedLevel, t }) {
  const [mode, setMode] = useState(null) // 'vs_ai' | 'duel_local' | 'duel_online'
  const [creatingDuel, setCreatingDuel] = useState(false)
  const [duelLink, setDuelLink] = useState(null)
  const [error, setError] = useState(null)

  async function handleStart() {
    setError(null)
    if (mode === 'vs_ai') {
      onStart({ mode: 'vs_ai', skillLevel: selectedLevel })
      return
    }
    if (mode === 'duel_local') {
      onStart({ mode: 'duel' })
      return
    }
    if (mode === 'duel_online') {
      setCreatingDuel(true)
      try {
        if (!profile?.id) throw new Error('no profile — sign in first')
        const duel = await createDuel(profile.id)
        const link = `${window.location.origin}/duel/${duel.invite_code}`
        setDuelLink(link)
        try { await navigator.clipboard.writeText(link) } catch { /* ignore */ }
      } catch (e) {
        setError(e.message || t('newgame_duel_error'))
      } finally {
        setCreatingDuel(false)
      }
    }
  }

  function openCreatedDuel() {
    if (!duelLink) return
    const code = duelLink.split('/').pop()
    onStart({ mode: 'duel', inviteCode: code })
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px', width: '100%' }}>
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text)', fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
        padding: '8px 0', marginBottom: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t('newgame_title')}
      </button>

      <div style={{
        display: 'flex', justifyContent: 'center', padding: '24px 0 16px',
        color: 'var(--primary)',
        filter: 'drop-shadow(0 16px 40px rgba(168,85,247,0.35))',
      }}>
        <IconChessRook size={120} color="currentColor" />
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', margin: '0 0 18px' }}>
        {t('newgame_choose')}
      </p>

      {/* Mode list — 3 distinct options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <ModeRow
          icon={<IconRobot size={20} color="currentColor" />}
          title={t('newgame_vs_ai')}
          subtitle={t('newgame_vs_ai_sub')}
          active={mode === 'vs_ai'}
          onClick={() => setMode('vs_ai')}
        />
        <ModeRow
          icon={<IconSwords size={20} color="currentColor" />}
          title={t('newgame_duel_local')}
          subtitle={t('newgame_duel_local_sub')}
          active={mode === 'duel_local'}
          onClick={() => setMode('duel_local')}
        />
        <ModeRow
          icon={<IconSwords size={20} color="currentColor" />}
          title={t('newgame_duel_online')}
          subtitle={t('newgame_duel_online_sub')}
          active={mode === 'duel_online'}
          onClick={() => setMode('duel_online')}
        />
      </div>

      {/* AI level picker */}
      {mode === 'vs_ai' && (
        <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--muted-soft)', marginBottom: 10, textTransform: 'uppercase' }}>
            {t('newgame_difficulty')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {AI_LEVEL_DEFS.map(({ level, icon }) => {
              const active = selectedLevel === level
              return (
                <button key={level} onClick={() => setSelectedLevel(level)} style={{
                  padding: '12px 4px', borderRadius: 10, cursor: 'pointer',
                  background: active ? 'var(--primary)' : 'transparent',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                  color: active ? '#FFFFFF' : 'var(--muted)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  fontFamily: 'inherit',
                }}>
                  {icon}
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{level}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Online duel — link card */}
      {duelLink && (
        <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            {t('newgame_duel_link_label')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: 10 }}>{duelLink}</div>
          <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginBottom: 10 }}>{t('newgame_duel_link_hint')}</div>
          <button onClick={openCreatedDuel} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--primary)', color: '#FFFFFF', fontWeight: 700, fontSize: 13,
            fontFamily: 'inherit',
          }}>
            {t('newgame_open_board')}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--tint-red)', border: '1px solid var(--tint-red-border)', borderRadius: 10, color: 'var(--accent-red)', fontSize: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button
        disabled={!mode || creatingDuel}
        onClick={handleStart}
        style={{
          width: '100%', padding: '15px',
          background: mode && !creatingDuel ? 'var(--primary)' : 'var(--bg-card)',
          color: mode && !creatingDuel ? '#FFFFFF' : 'var(--muted-soft)',
          border: mode && !creatingDuel ? 'none' : '1px solid var(--border)',
          borderRadius: 14, cursor: mode && !creatingDuel ? 'pointer' : 'not-allowed',
          fontFamily: "'Oswald', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: 0.5,
          transition: 'all 0.15s',
        }}
      >
        {creatingDuel ? '...' : mode === 'duel_online' ? t('newgame_create_link') : t('newgame_start')}
      </button>
    </div>
  )
}

function ModeRow({ icon, title, subtitle, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px', borderRadius: 14,
      background: active ? 'var(--primary-tint)' : 'var(--bg-card)',
      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
      cursor: 'pointer', fontFamily: 'inherit',
      color: 'var(--text)', textAlign: 'left',
    }}>
      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{title}</span>
        {subtitle && <span style={{ display: 'block', fontSize: 11, color: 'var(--muted-soft)', marginTop: 2 }}>{subtitle}</span>}
      </span>
      <IconArrowRight size={18} color="var(--muted)" />
    </button>
  )
}
