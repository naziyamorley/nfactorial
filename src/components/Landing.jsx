import { Link } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { useState } from 'react'
import { Chess } from 'chess.js'
import {
  IconChessKing, IconRobot, IconSwords, IconCrown, IconGraduation, IconBook,
  IconMapAlt, IconStar, IconArrowRight, IconCheck, IconUsers, IconCoin,
} from './Icons'
import { useLang, useTheme } from '../lib/i18n'
import Footer from './Footer'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function Landing() {
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(255,243,225,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-soft)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
            <IconChessKing size={28} color="currentColor" />
            <span style={{ ...display, fontSize: 22, letterSpacing: '-0.01em' }}>chess legends</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Link to="/lessons" style={navLink}>{t('nav_lessons')}</Link>
            <Link to="/heroes" style={navLink}>{t('nav_heroes')}</Link>
            <Link to="/about" style={navLink}>{t('nav_about')}</Link>
            <button
              onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
              style={{ ...navLink, border: '1.5px solid var(--border)', background: 'transparent', padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
            >
              {lang === 'ru' ? 'қаз' : 'рус'}
            </button>
          </nav>
        </div>
      </header>

      <style>{`
        .landing-hero {
          display: grid; grid-template-columns: 1fr;
          gap: clamp(28px, 4vw, 48px); align-items: center;
          max-width: 1200px; margin: 0 auto;
          padding: clamp(40px, 6vw, 64px) clamp(20px, 4vw, 28px) clamp(56px, 8vw, 80px);
        }
        @media (min-width: 880px) {
          .landing-hero { grid-template-columns: 1.1fr 1fr; }
        }
      `}</style>
      <section className="landing-hero">
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: 'var(--tint-red)', color: 'var(--accent-red)',
            border: '1.5px solid var(--tint-red-border)',
            fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20,
          }}>
            <IconStar size={11} filled color="currentColor" />
            {t('landing_badge')}
          </span>
          <h1 style={{ ...display, fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: 0.92, margin: '0 0 18px', color: 'var(--text)', letterSpacing: '-0.025em' }}>
            {t('landing_hero_title_1')}<br />
            <span style={{ color: 'var(--accent-red)' }}>{t('landing_hero_title_2')}</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 28px', maxWidth: 520 }}>
            {t('landing_hero_subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/auth"
              className="btn-cta"
              style={{ background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none', padding: '16px 28px', fontSize: 16 }}
            >
              {t('landing_cta_play')} <IconArrowRight size={16} color="currentColor" />
            </Link>
            <Link
              to="/lessons"
              className="btn-cta"
              style={{ background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)', textDecoration: 'none', padding: '16px 28px', fontSize: 16 }}
            >
              {t('landing_cta_lessons')}
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
            <Stat n="50+" label={t('landing_stat_puzzles')} />
            <Stat n="6" label={t('landing_stat_lessons')} />
            <Stat n="2" label={t('landing_stat_langs')} />
            <Stat n="∞" label={t('landing_stat_games')} />
          </div>
        </div>

        {/* Interactive demo board */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DemoBoard />
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--bg-card-soft)', padding: '72px 28px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ ...display, fontSize: 'clamp(32px, 4vw, 48px)', margin: '0 0 14px', color: 'var(--text)', textAlign: 'center', letterSpacing: '-0.02em' }}>
            {t('landing_features_title')}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 16, margin: '0 0 48px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            {t('landing_features_subtitle')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { Icon: IconRobot,      titleKey: 'landing_feat_coach_t',   descKey: 'landing_feat_coach_d',   color: 'var(--accent-blue)' },
              { Icon: IconSwords,     titleKey: 'landing_feat_duel_t',    descKey: 'landing_feat_duel_d',    color: 'var(--accent-red)' },
              { Icon: IconBook,       titleKey: 'landing_feat_learn_t',   descKey: 'landing_feat_learn_d',   color: 'var(--accent-amber)' },
              { Icon: IconCrown,      titleKey: 'landing_feat_rank_t',    descKey: 'landing_feat_rank_d',    color: 'var(--accent-green)' },
              { Icon: IconGraduation, titleKey: 'landing_feat_school_t',  descKey: 'landing_feat_school_d',  color: 'var(--accent-purple)' },
              { Icon: IconMapAlt,     titleKey: 'landing_feat_map_t',     descKey: 'landing_feat_map_d',     color: 'var(--accent-red)' },
            ].map(({ Icon, titleKey, descKey, color }) => (
              <div key={titleKey} className="card-hover" style={{
                background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 18,
                padding: '24px 22px',
              }}>
                <div style={{ color, marginBottom: 14 }}>
                  <Icon size={28} color="currentColor" />
                </div>
                <div style={{ ...display, fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>{t(titleKey)}</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For whom */}
      <section style={{ padding: '72px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ ...display, fontSize: 'clamp(32px, 4vw, 44px)', margin: '0 0 36px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {t('landing_audience_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { Icon: IconUsers,      titleKey: 'landing_aud_students_t',  descKey: 'landing_aud_students_d' },
              { Icon: IconGraduation, titleKey: 'landing_aud_teachers_t',  descKey: 'landing_aud_teachers_d' },
              { Icon: IconMapAlt,     titleKey: 'landing_aud_locals_t',    descKey: 'landing_aud_locals_d' },
              { Icon: IconCrown,      titleKey: 'landing_aud_competitive_t', descKey: 'landing_aud_competitive_d' },
            ].map(({ Icon, titleKey, descKey }) => (
              <div key={titleKey} style={{
                background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16,
                padding: '22px 22px',
                borderLeft: '4px solid var(--accent-red)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: 'var(--accent-red)' }}><Icon size={20} color="currentColor" /></span>
                  <div style={{ ...display, fontSize: 18, color: 'var(--text)' }}>{t(titleKey)}</div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
        padding: '72px 28px', color: 'var(--ink-light)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -20, color: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}>
          <IconChessKing size={280} color="currentColor" />
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ ...display, fontSize: 'clamp(36px, 5vw, 56px)', margin: '0 0 16px', letterSpacing: '-0.02em', color: 'var(--ink-light)' }}>
            {t('landing_final_title')}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,243,225,0.8)', margin: '0 0 28px', lineHeight: 1.5 }}>
            {t('landing_final_subtitle')}
          </p>
          <Link
            to="/auth"
            className="btn-cta"
            style={{ background: 'var(--accent-red)', color: 'var(--ink-light)', textDecoration: 'none', padding: '16px 32px', fontSize: 17 }}
          >
            {t('landing_final_cta')} <IconArrowRight size={16} color="currentColor" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const navLink = {
  padding: '6px 12px',
  color: 'var(--muted)',
  textDecoration: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ ...display, fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--muted-soft)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
    </div>
  )
}

// Tiny interactive demo board — anonymous can try a quick puzzle
function DemoBoard() {
  const { t } = useLang()
  const [game, setGame] = useState(() => new Chess('4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1'))
  const [status, setStatus] = useState('idle')

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (status === 'done') return false
    const next = new Chess(game.fen())
    const move = next.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    if (!move) return false

    if (next.isCheckmate()) {
      setGame(next)
      setStatus('done')
      return true
    }
    setGame(new Chess(game.fen()))
    setStatus('wrong')
    setTimeout(() => setStatus('idle'), 1200)
    return false
  }

  function reset() {
    setGame(new Chess('4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1'))
    setStatus('idle')
  }

  const [size, setSize] = useState(() => Math.min(360, window.innerWidth - 64))
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18,
        padding: 14, boxShadow: '0 12px 32px var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--primary)', padding: '3px 8px', background: 'var(--tint-purple)', borderRadius: 6 }}>
            {t('landing_demo_label')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t('landing_demo_hint')}</span>
        </div>
        <div ref={el => { if (el && el.clientWidth && Math.abs(el.clientWidth - size) > 4) setSize(el.clientWidth) }}>
          <Chessboard options={{
            position: game.fen(),
            boardOrientation: 'white',
            boardStyle: { borderRadius: 10, width: size, height: size },
            onPieceDrop,
          }} />
        </div>
        <div style={{ marginTop: 12, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {status === 'done' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}>
              <IconCheck size={14} color="currentColor" /> {t('landing_demo_solved')}
            </span>
          ) : status === 'wrong' ? (
            <span style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: 13 }}>{t('landing_demo_wrong')}</span>
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{t('landing_demo_idle')}</span>
          )}
          {status !== 'idle' && (
            <button onClick={reset} style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 11,
              background: 'transparent', border: '1.5px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {t('landing_demo_reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
