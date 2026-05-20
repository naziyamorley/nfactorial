import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createDuel } from '../lib/supabase'
import { IconRobot, IconSwords, IconLightning, IconShield, IconKnight, IconSprout, IconTarget, IconFlame, IconDiamond, IconCoin, IconChessKing, IconStar, IconArrowRight } from './Icons'
import SkinSelector from './SkinSelector'
import PieceShop from './PieceShop'
import DailyQuests from './DailyQuests'
import Competitions from './Competitions'
import { useLang } from '../lib/i18n'

const CLASS_STYLE = {
  attacker:  { icon: <IconSwords size={28} />, nameKey: 'class_attacker', accent: '#FA2D1A', bg: 'var(--tint-red)', border: 'var(--tint-red-border)' },
  defender:  { icon: <IconShield size={28} />, nameKey: 'class_defender', accent: '#2E4C8C', bg: 'var(--tint-blue)', border: 'var(--tint-blue-border)' },
  tactician: { icon: <IconKnight size={28} />, nameKey: 'class_tactician', accent: '#1A7A4A', bg: 'var(--tint-green)', border: 'var(--tint-green-border)' },
}

const AI_LEVEL_DEFS = [
  { level: 1,  key: 'level_novice',   icon: <IconSprout size={18} /> },
  { level: 5,  key: 'level_amateur',  icon: <IconTarget size={18} /> },
  { level: 10, key: 'level_semipro',  icon: <IconLightning size={18} /> },
  { level: 15, key: 'level_advanced', icon: <IconFlame size={18} /> },
  { level: 20, key: 'level_gm',       icon: <IconDiamond size={18} /> },
]

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900, lineHeight: 0.92 }

