import { useState, useEffect } from 'react'
import { getLeaderboard } from '../lib/supabase'
import { IconSwords, IconShield, IconKnight, IconMedal, IconStar, IconChessRook, IconPin } from './Icons'
import { useLang, KZ_CITIES } from '../lib/i18n'

const CLASS_META = {
  attacker:  { icon: <IconSwords size={16} />, color: '#FA2D1A' },
  defender:  { icon: <IconShield size={16} />, color: 'var(--accent-blue)' },
  tactician: { icon: <IconKnight size={16} />, color: '#1A7A4A' },
}

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const CITY_TABS = ['all', ...KZ_CITIES.slice(0, 4)]

export default function Leaderboard({ currentProfile }) {
  const { t }             = useLang()
  const [city, setCity]   = useState('all')
  const [data, setData]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLeaderboard(city === 'all' ? null : city, 20).then(rows => {
      if (cancelled) return
      setData(rows)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [city])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#FA2D1A', marginBottom: 6 }}>{t('top_players')}</div>
          <div style={{ ...display, fontSize: 52, color: 'var(--text)', lineHeight: 0.92 }}>
            {t('leaderboard').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
          </div>
        </div>

        {/* City filter */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 4, borderRadius: 14 }}>
            {CITY_TABS.map(c => (
              <button key={c} onClick={() => setCity(c)} style={{
                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                background: city === c ? '#2E4C8C' : 'transparent',
                color: city === c ? 'var(--bg)' : 'var(--muted)',
                fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}>
                {c === 'all' ? t('all_cities') : c}
              </button>
            ))}
          </div>

          {/* More cities dropdown */}
          <select
            value={KZ_CITIES.slice(4).includes(city) ? city : ''}
            onChange={e => e.target.value && setCity(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
              background: KZ_CITIES.slice(4).includes(city) ? '#2E4C8C' : 'var(--border)',
              color: KZ_CITIES.slice(4).includes(city) ? 'var(--bg)' : 'var(--muted)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif',",
            }}
          >
            <option value="">{t('more_cities')}</option>
            {KZ_CITIES.slice(4).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active city badge */}
      {city !== 'all' && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, background: '#2E4C8C', color: 'var(--ink-light)', padding: '4px 12px', borderRadius: 999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconPin size={12} color="currentColor" /> {city}
          </span>
          <button onClick={() => setCity('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted-soft)' }}>
            {t('show_all')}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid #2E4C8C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <div style={{ color: 'var(--border)', margin: '0 0 12px' }}>
            <IconChessRook size={64} color="currentColor" />
          </div>
            <p style={{ fontSize: 14, color: 'var(--muted-soft)' }}>{t('no_data')}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-soft)' }}>
                {['#', t('col_player'), t('rating_label'), t('games_col'), t('wins_col')].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 0 || i === 1 ? 'left' : 'right',
                    padding: '14px 18px', fontSize: 11, color: 'var(--muted-soft)', fontWeight: 700, letterSpacing: 1,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((player, i) => {
                const isMe = player.id === currentProfile?.id
                const cls = CLASS_META[player.class] || CLASS_META.tactician
                return (
                  <tr key={player.id} style={{
                    borderBottom: '1px solid var(--border-soft)',
                    background: isMe ? 'var(--tint-red)' : i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-row-alt)',
                  }}>
                    <td style={{ padding: '14px 18px' }}>
                      {i < 3
                        ? <IconMedal size={28} rank={i + 1} />
                        : <span style={{ ...display, fontSize: 18, color: 'var(--muted-soft)' }}>{i + 1}</span>
                      }
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, background: 'var(--bg)',
                          border: `1.5px solid ${cls.color}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: cls.color,
                        }}>
                          {cls.icon}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#FA2D1A' : 'var(--text)' }}>{player.username}</span>
                            {isMe && <span style={{ fontSize: 10, background: '#FA2D1A', color: '#fff', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>{t('you_short')}</span>}
                            {player.is_pro && <IconStar size={12} filled color="var(--accent-amber)" />}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 10, color: 'var(--muted-soft)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconPin size={10} color="currentColor" /> {player.city || 'KZ'}</span>
                            <span style={{ fontSize: 10, color: cls.color, fontWeight: 600 }}>· {t('level_short')}{player.level}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{ ...display, fontSize: 22, color: 'var(--text)' }}>{player.rating}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>
                      {player.games_played}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                        background: player.winrate >= 60 ? 'var(--tint-blue)' : player.winrate >= 40 ? 'var(--tint-amber)' : 'var(--tint-red)',
                        color: player.winrate >= 60 ? '#2E4C8C' : player.winrate >= 40 ? '#92400e' : '#FA2D1A',
                      }}>
                        {player.winrate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {currentProfile && !data.find(p => p.id === currentProfile.id) && (
        <div style={{ marginTop: 16, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {t('not_in_top')} <span style={{ ...display, fontSize: 20, color: 'var(--accent-blue)' }}>{currentProfile.rating}</span>
          </p>
        </div>
      )}
    </div>
  )
}
