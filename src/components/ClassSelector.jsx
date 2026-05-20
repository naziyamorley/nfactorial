import { useState } from 'react'
import { updateProfile } from '../lib/supabase'
import { IconSwords, IconShield, IconKnight } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const CLASSES_BASE = [
  {
    id: 'attacker',
    icon: <IconSwords size={44} />,
    nameKey: 'class_attacker',
    accent: '#FA2D1A',
    bg: 'var(--tint-red)',
    border: 'var(--tint-red-border)',
    badgeKey: 'class_attacker_badge',
    styleKey: 'class_attacker_style',
    bonusKeys: ['class_attacker_bonus1', 'class_attacker_bonus2', 'class_attacker_bonus3'],
  },
  {
    id: 'defender',
    icon: <IconShield size={44} />,
    nameKey: 'class_defender',
    accent: '#7C3AED',
    bg: 'var(--tint-blue)',
    border: 'var(--tint-blue-border)',
    badgeKey: 'class_defender_badge',
    styleKey: 'class_defender_style',
    bonusKeys: ['class_defender_bonus1', 'class_defender_bonus2', 'class_defender_bonus3'],
  },
  {
    id: 'tactician',
    icon: <IconKnight size={44} />,
    nameKey: 'class_tactician',
    accent: '#1A7A4A',
    bg: 'var(--tint-green)',
    border: 'var(--tint-green-border)',
    badgeKey: 'class_tactician_badge',
    styleKey: 'class_tactician_style',
    bonusKeys: ['class_tactician_bonus1', 'class_tactician_bonus2', 'class_tactician_bonus3'],
  },
]

export default function ClassSelector({ userId, onComplete }) {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(false)

  async function confirm() {
    if (!selected) return
    setLoading(true)
    await updateProfile(userId, { class: selected })
    onComplete(selected)
  }

  const selectedCls = CLASSES_BASE.find(c => c.id === selected)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-block', background: '#FA2D1A', color: 'var(--ink-light)', fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: '5px 16px', borderRadius: 999, marginBottom: 20 }}>
          {t('welcome_legend')}
        </div>
        <div style={{ ...display, fontSize: 72, color: 'var(--text)', lineHeight: 0.88, marginBottom: 20 }}>
          {t('choose_class_title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
        </div>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)', maxWidth: 380 }}>
          {t('class_choice_desc')}
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, width: '100%', maxWidth: 880, marginBottom: 40 }}>
        {CLASSES_BASE.map(cls => {
          const isSelected = selected === cls.id
          return (
            <button
              key={cls.id}
              onClick={() => setSelected(cls.id)}
              style={{
                position: 'relative', textAlign: 'left', padding: '28px 26px',
                borderRadius: 22,
                border: `2px solid ${isSelected ? cls.accent : 'var(--border)'}`,
                background: isSelected ? cls.bg : 'var(--bg-card)',
                cursor: 'pointer', transition: 'all 0.15s',
                transform: isSelected ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                boxShadow: isSelected ? `0 12px 32px ${cls.accent}28` : '0 2px 8px rgba(26,26,26,0.06)',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 18, right: 18,
                  width: 24, height: 24, borderRadius: '50%',
                  background: cls.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}

              <div style={{ marginBottom: 16, color: cls.accent }}>{cls.icon}</div>

              <div style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 2,
                padding: '4px 12px', borderRadius: 999, marginBottom: 12,
                background: cls.bg, color: cls.accent, border: `1.5px solid ${cls.border}`,
              }}>
                {t(cls.badgeKey)}
              </div>

              <div style={{ ...display, fontSize: 32, color: isSelected ? cls.accent : 'var(--text)', lineHeight: 1, marginBottom: 8 }}>{t(cls.nameKey)}</div>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t(cls.styleKey)}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cls.bonusKeys.map((bk, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#555' }}>
                    <span style={{ color: cls.accent, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✦</span>
                    {t(bk)}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Confirm */}
      <button
        onClick={confirm}
        disabled={!selected || loading}
        style={{
          padding: '16px 56px',
          background: selected ? '#FA2D1A' : 'var(--border)',
          color: selected ? 'var(--bg)' : 'var(--muted-soft)',
          border: 'none', borderRadius: 16,
          ...display, fontSize: 24, letterSpacing: 1,
          cursor: selected && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        {loading ? t('saving') : selectedCls ? `${t(selectedCls.nameKey)} →` : t('choose_class_btn')}
      </button>
    </div>
  )
}
