import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import { useIsMobile } from '../hooks/useMediaQuery'
import {
  IconChessRook, IconCoin, IconSun, IconMoon, IconLogout, IconStar,
  IconHome, IconScroll, IconBook, IconTrophy, IconUsers, IconCrown,
  IconRobot, IconGraduation, IconMapAlt,
} from './Icons'
import Avatar from './Avatar'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700 }

// Primary nav items shown both on mobile bottom-bar and desktop top-tabs.
const PRIMARY = (t) => [
  { to: '/',            label: t('nav_arena'),   Icon: IconHome },
  { to: '/puzzles',     label: t('nav_puzzles'), Icon: IconScroll },
  { to: '/lessons',     label: t('nav_lessons'), Icon: IconBook },
  { to: '/leaderboard', label: t('nav_rating'),  Icon: IconCrown },
  { to: '/profile',     label: t('nav_profile'), Icon: null /* avatar */ },
]

// Secondary items only in profile menu / overflow.
const SECONDARY = (t) => [
  { to: '/tournament',  label: t('nav_tournament'), Icon: IconTrophy },
  { to: '/friends',     label: t('nav_friends'),    Icon: IconUsers },
  { to: '/coach',       label: t('nav_coach'),      Icon: IconRobot },
  { to: '/school',      label: t('nav_school'),     Icon: IconGraduation },
  { to: '/heroes',      label: t('nav_heroes'),     Icon: IconStar },
  { to: '/map',         label: t('nav_map'),        Icon: IconMapAlt },
  { to: '/pro',         label: 'pro',               Icon: IconStar },
]

export default function TopBar({ profile }) {
  const isMobile = useIsMobile()
  return isMobile
    ? <MobileLayout profile={profile} />
    : <DesktopLayout profile={profile} />
}

// ── DESKTOP: top bar with brand + tab-row + actions ──────────────────────
function DesktopLayout({ profile }) {
  const { t } = useLang()
  const location = useLocation()
  const primary = PRIMARY(t)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border-soft)',
      flexShrink: 0,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)', flexShrink: 0 }}>
          <span style={{ color: 'var(--primary)' }}><IconChessRook size={22} color="currentColor" /></span>
          <span style={{ ...display, fontSize: 19, letterSpacing: '-0.01em' }}>chess</span>
        </Link>

        {/* Tabs */}
        <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
          {primary.filter(p => p.to !== '/profile').map(({ to, label, Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{
                padding: '8px 14px', borderRadius: 10,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                textDecoration: 'none',
                color: active ? 'var(--text)' : 'var(--muted)',
                background: active ? 'var(--bg-card)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                fontSize: 13, fontWeight: active ? 700 : 500,
              }}>
                {Icon && <Icon size={16} color="currentColor" />}
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <RightActions profile={profile} />
      </div>
    </header>
  )
}

// ── MOBILE: top bar (brand + actions) + bottom tab bar ───────────────────
function MobileLayout({ profile }) {
  const { t } = useLang()
  const location = useLocation()
  const primary = PRIMARY(t)

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-soft)',
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)', flex: 1 }}>
          <span style={{ color: 'var(--primary)' }}><IconChessRook size={22} color="currentColor" /></span>
          <span style={{ ...display, fontSize: 18, letterSpacing: '-0.01em' }}>chess</span>
        </Link>
        <RightActions profile={profile} compact />
      </header>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
        padding: '4px 4px 6px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}>
        {primary.map(({ to, label, Icon }) => {
          const active = location.pathname === to || (to === '/profile' && location.pathname.startsWith('/profile'))
          return (
            <Link key={to} to={to} style={{
              flex: 1, padding: '7px 4px', borderRadius: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              textDecoration: 'none',
              color: active ? 'var(--primary)' : 'var(--muted)',
            }}>
              {to === '/profile' ? (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: active ? 'var(--primary)' : 'var(--bg-tag)',
                  color: active ? '#FFFFFF' : 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {profile?.username ? profile.username.charAt(0).toUpperCase() : '?'}
                </div>
              ) : (
                <Icon size={20} color="currentColor" />
              )}
              <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

// ── Right-side actions (coins + bell + chat + overflow menu) ─────────────
function RightActions({ profile, compact }) {
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const secondary = SECONDARY(t)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      {profile && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: compact ? '4px 8px' : '5px 10px', borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--accent-amber)', fontSize: 12, fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
        }}>
          <IconCoin size={13} color="currentColor" />
          <span style={{ color: 'var(--text)' }}>{profile.coins || 0}</span>
        </div>
      )}
      <button
        onClick={() => setMenuOpen(o => !o)}
        aria-label="menu"
        style={{
          width: compact ? 32 : 36, height: compact ? 32 : 36, borderRadius: 10,
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            minWidth: 220, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: '0 12px 32px var(--shadow)',
            padding: 6, zIndex: 60,
          }}>
            {secondary.map(({ to, label, Icon }) => (
              <Link
                key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8,
                  textDecoration: 'none', color: 'var(--text)',
                  fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {Icon && <Icon size={16} color="var(--muted)" />}
                {label}
              </Link>
            ))}
            <div style={{ height: 1, background: 'var(--border-soft)', margin: '6px 8px' }} />
            <SettingsRow />
            {profile && (
              <button
                onClick={() => { supabase.auth.signOut(); setMenuOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-red)', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 500, textAlign: 'left',
                }}
              >
                <IconLogout size={16} color="currentColor" />
                {t('logout_title')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SettingsRow() {
  const { lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px' }}>
      <button
        onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
        style={{
          flex: 1, padding: '8px', borderRadius: 8,
          background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'inherit', textTransform: 'uppercase',
        }}
      >
        {lang === 'ru' ? 'kz' : 'ru'}
      </button>
      <button
        onClick={toggleTheme}
        style={{
          flex: 1, padding: '8px', borderRadius: 8,
          background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text)',
        }}
      >
        {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
      </button>
    </div>
  )
}
