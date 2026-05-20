import { useState, useEffect } from 'react'
import { getDailyQuests, claimQuestReward } from '../lib/dailyQuests'
import { IconLightning, IconCrown, IconCoin } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function DailyQuests({ onEarnReward }) {
  const { t, lang }         = useLang()
  const [quests, setQuests] = useState(() => getDailyQuests())

  useEffect(() => {
    setQuests(getDailyQuests())
  }, [lang])

  function handleClaim(questId) {
    const reward = claimQuestReward(questId)
    if (!reward) return
    setQuests(getDailyQuests())
    onEarnReward?.(reward)
  }

  const allDone = quests.every(q => q.claimed)

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ ...display, fontSize: 26, color: 'var(--text)' }}>{t('daily_quests')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
        {allDone && (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', background: 'var(--tint-green)', border: '1.5px solid var(--tint-green-border)', padding: '3px 10px', borderRadius: 999 }}>
            {t('all_done')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quests.map(q => {
          const pct     = Math.min(100, (q.progress / q.goal) * 100)
          const done    = q.progress >= q.goal
          const claimed = q.claimed

          return (
            <div key={q.id} style={{
              background: claimed ? 'var(--bg-card-soft)' : 'var(--bg-card)',
              border: `1.5px solid ${claimed ? 'var(--border)' : done ? 'var(--tint-green-border)' : 'var(--border)'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: claimed ? 0.6 : 1,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: claimed ? 'var(--border)' : done ? 'var(--tint-green)' : 'var(--bg-tag)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: claimed ? 'var(--muted-soft)' : done ? '#1A7A4A' : 'var(--muted)',
              }}>
                {done ? <IconCrown size={20} /> : <IconLightning size={20} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <div style={{ ...display, fontSize: 15, color: claimed ? 'var(--muted-soft)' : 'var(--text)', lineHeight: 1 }}>
                    {q.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-soft)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {q.progress}/{q.goal}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginBottom: 6 }}>{q.desc}</div>
                <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: claimed ? 'var(--muted-soft)' : done ? '#1A7A4A' : '#7C3AED',
                    borderRadius: 99, transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>+{q.reward.coins}<IconCoin size={11} color="currentColor" /></span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)' }}>+{q.reward.xp}xp</span>
                </div>
                {done && !claimed && (
                  <button onClick={() => handleClaim(q.id)} style={{
                    padding: '5px 14px', background: 'var(--text)', color: 'var(--bg)',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13,
                  }}>
                    {t('claim')}
                  </button>
                )}
                {claimed && <span style={{ fontSize: 11, color: 'var(--muted-soft)' }}>{t('claimed')}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
