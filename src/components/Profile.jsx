import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPlayerGames, getProfile } from '../lib/supabase'
import { IconSwords, IconShield, IconKnight, IconCrown, IconSkull, IconHandshake, IconPin, IconCoin, IconStar, IconChessRook, IconLightning, IconFlame, IconSparkle } from './Icons'

const ACHIEVEMENT_ICON = {
  first_win: IconSwords,
  veteran:   IconShield,
  legend:    IconCrown,
  tactician: IconKnight,
  rich:      IconCoin,
  rated:     IconLightning,
  streak3:   IconFlame,
  collector: IconSparkle,
}
import { ACHIEVEMENTS, getUnlockedAchievements } from '../lib/achievements'
import { useLang } from '../lib/i18n'

const CLASS_STYLE = {
  attacker:  { icon: <IconSwords size={38} />, nameKey: 'class_attacker', accent: '#FA2D1A', bg: 'var(--tint-red)', border: 'var(--tint-red-border)' },
  defender:  { icon: <IconShield size={38} />, nameKey: 'class_defender', accent: '#2E4C8C', bg: 'var(--tint-blue)', border: 'var(--tint-blue-border)' },
  tactician: { icon: <IconKnight size={38} />, nameKey: 'class_tactician', accent: '#1A7A4A', bg: 'var(--tint-green)', border: 'var(--tint-green-border)' },
}

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function Profile({ profile: currentProfile, userId: userIdProp }) {
  const { t }                   = useLang()
  const params                  = useParams()
  const userId                  = userIdProp || params.userId
  const [profile, setProfile]   = useState(currentProfile)
  const [games, setGames]       = useState([])
  const [loading, setLoading]   = useState(true)
  const unlocked = getUnlockedAchievements()
  const targetId = userId || currentProfile?.id

  const RESULT_META = {
    win:  { label: t('result_win_label'),  icon: <IconCrown size={20} />,     color: 'var(--accent-blue)', bg: 'var(--tint-blue)' },
    loss: { label: t('result_loss_label'), icon: <IconSkull size={20} />,     color: '#FA2D1A', bg: 'var(--tint-red)' },
    draw: { label: t('result_draw_label'), icon: <IconHandshake size={20} />, color: 'var(--muted)', bg: 'var(--bg-tag)' },
  }

  useEffect(() => {
    if (!targetId) {
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([
      userId && userId !== currentProfile?.id ? getProfile(userId) : Promise.resolve(currentProfile),
      getPlayerGames(targetId, 15),
    ])
      .then(([p, g]) => {
        if (cancelled) return
        if (p) setProfile(p)
        setGames(g || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Profile load failed:', err)
        setGames([])
        setLoading(false)
      })
    return () => { cancelled = true }
    // We only want to re-fetch when targetId changes. currentProfile and userId
    // are inputs to building targetId — they're captured intentionally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid #2E4C8C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!profile) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted-soft)' }}>{t('profile_not_found')}</div>

  const clsBase = CLASS_STYLE[profile.class] || CLASS_STYLE.tactician
  const cls = { ...clsBase, name: t(clsBase.nameKey) }
  const winrate = profile.games_played > 0 ? Math.round(profile.games_won / profile.games_played * 100) : 0
  const isOwn = !userId || userId === currentProfile?.id
  const xpPct = Math.min(100, (profile.xp % 500) / 5)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 28px' }}>

      {/* Hero */}
      <div style={{
        background: '#2E4C8C', borderRadius: 24, padding: '32px 36px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -40, ...display, fontSize: 200, color: 'rgba(255,255,255,0.05)', lineHeight: 1 }}>
          {cls.icon}
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 18,
            background: cls.bg, border: `2px solid ${cls.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cls.accent, flexShrink: 0,
          }}>
            {cls.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#FA2D1A', color: 'var(--ink-light)', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '4px 12px', borderRadius: 999 }}>
                {cls.name}
              </span>
              {profile.is_pro && <span style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--ink-light)', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={11} filled color="currentColor" /> pro</span>}
              {isOwn && <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,243,225,0.7)', fontSize: 10, padding: '4px 12px', borderRadius: 999 }}>{t('you_label')}</span>}
            </div>
            <div style={{ ...display, fontSize: 44, color: 'var(--ink-light)', lineHeight: 0.92, marginBottom: 8 }}>{profile.username}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,243,225,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconPin size={14} color="rgba(255,243,225,0.6)" /> {profile.city || 'Алматы'} · {t('level_label_full')} {profile.level}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: t('rating_label'), value: profile.rating, accent: '#2E4C8C' },
          { label: t('games_label'),  value: profile.games_played },
          { label: t('stat_winrate'), value: `${winrate}%`, accent: winrate >= 60 ? '#1A7A4A' : winrate >= 40 ? '#92400e' : '#FA2D1A' },
          { label: t('xp_label'),     value: profile.xp, accent: '#7c3aed' },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ ...display, fontSize: 28, color: accent || 'var(--text)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{t('level_label_full')} {profile.level}</span>
          <span>{profile.xp % 500} / 500 xp → {t('level_short')}{profile.level + 1}</span>
        </div>
        <div style={{ height: 8, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${xpPct}%`, background: '#2E4C8C', borderRadius: 99 }} />
        </div>
      </div>

      {/* Achievements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ ...display, fontSize: 32, color: 'var(--text)' }}>{t('achievements_label')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {ACHIEVEMENTS.map(a => {
          const done = unlocked.includes(a.id)
          const Icon = ACHIEVEMENT_ICON[a.id] || IconStar
          return (
            <div key={a.id} title={a.desc} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 12,
              background: done ? 'var(--text)' : 'var(--bg-card)',
              border: `1.5px solid ${done ? 'var(--text)' : 'var(--border)'}`,
              opacity: done ? 1 : 0.45,
              transition: 'all 0.15s',
            }}>
              <span style={{ color: done ? 'var(--bg)' : 'var(--muted)', display: 'inline-flex' }}>
                <Icon size={18} color="currentColor" />
              </span>
              <div>
                <div style={{ ...display, fontSize: 14, color: done ? 'var(--bg)' : 'var(--text)', lineHeight: 1 }}>{a.name}</div>
                <div style={{ fontSize: 10, color: done ? 'rgba(255,243,225,0.5)' : 'var(--muted-soft)' }}>{a.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ ...display, fontSize: 32, color: 'var(--text)' }}>{t('game_history')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
      </div>

      {games.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 18, padding: '48px 16px', textAlign: 'center' }}>
          <div style={{ color: 'var(--border)', marginBottom: 12 }}>
            <IconChessRook size={64} color="currentColor" />
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-soft)', margin: 0 }}>{t('no_games')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {games.map(game => {
            const res = RESULT_META[game.result] || {}
            return (
              <div key={game.id} style={{
                background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14,
                padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: res.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: res.color }}>
                    {res.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: res.color }}>{res.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-soft)' }}>
                      vs {game.opponent} · {game.mode === 'vs_ai' ? `${t('ai_level_prefix')}${game.skill_level}` : game.mode} · {new Date(game.created_at).toLocaleDateString('ru')}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {game.game_rating && (
                    <div style={{ ...display, fontSize: 22, color: game.game_rating >= 70 ? '#2E4C8C' : game.game_rating >= 50 ? '#92400e' : '#FA2D1A' }}>
                      {game.game_rating}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
                    {game.coins_delta !== 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: game.coins_delta > 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        {game.coins_delta > 0 ? '+' : ''}{game.coins_delta}<IconCoin size={11} color="currentColor" />
                      </span>
                    )}
                    {game.xp_delta > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)' }}>+{game.xp_delta}xp</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
