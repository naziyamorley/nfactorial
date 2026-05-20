import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { IconEnvelope, IconChessRook, IconRobot, IconSwords, IconCrown, IconGraduation } from './Icons'
import { KZ_CITIES, useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const inp = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  border: '1.5px solid var(--border)', background: 'var(--bg-card-soft)',
  color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'border-color 0.15s',
}

export default function Auth() {
  const { t }                   = useLang()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity]         = useState('Алматы')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username, city } },
        })
        if (error) throw error
        setSent(true)
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 24, padding: 48, maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 20, color: 'var(--accent-blue)' }}><IconEnvelope size={64} color="var(--accent-blue)" /></div>
          <h2 style={{ ...display, margin: '0 0 10px', fontSize: 36, color: 'var(--text)' }}>{t('check_email')}</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            {t('email_sent')} <span style={{ color: '#FA2D1A', fontWeight: 600 }}>{email}</span>
          </p>
        </div>
      </div>
    )
  }

  const FEATURES = [
    { Icon: IconRobot,      key: 'auth_feat_ai' },
    { Icon: IconSwords,     key: 'auth_feat_duel' },
    { Icon: IconCrown,      key: 'auth_feat_rank' },
    { Icon: IconGraduation, key: 'auth_feat_school' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexWrap: 'wrap' }}>
      {/* Left hero panel */}
      <div className="auth-hero" style={{
        flex: '1 1 360px', background: 'var(--primary)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 'clamp(28px, 6vw, 52px)',
        position: 'relative', overflow: 'hidden',
        minHeight: '36vh', color: '#FFFFFF',
      }}>
        {/* Decorative chess symbol */}
        <div style={{
          position: 'absolute', right: -60, bottom: -40,
          color: 'rgba(255,255,255,0.06)',
          lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          transform: 'rotate(8deg)',
        }}>
          <IconChessRook size={420} color="currentColor" />
        </div>

        {/* Top — brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FA2D1A', color: 'var(--ink-light)',
            padding: '5px 16px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            marginBottom: 28,
          }}>
            chess legends · kz
          </div>

          <div style={{ ...display, fontSize: 'clamp(48px, 9vw, 88px)', color: '#FFFFFF', lineHeight: 0.88, marginBottom: 18, letterSpacing: '-0.025em', fontWeight: 800 }}>
            играй<br />легенды.
          </div>

          <p style={{ margin: 0, fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.78)', maxWidth: 380, lineHeight: 1.5 }}>
            {t('auth_tagline')}
          </p>
        </div>

        {/* Bottom — feature bullets */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 24px', maxWidth: 480, marginTop: 24 }}>
          {FEATURES.map(({ Icon, key }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'rgba(255,255,255,0.88)' }}>
              <span style={{ flexShrink: 0, marginTop: 1, color: '#FFFFFF' }}>
                <Icon size={18} color="currentColor" />
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: '1 1 360px', maxWidth: 540, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 40px)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ ...display, fontSize: 40, color: 'var(--text)', marginBottom: 28, lineHeight: 1 }}>
            {mode === 'login' ? t('enter_arena') : t('create_hero')}
          </h2>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 4, borderRadius: 14, marginBottom: 28 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                background: mode === m ? 'var(--text)' : 'transparent',
                color: mode === m ? 'var(--bg)' : 'var(--muted)',
                fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
              }}>
                {m === 'login' ? t('login') : t('signup')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>{t('hero_name')}</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="LegendSlayer" required minLength={3} style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>{t('city_label')}</label>
                  <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {KZ_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="legend@chess.kz" required style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} style={inp} />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 12, color: '#FA2D1A', background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-cta btn-primary" style={{
              width: '100%', padding: '14px', fontSize: 16, marginTop: 4,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '...' : mode === 'login' ? t('btn_login') : t('btn_create')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted-soft)', marginTop: 20, marginBottom: 0 }}>
            {t('no_supabase')}{' '}
            <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>supabase.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
