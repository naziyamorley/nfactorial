import { Link } from 'react-router-dom'
import { IconChessKing, IconArrowRight, IconEnvelope } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function AboutPage({ page = 'about' }) {
  const { t } = useLang()

  if (page === 'about') return <About t={t} />
  if (page === 'privacy') return <Generic t={t} titleKey="privacy_title" bodyKey="privacy_body" />
  if (page === 'terms')   return <Generic t={t} titleKey="terms_title"   bodyKey="terms_body" />
  if (page === 'contact') return <Contact t={t} />
  return null
}

function About({ t }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 28px' }}>
      <div style={{ marginBottom: 18, color: 'var(--accent-red)' }}>
        <IconChessKing size={48} color="currentColor" />
      </div>
      <div style={{ ...display, fontSize: 'clamp(36px, 6vw, 56px)', color: 'var(--text)', marginBottom: 18, letterSpacing: '-0.02em' }}>
        {t('about_title')}
      </div>
      <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 28px' }}>
        {t('about_intro')}
      </p>

      <Section title={t('about_mission_title')} body={t('about_mission_body')} />
      <Section title={t('about_audience_title')} body={t('about_audience_body')} />
      <Section title={t('about_offer_title')}    body={t('about_offer_body')} />
      <Section title={t('about_business_title')} body={t('about_business_body')} />
      <Section title={t('about_team_title')}     body={t('about_team_body')} />

      <div style={{ marginTop: 36, padding: '20px 22px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ ...display, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>{t('about_cta_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('about_cta_sub')}</div>
        </div>
        <Link to="/" className="btn-cta" style={{ background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none' }}>
          {t('about_cta_btn')} <IconArrowRight size={14} color="currentColor" />
        </Link>
      </div>
    </div>
  )
}

function Generic({ t, titleKey, bodyKey }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 28px' }}>
      <div style={{ ...display, fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
        {t(titleKey)}
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {t(bodyKey)}
      </div>
      <p style={{ marginTop: 36, fontSize: 12, color: 'var(--muted-soft)' }}>
        {t('last_updated')}: 2026-05-20
      </p>
    </div>
  )
}

function Contact({ t }) {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '60px 28px', textAlign: 'center' }}>
      <div style={{ color: 'var(--accent-blue)', marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
        <IconEnvelope size={56} color="currentColor" />
      </div>
      <div style={{ ...display, fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>
        {t('contact_title')}
      </div>
      <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
        {t('contact_intro')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <ContactRow label={t('contact_email')}     value="hello@chess-legends.kz" link="mailto:hello@chess-legends.kz" />
        <ContactRow label={t('contact_telegram')}  value="@chess_legends_kz" link="https://t.me/chess_legends_kz" />
        <ContactRow label={t('contact_partners')}  value="partners@chess-legends.kz" link="mailto:partners@chess-legends.kz" />
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted-soft)' }}>
        {t('contact_note')}
      </p>
    </div>
  )
}

function ContactRow({ label, value, link }) {
  return (
    <a href={link} target={link.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderRadius: 12,
      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
      textDecoration: 'none', color: 'var(--text)',
      transition: 'border-color 0.12s, transform 0.12s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'monospace' }}>{value}</span>
    </a>
  )
}

function Section({ title, body }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ ...display, fontSize: 24, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>{body}</p>
    </section>
  )
}
