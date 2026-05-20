import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../lib/i18n'
import {
  supabase,
  getMySchoolRole,
  createSchoolClass,
  joinSchoolClass,
  leaveSchoolClass,
  deleteSchoolClass,
  getClassRoster,
  getClassHomework,
  getClassSubmissions,
  getMySubmissions,
  assignHomework,
  removeHomework,
  submitHomework,
} from '../lib/supabase'
import { IconGraduation, IconBook, IconUsers, IconClipboard, IconTrophy, IconPawn, IconSchool, IconLightbulb, IconCheck } from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

const DEMO_PUZZLES = [
  { id: 'f1', themeKey: 'theme_mate_1',        rating: 1100, fen: '6rk/6pp/8/4Q3/8/8/8/6K1 w - - 0 1' },
  { id: 'f2', themeKey: 'theme_mate_1',        rating: 1050, fen: 'r5k1/5ppp/8/8/4R3/8/5PPP/6K1 w - - 0 1' },
  { id: 'f3', themeKey: 'theme_mate_1',        rating: 1150, fen: '7k/5KRp/8/8/8/8/8/8 w - - 0 1' },
  { id: 'f4', themeKey: 'theme_mate_1',        rating: 1000, fen: '4k3/4Q3/4K3/8/8/8/8/8 w - - 0 1' },
  { id: 'f5', themeKey: 'theme_arabian',       rating: 1300, fen: '7k/6R1/5N2/8/8/8/8/7K w - - 0 1' },
  { id: 'f6', themeKey: 'theme_double_strike', rating: 1400, fen: '8/8/8/8/8/k7/ppp5/KQ6 w - - 0 1' },
  { id: 'f7', themeKey: 'theme_knight_fork',   rating: 1250, fen: 'k7/pR6/K7/8/8/8/8/8 w - - 0 1' },
]

function btnStyle(bg, color, border) {
  return {
    padding: '11px 20px', borderRadius: 12, border: `1.5px solid ${border}`,
    background: bg, color, cursor: 'pointer', fontWeight: 700,
    fontSize: 13, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5,
  }
}

const inpStyle = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  border: '1.5px solid var(--border)', background: 'var(--bg-card-soft)',
  color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SchoolPage({ navigate }) {
  const { t } = useLang()
  const [profile, setProfile] = useState(null)
  const [view, setView]       = useState('detect')       // detect | teacher-form | student-form
  const [info, setInfo]       = useState({ role: null }) // {role, class?, membership?}
  const [loading, setLoading] = useState(true)

  // Pull current user via session
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      const userId = session?.user?.id
      if (!userId) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      setProfile(data || { id: userId })
      const inf = await getMySchoolRole(userId)
      if (cancelled) return
      setInfo(inf)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid #2E4C8C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 28px', textAlign: 'center', color: 'var(--muted)' }}>
        {t('school_need_login')}
      </div>
    )
  }

  if (info.role === 'teacher') {
    return <TeacherDashboard t={t} cls={info.class} onLeft={() => setInfo({ role: null })} />
  }

  if (info.role === 'student') {
    return <StudentDashboard t={t} cls={info.class} profile={profile} navigate={navigate} onLeft={() => setInfo({ role: null })} />
  }

  if (view === 'detect') {
    return <RoleSelector t={t} onSelect={r => setView(r === 'teacher' ? 'teacher-form' : 'student-form')} />
  }

  if (view === 'teacher-form') {
    return <CreateClassForm t={t} teacherId={profile.id} onCreated={cls => setInfo({ role: 'teacher', class: cls })} />
  }

  if (view === 'student-form') {
    return <JoinClassForm t={t} studentId={profile.id} onJoined={cls => setInfo({ role: 'student', class: cls })} />
  }

  return null
}

