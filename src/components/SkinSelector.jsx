import { useState } from 'react'
import { SKINS, getActiveSkin, setActiveSkin } from '../lib/skins'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

function MiniBoard({ light, dark, size = 56 }) {
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push(
        <div key={`${r}-${c}`} style={{
          width: size / 4,
          height: size / 4,
          background: (r + c) % 2 === 0 ? light : dark,
        }} />
      )
    }
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      display: 'grid', gridTemplateColumns: `repeat(4, 1fr)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      {cells}
    </div>
  )
}

export default function SkinSelector({ playerLevel = 1 }) {
  const { t } = useLang()
  const [active, setActive] = useState(getActiveSkin().id)

  function select(skin) {
    if (playerLevel < skin.level) return
    setActive(skin.id)
    setActiveSkin(skin.id)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)' }}>{t('skin_board')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {SKINS.map(skin => {
          const locked = playerLevel < skin.level
          const isActive = active === skin.id

          return (
            <button
              key={skin.id}
              onClick={() => select(skin)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 16, cursor: locked ? 'not-allowed' : 'pointer',
                border: isActive ? '2px solid var(--text)' : '1.5px solid var(--border)',
                background: isActive ? 'var(--text)' : locked ? 'var(--bg-card-soft)' : 'var(--bg-card)',
                opacity: locked ? 0.6 : 1,
                transition: 'all 0.15s',
                minWidth: 96,
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <MiniBoard light={skin.light} dark={skin.dark} size={64} />
                {locked && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,243,225,0.55)', borderRadius: 6,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11 V7 Q8 3 12 3 Q16 3 16 7 V11" />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  ...display, fontSize: 16, lineHeight: 1, marginBottom: 3,
                  color: isActive ? 'var(--bg)' : locked ? 'var(--muted-soft)' : 'var(--text)',
                }}>
                  {t(`skin_${skin.id}_name`)}
                </div>
                <div style={{
                  fontSize: 10, color: isActive ? 'rgba(255,243,225,0.5)' : 'var(--muted-soft)',
                  letterSpacing: 0.5,
                }}>
                  {isActive ? t('skin_selected') : `${t('level_short')} ${skin.level}`}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
