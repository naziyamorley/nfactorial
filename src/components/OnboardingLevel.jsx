import { useState } from 'react'
import { updateProfile } from '../lib/supabase'
import { IconSprout, IconTarget, IconLightning, IconFlame, IconDiamond, IconArrowRight } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: '-0.01em' }

const LEVELS = [
  {
    id: 'beginner', rating: 800,
    Icon: IconSprout, color: 'var(--accent-green)',
    titleKey: 'onb_beginner_title', descKey: 'onb_beginner_desc',
  },
  {
    id: 'novice', rating: 1000,
    Icon: IconTarget, color: 'var(--primary)',
    titleKey: 'onb_novice_title', descKey: 'onb_novice_desc',
  },
  {
    id: 'amateur', rating: 1300,
    Icon: IconLightning, color: 'var(--accent-blue)',
    titleKey: 'onb_amateur_title', descKey: 'onb_amateur_desc',
  },
  {
    id: 'advanced', rating: 1600,
    Icon: IconFlame, color: 'var(--accent-amber)',
    titleKey: 'onb_advanced_title', descKey: 'onb_advanced_desc',
  },
  {
    id: 'expert', rating: 2000,
    Icon: IconDiamond, color: 'var(--accent-red)',
    titleKey: 'onb_expert_title', descKey: 'onb_expert_desc',
  },
]

export default function OnboardingLevel({ userId, onComplete }) {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    if (!selected) return
    setBusy(true)
    const level = LEVELS.find(l => l.id === selected)
    try {
      await updateProfile(userId, {
        rating: level.rating,
        onboarded: true,
      })
    } catch (e) {
      // onboarded column may not exist — still ok, rating is set
      console.warn('onboarding save:', e)
    }
    onComplete(level.rating)
  }

  async function skip() {
    setBusy(true)
    try {
      await updateProfile(userId, { onboarded: true })
    } catch { /* ignore */ }
    onComplete(1000)
  }

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', padding: '20px 16px 24px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', padding: '4px 12px', borderRadius: 999,
            background: 'var(--primary-tint)', color: 'var(--primary)',
            fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          }}>
            {t('onb_badge')}
          </span>
          <div style={{ ...display, fontSize: 32, color: 'var(--text)', lineHeight: 1.05, marginTop: 12, marginBottom: 8 }}>
            {t('onb_title')}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
            {t('onb_desc')}
          </p>
        </div>

        {/* Level cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {LEVELS.map(({ id, Icon, color, titleKey, descKey, rating }) => {
            const active = selected === id
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 14,
                  background: active ? 'var(--primary-tint)' : 'var(--bg-card)',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${color}15`, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color="currentColor" />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t(titleKey)}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.35 }}>{t(descKey)}</span>
                </span>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 700, color: active ? color : 'var(--muted-soft)',
                  fontFamily: 'monospace', padding: '3px 7px',
                  background: active ? 'var(--bg-card)' : 'transparent', borderRadius: 5,
                }}>
                  ~{rating}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <button
          onClick={confirm}
          disabled={!selected || busy}
          style={{
            width: '100%', padding: '15px',
            background: selected && !busy ? 'var(--primary)' : 'var(--bg-card)',
            color: selected && !busy ? '#FFFFFF' : 'var(--muted-soft)',
            border: selected && !busy ? 'none' : '1px solid var(--border)',
            borderRadius: 14, cursor: selected && !busy ? 'pointer' : 'not-allowed',
            fontFamily: "'Oswald', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: 0.5,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 8,
          }}
        >
          {busy ? '...' : <>{t('onb_confirm')} <IconArrowRight size={16} color="currentColor" /></>}
        </button>
        <button
          onClick={skip}
          disabled={busy}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent', color: 'var(--muted)',
            border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          }}
        >
          {t('onb_skip')}
        </button>
      </div>
    </div>
  )
}
