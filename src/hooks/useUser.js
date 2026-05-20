import { useState, useEffect, useCallback } from 'react'
import { supabase, getProfile, updateProfile, ensureProfile } from '../lib/supabase'

export function useUser() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(u) {
    setLoading(true)
    let p = await getProfile(u.id)
    // If the auth user has no profile row yet (e.g. trigger not set up), create one.
    if (!p) p = await ensureProfile(u)
    setProfile(p)
    setLoading(false)
  }

  const refreshProfile = useCallback(() => {
    if (user) loadProfile(user)
  }, [user])

  const applyGameResult = useCallback(async ({ result, coinsDelta, xpDelta, playerClass }) => {
    if (!user || !profile) return
    const xpBonus = playerClass === 'tactician' ? Math.floor(xpDelta * 1.1) : xpDelta
    const coinBonus = playerClass === 'attacker' && result === 'win' ? Math.floor(coinsDelta * 1.15) : coinsDelta
    const newXp    = Math.max(0, profile.xp + xpBonus)
    const newCoins = Math.max(0, profile.coins + coinBonus)
    const newLevel = Math.floor(newXp / 500) + 1
    const newRating = profile.rating + (result === 'win' ? 25 : result === 'draw' ? 5 : -15)
    const updates = {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      rating: Math.max(100, newRating),
      games_played: profile.games_played + 1,
      games_won: result === 'win' ? profile.games_won + 1 : profile.games_won,
    }
    const updated = await updateProfile(user.id, updates)
    setProfile(updated)
    return { xpBonus, coinBonus }
  }, [user, profile])

  return { user, profile, loading, refreshProfile, applyGameResult, setProfile }
}
