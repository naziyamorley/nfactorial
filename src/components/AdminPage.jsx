import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import {
  getLocationRequests, approveLocationRequest, rejectLocationRequest,
} from '../lib/supabase'
import { IconCheck, IconPin } from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const TYPE_LABEL = {
  club: 'клуб', section: 'секция', school: 'школа', outdoor: 'улица', tournament: 'турнир',
}

export default function AdminPage({ profile }) {
  if (!profile?.is_admin) return <Navigate to="/" replace />
  return <AdminInner profile={profile} />
}

function AdminInner({ profile }) {
  const { t } = useLang()
  const [tab, setTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getLocationRequests({ status: tab === 'all' ? null : tab })
      setRequests(list)
    } catch (e) {
      console.error('admin load:', e)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { reload() }, [reload])

  async function handleApprove(req) {
    setBusy(req.id)
    try {
      await approveLocationRequest(req.id, profile.id)
      await reload()
    } catch (e) { alert(e.message || 'error') }
    finally { setBusy(null) }
  }

  async function handleReject(req) {
    const note = window.prompt('причина отказа (необязательно):', '') || null
    setBusy(req.id)
    try {
      await rejectLocationRequest(req.id, profile.id, note)
      await reload()
    } catch (e) { alert(e.message || 'error') }
    finally { setBusy(null) }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 28px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ ...display, fontSize: 36, color: 'var(--text)', lineHeight: 1 }}>админ-панель</div>
        <div style={{ fontSize: 13, color: 'var(--muted-soft)', marginTop: 4 }}>
          заявки на добавление мест на карту
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { id: 'pending',  label: 'на рассмотрении' },
          { id: 'approved', label: 'одобренные' },
          { id: 'rejected', label: 'отклонённые' },
          { id: 'all',      label: 'все' },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
            border: `1.5px solid ${tab === tb.id ? 'var(--primary)' : 'var(--border)'}`,
            background: tab === tb.id ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === tb.id ? '#fff' : 'var(--muted)',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          }}>
            {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-soft)' }}>загрузка...</div>
      ) : requests.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1.5px dashed var(--border)', borderRadius: 16,
          padding: '40px 20px', textAlign: 'center', color: 'var(--muted-soft)', fontSize: 13,
        }}>
          нет заявок в этой категории
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map(r => (
            <RequestCard
              key={r.id}
              req={r}
              busy={busy === r.id}
              onApprove={() => handleApprove(r)}
              onReject={() => handleReject(r)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ req, busy, onApprove, onReject }) {
  const STATUS_COLOR = {
    pending:  { bg: 'var(--tint-amber)',  border: 'var(--accent-amber)', label: 'ждёт' },
    approved: { bg: 'var(--tint-green)',  border: 'var(--accent-green)', label: 'одобрено' },
    rejected: { bg: 'var(--tint-red)',    border: 'var(--accent-red)',   label: 'отклонено' },
  }[req.status] || { bg: 'var(--bg-card)', border: 'var(--border)', label: req.status }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14,
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              background: STATUS_COLOR.bg, color: STATUS_COLOR.border, letterSpacing: 0.5,
              border: `1px solid ${STATUS_COLOR.border}`,
            }}>
              {STATUS_COLOR.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted-soft)' }}>
              {TYPE_LABEL[req.type] || req.type}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted-soft)' }}>
              · от @{req.requester?.username || '?'}
            </span>
          </div>
          <div style={{ ...display, fontSize: 18, color: 'var(--text)', lineHeight: 1.2, marginBottom: 4 }}>
            {req.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconPin size={11} color="currentColor" /> {req.city} · {req.address}
          </div>
          {req.description && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
              {req.description}
            </p>
          )}
          {req.schedule && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              ⏰ {req.schedule}
            </div>
          )}
          {req.contact && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              📞 {req.contact}
            </div>
          )}
          {req.review_note && (
            <div style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 6, fontStyle: 'italic' }}>
              отказ: {req.review_note}
            </div>
          )}
        </div>

        {req.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={onApprove} disabled={busy} style={{
              padding: '8px 14px', borderRadius: 10, cursor: busy ? 'wait' : 'pointer',
              background: 'var(--accent-green)', color: '#fff', border: 'none',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <IconCheck size={12} color="currentColor" /> одобрить
            </button>
            <button onClick={onReject} disabled={busy} style={{
              padding: '8px 14px', borderRadius: 10, cursor: busy ? 'wait' : 'pointer',
              background: 'transparent', color: 'var(--accent-red)',
              border: '1.5px solid var(--tint-red-border)',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
            }}>
              отклонить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
