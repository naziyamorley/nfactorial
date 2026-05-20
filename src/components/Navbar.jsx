import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import { IconChessKing, IconSun, IconMoon, IconLogout, IconStar } from './Icons'

export default function Navbar({ profile }) {
  const location  = useLocation()
  const { lang, setLang, t } = useLang()
  const { theme, toggleTheme } = useTheme()

  const NAV = [
    {
      to: '/',
      labelKey: 'nav_arena',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: '/puzzles',
      labelKey: 'nav_puzzles',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      to: '/lessons',
      labelKey: 'nav_lessons',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M4 4 Q4 3 5 3 L11 3 Q12 4 12 5 L12 21 Q11 20 10 20 L5 20 Q4 20 4 19 Z" />
          <path d="M20 4 Q20 3 19 3 L13 3 Q12 4 12 5 L12 21 Q13 20 14 20 L19 20 Q20 20 20 19 Z" />
        </svg>
      ),
    },
    {
      to: '/map',
      labelKey: 'nav_map',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3z"/>
          <path d="M8 3v18"/>
          <path d="M16 6v18"/>
        </svg>
      ),
    },
    {
      to: '/school',
      labelKey: 'nav_school',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      ),
    },
    {
      to: '/tournament',
      labelKey: 'nav_tournament',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M8 21h8M12 17v4"/>
          <path d="M7 4H4v5c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6V4h-3"/>
          <path d="M7 4h10"/>
        </svg>
      ),
    },
    {
      to: '/friends',
      labelKey: 'nav_friends',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      to: '/coach',
      labelKey: 'nav_coach',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <rect x="3" y="4" width="18" height="13" rx="3"/>
          <path d="M8 9h8M8 12h5"/>
          <path d="M7 17l-3 4h16l-3-4"/>
        </svg>
      ),
    },
    {
      to: '/leaderboard',
      labelKey: 'nav_rating',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#navsketch)' }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ]

  return (
    <aside style={{
      width: 68,
      flexShrink: 0,
      background: '#2E4C8C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0 14px',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 10,
    }}>
      {/* Hover-tooltip styles for nav items */}
      <style>{`
        .navy-link { position: relative; }
        .navy-link .navy-tooltip {
          position: absolute;
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: var(--text);
          color: var(--bg);
          padding: 6px 10px;
          border-radius: 8px;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.12s ease, transform 0.12s ease;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .navy-link:hover .navy-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>
      {/* Shared sketch filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="navsketch" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Logo */}
      <Link to="/" style={{
        color: 'var(--ink-light)',
        textDecoration: 'none',
        marginBottom: 18,
        display: 'flex',
      }}>
        <IconChessKing size={30} color="currentColor" />
      </Link>

      {/* Language switcher */}
      <button
        onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
        title={lang === 'ru' ? 'Қазақшаға ауысу' : 'Переключить на русский'}
        style={{
          width: 46, height: 28, borderRadius: 8,
          background: lang === 'kz' ? '#FA2D1A' : 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer', marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: '#FFF3E1',
          fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5,
          transition: 'all 0.2s',
        }}
      >
        {lang === 'ru' ? 'ҚАЗ' : 'РУС'}
      </button>

      {/* Theme switcher */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        style={{
          width: 46, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFF3E1',
          transition: 'all 0.2s',
        }}
      >
        {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
      </button>

      {/* Nav — icon-only, label shows on hover */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, overflow: 'visible' }}>
        {NAV.map(({ to, labelKey, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="navy-link"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: active ? 'var(--ink-light)' : 'rgba(255,255,255,0.5)',
                background: active ? '#FA2D1A' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--ink-light)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
              {icon}
              <span className="navy-tooltip">{t(labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom — pro / profile / logout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.12)', width: '100%' }}>
        {profile && (
          <Link to="/pro" className="navy-link" style={{
            width: 38, height: 32, borderRadius: 10,
            background: profile.is_pro ? '#F5C218' : 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            color: profile.is_pro ? '#1A1A1A' : 'rgba(255,255,255,0.7)',
            transition: 'all 0.15s',
          }}>
            <IconStar size={14} filled={profile.is_pro} color="currentColor" />
            <span className="navy-tooltip">{profile.is_pro ? `${t('nav_pro')} · active` : t('nav_pro')}</span>
          </Link>
        )}
        {profile && (
          <Link to="/profile" className="navy-link" style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-light)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#2E4C8C',
              fontFamily: "'Oswald', sans-serif",
              border: location.pathname.startsWith('/profile') ? '2px solid #FA2D1A' : '2px solid transparent',
            }}>
              {profile.username ? profile.username.charAt(0).toUpperCase() : profile.level}
            </div>
            <span className="navy-tooltip">{t('nav_profile')} · ур. {profile.level}</span>
          </Link>
        )}
        {profile && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="navy-link"
            style={{
              width: 36, height: 32, borderRadius: 10,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FA2D1A' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            <IconLogout size={16} color="currentColor" />
            <span className="navy-tooltip">{t('logout_title')}</span>
          </button>
        )}
      </div>
    </aside>
  )
}
