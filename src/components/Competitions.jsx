import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { IconPin, IconCrown, IconFlame, IconDiamond, IconTrophy, IconScroll, IconChessKing } from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const COMPETITIONS = [
  {
    id: 'kz-champ',
    title_ru: 'Чемпионат Казахстана 2026',
    title_kz: 'Қазақстан чемпионаты 2026',
    desc_ru: 'главный национальный турнир — классические шахматы',
    desc_kz: 'басты ұлттық турнир — классикалық шахмат',
    date_ru: '15–25 июня 2026',
    date_kz: '15–25 маусым 2026',
    city: 'Алматы',
    region: 'kz',
    type: 'offline',
    prize: '5 000 000 ₸',
    url: 'https://kazchess.kz',
    gradient: 'linear-gradient(135deg, #FA2D1A 0%, #C41E0E 100%)',
    icon: <IconCrown size={28} color="var(--ink-light)" />,
  },
  {
    id: 'astana-open',
    title_ru: 'Astana Open 2026',
    title_kz: 'Astana Open 2026',
    desc_ru: 'международный опен-турнир FIDE',
    desc_kz: 'халықаралық FIDE опен-турнирі',
    date_ru: '10–15 августа 2026',
    date_kz: '10–15 тамыз 2026',
    city: 'Астана',
    region: 'kz',
    type: 'offline',
    prize: '$10 000',
    url: 'https://chess-results.com',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
    icon: <IconTrophy size={28} color="var(--ink-light)" />,
  },
  {
    id: 'shymkent-cup',
    title_ru: 'Кубок Шымкента',
    title_kz: 'Шымкент Кубогы',
    desc_ru: 'региональный турнир по быстрым шахматам',
    desc_kz: 'жылдам шахмат бойынша өңірлік турнир',
    date_ru: '20–22 июля 2026',
    date_kz: '20–22 шілде 2026',
    city: 'Шымкент',
    region: 'kz',
    type: 'offline',
    prize: '500 000 ₸',
    url: '#',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    icon: <IconDiamond size={28} color="var(--ink-light)" />,
  },
  {
    id: 'fide-wc',
    title_ru: 'FIDE Кубок Мира',
    title_kz: 'FIDE Әлем Кубогы',
    desc_ru: 'крупнейший международный турнир по нокаут-системе',
    desc_kz: 'нокаут жүйесі бойынша ең ірі халықаралық турнир',
    date_ru: '1–25 сентября 2026',
    date_kz: '1–25 қыркүйек 2026',
    city: 'TBD',
    region: 'world',
    type: 'offline',
    prize: '$2 000 000',
    url: 'https://www.fide.com',
    gradient: 'linear-gradient(135deg, #1A7A4A 0%, #0D5232 100%)',
    icon: <IconCrown size={28} color="var(--ink-light)" />,
  },
  {
    id: 'titled-tuesday',
    title_ru: 'Titled Tuesday',
    title_kz: 'Titled Tuesday',
    desc_ru: 'еженедельный онлайн-турнир для всех — призы до $1000',
    desc_kz: 'барлығына арналған апта сайынғы онлайн-турнир — сыйлық $1000-ға дейін',
    date_ru: 'каждый вторник',
    date_kz: 'әр сейсенбі',
    city: 'Online',
    region: 'online',
    type: 'online',
    prize: '$1 000+',
    url: 'https://www.chess.com/tournament/live/titled-tuesday',
    gradient: 'linear-gradient(135deg, #92400e 0%, #5e2807 100%)',
    icon: <IconFlame size={28} color="var(--ink-light)" />,
  },
  {
    id: 'lichess-arena',
    title_ru: 'Lichess Daily Arena',
    title_kz: 'Lichess Күнделікті Арена',
    desc_ru: 'бесплатные онлайн-турниры каждый час',
    desc_kz: 'сағат сайын тегін онлайн-турнирлер',
    date_ru: 'круглосуточно',
    date_kz: 'тәулік бойы',
    city: 'Online',
    region: 'online',
    type: 'online',
    prize: '—',
    url: 'https://lichess.org/tournament',
    gradient: 'linear-gradient(135deg, var(--text) 0%, #000000 100%)',
    icon: <IconFlame size={28} color="var(--ink-light)" />,
  },
]

const FILTERS = [
  { id: 'all',    labelKey: 'comp_filter_all' },
  { id: 'kz',     labelKey: 'comp_filter_kz' },
  { id: 'world',  labelKey: 'comp_filter_world' },
  { id: 'online', labelKey: 'comp_filter_online' },
]

export default function Competitions() {
  const { lang, t } = useLang()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? COMPETITIONS
    : COMPETITIONS.filter(c => c.region === filter)

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ ...display, fontSize: 32, color: 'var(--text)' }}>{t('comp_title')}</div>
        <div style={{ fontSize: 13, color: 'var(--muted-soft)' }}>{t('comp_subtitle')}</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: 0.5,
              background: filter === f.id ? 'var(--text)' : 'var(--bg-card)',
              color: filter === f.id ? 'var(--bg)' : 'var(--muted)',
              border: `1.5px solid ${filter === f.id ? 'var(--text)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Posters grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {filtered.map(c => {
          const title = lang === 'kz' ? c.title_kz : c.title_ru
          const desc  = lang === 'kz' ? c.desc_kz  : c.desc_ru
          const date  = lang === 'kz' ? c.date_kz  : c.date_ru
          return (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                background: c.gradient, borderRadius: 18, padding: '20px 22px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(26,26,26,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,26,26,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,26,26,0.08)'
              }}
            >
              {/* Decoration — chess king replaces ♟ unicode */}
              <div style={{
                position: 'absolute', right: -10, top: -10,
                color: 'rgba(255,255,255,0.06)',
                lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
              }}>
                <IconChessKing size={140} color="currentColor" />
              </div>

              {/* Top: icon + region badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-light)',
                }}>
                  {c.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                    padding: '3px 8px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.2)', color: 'var(--ink-light)',
                  }}>
                    {c.region === 'kz' ? 'KZ' : c.region === 'online' ? 'ONLINE' : 'INTL'}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                    padding: '3px 8px', borderRadius: 4,
                    background: c.type === 'online' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                    color: 'var(--ink-light)',
                  }}>
                    {c.type === 'online' ? t('comp_online') : t('comp_offline')}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div style={{ ...display, fontSize: 22, color: 'var(--ink-light)', marginBottom: 6, lineHeight: 1.05, position: 'relative' }}>
                {title}
              </div>

              {/* Description */}
              <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(255,243,225,0.75)', lineHeight: 1.45, position: 'relative' }}>
                {desc}
              </p>

              {/* Info row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,243,225,0.9)' }}>
                  <IconScroll size={12} color="rgba(255,243,225,0.7)" />
                  <span>{date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,243,225,0.9)' }}>
                  <IconPin size={12} color="rgba(255,243,225,0.7)" />
                  <span>{c.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,243,225,0.9)' }}>
                  <IconTrophy size={12} color="rgba(255,243,225,0.7)" />
                  <span style={{ fontWeight: 700 }}>{c.prize}</span>
                </div>
              </div>

              {/* CTA */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.18)', color: 'var(--ink-light)',
                ...display, fontSize: 13, letterSpacing: 0.5,
                position: 'relative',
              }}>
                {t('comp_more')} →
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
