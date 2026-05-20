import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import {
  IconChessKing, IconSun, IconMoon, IconLogout, IconStar,
  IconHome, IconScroll, IconMapAlt, IconGraduation, IconTrophy,
  IconUsers, IconRobot, IconCrown, IconBook,
} from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700 }

const PRIMARY = (t) => [
  { to: '/',         label: t('nav_arena'),   Icon: IconHome },
  { to: '/puzzles',  label: t('nav_puzzles'), Icon: IconScroll },
  { to: '/lessons',  label: t('nav_lessons'), Icon: IconBook },
]
const SECONDARY = (t) => [
  { to: '/tournament',  label: t('nav_tournament'), Icon: IconTrophy },
  { to: '/friends',     label: t('nav_friends'),    Icon: IconUsers },
  { to: '/leaderboard', label: t('nav_rating'),     Icon: IconCrown },
  { to: '/coach',       label: t('nav_coach'),      Icon: IconRobot },
  { to: '/school',      label: t('nav_school'),     Icon: IconGraduation },
  { to: '/map',         label: t('nav_map'),        Icon: IconMapAlt },
]

export default function Navbar({ profile }) {
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '18px 14px',
      minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
      zIndex: 10,
    }}>
      {/* Brand */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        textDecoration: 'none', color: 'var(--text)',
        padding: '4px 8px', marginBottom: 18,
      }}>
        <span style={{ color: 'var(--primary)', display: 'inline-flex' }}>
          <IconChessKing size={26} color="currentColor" />
        </span>
        <span style={{ ...display, fontSize: 20, letterSpacing: '-0.01em' }}>chess</span>
      </Link>

      {/* Primary */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
        {PRIMARY(t).map(item => (
          <NavRow key={item.to} item={item} active={location.pathname === item.to} />
        ))}
      </nav>

      <div style={{ height: 1, background: 'var(--border-soft)', margin: '4px 8px 10px' }} />

      {/* Secondary */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
        {SECONDARY(t).map(item => (
          <NavRow key={item.to} item={item} active={location.pathname === item.to} />
        ))}
      </nav>

      {/* Settings row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, marginBottom: 10 }}>
        <SwitchButton onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')} title={lang === 'ru' ? 'kz' : 'ru'}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>{lang === 'ru' ? 'kz' : 'ru'}</span>
        </SwitchButton>
        <SwitchButton onClick={toggleTheme} title={theme === 'dark' ? 'light' : 'dark'}>
          {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
        </SwitchButton>
      </div>

      {/* Pro */}
      {profile && (
        <Link to="/pro" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: profile.is_pro ? 'var(--accent-amber)' : 'transparent',
          border: profile.is_pro ? 'none' : '1px solid var(--border)',
          textDecoration: 'none',
          color: profile.is_pro ? '#FFFFFF' : 'var(--text)',
          fontSize: 13, fontWeight: 600,
          marginBottom: 8,
        }}>
          <IconStar size={15} filled={profile.is_pro} color="currentColor" />
          <span>{profile.is_pro ? 'pro · active' : 'upgrade to pro'}</span>
        </Link>
      )}

      {/* Profile + logout */}
      {profile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 12,
          background: 'var(--bg)',
          border: '1px solid var(--border-soft)',
        }}>
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', flex: 1, minWidth: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#FFFFFF',
              flexShrink: 0,
              border: location.pathname.startsWith('/profile') ? '2px solid var(--text)' : '2px solid transparent',
            }}>
              {profile.username ? profile.username.charAt(0).toUpperCase() : profile.level}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {profile.username || t('guest')}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                {t('level_short')} {profile.level}
              </div>
            </div>
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            title={t('logout_title')}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <IconLogout size={14} color="currentColor" />
          </button>
        </div>
      )}
    </aside>
  )
}

function NavRow({ item, active }) {
  const { to, label, Icon } = item
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 10,
        textDecoration: 'none',
        color: active ? '#FFFFFF' : 'var(--text)',
        background: active ? 'var(--primary)' : 'transparent',
        fontSize: 13, fontWeight: active ? 700 : 500,
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <Icon size={17} color="currentColor" />
      <span>{label}</span>
    </Link>
  )
}

function SwitchButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        flex: 1, height: 32, borderRadius: 8,
        background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text)',
      }}
    >
      {children}
    </button>
  )
}
