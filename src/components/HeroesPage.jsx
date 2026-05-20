import { HEROES } from '../lib/heroes'
import { IconCrown, IconPin, IconStar } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function HeroesPage() {
  const { t, lang } = useLang()

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span style={{ color: 'var(--accent-red)' }}><IconCrown size={32} color="currentColor" /></span>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('heroes_title')}</div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, maxWidth: 640, lineHeight: 1.55 }}>
        {t('heroes_subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {HEROES.map(h => {
          const name = lang === 'kz' ? h.name_kz : h.name_ru
          const city = lang === 'kz' ? h.city_kz : h.city_ru
          const bio  = lang === 'kz' ? h.bio_kz  : h.bio_ru
          return (
            <article key={h.id} className="card-hover" style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 18,
              padding: '24px 24px',
            }}>
              {/* Top row: title chip + rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
                  padding: '4px 10px', borderRadius: 6,
                  background: 'var(--text)', color: 'var(--bg)',
                  fontFamily: "'Oswald', sans-serif",
                }}>
                  {h.title}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-amber)', fontWeight: 700 }}>
                  <IconStar size={12} filled color="currentColor" />
                  {h.rating}
                </span>
              </div>

              {/* Name */}
              <div style={{ ...display, fontSize: 26, color: 'var(--text)', lineHeight: 1.05, marginBottom: 6, letterSpacing: '-0.01em' }}>
                {name}
              </div>

              {/* Meta */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                <IconPin size={11} color="currentColor" /> {city} · {t('heroes_born')} {h.born}
              </div>

              {/* Bio */}
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                {bio}
              </p>

              {/* Quote */}
              {h.quote_ru && lang === 'ru' && (
                <blockquote style={{
                  margin: '14px 0 0', padding: '12px 16px',
                  background: 'var(--bg-card-soft)',
                  borderLeft: '3px solid var(--accent-red)', borderRadius: '0 10px 10px 0',
                  fontSize: 13, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.5,
                }}>
                  {h.quote_ru}
                </blockquote>
              )}
            </article>
          )
        })}
      </div>

      <p style={{ marginTop: 32, fontSize: 11, color: 'var(--muted-soft)', textAlign: 'center', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
        {t('heroes_source')}
      </p>
    </div>
  )
}