// ── Role selector ─────────────────────────────────────────────────────────────
function RoleSelector({ onSelect, t }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 28px', textAlign: 'center' }}>
      <div style={{ marginBottom: 14, color: 'var(--text)', display: 'flex', justifyContent: 'center' }}><IconSchool size={56} color="var(--text)" /></div>
      <div style={{ ...display, fontSize: 44, color: 'var(--text)', marginBottom: 12 }}>{t('school')}</div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}>{t('school_desc')}</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => onSelect('teacher')} style={{
          ...btnStyle('#2E4C8C', 'var(--bg)', '#2E4C8C'),
          padding: '24px 36px', borderRadius: 18, fontSize: 18,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <IconGraduation size={36} color="var(--bg)" />
          <span>{t('i_am_teacher')}</span>
        </button>
        <button onClick={() => onSelect('student')} style={{
          ...btnStyle('#FA2D1A', 'var(--bg)', '#FA2D1A'),
          padding: '24px 36px', borderRadius: 18, fontSize: 18,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <IconBook size={36} color="var(--bg)" />
          <span>{t('i_am_student')}</span>
        </button>
      </div>
    </div>
  )
}

// ── Create class form ─────────────────────────────────────────────────────────
function CreateClassForm({ teacherId, onCreated, t }) {
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setBusy(true); setError('')
    try {
      const cls = await createSchoolClass(teacherId, name.trim())
      onCreated(cls)
    } catch (e) {
      setError(e.message || 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ ...display, fontSize: 40, color: 'var(--text)', marginBottom: 28 }}>{t('create_class')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>
            {t('class_name')}
          </label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={t('class_name_placeholder')} style={inpStyle} />
        </div>
        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#FA2D1A', background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
        )}
        <button onClick={handleCreate} disabled={busy} style={{
          ...btnStyle('#2E4C8C', 'var(--bg)', '#2E4C8C'),
          padding: '14px', marginTop: 4, fontSize: 16, opacity: busy ? 0.6 : 1,
        }}>
          {t('create_class')} →
        </button>
      </div>
    </div>
  )
}

// ── Join class form ───────────────────────────────────────────────────────────
function JoinClassForm({ studentId, onJoined, t }) {
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  async function handleJoin() {
    if (!code.trim()) return
    setBusy(true); setError('')
    try {
      const cls = await joinSchoolClass(code.trim(), studentId)
      if (!cls) { setError(t('class_not_found')); return }
      onJoined(cls)
    } catch (e) {
      setError(e.message || 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ ...display, fontSize: 40, color: 'var(--text)', marginBottom: 28 }}>{t('join_class')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 7, letterSpacing: 0.5 }}>
            {t('enter_code')}
          </label>
          <input value={code} onChange={e => setCode(e.target.value)}
            placeholder="ABC123" style={{ ...inpStyle, textTransform: 'uppercase', letterSpacing: 3, fontSize: 18 }} />
        </div>
        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#FA2D1A', background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
        )}
        <button onClick={handleJoin} disabled={busy} style={{
          ...btnStyle('#FA2D1A', 'var(--bg)', '#FA2D1A'),
          padding: '14px', marginTop: 4, fontSize: 16, opacity: busy ? 0.6 : 1,
        }}>
          {t('join_btn')} →
        </button>
      </div>
    </div>
  )
}

