import { useState, useRef, useEffect } from 'react'
import { chatWithCoach } from '../lib/claude'
import { IconRobot } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function CoachChat({ profile }) {
  const { t, lang } = useLang()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat_welcome') },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  const SUGGESTED = [
    t('chat_s1'),
    t('chat_s2'),
    t('chat_s3'),
    t('chat_s4'),
    t('chat_s5'),
    t('chat_s6'),
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg  = { role: 'user', content: msg }
    const next     = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    try {
      const history = next.filter(m => m.role !== 'system')
      const reply   = await chatWithCoach({
        messages: history,
        pgn: null,
        playerClass: profile?.class || 'tactician',
        result: null,
        analysis: null,
        lang,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('coach_error') }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const showSuggested = messages.length === 1

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 28px 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexShrink: 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconRobot size={26} color="var(--bg)" />
        </div>
        <div>
          <div style={{ ...display, fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>{t('ai_coach_title')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-soft)', marginTop: 2 }}>{t('ai_coach_sub')}</div>
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
        paddingBottom: 16, minHeight: 0,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 10, alignItems: 'flex-end',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <IconRobot size={18} color="var(--bg)" />
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px', lineHeight: 1.6,
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#2E4C8C' : 'var(--bg-card)',
              border: msg.role === 'user' ? 'none' : '1.5px solid var(--border)',
              color: msg.role === 'user' ? 'var(--bg)' : 'var(--text)',
              fontSize: 14,
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconRobot size={18} color="var(--bg)" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--muted-soft)',
                  animation: `bounce 1s ease-in-out ${j * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggested && (
        <div style={{ flexShrink: 0, paddingBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginBottom: 8, letterSpacing: 0.5 }}>{t('chat_start')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                padding: '7px 14px', borderRadius: 20,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        flexShrink: 0, paddingBottom: 24, paddingTop: 8,
        borderTop: '1.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t('chat_placeholder')}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              border: '1.5px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              padding: '12px 20px', borderRadius: 12, border: 'none',
              background: input.trim() && !loading ? 'var(--text)' : 'var(--border)',
              color: input.trim() && !loading ? 'var(--bg)' : 'var(--muted-soft)',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900, fontSize: 16, letterSpacing: 0.5,
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
