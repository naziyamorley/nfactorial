import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzeGame, chatWithCoach } from '../lib/claude'
import { IconCrown, IconSkull, IconHandshake, IconRobot, IconKnight, IconWarning, IconSparkle, IconMasks, IconLightbulb, IconCoin, IconChessKing } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const card = {
  background: '#242424', border: '1px solid #333',
  borderRadius: 14, padding: '14px 18px',
}

export default function AICoach({ pgn, playerClass, result, durationS, coinsDelta, xpDelta, onClose, isPro }) {
  const { t, lang } = useLang()
  const [analysis, setAnalysis]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  const RATING_LABEL = (r) =>
    r >= 90 ? t('rating_masterpiece') :
    r >= 80 ? t('rating_excellent') :
    r >= 70 ? t('rating_good') :
    r >= 60 ? t('rating_ok') :
    r >= 40 ? t('rating_weak') :
    t('rating_needs_work')

  const RESULT_CFG = {
    win:  { icon: <IconCrown size={40} />,     label: t('coach_result_win'),  color: 'var(--ink-light)', accent: '#2E4C8C' },
    loss: { icon: <IconSkull size={40} />,     label: t('coach_result_loss'), color: '#FA2D1A', accent: '#FA2D1A' },
    draw: { icon: <IconHandshake size={40} />, label: t('coach_result_draw'), color: 'rgba(255,243,225,0.65)', accent: 'rgba(255,243,225,0.65)' },
  }

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeGame({ pgn, playerClass, result, durationS, lang })
      setAnalysis(data)
    } catch (err) {
      console.error(err)
      setError(t('coach_error'))
    } finally {
      setLoading(false)
    }
  }, [pgn, playerClass, result, durationS, lang, t])

  useEffect(() => { fetchAnalysis() }, [fetchAnalysis])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  async function handleSendMessage(text) {
    const msg = text || chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const next = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(next)
    setChatLoading(true)
    try {
      const reply = await chatWithCoach({ messages: next, pgn, playerClass, result, analysis, lang })
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: t('coach_error') }])
    } finally { setChatLoading(false) }
  }

  const rc = RESULT_CFG[result] || RESULT_CFG.draw

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1A1A1A', borderRadius: 24, width: '100%', maxWidth: 520,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        border: '1px solid #2E2E2E',
      }}>

        {/* Result hero */}
        <div style={{ padding: '32px 28px 24px', borderBottom: '1px solid #2E2E2E', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', right: -10, top: -10,
            color: 'rgba(255,255,255,0.05)',
            lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          }}>
            <IconChessKing size={170} color="currentColor" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ color: rc.color }}>{rc.icon}</span>
                <span style={{ ...display, fontSize: 48, color: rc.color, lineHeight: 1 }}>{rc.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <IconRobot size={14} color="rgba(255,243,225,0.3)" />
                <span style={{ fontSize: 12, color: 'rgba(255,243,225,0.3)', letterSpacing: 0.5 }}>{t('coach_subtitle')}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,243,225,0.3)', marginBottom: 6, letterSpacing: 1 }}>{t('coach_earned')}</div>
              <div style={{ ...display, fontSize: 20, color: 'var(--ink-light)', lineHeight: 1.3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                +{Math.max(0, coinsDelta)}<IconCoin size={16} color="currentColor" />
              </div>
              <div style={{ ...display, fontSize: 20, color: 'var(--ink-light)', lineHeight: 1.3 }}>
                +{Math.max(0, xpDelta)} xp
              </div>
            </div>
          </div>
        </div>

        {!isPro && (
          <div style={{ margin: '14px 22px 0', padding: '8px 14px', background: '#242424', border: '1px solid #333', borderRadius: 10, fontSize: 12, color: 'rgba(255,243,225,0.35)' }}>
            {t('coach_pro_hint')}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 18 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 56, height: 56, border: '2px solid #333', borderTop: '2px solid var(--ink-light)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconKnight size={22} color="var(--ink-light)" />
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ ...display, fontSize: 22, margin: '0 0 4px', color: 'var(--ink-light)' }}>{t('coach_analyzing')}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.4)' }}>{t('coach_studying')}</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <p style={{ color: '#FA2D1A', marginBottom: 10 }}>{error}</p>
              <button onClick={fetchAnalysis} style={{ color: 'var(--ink-light)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>{t('coach_retry')}</button>
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Rating */}
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2E2E2E" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="var(--ink-light)" strokeWidth="3"
                      strokeDasharray={`${analysis.rating} 100`} strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ ...display, fontSize: 20, color: 'var(--ink-light)', lineHeight: 1 }}>{analysis.rating}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,243,225,0.35)' }}>/100</span>
                  </div>
                </div>
                <div>
                  <div style={{ ...display, fontSize: 22, color: 'var(--ink-light)', marginBottom: 4 }}>{RATING_LABEL(analysis.rating)}</div>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.5)', lineHeight: 1.5 }}>{analysis.summary}</p>
                </div>
              </div>

              {/* Critical moment */}
              {analysis.critical_moment && (
                <div style={{ ...card }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <IconWarning size={18} color="#FA2D1A" />
                    <span style={{ ...display, fontSize: 20, color: '#FA2D1A', lineHeight: 1 }}>{t('coach_critical')}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, background: '#FA2D1A', color: '#fff', padding: '2px 9px', borderRadius: 5, fontFamily: 'monospace', fontWeight: 700 }}>
                      {analysis.critical_moment.move}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.5)', lineHeight: 1.6 }}>{analysis.critical_moment.description}</p>
                </div>
              )}

              {/* Best move */}
              {analysis.best_move && (
                <div style={{ ...card }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <IconSparkle size={18} color="#6B8FD4" />
                    <span style={{ ...display, fontSize: 20, color: '#6B8FD4', lineHeight: 1 }}>{t('coach_best_move')}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, background: '#2E4C8C', color: 'var(--ink-light)', padding: '2px 9px', borderRadius: 5, fontFamily: 'monospace', fontWeight: 700 }}>
                      {analysis.best_move.move}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.5)', lineHeight: 1.6 }}>{analysis.best_move.description}</p>
                </div>
              )}

              {/* Style */}
              <div style={{ ...card }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconMasks size={18} color="rgba(255,243,225,0.4)" />
                  <span style={{ ...display, fontSize: 20, color: 'var(--ink-light)', lineHeight: 1 }}>{t('coach_style')}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.5)', lineHeight: 1.6 }}>{analysis.style_assessment}</p>
              </div>

              {/* Tip */}
              <div style={{ ...card }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <IconLightbulb size={18} color="rgba(255,243,225,0.4)" />
                  <span style={{ ...display, fontSize: 20, color: 'var(--ink-light)', lineHeight: 1 }}>{t('coach_tip_label')}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,243,225,0.5)', lineHeight: 1.5 }}>{analysis.tip}</p>
              </div>
            </>
          )}
        </div>

        {/* Chat */}
        {analysis && !loading && (
          <div style={{ margin: '0 22px', borderTop: '1px solid #2E2E2E', paddingTop: 16, paddingBottom: 4 }}>
            <div style={{ ...display, fontSize: 18, color: 'rgba(255,243,225,0.4)', marginBottom: 12, letterSpacing: 0.5 }}>
              {t('coach_ask')}
            </div>

            {/* Quick prompts */}
            {chatMessages.length === 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {[
                  t('coach_q1'),
                  t('coach_q2'),
                  t('coach_q3'),
                  t('coach_q4'),
                ].map(q => (
                  <button key={q} onClick={() => handleSendMessage(q)} style={{
                    padding: '6px 12px', borderRadius: 20,
                    border: '1px solid #333', background: 'transparent',
                    color: 'rgba(255,243,225,0.55)', fontSize: 12, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink-light)'; e.target.style.color = 'var(--ink-light)' }}
                  onMouseLeave={e => { e.target.style.borderColor = '#333'; e.target.style.color = 'rgba(255,243,225,0.55)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {chatMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, maxHeight: 260, overflowY: 'auto' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2E2E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconRobot size={16} color="rgba(255,243,225,0.6)" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                      background: msg.role === 'user' ? '#2E4C8C' : '#242424',
                      border: '1px solid ' + (msg.role === 'user' ? '#3a5fa8' : '#333'),
                      fontSize: 13, color: msg.role === 'user' ? 'var(--ink-light)' : 'rgba(255,243,225,0.75)',
                      lineHeight: 1.55,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                      borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2E2E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconRobot size={16} color="rgba(255,243,225,0.6)" />
                    </div>
                    <div style={{ padding: '10px 16px', borderRadius: '12px 12px 12px 4px', background: '#242424', border: '1px solid #333', display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,243,225,0.3)',
                          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('coach_placeholder')}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  border: '1px solid #333', background: '#242424',
                  color: 'var(--ink-light)', fontSize: 13, outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: chatInput.trim() && !chatLoading ? 'var(--ink-light)' : '#2E2E2E',
                  color: chatInput.trim() && !chatLoading ? 'var(--ink-dark)' : '#555',
                  cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'default',
                  fontWeight: 700, fontSize: 13,
                  fontFamily: "'Oswald', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 22px 22px' }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '14px',
            background: 'var(--ink-light)', color: 'var(--ink-dark)', border: 'none',
            borderRadius: 14, fontWeight: 900, fontSize: 18, cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif", letterSpacing: 1,
          }}>
            {t('coach_play_again')}
          </button>
        </div>
      </div>
    </div>
  )
}