export default function Dashboard({ profile, onStartGame, onSpendCoins }) {
  const { t }                             = useLang()
  const [selectedLevel, setSelectedLevel] = useState(10)
  const [creatingDuel, setCreatingDuel]   = useState(false)
  const [duelLink, setDuelLink]           = useState(null)

  const clsBase = CLASS_STYLE[profile?.class] || CLASS_STYLE.tactician
  const cls = { ...clsBase, name: t(clsBase.nameKey) }
  const winrate = profile?.games_played > 0
    ? Math.round(profile.games_won / profile.games_played * 100) : 0
  const xpPct = Math.min(100, ((profile?.xp || 0) % 500) / 5)

  async function handleCreateDuel() {
    if (!profile) return
    setCreatingDuel(true)
    try {
      const duel = await createDuel(profile.id)
      const link = `${window.location.origin}/duel/${duel.invite_code}`
      setDuelLink(link)
      await navigator.clipboard.writeText(link)
    } catch (e) { console.error(e) }
    finally { setCreatingDuel(false) }
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 940, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{
        background: '#2E4C8C', borderRadius: 24, padding: '32px 36px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20,
        minHeight: 180,
      }}>
        {/* Decorative chess king — replaces ♔ unicode */}
        <div style={{
          position: 'absolute', right: -20, top: -10,
          color: 'rgba(255,255,255,0.06)',
          userSelect: 'none', pointerEvents: 'none', lineHeight: 1,
        }}>
          <IconChessKing size={200} color="currentColor" />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FA2D1A', color: 'var(--ink-light)',
            padding: '5px 14px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12,
          }}>
            {cls.icon} {cls.name}
          </div>

          <div style={{ ...display, fontSize: 56, color: 'var(--ink-light)', marginBottom: 8 }}>
            {profile?.username || t('legend')}
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { val: `${t('level_short')} ${profile?.level || 1}`, label: null, icon: null },
              { val: `${profile?.rating || 1000}`, label: t('rating_label'), icon: null },
              { val: `${profile?.coins || 0}`, label: t('coins_label'), icon: <IconCoin size={14} color="currentColor" /> },
            ].map(({ val, label, icon }) => (
              <span key={val} style={{ fontSize: 14, color: 'rgba(255,243,225,0.7)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {label && <span style={{ opacity: 0.5 }}>{label} </span>}
                <span style={{ fontWeight: 600, color: 'var(--ink-light)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{val}{icon}</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 20px', textAlign: 'right' }}>
            <div style={{ ...display, fontSize: 36, color: 'var(--ink-light)', lineHeight: 1 }}>{profile?.games_played || 0}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,243,225,0.6)', marginTop: 2 }}>{t('games_label')}</div>
          </div>
          <div style={{ background: '#FA2D1A', borderRadius: 14, padding: '12px 20px', textAlign: 'right' }}>
            <div style={{ ...display, fontSize: 36, color: 'var(--ink-light)', lineHeight: 1 }}>{winrate}%</div>
            <div style={{ fontSize: 11, color: 'rgba(255,243,225,0.7)', marginTop: 2 }}>{t('wins_label')}</div>
          </div>
        </div>
      </div>

      {/* Pro upsell — shown only if user is not pro yet */}
      {profile && !profile.is_pro && (
        <Link to="/pro" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '14px 20px',
          background: 'linear-gradient(135deg, var(--tint-amber) 0%, var(--tint-red) 100%)',
          border: '1.5px solid var(--tint-amber-border)', borderRadius: 14,
          marginBottom: 16, textDecoration: 'none', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#F5C218', display: 'flex' }}><IconStar size={22} filled color="currentColor" /></span>
            <div>
              <div style={{ ...display, fontSize: 18, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{t('pro_title')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('pro_subtitle')}</div>
            </div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10,
            background: 'var(--text)', color: 'var(--bg)',
            fontFamily: "'Oswald', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
          }}>
            {t('pro_cta')} <IconArrowRight size={12} color="currentColor" />
          </span>
        </Link>
      )}

      {/* XP bar */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px 20px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{t('xp_label')}</span>
          <span>{profile?.xp || 0} / {(profile?.level || 1) * 500} xp</span>
        </div>
        <div style={{ height: 8, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${xpPct}%`, background: '#2E4C8C', borderRadius: 99, transition: 'width 0.6s' }} />
        </div>
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)' }}>{t('choose_mode')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1 }} />
      </div>

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>

        {/* vs AI */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ ...display, fontSize: 32, color: 'var(--text)' }}>vs ai</div>
            <IconRobot size={36} color="var(--accent-blue)" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>{t('vs_ai_desc')}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, flex: 1 }}>
            {AI_LEVEL_DEFS.map(({ level, key, icon }) => {
              const active = selectedLevel === level
              return (
                <button key={level} onClick={() => setSelectedLevel(level)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
                  border: active ? '1.5px solid #2E4C8C' : '1.5px solid var(--border)',
                  background: active ? 'var(--tint-blue)' : 'transparent',
                  color: active ? 'var(--accent-blue)' : 'var(--muted)', fontWeight: active ? 700 : 400,
                  transition: 'all 0.12s',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: active ? 'var(--accent-blue)' : 'var(--muted-soft)' }}>{icon}</span>
                    {t(key)}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>{t('level_short')} {level}</span>
                </button>
              )
            })}
          </div>

          <div style={{
            background: `repeating-conic-gradient(var(--text) 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px`,
            borderRadius: 16, padding: 5, border: '1.5px solid var(--text)',
          }}>
            <button onClick={() => onStartGame({ mode: 'vs_ai', skillLevel: selectedLevel })} style={{
              width: '100%', padding: '11px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: '#FA2D1A', color: '#fff',
              fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 1,
            }}>
              {t('play')}
            </button>
          </div>
        </div>

        {/* Duel */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ ...display, fontSize: 32, color: 'var(--text)' }}>{t('duel_title')}</div>
            <IconSwords size={36} color="#FA2D1A" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>{t('duel_desc')}</p>

          <div style={{ flex: 1 }} />

          <button onClick={() => onStartGame({ mode: 'duel' })} style={{
            padding: '13px', borderRadius: 14, marginBottom: 8,
            border: '1.5px solid var(--text)', cursor: 'pointer',
            background: 'var(--text)', color: 'var(--bg)',
            fontWeight: 700, fontSize: 14,
            fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
          }}>
            {t('duel_local')}
          </button>

          {duelLink ? (
            <div>
              <div style={{ background: 'var(--tint-blue)', border: '1.5px solid var(--tint-blue-border)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--accent-blue)', fontWeight: 700 }}>{t('link_copied')}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{duelLink}</p>
              </div>
              <button onClick={() => onStartGame({ mode: 'duel', inviteCode: duelLink.split('/').pop() })} style={{
                width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: '#2E4C8C', color: 'var(--ink-light)', fontWeight: 700, fontSize: 13,
                fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
              }}>
                {t('open_board')}
              </button>
            </div>
          ) : (
            <button onClick={handleCreateDuel} disabled={creatingDuel} style={{
              padding: '11px', borderRadius: 12, cursor: 'pointer',
              border: '1.5px solid var(--tint-blue-border)',
              background: creatingDuel ? '#F5F5F5' : 'var(--tint-blue)',
              color: creatingDuel ? '#aaa' : 'var(--accent-blue)',
              fontWeight: 700, fontSize: 13,
              fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
            }}>
              {creatingDuel ? t('creating') : t('duel_online')}
            </button>
          )}
        </div>

      </div>

      {/* Daily quests */}
      <DailyQuests
        onEarnReward={(reward) => {
          if (onSpendCoins && reward.coins > 0) onSpendCoins(-reward.coins)
        }}
      />

      {/* Competitions board */}
      <Competitions />

      {/* Board skin selector */}
      <div style={{ marginBottom: 28 }}>
        <SkinSelector playerLevel={profile?.level || 1} />
      </div>

      {/* Piece shop */}
      <div style={{ marginBottom: 28 }}>
        <PieceShop profile={profile} onSpendCoins={onSpendCoins} />
      </div>

    </div>
  )
}
