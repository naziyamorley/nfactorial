import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { startProCheckout, stripeConfigured } from '../lib/stripe'
import { IconCheck, IconStar, IconRobot, IconChessKing, IconCoin, IconSparkle } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900, lineHeight: 0.92 }

const FEATURES = [
  { Icon: IconRobot,    titleKey: 'pro_feat_coach_title',    descKey: 'pro_feat_coach_desc' },
  { Icon: IconSparkle,  titleKey: 'pro_feat_skins_title',    descKey: 'pro_feat_skins_desc' },
  { Icon: IconChessKing,titleKey: 'pro_feat_badge_title',    descKey: 'pro_feat_badge_desc' },
  { Icon: IconCoin,     titleKey: 'pro_feat_coins_title',    descKey: 'pro_feat_coins_desc' },
]

export default function UpgradePro({ profile, user }) {
  const { t }       = useLang()
  const navigate    = useNavigate()
  const [params]    = useSearchParams()
  const isSuccess   = params.get('success') === '1'
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (isSuccess) {
      // Webhook usually updates within seconds; nudge user to refresh.
      const t = setTimeout(() => window.location.reload(), 3500)
      return () => clearTimeout(t)
    }
  }, [isSuccess])

  async function handleUpgrade() {
    if (!user) { navigate('/'); return }
    setError(null)
    setLoading(true)
    try {
      await startProCheckout({ userId: user.id, email: user.email })
    } catch (e) {
      setError(e.message || 'error')
    } finally { setLoading(false) }
  }

  if (isSuccess) {
    return (
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '80px 28px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent-green)', marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
          <IconCheck size={64} color="currentColor" />
        </div>
        <div style={{ ...display, fontSize: 32, color: 'var(--text)', marginBottom: 10 }}>
          {t('pro_success_title')}
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
          {t('pro_success_desc')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 28px' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #FA2D1A 0%, #C41E0E 100%)',
        borderRadius: 24, padding: '36px 36px',
        position: 'relative', overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{ position: 'absolute', right: -10, top: -10, color: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}>
          <IconChessKing size={180} color="currentColor" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', color: 'var(--ink-light)',
            padding: '4px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 14,
          }}>
            <IconStar size={11} filled color="currentColor" /> chess legends pro
          </span>
          <div style={{ ...display, fontSize: 48, color: 'var(--ink-light)', marginBottom: 10 }}>
            {t('pro_title')}
          </div>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,243,225,0.85)', lineHeight: 1.4, maxWidth: 460 }}>
            {t('pro_subtitle')}
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {FEATURES.map(({ Icon, titleKey, descKey }) => (
          <div key={titleKey} style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14,
            padding: '18px 18px',
          }}>
            <div style={{ color: 'var(--accent-blue)', marginBottom: 10 }}>
              <Icon size={26} color="currentColor" />
            </div>
            <div style={{ ...display, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{t(titleKey)}</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{t(descKey)}</p>
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <div style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 18,
        padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ ...display, fontSize: 44, color: 'var(--text)', lineHeight: 1 }}>$4.99</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ {t('pro_per_month')}</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-soft)' }}>{t('pro_cancel_anytime')}</p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading || !user}
          style={{
            padding: '14px 28px', borderRadius: 12,
            background: loading ? 'var(--muted-soft)' : 'var(--text)',
            color: 'var(--bg)', border: 'none',
            cursor: loading || !user ? 'not-allowed' : 'pointer',
            fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 0.5,
          }}
        >
          {loading ? '...' : t('pro_cta')}
        </button>
      </div>

      {profile?.is_pro && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--tint-green)', border: '1.5px solid var(--tint-green-border)', borderRadius: 12, color: 'var(--accent-green)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCheck size={16} color="currentColor" />
          {t('pro_already')}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', borderRadius: 12, color: 'var(--accent-red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!stripeConfigured && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--tint-amber)', border: '1.5px solid var(--tint-amber-border)', borderRadius: 12, color: 'var(--accent-amber)', fontSize: 12 }}>
          {t('pro_not_configured')}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--muted-soft)', textAlign: 'center' }}>
        {t('pro_test_card')} <span style={{ fontFamily: 'monospace', background: 'var(--bg-tag)', padding: '2px 6px', borderRadius: 4 }}>4242 4242 4242 4242</span>
      </p>
    </div>
  )
}
