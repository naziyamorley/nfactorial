import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang, useTheme } from '../lib/i18n'
import {
  IconChessRook, IconCoin, IconSun, IconMoon, IconLogout, IconStar,
  IconHome, IconScroll, IconBook, IconTrophy, IconUsers, IconCrown,
  IconRobot, IconGraduation, IconMapAlt,
} from './Icons'
import Avatar from './Avatar'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700 }

export default function TopBar({ profile }) {
  const [open, setOpen] = useState(false)
  const { t } = useLang()

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-soft)',
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          aria-label="menu"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)', flex: 1 }}>
          <span style={{ color: 'var(--primary)' }}><IconChessRook size={22} color="currentColor" /></span>
          <span style={{ ...display, fontSize: 19, letterSpacing: '-0.01em' }}>chess</span>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {profile && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--accent-amber)', fontSize: 13, fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
            }}>
              <IconCoin size={14} color="currentColor" />
              <span style={{ color: 'var(--text)' }}>{profile.coins || 0}</span>
            </div>
          )}
          <IconButton ariaLabel="notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
          </IconButton>
          <IconButton ariaLabel="chat" to="/coach">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </IconButton>
        </div>
      </header>

      {open && <Drawer onClose={() => setOpen(false)} profile={profile} />}
    </>
  )
}

function IconButton({ children, ariaLabel, to }) {
  const style = {
    width: 36, height: 36, borderRadius: 10,
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text)', textDecoration: 'none',
  }
  if (to) return <Link to={to} aria-label={ariaLabel} style={style}>{children}</Link>
  return <button aria-label={ariaLabel} style={style}>{children}</button>
}

function Drawer({ onClose, profile }) {
  const { lang, setLang, t } = useLang()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const SECTIONS = [
    {
      title: t('drawer_play'),
      items: [
        { to: '/',            label: t('nav_arena'),      Icon: IconHome },
        { to: '/puzzles',     label: t('nav_puzzles'),    Icon: IconScroll },
        { to: '/lessons',     label: t('nav_lessons'),    Icon: IconBook },
        { to: '/tournament',  label: t('nav_tournament'), Icon: IconTrophy },
      ],
    },
    {
      title: t('drawer_community'),
      items: [
        { to: '/friends',     label: t('nav_friends'),    Icon: IconUsers },
        { to: '/leaderboard', label: t('nav_rating'),     Icon: IconCrown },
        { to: '/heroes',      label: t('nav_heroes'),     Icon: IconStar },
        { to: '/map',         label: t('nav_map'),        Icon: IconMapAlt },
      ],
    },
    {
      title: t('drawer_learn'),
      items: [
        { to: '/school',      label: t('nav_school'),     Icon: IconGraduation },
        { to: '/coach',       label: t('nav_coach'),      Icon: IconRobot },
      ],
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 40, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer panel */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'min(320px, 86vw)', background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>

        {/* Header — profile */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          {profile ? (
            <Link to="/profile" onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              textDecoration: 'none', color: 'var(--text)',
            }}>
              <Avatar name={profile.username || 'player'} id={profile.id} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.username || 'player'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span>{t('level_short')} {profile.level || 1}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <IconCoin size={11} color="var(--accent-amber)" /> {profile.coins || 0}
                  </span>
                </div>
              </div>
              {profile.is_pro && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'var(--accent-amber)', color: '#000', fontSize: 10, fontWeight: 800 }}>
                  <IconStar size={10} filled color="currentColor" /> PRO
                </span>
              )}
            </Link>
          ) : (
            <Link to="/auth" onClick={onClose} style={{
              display: 'block', padding: '11px 16px', borderRadius: 12,
              background: 'var(--primary)', color: '#FFFFFF',
              textDecoration: 'none', textAlign: 'center',
              fontWeight: 700, fontSize: 14,
            }}>
              {t('btn_login')}
            </Link>
          )}
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {SECTIONS.map((section, i) => (
            <div key={section.title} style={{ marginBottom: i === SECTIONS.length - 1 ? 0 : 18 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                color: 'var(--muted-soft)', textTransform: 'uppercase',
                padding: '6px 12px', marginBottom: 4,
              }}>
                {section.title}
              </div>
              {section.items.map(({ to, label, Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to} to={to} onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', borderRadius: 10,
                      textDecoration: 'none',
                      color: active ? 'var(--primary)' : 'var(--text)',
                      background: active ? 'var(--primary-tint)' : 'transparent',
                      fontSize: 14, fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Icon size={18} color="currentColor" />
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — switchers + logout */}
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
            style={{
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: 'var(--text)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {lang === 'ru' ? 'kz' : 'ru'}
          </button>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text)',
            }}
          >
            {theme === 'dark' ? <IconSun size={14} color="currentColor" /> : <IconMoon size={14} color="currentColor" />}
          </button>
          <div style={{ flex: 1 }} />
          {profile && (
            <button
              onClick={() => { supabase.auth.signOut(); onClose() }}
              style={{
                padding: '8px 12px', borderRadius: 10,
                background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: 'var(--muted)', fontSize: 12, fontWeight: 600,
              }}
            >
              <IconLogout size={13} color="currentColor" /> {t('logout_title')}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
