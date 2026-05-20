import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { useIsMobile } from '../hooks/useMediaQuery'
import { IconChessRook, IconCoin } from './Icons'
import DrawerMenu from './DrawerMenu'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 700 }

export default function TopBar({ profile }) {
  const isMobile = useIsMobile()
  if (!isMobile) return null
  return <MobileTopBar profile={profile} />
}

function MobileTopBar({ profile }) {
  const { t } = useLang()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border-soft)',
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', color: 'var(--text)', flex: 1,
        }}>
          <span style={{ color: 'var(--primary)' }}><IconChessRook size={22} color="currentColor" /></span>
          <span style={{ ...display, fontSize: 18, letterSpacing: '-0.01em' }}>chess</span>
        </Link>

        {profile && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--accent-amber)', fontSize: 12, fontWeight: 700,
          }}>
            <IconCoin size={13} color="currentColor" />
            <span style={{ color: 'var(--text)' }}>{profile.coins || 0}</span>
          </div>
        )}

        <button
          onClick={() => setDrawerOpen(true)}
          aria-label={t('open_menu') || 'menu'}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>

      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} profile={profile} />
    </>
  )
}
