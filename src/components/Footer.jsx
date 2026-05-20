import { Link } from 'react-router-dom'
import { IconChessKing } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function Footer() {
  const { t } = useLang()

  return (
    <footer style={{
      background: 'var(--text)', color: 'var(--bg)',
      padding: '52px 28px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 28 }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <IconChessKing size={28} color="currentColor" />
            <span style={{ ...display, fontSize: 22, letterSpacing: '-0.01em' }}>chessy</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,243,225,0.6)', lineHeight: 1.55, maxWidth: 240 }}>
            {t('footer_tagline')}
          </p>
        </div>

        {/* Product */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,243,225,0.5)', marginBottom: 14, textTransform: 'uppercase' }}>
            {t('footer_product')}
          </div>
          <FooterLink to="/auth">{t('landing_cta_play')}</FooterLink>
          <FooterLink to="/lessons">{t('nav_lessons')}</FooterLink>
          <FooterLink to="/heroes">{t('nav_heroes')}</FooterLink>
          <FooterLink to="/pro">pro</FooterLink>
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,243,225,0.5)', marginBottom: 14, textTransform: 'uppercase' }}>
            {t('footer_company')}
          </div>
          <FooterLink to="/about">{t('nav_about')}</FooterLink>
          <FooterLink to="/contact">{t('nav_contact')}</FooterLink>
          <FooterLink to="/privacy">{t('nav_privacy')}</FooterLink>
          <FooterLink to="/terms">{t('nav_terms')}</FooterLink>
        </div>

        {/* External */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,243,225,0.5)', marginBottom: 14, textTransform: 'uppercase' }}>
            {t('footer_kz')}
          </div>
          <FooterLink href="https://kazchess.kz" external>{t('footer_link_fed')}</FooterLink>
          <FooterLink href="https://lichess.org" external>lichess.org</FooterLink>
          <FooterLink href="https://www.fide.com" external>fide.com</FooterLink>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,243,225,0.1)', marginTop: 36, paddingTop: 20, maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,243,225,0.4)' }}>
          © 2026 Chessy — {t('footer_made_in_kz')}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,243,225,0.4)' }}>
          {t('footer_built_with')}
        </span>
      </div>
    </footer>
  )
}

function FooterLink({ to, href, external, children }) {
  const style = {
    display: 'block',
    fontSize: 13,
    color: 'rgba(255,243,225,0.75)',
    textDecoration: 'none',
    marginBottom: 8,
    transition: 'color 0.12s',
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}
         onMouseEnter={e => e.currentTarget.style.color = 'var(--bg)'}
         onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,243,225,0.75)'}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} style={style}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--bg)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,243,225,0.75)'}>
      {children}
    </Link>
  )
}
