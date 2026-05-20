import { Link, useLocation } from 'react-router-dom'
import { IconChessKing, IconSun, IconMoon } from './Icons'
import { useLang, useTheme } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function PublicTopBar() {
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const loc = useLocation()

  const linkStyle = (active) => ({
    padding: '6px 12px',
    color: active ? 'var(--text)' : 'var(--muted)',
    textDecoration: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: active ? 700 : 600,
    background: active ? 'var(--bg-card)' : 'transparent',
    border: active ? '1.5px solid var(--border)' : '1.5px solid transparent',
  })

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(255,243,225,0.94)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
          <IconChessKing size={26} color="currentColor" />
          <span style={{ ...display, fontSize: 20, letterSpacing: '-0.01em' }}>chess legends</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, flexWrap: 'wrap' }}>
          <Link to="/lessons" style={linkStyle(loc.pathname.startsWith('/lessons'))}>{t('nav_lessons')}</Link>
          <Link to="/heroes"  style={linkStyle(loc.pathname === '/heroes')}>{t('nav_heroes')}</Link>
          <Link to="/about"   style={linkStyle(loc.pathname === '/about')}>{t('nav_about')}</Link>

          <button
            onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
            style={{
              padding: '6px 10px', borderRadius: 8,
              background: 'transparent', border: '1.5px solid var(--border)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'var(--muted)',
              marginLeft: 8,
            }}
          >
            {lang === 'ru' ? 'қаз' : 'рус'}
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'light' : 'dark'}
            style={{
              padding: '6px 10px', borderRadius: 8,
              background: 'transparent', border: '1.5px solid var(--border)', cursor: 'pointer',
              color: 'var(--muted)', display: 'flex', alignItems: 'center',
            }}
          >
            {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
          </button>

          <Link
            to="/auth"
            style={{
              marginLeft: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'var(--text)', color: 'var(--bg)',
              textDecoration: 'none', fontFamily: "'Oswald', sans-serif",
              fontWeight: 800, fontSize: 13, letterSpacing: 0.4,
            }}
          >
            {t('btn_login')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
