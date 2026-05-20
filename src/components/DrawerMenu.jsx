import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import {
  IconSun, IconMoon, IconLogout, IconStar,
  IconHome, IconScroll, IconMapAlt, IconGraduation, IconTrophy,
  IconUsers, IconRobot, IconCrown, IconBook,
} from './Icons'

const ITEMS = (t) => [
  { to: '/',            label: t('nav_arena'),      Icon: IconHome },
  { to: '/puzzles',     label: t('nav_puzzles'),    Icon: IconScroll },
  { to: '/lessons',     label: t('nav_lessons'),    Icon: IconBook },
  { to: '/tournament',  label: t('nav_tournament'), Icon: IconTrophy },
  { to: '/friends',     label: t('nav_friends'),    Icon: IconUsers },
  { to: '/leaderboard', label: t('nav_rating'),     Icon: IconCrown },
  { to: '/coach',       label: t('nav_coach'),      Icon: IconRobot },
  { to: '/school',      label: t('nav_school'),     Icon: IconGraduation },
  { to: '/map',         label: t('nav_map'),        Icon: IconMapAlt },
]

export default function DrawerMenu({ open, onClose, profile }) {
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />
      {/* Drawer panel */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 95,
        width: 'min(86vw, 320px)',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-8px 0 32px var(--shadow)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.24s cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontWeight: 700,
            fontSize: 16, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 0.6,
          }}>menu</span>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          {ITEMS(t).map(({ to, label, Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to} to={to} onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 12px', borderRadius: 10,
                  textDecoration: 'none',
                  color: active ? '#FFFFFF' : 'var(--text)',
                  background: active ? 'var(--primary)' : 'transparent',
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  marginBottom: 2,
                }}
              >
                <Icon size={18} color="currentColor" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer: settings + pro + profile + logout */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button
              onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
              style={{
                flex: 1, height: 34, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: 'var(--text)',
                textTransform: 'uppercase',
              }}
            >
              {lang === 'ru' ? 'kz' : 'ru'}
            </button>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1, height: 34, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text)',
              }}
            >
              {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
            </button>
          </div>

          {profile && (
            <Link to="/pro" onClick={onClose} style={{
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

          {profile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 12,
              background: 'var(--bg)',
              border: '1px solid var(--border-soft)',
            }}>
              <Link to="/profile" onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                textDecoration: 'none', flex: 1, minWidth: 0,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#FFFFFF',
                  flexShrink: 0,
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
                onClick={() => { supabase.auth.signOut(); onClose() }}
                title={t('logout_title')}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--muted)', flexShrink: 0,
                }}
              >
                <IconLogout size={14} color="currentColor" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
