import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import { useIsMobile } from '../hooks/useMediaQuery'
import {
  IconChessKing, IconSun, IconMoon, IconLogout, IconStar,
  IconHome, IconScroll, IconMapAlt, IconGraduation, IconTrophy,
  IconUsers, IconRobot, IconCrown, IconBook,
} from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700 }

export default function Navbar({ profile }) {
  const isMobile = useIsMobile()
  const Component = isMobile ? MobileBottomNav : DesktopSidebar
  return <Component profile={profile} />
}

const NAV_ITEMS = (t) => [
  { to: '/',            label: t('nav_arena'),      Icon: IconHome      },
  { to: '/puzzles',     label: t('nav_puzzles'),    Icon: IconScroll    },
  { to: '/lessons',     label: t('nav_lessons'),    Icon: IconBook      },
  { to: '/tournament',  label: t('nav_tournament'), Icon: IconTrophy    },
  { to: '/friends',     label: t('nav_friends'),    Icon: IconUsers     },
  { to: '/leaderboard', label: t('nav_rating'),     Icon: IconCrown     },
  { to: '/coach',       label: t('nav_coach'),      Icon: IconRobot     },
  { to: '/school',      label: t('nav_school'),     Icon: IconGraduation},
  { to: '/map',         label: t('nav_map'),        Icon: IconMapAlt    },
]

// ── Desktop sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar({ profile }) {
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const { theme, toggleTheme } = useTheme()
  const items = NAV_ITEMS(t)

  return (
    <aside style={{
      width: 72, flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '16px 0',
      minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
      zIndex: 10,
    }}>
      {/* Tooltip styles */}
      <style>{`
        .navy-link { position: relative; }
        .navy-link .navy-tooltip {
          position: absolute; left: calc(100% + 8px); top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: var(--text); color: var(--bg);
          padding: 6px 10px; border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600; font-size: 12px;
          white-space: nowrap; opacity: 0; pointer-events: none;
          transition: opacity 0.12s ease, transform 0.12s ease;
          z-index: 20; box-shadow: 0 4px 12px var(--shadow);
        }
        .navy-link:hover .navy-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
      `}</style>

      <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: 18, display: 'flex' }}>
        <IconChessKing size={30} color="currentColor" />
      </Link>

      {/* Switchers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        <SwitchButton onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')} title={lang === 'ru' ? 'kz' : 'ru'}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4 }}>{lang === 'ru' ? 'kz' : 'ru'}</span>
        </SwitchButton>
        <SwitchButton onClick={toggleTheme} title={theme === 'dark' ? 'light' : 'dark'}>
          {theme === 'dark' ? <IconSun size={13} color="currentColor" /> : <IconMoon size={13} color="currentColor" />}
        </SwitchButton>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, overflow: 'visible' }}>
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to} to={to} className="navy-link"
              style={{
                width: 44, height: 44, borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                color: active ? '#FFFFFF' : 'var(--muted)',
                background: active ? 'var(--primary)' : 'transparent',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--muted)' }}
            >
              <Icon size={19} color="currentColor" />
              <span className="navy-tooltip">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-soft)', width: '100%' }}>
        {profile && (
          <Link to="/pro" className="navy-link" style={{
            width: 38, height: 32, borderRadius: 10,
            background: profile.is_pro ? 'var(--accent-amber)' : 'transparent',
            border: profile.is_pro ? 'none' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            color: profile.is_pro ? '#FFFFFF' : 'var(--muted)',
          }}>
            <IconStar size={14} filled={profile.is_pro} color="currentColor" />
            <span className="navy-tooltip">{profile.is_pro ? 'pro · active' : 'pro'}</span>
          </Link>
        )}
        {profile && (
          <Link to="/profile" className="navy-link" style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              border: location.pathname.startsWith('/profile') ? '2px solid var(--text)' : '2px solid transparent',
            }}>
              {profile.username ? profile.username.charAt(0).toUpperCase() : profile.level}
            </div>
            <span className="navy-tooltip">{t('nav_profile')} · {t('level_short')} {profile.level}</span>
          </Link>
        )}
        {profile && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="navy-link"
            style={{
              width: 36, height: 30, borderRadius: 9,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted-soft)',
            }}
          >
            <IconLogout size={15} color="currentColor" />
            <span className="navy-tooltip">{t('logout_title')}</span>
          </button>
        )}
      </div>
    </aside>
  )
}

function SwitchButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: 38, height: 28, borderRadius: 8,
        background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)',
      }}
    >
      {children}
    </button>
  )
}

// ── Mobile bottom-nav ────────────────────────────────────────────────────────
function MobileBottomNav({ profile }) {
  const location = useLocation()
  const { t } = useLang()
  const items = NAV_ITEMS(t)

  // 5 most important items in bottom bar — rest in /more page (we'll just route via profile)
  const MOBILE_ITEMS = [
    items[0], // arena
    items[1], // puzzles
    items[2], // lessons
    items[5], // leaderboard
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
      padding: '6px 4px 8px',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    }}>
      {MOBILE_ITEMS.map(({ to, label, Icon }) => {
        const active = location.pathname === to
        return (
          <Link key={to} to={to} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none',
            color: active ? 'var(--primary)' : 'var(--muted)',
          }}>
            <Icon size={22} color="currentColor" />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
          </Link>
        )
      })}
      {/* Profile / more */}
      <Link to="/profile" style={{
        flex: 1, padding: '8px 4px', borderRadius: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        textDecoration: 'none',
        color: location.pathname.startsWith('/profile') ? 'var(--primary)' : 'var(--muted)',
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: location.pathname.startsWith('/profile') ? 'var(--primary)' : 'var(--bg-tag)',
          color: location.pathname.startsWith('/profile') ? '#FFFFFF' : 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>
          {profile?.username ? profile.username.charAt(0).toUpperCase() : (profile?.level || '?')}
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{t('nav_profile')}</span>
      </Link>
    </nav>
  )
}
