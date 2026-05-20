import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { IconEnvelope, IconChessRook } from './Icons'
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left hero panel */}
      <div style={{
        flex: 1, background: '#2E4C8C', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh',
      }}>
        {/* Decorative chess symbol */}
        <div style={{
          position: 'absolute', top: 40, left: -30,
          color: 'rgba(255,255,255,0.06)',
          lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          transform: 'rotate(-8deg)',
        }}>
          <IconChessRook size={380} color="currentColor" />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FA2D1A', color: 'var(--ink-light)',
            padding: '5px 16px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            marginBottom: 24,
          }}>
            rpg chess · ai coach · duels
          </div>

          <div style={{ ...display, fontSize: 88, color: 'var(--ink-light)', lineHeight: 0.88, marginBottom: 24 }}>
            chessy
          </div>

          <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,243,225,0.65)', maxWidth: 320, lineHeight: 1.6 }}>
            {t('auth_tagline')}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        width: 440, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 40px',
      }}>
        <div style={{ width: '100%' }}>
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

            <button type="submit" disabled={loading} style={{
              padding: '14px', background: '#FA2D1A', color: 'var(--ink-light)', border: 'none',
              borderRadius: 14, fontWeight: 900, fontSize: 18, cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
              marginTop: 4,
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