// ── Teacher dashboard ─────────────────────────────────────────────────────────
function TeacherDashboard({ t, cls, onLeft }) {
  const [tab, setTab]               = useState('students')
  const [copied, setCopied]         = useState(false)
  const [roster, setRoster]         = useState([])
  const [homework, setHomework]     = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]       = useState(true)
  const [busy, setBusy]              = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [r, h, s] = await Promise.all([
        getClassRoster(cls.id),
        getClassHomework(cls.id),
        getClassSubmissions(cls.id),
      ])
      setRoster(r); setHomework(h); setSubmissions(s)
    } finally {
      setLoading(false)
    }
  }, [cls.id])

  useEffect(() => { reload() }, [reload])

  function copyCode() {
    navigator.clipboard.writeText(cls.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAssign(puzzle) {
    setBusy(true)
    try { await assignHomework(cls.id, puzzle); await reload() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  async function handleRemove(homeworkId) {
    setBusy(true)
    try { await removeHomework(homeworkId); await reload() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  async function handleDeleteClass() {
    if (!window.confirm(t('confirm_delete_class'))) return
    setBusy(true)
    try { await deleteSchoolClass(cls.id); onLeft() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  const assignedKeys = new Set(homework.map(h => h.puzzle_key))
  const sortedRoster = [...roster].sort((a, b) => b.rating - a.rating)

  // submissions per homework: { homeworkId: Set(studentIds) }
  const subByHomework = new Map()
  for (const s of submissions) {
    if (!subByHomework.has(s.homework_id)) subByHomework.set(s.homework_id, new Set())
    subByHomework.get(s.homework_id).add(s.student_id)
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#FA2D1A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconGraduation size={14} color="#FA2D1A" /> {t('teacher_cabinet')}
        </div>
        <div style={{ ...display, fontSize: 48, color: 'var(--text)', lineHeight: 0.92, marginBottom: 16 }}>{cls.name}</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16,
          background: 'var(--tint-blue)', border: '1.5px solid var(--tint-blue-border)', borderRadius: 14, padding: '12px 20px',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1 }}>{t('class_code')}</div>
            <div style={{ ...display, fontSize: 32, color: 'var(--accent-blue)', letterSpacing: 4 }}>{cls.join_code}</div>
          </div>
          <button onClick={copyCode} style={{ ...btnStyle(copied ? '#2E4C8C' : 'var(--bg-card)', copied ? 'var(--bg)' : '#2E4C8C', 'var(--tint-blue-border)') }}>
            {copied ? <IconCheck size={14} color="currentColor" /> : t('copy_code')}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted-soft)', marginTop: 8 }}>{t('share_code')}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 4, borderRadius: 14, marginBottom: 20, width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          ['students', t('students'), <IconUsers size={14} color="currentColor" />],
          ['homework', t('homework'), <IconClipboard size={14} color="currentColor" />],
        ].map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
            background: tab === id ? '#2E4C8C' : 'transparent',
            color: tab === id ? 'var(--bg)' : 'var(--muted)',
            fontFamily: "'Oswald', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border)', borderTop: '3px solid #2E4C8C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {tab === 'students' && (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
              {sortedRoster.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ marginBottom: 8, color: 'var(--border)', display: 'flex', justifyContent: 'center' }}><IconPawn size={60} color="var(--border)" /></div>
                  <p style={{ color: 'var(--muted-soft)', fontSize: 13, margin: 0 }}>{t('no_students')}</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-soft)' }}>
                      {['#', t('student_name'), t('rating_col'), t('games_col'), t('wins_col')].map((h, i) => (
                        <th key={i} style={{
                          textAlign: i < 2 ? 'left' : 'right', padding: '12px 18px',
                          fontSize: 11, color: 'var(--muted-soft)', fontWeight: 700, letterSpacing: 1,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRoster.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-row-alt)' }}>
                        <td style={{ padding: '12px 18px', ...display, fontSize: 18, color: 'var(--muted-soft)' }}>{i + 1}</td>
                        <td style={{ padding: '12px 18px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.username}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'right', ...display, fontSize: 22, color: 'var(--accent-blue)' }}>{s.rating}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>{s.games_played}</td>
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                            background: s.games_played > 0 && s.games_won / s.games_played >= 0.6 ? 'var(--tint-blue)' : 'var(--tint-red)',
                            color: s.games_played > 0 && s.games_won / s.games_played >= 0.6 ? '#2E4C8C' : '#FA2D1A',
                          }}>
                            {s.games_played > 0 ? Math.round(s.games_won / s.games_played * 100) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'homework' && (
            <div>
              {homework.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ ...display, fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>
                    {t('assigned')} ({homework.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {homework.map(h => {
                      const completedCount = subByHomework.get(h.id)?.size || 0
                      return (
                        <div key={h.id} style={{
                          background: 'var(--tint-blue)', border: '1.5px solid var(--tint-blue-border)', borderRadius: 14,
                          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>
                              {h.theme_key ? t(h.theme_key) : (h.puzzle_key || '')}
                            </span>
                            {h.rating && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{t('rating_label')} {h.rating}</span>}
                            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
                              · {completedCount} / {roster.length} {t('done')}
                            </span>
                          </div>
                          <button onClick={() => handleRemove(h.id)} disabled={busy} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 18, color: 'var(--muted-soft)', padding: '0 4px',
                          }}>×</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ ...display, fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>{t('puzzle_pool')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEMO_PUZZLES.map(p => {
                  const isAssigned = assignedKeys.has(p.id)
                  return (
                    <div key={p.id} style={{
                      background: 'var(--bg-card)', border: `1.5px solid ${isAssigned ? 'var(--tint-blue-border)' : 'var(--border)'}`,
                      borderRadius: 14, padding: '14px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t(p.themeKey)}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{t('rating_label')} {p.rating}</span>
                      </div>
                      <button
                        onClick={() => !isAssigned && handleAssign(p)}
                        disabled={isAssigned || busy}
                        style={{
                          ...btnStyle(
                            isAssigned ? 'var(--tint-blue)' : '#2E4C8C',
                            isAssigned ? '#2E4C8C' : 'var(--bg)',
                            isAssigned ? 'var(--tint-blue-border)' : '#2E4C8C',
                          ),
                          opacity: isAssigned ? 0.7 : 1,
                        }}
                      >
                        {isAssigned ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCheck size={12} color="currentColor" /> {t('assigned')}</span> : t('add_homework')}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <button onClick={handleDeleteClass} disabled={busy}
        style={{ marginTop: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted-soft)' }}>
        {t('reset_school')}
      </button>
    </div>
  )
}

// ── Student dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ t, cls, profile, navigate, onLeft }) {
  const [tab, setTab]               = useState('homework')
  const [roster, setRoster]         = useState([])
  const [homework, setHomework]     = useState([])
  const [mySubs, setMySubs]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [busy, setBusy]             = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [r, h, ms] = await Promise.all([
        getClassRoster(cls.id),
        getClassHomework(cls.id),
        getMySubmissions(profile.id),
      ])
      setRoster(r); setHomework(h); setMySubs(ms)
    } finally {
      setLoading(false)
    }
  }, [cls.id, profile.id])

  useEffect(() => { reload() }, [reload])

  async function handleSolve(h) {
    setBusy(true)
    try {
      await submitHomework(h.id, profile.id)
      try { sessionStorage.setItem('school_puzzle_fen', h.fen || '') } catch { /* sessionStorage may be unavailable in private mode */ }
      navigate?.('/puzzles')
    } catch (e) {
      alert(e.message || 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    if (!window.confirm(t('confirm_leave_class'))) return
    setBusy(true)
    try { await leaveSchoolClass(cls.id, profile.id); onLeft() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  const sortedRoster = [...roster].sort((a, b) => b.rating - a.rating)
  const completed = new Set(mySubs)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#FA2D1A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconBook size={14} color="#FA2D1A" /> {t('student_cabinet')}
        </div>
        <div style={{ ...display, fontSize: 48, color: 'var(--text)', lineHeight: 0.92, marginBottom: 8 }}>{cls.name}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--tint-blue)', border: '1.5px solid var(--tint-blue-border)', borderRadius: 10, padding: '6px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{t('class_code')}:</span>
          <span style={{ ...display, fontSize: 18, color: 'var(--accent-blue)', letterSpacing: 3 }}>{cls.join_code}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 4, borderRadius: 14, marginBottom: 20, width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          ['homework',    t('homework'),         <IconClipboard size={14} color="currentColor" />],
          ['leaderboard', t('class_leaderboard'), <IconTrophy size={14} color="currentColor" />],
        ].map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
            background: tab === id ? '#FA2D1A' : 'transparent',
            color: tab === id ? 'var(--bg)' : 'var(--muted)',
            fontFamily: "'Oswald', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border)', borderTop: '3px solid #2E4C8C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {tab === 'homework' && (
            <div>
              {homework.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '48px 16px', textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, color: 'var(--border)', display: 'flex', justifyContent: 'center' }}><IconPawn size={60} color="var(--border)" /></div>
                  <p style={{ color: 'var(--muted-soft)', fontSize: 13, margin: 0 }}>{t('no_homework')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {homework.map(h => {
                    const isDone = completed.has(h.id)
                    return (
                      <div key={h.id} style={{
                        background: isDone ? 'var(--tint-green)' : 'var(--bg-card)',
                        border: `1.5px solid ${isDone ? 'var(--tint-green-border)' : 'var(--border)'}`,
                        borderRadius: 16, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: isDone ? 'var(--tint-green-border)' : 'var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, color: isDone ? '#1A7A4A' : 'var(--muted-soft)',
                          }}>
                            {isDone ? <IconCheck size={20} color="var(--accent-green)" /> : <IconPawn size={22} color="var(--muted-soft)" />}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                              {h.theme_key ? t(h.theme_key) : (h.puzzle_key || '')}
                            </div>
                            {h.rating && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t('rating_label')} {h.rating}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isDone
                            ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', background: 'var(--tint-green)', border: '1.5px solid var(--tint-green-border)', padding: '5px 12px', borderRadius: 999 }}>{t('done')}</span>
                            : <button onClick={() => handleSolve(h)} disabled={busy} style={{ ...btnStyle('#FA2D1A', 'var(--bg)', '#FA2D1A') }}>{t('solve')}</button>
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--tint-amber)', border: '1.5px solid var(--tint-amber-border)', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconLightbulb size={16} color="currentColor" />
                  {t('school_tip')}
                </p>
              </div>
            </div>
          )}

          {tab === 'leaderboard' && (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
              {sortedRoster.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted-soft)', fontSize: 13 }}>{t('no_students')}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-soft)' }}>
                      {['#', t('student_name'), t('rating_col'), t('games_col'), t('wins_col')].map((h, i) => (
                        <th key={i} style={{
                          textAlign: i < 2 ? 'left' : 'right', padding: '12px 18px',
                          fontSize: 11, color: 'var(--muted-soft)', fontWeight: 700, letterSpacing: 1,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRoster.map((s, i) => {
                      const isMe = s.id === profile.id
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-soft)', background: isMe ? 'var(--tint-red)' : i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-row-alt)' }}>
                          <td style={{ padding: '12px 18px', ...display, fontSize: 18, color: 'var(--muted-soft)' }}>{i + 1}</td>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#FA2D1A' : 'var(--text)' }}>{s.username}</span>
                            {isMe && <span style={{ marginLeft: 6, fontSize: 10, background: '#FA2D1A', color: '#fff', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>{t('you_short')}</span>}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right', ...display, fontSize: 22, color: 'var(--accent-blue)' }}>{s.rating}</td>
                          <td style={{ padding: '12px 18px', textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>{s.games_played}</td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                              background: s.games_played > 0 && s.games_won / s.games_played >= 0.6 ? 'var(--tint-blue)' : 'var(--tint-red)',
                              color: s.games_played > 0 && s.games_won / s.games_played >= 0.6 ? '#2E4C8C' : '#FA2D1A',
                            }}>
                              {s.games_played > 0 ? Math.round(s.games_won / s.games_played * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      <button onClick={handleLeave} disabled={busy}
        style={{ marginTop: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted-soft)' }}>
        {t('leave_class')}
      </button>
    </div>
  )
}
