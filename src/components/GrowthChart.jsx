import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function GrowthChart({ history = [], height = 180, accent = '#7C3AED' }) {
  const { t } = useLang()

  if (!history || history.length < 2) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted-soft)', fontSize: 13 }}>
        {t('growth_no_data')}
      </div>
    )
  }

  const ratings = history.map(h => h.rating)
  const minR = Math.min(...ratings) - 20
  const maxR = Math.max(...ratings) + 20
  const range = Math.max(1, maxR - minR)

  const W = 600
  const H = height
  const PAD_L = 40
  const PAD_R = 12
  const PAD_T = 20
  const PAD_B = 30
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  const xAt = i => PAD_L + (i / (history.length - 1)) * innerW
  const yAt = r => PAD_T + (1 - (r - minR) / range) * innerH

  const linePath = history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(h.rating)}`).join(' ')
  const areaPath = `${linePath} L ${xAt(history.length - 1)} ${PAD_T + innerH} L ${xAt(0)} ${PAD_T + innerH} Z`

  // Y axis labels (4 ticks)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(minR + range * p))

  // X axis labels (start/mid/end)
  const xLabels = [
    history[0]?.date,
    history[Math.floor(history.length / 2)]?.date,
    history[history.length - 1]?.date,
  ].map(d => d?.slice(5))

  const first = history[0]
  const last  = history[history.length - 1]
  const delta = last.rating - first.rating
  const deltaColor = delta > 0 ? '#1A7A4A' : delta < 0 ? '#FA2D1A' : 'var(--muted)'

  return (
    <div>
      {/* Summary header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-soft)', letterSpacing: 1, marginBottom: 2 }}>{t('growth_now')}</div>
            <div style={{ ...display, fontSize: 32, color: accent, lineHeight: 1 }}>{last.rating}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-soft)', letterSpacing: 1, marginBottom: 2 }}>{t('growth_change')}</div>
            <div style={{ ...display, fontSize: 22, color: deltaColor, lineHeight: 1 }}>
              {delta > 0 ? '+' : ''}{delta}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-soft)', letterSpacing: 1, marginBottom: 2 }}>{t('growth_games')}</div>
            <div style={{ ...display, fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{last.games}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted-soft)', letterSpacing: 1, marginBottom: 2 }}>{t('growth_wins')}</div>
            <div style={{ ...display, fontSize: 22, color: 'var(--accent-green)', lineHeight: 1 }}>{last.wins}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-soft)' }}>{t('growth_period')}: {history.length} {t('growth_days')}</div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} style={{ display: 'block' }}>
        {/* Y gridlines */}
        {ticks.map((r, i) => {
          const y = yAt(r)
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="var(--border-soft)" strokeWidth="1" />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--muted-soft)" fontFamily="'DM Sans', sans-serif">
                {r}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill={accent} opacity="0.08" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {history.map((h, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(h.rating)} r={i === history.length - 1 ? 5 : 3} fill={i === history.length - 1 ? accent : '#fff'} stroke={accent} strokeWidth="2" />
        ))}

        {/* X labels */}
        {xLabels.map((lbl, i) => {
          const x = PAD_L + (i / 2) * innerW
          return (
            <text key={i} x={x} y={H - 8} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fontSize="10" fill="var(--muted-soft)" fontFamily="'DM Sans', sans-serif">
              {lbl}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
