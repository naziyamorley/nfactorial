import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCrown, IconSwords, IconCoin, IconCheck, IconChessKing } from './Icons'
import { useLang } from '../lib/i18n'
import {
  getCurrentTournament,
  getTournamentParticipants,
  getTournamentMatches,
  joinTournament,
  leaveTournament,
  reportMatchWinner,
  createDuel,
  setMatchDuelCode,
  createTournament,
} from '../lib/supabase'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function TournamentPage({ profile }) {
  const { t }     = useLang()
  const navigate  = useNavigate()
  const [tab, setTab]                   = useState('bracket')
  const [tournament, setTournament]     = useState(null)
  const [participants, setParticipants] = useState([])
  const [matches, setMatches]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [busy, setBusy]                 = useState(false)
  const [creating, setCreating]         = useState(false)
  const [newName, setNewName]           = useState('')
  const [newSize, setNewSize]           = useState(8)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const tr = await getCurrentTournament()
      setTournament(tr)
      if (tr) {
        const [parts, ms] = await Promise.all([
          getTournamentParticipants(tr.id),
          getTournamentMatches(tr.id),
        ])
        setParticipants(parts)
        setMatches(ms)
      } else {
        setParticipants([])
        setMatches([])
      }
    } catch (e) {
      console.error('tournament load:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const myId           = profile?.id
  const isParticipant  = !!myId && participants.some(p => p.id === myId)
  const myMatch        = matches.find(m =>
    m.status !== 'finished' && (m.player1_id === myId || m.player2_id === myId)
  )
  const rounds         = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b)

  function roundLabel(round) {
    const total = rounds.length
    if (round === total) return t('round_final')
    if (round === total - 1 && total >= 2) return t('round_semi')
    return t('round_quarter')
  }

  async function handleJoin() {
    if (!tournament || !myId) return
    setBusy(true)
    try { await joinTournament(tournament.id, myId); await reload() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  async function handleLeave() {
    if (!tournament || !myId) return
    if (!window.confirm(t('confirm_leave_tournament'))) return
    setBusy(true)
    try { await leaveTournament(tournament.id, myId); await reload() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  async function handlePlayMatch(match) {
    if (!myId) return
    setBusy(true)
    try {
      let code = match.duel_invite_code
      if (!code) {
        const duel = await createDuel(myId)
        code = duel.invite_code
        await setMatchDuelCode(match.id, code)
      }
      try { await navigator.clipboard.writeText(`${window.location.origin}/duel/${code}`) } catch { /* ignore clipboard error */ }
      navigate(`/duel/${code}`)
    } catch (e) {
      console.error(e); alert(e.message || 'error')
    } finally { setBusy(false) }
  }

  async function handleCreate(e) {
    e?.preventDefault?.()
    const name = newName.trim() || `Open Tournament ${new Date().toLocaleDateString('ru')}`
    setBusy(true)
    try {
      await createTournament({ name, maxPlayers: newSize, prizeCoins: newSize * 25 })
      setCreating(false)
      setNewName('')
      await reload()
    } catch (e) {
      alert(e.message || 'error')
    } finally { setBusy(false) }
  }

  async function handleReport(match, winnerId) {
    setBusy(true)
    try { await reportMatchWinner(match.id, winnerId); await reload() }
    catch (e) { alert(e.message || 'error') }
    finally { setBusy(false) }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: 'var(--border)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <IconChessKing size={84} color="currentColor" />
          </div>
          <div style={{ ...display, fontSize: 28, color: 'var(--text)', marginBottom: 10 }}>
            {t('tourney_empty_title')}
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
            {t('tourney_empty_desc')}
          </p>
        </div>

        {!creating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile && (
              <button
                onClick={() => setCreating(true)}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12,
                  background: 'var(--text)', color: 'var(--bg)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: 0.5,
                }}
              >
                {t('tourney_create_btn')}
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%', padding: '11px', borderRadius: 12,
                background: 'transparent', color: 'var(--muted)',
                border: '1.5px solid var(--border)', cursor: 'pointer',
                fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
              }}
            >
              {t('tourney_empty_cta')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16,
            padding: 22, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ ...display, fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{t('tourney_create_title')}</div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{t('tourney_create_name')}</span>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t('tourney_create_name_ph')}
                style={{
                  padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--bg-card-soft)',
                  color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{t('tourney_create_size')}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[4, 8, 16].map(n => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setNewSize(n)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                      border: newSize === n ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border)',
                      background: newSize === n ? 'var(--tint-blue)' : 'transparent',
                      color: newSize === n ? 'var(--accent-blue)' : 'var(--muted)',
                      fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 14,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>

            <div style={{ fontSize: 12, color: 'var(--muted-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('tourney_create_prize')}: <strong style={{ color: 'var(--accent-green)' }}>{newSize * 25}</strong>
              <IconCoin size={12} color="var(--accent-amber)" />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setCreating(false)}
                disabled={busy}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
                  border: '1.5px solid var(--border)', background: 'transparent',
                  color: 'var(--muted)', fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13,
                }}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={busy}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
                  border: 'none', background: busy ? 'var(--border)' : 'var(--accent-red)',
                  color: 'var(--ink-light)', fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: 0.5,
                }}
              >
                {busy ? '...' : t('tourney_create_submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 28px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--text)', borderRadius: 24, padding: '28px 32px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.08, lineHeight: 1, color: 'var(--bg)' }}>
          <IconChessKing size={180} color="currentColor" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={tournament.status} />
            <span style={{ fontSize: 11, color: 'var(--bg)', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {participants.length} / {tournament.max_players} · {t('rating_label')} · {tournament.prize_coins}
              <IconCoin size={11} color="currentColor" />
            </span>
          </div>
          <div style={{ ...display, fontSize: 40, color: 'var(--bg)', lineHeight: 1, marginBottom: 6 }}>
            {tournament.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--bg)', opacity: 0.6 }}>
            {tournament.status === 'open'
              ? `${t('tournament_info')} · ${t('tour_status_open_desc')}`
              : tournament.status === 'active'
                ? t('tour_status_active_desc')
                : tournament.winner_id
                  ? t('tour_status_finished_winner')
                  : t('tour_status_finished')}
          </div>
        </div>
      </div>

      {/* Registration / Status CTA */}
      {tournament.status === 'open' && (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ ...display, fontSize: 16, color: 'var(--text)' }}>
              {isParticipant ? t('you_in_tournament') : t('join_tournament')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-soft)', marginTop: 2 }}>
              {t('auto_start_at').replace('{n}', tournament.max_players)}
            </div>
          </div>
          {!myId ? null : isParticipant ? (
            <button onClick={handleLeave} disabled={busy} style={btnSecondary}>{t('decline_btn')}</button>
          ) : (
            <button onClick={handleJoin} disabled={busy} style={btnPrimary}>{t('register_btn')}</button>
          )}
        </div>
      )}

      {/* My next match */}
      {tournament.status === 'active' && myMatch && (
        <div style={{
          background: 'var(--tint-blue)', border: '1.5px solid var(--tint-blue-border)', borderRadius: 16,
          padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
            {t('your_match')} · {roundLabel(myMatch.round)}
          </div>
          <MatchBody match={myMatch} myId={myId} onPlay={handlePlayMatch} onReport={handleReport} busy={busy} t={t} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'bracket', label: t('bracket_tab') },
          { id: 'leaderboard', label: t('table_tab') },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: '8px 20px', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 15,
            background: tab === tb.id ? 'var(--text)' : 'var(--bg-card)',
            color: tab === tb.id ? 'var(--bg)' : 'var(--muted)',
            border: `1.5px solid ${tab === tb.id ? 'var(--text)' : 'var(--border)'}`,
          }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Bracket */}
      {tab === 'bracket' && (
        rounds.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1.5px dashed var(--border)', borderRadius: 16, padding: '40px 20px', textAlign: 'center', color: 'var(--muted-soft)' }}>
            {t('bracket_will_form').replace('{n}', tournament.max_players)}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {rounds.map(round => (
              <div key={round} style={{ flex: 1, minWidth: 220 }}>
                <div style={{ ...display, fontSize: 16, color: 'var(--muted-soft)', marginBottom: 10 }}>
                  {roundLabel(round)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {matches.filter(m => m.round === round).map(m => (
                    <BracketCard key={m.id} match={m} myId={myId} onPlay={handlePlayMatch} onReport={handleReport} busy={busy} t={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Participants list */}
      {tab === 'leaderboard' && (
        participants.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1.5px dashed var(--border)', borderRadius: 16, padding: '40px 20px', textAlign: 'center', color: 'var(--muted-soft)' }}>
            {t('no_participants_yet')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {participants.map((p, idx) => {
              const isWinner = tournament.winner_id === p.id
              const isMe     = p.id === myId
              return (
                <div key={p.id} style={{
                  background: isMe ? 'var(--tint-blue)' : 'var(--bg-card)',
                  border: `1.5px solid ${isMe ? 'var(--tint-blue-border)' : 'var(--border)'}`,
                  borderRadius: 14, padding: '12px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{
                    ...display, fontSize: 22, color: isWinner ? '#F5D050' : 'var(--muted-soft)',
                    width: 28, textAlign: 'center', lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isWinner ? <IconCrown size={22} color="currentColor" /> : idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...display, fontSize: 16, color: isMe ? '#7C3AED' : 'var(--text)', lineHeight: 1 }}>
                      {p.username}{isMe ? ` · ${t('you_label')}` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-soft)' }}>
                      {t('level_short')}{p.level} · ★ {p.rating}
                    </div>
                  </div>
                  {isWinner && (
                    <div style={{ ...display, fontSize: 14, color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      +{tournament.prize_coins}<IconCoin size={13} color="currentColor" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    open:     { bg: '#1A7A4A', label: 'OPEN' },
    active:   { bg: '#FA2D1A', label: 'LIVE' },
    finished: { bg: 'var(--muted)', label: 'DONE' },
  }[status] || { bg: 'var(--muted)', label: status }
  return (
    <span style={{ background: cfg.bg, color: 'var(--ink-light)', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '4px 12px', borderRadius: 999 }}>
      {cfg.label}
    </span>
  )
}

function BracketCard({ match, myId, onPlay, onReport, busy, t }) {
  const iAmInMatch = myId && (match.player1_id === myId || match.player2_id === myId)
  const winnerName = match.winner_id === match.player1_id ? match.player1?.username
                   : match.winner_id === match.player2_id ? match.player2?.username
                   : null

  const isWaitingForOpponent = !match.player1_id || !match.player2_id

  return (
    <div style={{
      background: iAmInMatch && match.status !== 'finished' ? 'var(--tint-blue)' : 'var(--bg-card)',
      border: `1.5px solid ${iAmInMatch && match.status !== 'finished' ? 'var(--tint-blue-border)' : 'var(--border)'}`,
      borderRadius: 12, padding: '12px 14px',
    }}>
      <PlayerRow profile={match.player1} isWinner={match.winner_id === match.player1_id} muted={!match.player1} />
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted-soft)', margin: '6px 0', fontWeight: 700 }}>VS</div>
      <PlayerRow profile={match.player2} isWinner={match.winner_id === match.player2_id} muted={!match.player2} />

      {match.status === 'finished' && winnerName && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent-green)', textAlign: 'center', fontWeight: 700 }}>
          <IconCheck size={12} color="currentColor" /> {winnerName}
        </div>
      )}

      {match.status !== 'finished' && iAmInMatch && !isWaitingForOpponent && (
        <MatchActions match={match} myId={myId} onPlay={onPlay} onReport={onReport} busy={busy} t={t} />
      )}

      {match.status !== 'finished' && isWaitingForOpponent && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted-soft)', textAlign: 'center' }}>
          {t('match_waiting')}
        </div>
      )}
    </div>
  )
}

function PlayerRow({ profile, isWinner, muted }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      opacity: muted ? 0.5 : 1,
    }}>
      <div style={{ ...display, fontSize: 14, color: isWinner ? '#1A7A4A' : 'var(--text)', flex: 1, lineHeight: 1 }}>
        {profile?.username || '—'}
      </div>
      {profile?.rating && (
        <span style={{ fontSize: 10, color: 'var(--muted-soft)' }}>★ {profile.rating}</span>
      )}
      {isWinner && <IconCrown size={14} color="#F5D050" />}
    </div>
  )
}

function MatchBody({ match, myId, onPlay, onReport, busy, t }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ ...display, fontSize: 18, color: 'var(--text)', flex: 1 }}>{match.player1?.username}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-soft)', fontWeight: 700 }}>VS</div>
        <div style={{ ...display, fontSize: 18, color: 'var(--text)', flex: 1, textAlign: 'right' }}>{match.player2?.username}</div>
      </div>
      <MatchActions match={match} myId={myId} onPlay={onPlay} onReport={onReport} busy={busy} t={t} />
    </>
  )
}

function MatchActions({ match, myId, onPlay, onReport, busy, t }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
      <button onClick={() => onPlay(match)} disabled={busy} style={{
        ...btnPrimary,
        padding: '6px 14px', fontSize: 12, flex: 1, minWidth: 90,
      }}>
        <IconSwords size={12} color="var(--bg)" /> {t('play_match')}
      </button>
      <button onClick={() => onReport(match, myId)} disabled={busy} title={t('i_won')} style={{
        ...btnGhost, padding: '6px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <IconCheck size={11} color="currentColor" /> {t('i_won')}
      </button>
      <button onClick={() => onReport(match, match.player1_id === myId ? match.player2_id : match.player1_id)} disabled={busy} title={t('i_lost')} style={{
        ...btnGhost, padding: '6px 10px', fontSize: 11, color: '#FA2D1A', borderColor: 'var(--tint-red-border)',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
        {t('i_lost')}
      </button>
    </div>
  )
}

// ── Button styles ─────────────────────────────────────────────────────────────

const btnPrimary = {
  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: 'var(--text)', color: 'var(--bg)',
  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 1,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
}

const btnSecondary = {
  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
  background: 'var(--bg-card)', color: '#FA2D1A', border: '1.5px solid var(--tint-red-border)',
  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 14,
}

const btnGhost = {
  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
  background: 'var(--bg-card)', color: 'var(--muted)', border: '1.5px solid var(--border)',
  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 13,
}
