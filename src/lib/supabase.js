import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fully chainable mock — every method returns the same thenable object
function mockQuery(resolveData = null) {
  const result = { data: resolveData, error: null }
  const q = {
    select:      () => q,
    eq:          () => q,
    neq:         () => q,
    order:       () => q,
    limit:       () => q,
    insert:      () => q,
    update:      () => q,
    upsert:      () => q,
    single:      () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    // make the chain itself awaitable
    then:  (res, rej) => Promise.resolve(result).then(res, rej),
    catch: (rej)      => Promise.resolve(result).catch(rej),
  }
  return q
}

const mockClient = {
  auth: {
    getSession:         () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange:  (_e, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signUp:             () => Promise.resolve({ data: { user: null }, error: null }),
    signOut:            () => Promise.resolve({ error: null }),
  },
  from:    () => mockQuery(),
  channel: () => ({ on: () => ({ subscribe: () => {} }), unsubscribe: () => {} }),
}

export const supabase = (url && key) ? createClient(url, key) : mockClient
export const supabaseConfigured = !!(url && key)

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function updateProfile(userId, updates) {
  // Upsert — works even if profile row doesn't exist yet (e.g. new user without trigger).
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// Ensure a profiles row exists for the given user. Safe to call repeatedly.
export async function ensureProfile(user) {
  if (!user?.id) return null
  const existing = await getProfile(user.id)
  if (existing) return existing
  const meta = user.user_metadata || {}
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: meta.username || (user.email ? user.email.split('@')[0] : 'player'),
      city: meta.city || 'Алматы',
      xp: 0, level: 1, coins: 100, rating: 1000,
      games_played: 0, games_won: 0, is_pro: false,
    }, { onConflict: 'id' })
    .select()
    .single()
  if (error) { console.warn('ensureProfile failed:', error); return null }
  return data
}

// ─── Game helpers ─────────────────────────────────────────────────────────────

