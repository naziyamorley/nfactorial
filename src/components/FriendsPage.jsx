import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSwords, IconPin, IconUsers, IconEnvelope } from './Icons'

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 16px', color: 'var(--muted-soft)' }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', color: 'var(--border)' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--muted-soft)' }}>{text}</p>
    </div>
  )
}
import { useLang } from '../lib/i18n'
import {
  searchPlayers,
  getFriends,
  getIncomingFriendRequests,
  getRelationshipMap,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  createDuel,
} from '../lib/supabase'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }
const CLASS_COLOR = { attacker: '#FA2D1A', defender: '#7C3AED', tactician: '#1A7A4A' }

export default function FriendsPage({ profile, onViewProfile }) {
  const { t }  = useLang()
  const navigate = useNavigate()

  const [tab, setTab]               = useState('friends')
  const [friends, setFriends]       = useState([])
  const [requests, setRequests]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [busyId, setBusyId]         = useState(null)

  // Search-tab state
  const [search, setSearch]         = useState('')
  const [searchResults, setResults] = useState([])
  const [searchRelMap, setRelMap]   = useState({})
  const [searching, setSearching]   = useState(false)

  // Friends-tab filter
  const [filter, setFilter]         = useState('')

  const CLASS_LABEL = {
    attacker:  t('class_attacker'),
    defender:  t('class_defender'),
    tactician: t('class_tactician'),
  }

  const reload = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const [f, r] = await Promise.all([
        getFriends(profile.id),
        getIncomingFriendRequests(profile.id),
      ])
      setFriends(f)
      setRequests(r)
    } catch (e) {
      console.error('friends load failed:', e)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => { reload() }, [reload])

  // Debounced search
  useEffect(() => {
    if (tab !== 'search') return
    const q = search.trim()
    if (q.length < 2) { setResults([]); setRelMap({}); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const list = await searchPlayers(q, profile.id, 20)
        setResults(list)
        const rel = await getRelationshipMap(profile.id, list.map(p => p.id))
        setRelMap(rel)
      } catch (e) {
        console.error('search failed:', e)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [search, tab, profile?.id])

  async function handleSendRequest(otherId) {
    setBusyId(otherId)
    try {
      await sendFriendRequest(profile.id, otherId)
      setRelMap(prev => ({ ...prev, [otherId]: { kind: 'pending_sent' } }))
    } catch (e) {
      console.error(e)
      alert(e.message || 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleAccept(requestId) {
    setBusyId(requestId)
    try {
      await acceptFriendRequest(requestId)
      await reload()
    } catch (e) {
      console.error(e)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDecline(requestId) {
    setBusyId(requestId)
    try {
      await removeFriendship(requestId)
      setRequests(prev => prev.filter(r => r.requestId !== requestId))
    } catch (e) {
      console.error(e)
    } finally {
      setBusyId(null)
    }
  }

  async function handleUnfriend(friendshipId) {
    if (!window.confirm(t('decline_btn') + '?')) return
    setBusyId(friendshipId)
    try {
      await removeFriendship(friendshipId)
      setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId))
    } catch (e) {
      console.error(e)
    } finally {
      setBusyId(null)
    }
  }

  async function handleChallenge(friend) {
    setBusyId(friend.id)
    try {
      const duel = await createDuel(profile.id)
      const link = `${window.location.origin}/duel/${duel.invite_code}`
      try { await navigator.clipboard.writeText(link) } catch { /* clipboard may be unavailable */ }
      navigate(`/duel/${duel.invite_code}`)
    } catch (e) {
      console.error(e)
      alert(e.message || 'error')
    } finally {
      setBusyId(null)
    }
  }

  const filteredFriends = friends.filter(f =>
    !filter || f.username.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('nav_friends')}</div>
        <div style={{ fontSize: 13, color: 'var(--muted-soft)' }}>{friends.length} {t('players_suffix')}</div>
        {requests.length > 0 && (
          <div style={{
            background: '#FA2D1A', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
          }}>
            +{requests.length}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'friends',  label: t('my_friends_tab') },
          { id: 'requests', label: `${t('requests_tab')}${requests.length ? ` (${requests.length})` : ''}` },
          { id: 'search',   label: t('find_player_tab') },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: '7px 16px', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 14,
            background: tab === tb.id ? 'var(--text)' : 'var(--bg-card)',
            color: tab === tb.id ? 'var(--bg)' : 'var(--muted)',
            border: `1.5px solid ${tab === tb.id ? 'var(--text)' : 'var(--border)'}`,
          }}>
            {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border)', borderTop: '3px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>

          {tab === 'friends' && (
            <>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder={t('search_by_nick')}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                  border: '1.5px solid var(--border)', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              {filteredFriends.length === 0 ? (
                <EmptyState icon={<IconUsers size={56} color="currentColor" />} text={t('nobody_found')} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredFriends.map(f => (
                    <PlayerRow
                      key={f.friendshipId}
                      player={f}
                      classLabel={CLASS_LABEL[f.class]}
                      classColor={CLASS_COLOR[f.class]}
                      t={t}
                      actions={[
                        { label: t('nav_profile'), variant: 'ghost',  onClick: () => onViewProfile?.(f.id) },
                        { label: t('challenge_btn'), variant: 'primary', icon: <IconSwords size={14} color="var(--bg)" />, onClick: () => handleChallenge(f), disabled: busyId === f.id },
                        { label: '×', variant: 'danger', onClick: () => handleUnfriend(f.friendshipId), disabled: busyId === f.friendshipId, title: t('decline_btn') },
                      ]}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <EmptyState icon={<IconEnvelope size={56} color="currentColor" />} text={t('no_requests')} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {requests.map(r => (
                    <PlayerRow
                      key={r.requestId}
                      player={r}
                      classLabel={CLASS_LABEL[r.class]}
                      classColor={CLASS_COLOR[r.class]}
                      t={t}
                      actions={[
                        { label: t('accept_btn'),  variant: 'success', onClick: () => handleAccept(r.requestId),  disabled: busyId === r.requestId },
                        { label: t('decline_btn'), variant: 'danger',  onClick: () => handleDecline(r.requestId), disabled: busyId === r.requestId },
                      ]}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'search' && (
            <>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('enter_nick')}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                  border: '1.5px solid var(--border)', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              {search.trim().length < 2 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-soft)', fontSize: 14 }}>
                  {t('search_hint_text')}
                </div>
              ) : searching ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--border)', borderTop: '3px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-soft)', fontSize: 14 }}>
                  {t('nobody_found')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {searchResults.map(p => {
                    const rel = searchRelMap[p.id]
                    let action
                    if (!rel) {
                      action = { label: t('send_request_btn'), variant: 'primary', onClick: () => handleSendRequest(p.id), disabled: busyId === p.id }
                    } else if (rel.kind === 'friend') {
                      action = { label: t('already_friends'), variant: 'ghost', disabled: true }
                    } else if (rel.kind === 'pending_sent') {
                      action = { label: t('request_sent'), variant: 'ghost', disabled: true }
                    } else if (rel.kind === 'pending_received') {
                      action = { label: t('accept_btn'), variant: 'success', onClick: () => handleAccept(rel.id), disabled: busyId === rel.id }
                    }
                    return (
                      <PlayerRow
                        key={p.id}
                        player={p}
                        classLabel={CLASS_LABEL[p.class]}
                        classColor={CLASS_COLOR[p.class]}
                        t={t}
                        actions={[
                          { label: t('nav_profile'), variant: 'ghost', onClick: () => onViewProfile?.(p.id) },
                          action,
                        ]}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}

        </>
      )}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function PlayerRow({ player, classLabel, classColor, actions, t }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14,
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--bg-tag)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...display, fontSize: 22, color: 'var(--muted-soft)', flexShrink: 0,
      }}>
        {player.username[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ ...display, fontSize: 16, color: 'var(--text)', lineHeight: 1 }}>{player.username}</div>
          {classLabel && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: (classColor || 'var(--muted)') + '18', color: classColor || 'var(--muted)' }}>
              {classLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-soft)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {player.city && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconPin size={10} color="var(--muted-soft)" /> {player.city}</span>}
          <span>{t('level_short')}{player.level}</span>
          <span>★ {player.rating}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {actions.filter(Boolean).map((a, i) => (
          <Btn key={i} {...a} />
        ))}
      </div>
    </div>
  )
}

function Btn({ label, variant = 'ghost', icon, onClick, disabled, title }) {
  const styles = {
    ghost:   { background: 'var(--bg-card)',     color: 'var(--muted)', border: '1.5px solid var(--border)' },
    primary: { background: 'var(--text)', color: 'var(--bg)', border: 'none' },
    success: { background: '#1A7A4A',  color: '#fff',    border: 'none' },
    danger:  { background: 'var(--bg-card)',     color: '#FA2D1A', border: '1.5px solid var(--tint-red-border)' },
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '6px 12px', borderRadius: 8,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 13,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...styles,
      }}
    >
      {icon}{label}
    </button>
  )
}