export async function saveGame({ playerId, mode, result, pgn, analysis, gameRating, skillLevel, coinsDelta, xpDelta, durationS }) {
  const { data, error } = await supabase
    .from('games')
    .insert({
      player_id: playerId,
      mode,
      result,
      pgn,
      analysis,
      game_rating: gameRating,
      skill_level: skillLevel,
      coins_delta: coinsDelta,
      xp_delta: xpDelta,
      duration_s: durationS,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPlayerGames(userId, limit = 10) {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('player_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

// ─── Leaderboard helpers ──────────────────────────────────────────────────────

export async function getLeaderboard(city = null, limit = 20) {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .limit(limit)

  if (city) query = query.eq('city', city)
  const { data } = await query
  return data || []
}

// ─── Duel helpers ─────────────────────────────────────────────────────────────

export async function createDuel(player1Id) {
  const { data, error } = await supabase
    .from('active_duels')
    .insert({ player1_id: player1Id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinDuel(inviteCode, player2Id) {
  const { data, error } = await supabase
    .from('active_duels')
    .update({ player2_id: player2Id, status: 'active' })
    .eq('invite_code', inviteCode)
    .eq('status', 'waiting')
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDuel(inviteCode) {
  const { data } = await supabase
    .from('active_duels')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()
  return data
}

export async function updateDuel(id, updates) {
  const { error } = await supabase
    .from('active_duels')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

// ─── Friendships ──────────────────────────────────────────────────────────────

export async function searchPlayers(query, selfId, limit = 20) {
  const q = (query || '').trim()
  if (q.length < 2) return []
  const { data } = await supabase
    .from('profiles')
    .select('id, username, rating, level, city, class')
    .ilike('username', `%${q}%`)
    .neq('id', selfId)
    .order('rating', { ascending: false })
    .limit(limit)
  return data || []
}

// Returns array of friend profiles (the OTHER side of each accepted friendship).
// Each item also includes `friendshipId` so we can unfriend.
export async function getFriends(userId) {
  const { data } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id,
      requester:profiles!friendships_requester_id_fkey (id, username, rating, level, city, class),
      addressee:profiles!friendships_addressee_id_fkey (id, username, rating, level, city, class)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')
  if (!data) return []
  return data.map(f => {
    const other = f.requester_id === userId ? f.addressee : f.requester
    return { ...other, friendshipId: f.id }
  })
}

// Pending requests where current user is the addressee (incoming).
export async function getIncomingFriendRequests(userId) {
  const { data } = await supabase
    .from('friendships')
    .select(`
      id, created_at,
      requester:profiles!friendships_requester_id_fkey (id, username, rating, level, city, class)
    `)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (!data) return []
  return data.map(r => ({ requestId: r.id, ...r.requester }))
}

// For a list of profile IDs, return a map of relationship status to current user.
// Map shape: { [profileId]: { kind: 'friend'|'pending_sent'|'pending_received', id } }
export async function getRelationshipMap(userId, otherIds) {
  if (!otherIds || !otherIds.length) return {}
  const { data } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  const map = {}
  const want = new Set(otherIds)
  for (const f of (data || [])) {
    const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id
    if (!want.has(otherId)) continue
    if (f.status === 'accepted') map[otherId] = { kind: 'friend', id: f.id }
    else if (f.requester_id === userId) map[otherId] = { kind: 'pending_sent', id: f.id }
    else map[otherId] = { kind: 'pending_received', id: f.id }
  }
  return map
}

export async function sendFriendRequest(requesterId, addresseeId) {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
  if (error) throw error
}

export async function acceptFriendRequest(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
  if (error) throw error
}

export async function removeFriendship(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
  if (error) throw error
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

// Create a new open tournament. Any authed user can host.
export async function createTournament({ name, maxPlayers = 8, prizeCoins = 200 }) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({ name, status: 'open', max_players: maxPlayers, prize_coins: prizeCoins })
    .select()
    .single()
  if (error) throw error
  return data
}

// Returns the latest non-finished tournament (open or active) or the latest finished one as fallback.
export async function getCurrentTournament() {
  const { data: open } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['open', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
  if (open && open.length) return open[0]
  const { data: any } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  return any?.[0] || null
}

export async function getTournamentParticipants(tournamentId) {
  const { data } = await supabase
    .from('tournament_participants')
    .select(`
      id, joined_at, final_rank,
      profile:profiles!tournament_participants_player_id_fkey (id, username, rating, level, class, city)
    `)
    .eq('tournament_id', tournamentId)
    .order('joined_at', { ascending: true })
  return (data || []).map(p => ({ ...p.profile, joined_at: p.joined_at, participantRowId: p.id, final_rank: p.final_rank }))
}

export async function getTournamentMatches(tournamentId) {
  const { data } = await supabase
    .from('tournament_matches')
    .select(`
      id, round, bracket_slot, status, winner_id, duel_invite_code, player1_id, player2_id,
      player1:profiles!tournament_matches_player1_id_fkey (id, username, rating, class),
      player2:profiles!tournament_matches_player2_id_fkey (id, username, rating, class)
    `)
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('bracket_slot', { ascending: true })
  return data || []
}

export async function joinTournament(tournamentId, playerId) {
  const { error } = await supabase
    .from('tournament_participants')
    .insert({ tournament_id: tournamentId, player_id: playerId })
  if (error) throw error
}

export async function leaveTournament(tournamentId, playerId) {
  const { error } = await supabase
    .from('tournament_participants')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('player_id', playerId)
  if (error) throw error
}

// Report winner of a tournament match. Must be one of the two players.
export async function reportMatchWinner(matchId, winnerId) {
  const { error } = await supabase
    .from('tournament_matches')
    .update({ winner_id: winnerId })
    .eq('id', matchId)
  if (error) throw error
}

// Link a match to a duel (when player clicks "Play")
export async function setMatchDuelCode(matchId, inviteCode) {
  const { error } = await supabase
    .from('tournament_matches')
    .update({ duel_invite_code: inviteCode, status: 'in_progress' })
    .eq('id', matchId)
  if (error) throw error
}

// ─── School ───────────────────────────────────────────────────────────────────

// Find the user's current class context. Returns:
//   { role: 'teacher', class: {...} }  if user teaches a class
//   { role: 'student', class: {...}, membership: {...} } if user is in a class
//   { role: null } otherwise.
// (For MVP we assume a user is in at most one class.)
export async function getMySchoolRole(userId) {
  if (!userId) return { role: null }

  const { data: ownClass } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (ownClass) return { role: 'teacher', class: ownClass }

  const { data: membership } = await supabase
    .from('class_members')
    .select('id, joined_at, class:classes!class_members_class_id_fkey(*)')
    .eq('student_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (membership) return { role: 'student', class: membership.class, membership }

  return { role: null }
}

export async function createSchoolClass(teacherId, name) {
  const { data, error } = await supabase
    .from('classes')
    .insert({ teacher_id: teacherId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinSchoolClass(joinCode, studentId) {
  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('join_code', joinCode.toUpperCase())
    .maybeSingle()
  if (!cls) return null
  const { error } = await supabase
    .from('class_members')
    .insert({ class_id: cls.id, student_id: studentId })
  if (error && !String(error.message || '').includes('duplicate')) throw error
  return cls
}

export async function leaveSchoolClass(classId, studentId) {
  const { error } = await supabase
    .from('class_members')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)
  if (error) throw error
}

export async function deleteSchoolClass(classId) {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)
  if (error) throw error
}

// Roster: list of student profiles in a class.
export async function getClassRoster(classId) {
  const { data } = await supabase
    .from('class_members')
    .select(`
      id, joined_at,
      profile:profiles!class_members_student_id_fkey (id, username, rating, level, city, class, games_played, games_won)
    `)
    .eq('class_id', classId)
    .order('joined_at', { ascending: true })
  return (data || [])
    .filter(m => m.profile)
    .map(m => ({ ...m.profile, joinedAt: m.joined_at, membershipId: m.id }))
}

export async function getClassHomework(classId) {
  const { data } = await supabase
    .from('class_homework')
    .select('*')
    .eq('class_id', classId)
    .order('assigned_at', { ascending: true })
  return data || []
}

export async function assignHomework(classId, puzzle) {
  const { error } = await supabase
    .from('class_homework')
    .insert({
      class_id:   classId,
      puzzle_key: puzzle.id,
      theme_key:  puzzle.themeKey || null,
      rating:     puzzle.rating ?? null,
      fen:        puzzle.fen || null,
    })
  if (error && !String(error.message || '').includes('duplicate')) throw error
}

export async function removeHomework(homeworkId) {
  const { error } = await supabase
    .from('class_homework')
    .delete()
    .eq('id', homeworkId)
  if (error) throw error
}

// All submissions for a class (used by teacher to see completion).
export async function getClassSubmissions(classId) {
  const { data: hw } = await supabase
    .from('class_homework')
    .select('id')
    .eq('class_id', classId)
  const hwIds = (hw || []).map(h => h.id)
  if (!hwIds.length) return []
  const { data } = await supabase
    .from('homework_submissions')
    .select('id, homework_id, student_id, completed_at')
    .in('homework_id', hwIds)
  return data || []
}

// Just the IDs of homework this student has finished.
export async function getMySubmissions(studentId) {
  const { data } = await supabase
    .from('homework_submissions')
    .select('homework_id')
    .eq('student_id', studentId)
  return (data || []).map(s => s.homework_id)
}

export async function submitHomework(homeworkId, studentId) {
  const { error } = await supabase
    .from('homework_submissions')
    .insert({ homework_id: homeworkId, student_id: studentId })
  if (error && !String(error.message || '').includes('duplicate')) throw error
}

// ─── Chess locations (map) ────────────────────────────────────────────────────

export async function getChessLocations({ city = null, types = null } = {}) {
  let q = supabase.from('chess_locations').select('*').order('verified', { ascending: false }).order('created_at', { ascending: false })
  if (city)             q = q.eq('city', city)
  if (types?.length)    q = q.in('type', types)
  const { data } = await q
  return data || []
}

export async function addChessLocation(loc) {
  const { data, error } = await supabase
    .from('chess_locations')
    .insert(loc)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteChessLocation(id) {
  const { error } = await supabase
    .from('chess_locations')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Location requests (user submits, admin reviews) ──────────────────────────

export async function addLocationRequest(req) {
  const { data, error } = await supabase
    .from('location_requests')
    .insert(req)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLocationRequests({ status = null } = {}) {
  let q = supabase
    .from('location_requests')
    .select('*, requester:profiles!requested_by(username)')
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function approveLocationRequest(requestId, adminId) {
  const { data: req, error: fetchErr } = await supabase
    .from('location_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  if (fetchErr) throw fetchErr

  const { data: created, error: insertErr } = await supabase
    .from('chess_locations')
    .insert({
      name: req.name, type: req.type, city: req.city, address: req.address,
      lat: req.lat, lon: req.lon,
      description: req.description, contact: req.contact, schedule: req.schedule,
      verified: true, added_by: req.requested_by,
    })
    .select()
    .single()
  if (insertErr) throw insertErr

  const { error: updateErr } = await supabase
    .from('location_requests')
    .update({ status: 'approved', reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId)
  if (updateErr) throw updateErr

  return created
}

export async function rejectLocationRequest(requestId, adminId, note = null) {
  const { error } = await supabase
    .from('location_requests')
    .update({
      status: 'rejected', reviewed_by: adminId,
      review_note: note, reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
  if (error) throw error
}
