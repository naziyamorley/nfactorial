import { useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useUser } from './hooks/useUser'
import { supabaseConfigured } from './lib/supabase'
import { useLang } from './lib/i18n'
import { IconChessKing, IconChessRook } from './components/Icons'
import Auth from './components/Auth'
import ClassSelector from './components/ClassSelector'
import OnboardingLevel from './components/OnboardingLevel'
import TopBar from './components/TopBar'
import Dashboard from './components/Dashboard'
import ChessGame from './components/ChessGame'
import AICoach from './components/AICoach'
import Leaderboard from './components/Leaderboard'
import Profile from './components/Profile'
import CoachChat from './components/CoachChat'
import PuzzlePage from './components/PuzzlePage'
import FriendsPage from './components/FriendsPage'
import TournamentPage from './components/TournamentPage'
// Lazy-load heavy/secondary routes to keep the initial bundle small.
const MapPage      = lazy(() => import('./components/MapPage'))       // pulls in Leaflet (~200KB)
const SchoolPage   = lazy(() => import('./components/SchoolPage'))
const UpgradePro   = lazy(() => import('./components/UpgradePro'))
const LessonsPage  = lazy(() => import('./components/LessonsPage'))
const HeroesPage   = lazy(() => import('./components/HeroesPage'))
const AboutPage    = lazy(() => import('./components/AboutPage'))
const Landing      = lazy(() => import('./components/Landing'))

const BASE_DEMO = {
  id: 'demo',
  class: 'tactician',
  xp: 0,
  level: 1,
  coins: 100,
  rating: 1000,
  city: 'Алматы',
  is_pro: false,
  games_played: 0,
  games_won: 0,
}

// ─── Game page wrapper ────────────────────────────────────────────────────────
function GamePage({ profile, applyGameResult }) {
  const { mode, code } = useParams()
  const navigate = useNavigate()

  const [gameConfig] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gameConfig') || '{}') } catch { return {} }
  })

  const [coachData, setCoachData] = useState(null)

  const skillLevel = gameConfig.skillLevel || 10
  const gameMode   = mode || gameConfig.mode || 'vs_ai'

  async function handleGameEnd({ result, pgn, coinsDelta, xpDelta, durationS }) {
    if (profile && applyGameResult) {
      await applyGameResult({ result, coinsDelta, xpDelta, playerClass: profile.class })
    }
    setCoachData({ result, pgn, coinsDelta, xpDelta, durationS })
  }

  return (
    <div style={{ minHeight: '100%' }}>
      <ChessGame
        profile={profile}
        mode={gameMode}
        skillLevel={skillLevel}
        inviteCode={code}
        onGameEnd={handleGameEnd}
      />

      {coachData && (
        <AICoach
          pgn={coachData.pgn}
          playerClass={profile?.class || 'tactician'}
          result={coachData.result}
          durationS={coachData.durationS}
          coinsDelta={coachData.coinsDelta}
          xpDelta={coachData.xpDelta}
          isPro={profile?.is_pro}
          onClose={() => navigate('/')}
        />
      )}
    </div>
  )
}

function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

// Public layout — top bar + footer for unauthenticated visitors.
const PublicTopBar = lazy(() => import('./components/PublicTopBar'))
const Footer       = lazy(() => import('./components/Footer'))

function PublicPage({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={null}><PublicTopBar /></Suspense>
      <main style={{ flex: 1 }}>{children}</main>
      <Suspense fallback={null}><Footer /></Suspense>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, profile, loading, applyGameResult, setProfile, refreshProfile } = useUser()
  const { t } = useLang()
  const navigate = useNavigate()

  // When Supabase not configured — use demo mode
  const DEMO_PROFILE = { ...BASE_DEMO, username: t('guest') }
  const effectiveProfile = supabaseConfigured ? profile : DEMO_PROFILE
  const isDemo = !supabaseConfigured

  async function onClassSelected(cls) {
    // Optimistic update + refresh from server to get full row (xp/level/coins defaults)
    setProfile(p => ({ ...p, class: cls }))
    try { await refreshProfile() } catch { /* ignore — optimistic state already set */ }
    navigate('/', { replace: true })
  }

  function handleStartGame({ mode, skillLevel, inviteCode }) {
    sessionStorage.setItem('gameConfig', JSON.stringify({ mode, skillLevel, inviteCode }))
    if (mode === 'duel' && inviteCode) {
      navigate(`/duel/${inviteCode}`)
    } else {
      navigate(`/game/${mode}`)
    }
  }

  // Loading splash
  if (loading && supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="animate-pulse" style={{ display: 'inline-block', color: 'var(--text)', marginBottom: 16 }}>
            <IconChessKing size={64} color="currentColor" />
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('app_loading')}</p>
        </div>
      </div>
    )
  }

  // Not logged in (only when Supabase is configured) — public site with landing
  if (supabaseConfigured && !user) {
    return (
      <Routes>
        <Route path="/" element={<Suspense fallback={<RouteFallback />}><Landing /></Suspense>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/lessons" element={<PublicPage><Suspense fallback={<RouteFallback />}><LessonsPage /></Suspense></PublicPage>} />
        <Route path="/lessons/:lessonId" element={<PublicPage><Suspense fallback={<RouteFallback />}><LessonsPage /></Suspense></PublicPage>} />
        <Route path="/heroes" element={<PublicPage><Suspense fallback={<RouteFallback />}><HeroesPage /></Suspense></PublicPage>} />
        <Route path="/about" element={<PublicPage><Suspense fallback={<RouteFallback />}><AboutPage page="about" /></Suspense></PublicPage>} />
        <Route path="/privacy" element={<PublicPage><Suspense fallback={<RouteFallback />}><AboutPage page="privacy" /></Suspense></PublicPage>} />
        <Route path="/terms" element={<PublicPage><Suspense fallback={<RouteFallback />}><AboutPage page="terms" /></Suspense></PublicPage>} />
        <Route path="/contact" element={<PublicPage><Suspense fallback={<RouteFallback />}><AboutPage page="contact" /></Suspense></PublicPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Logged in but no class set yet
  if (supabaseConfigured && profile && !profile.class) {
    return <ClassSelector userId={user.id} onComplete={onClassSelected} />
  }

  // Class set but onboarding not complete — show level picker
  const onboardedLocal = typeof window !== 'undefined' && localStorage.getItem(`chessy_onboarded_${user?.id}`) === '1'
  if (supabaseConfigured && profile && profile.class && !profile.onboarded && !onboardedLocal) {
    return (
      <OnboardingLevel
        userId={user.id}
        onComplete={async () => {
          localStorage.setItem(`chessy_onboarded_${user.id}`, '1')
          try { await refreshProfile() } catch { /* ignore */ }
          navigate('/', { replace: true })
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minHeight: '100dvh', background: 'var(--bg)' }}>
      <TopBar profile={effectiveProfile} />

      <div className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {isDemo && (
          <div style={{ background: '#FA2D1A', textAlign: 'center', padding: '8px 16px', flexShrink: 0 }}>
            <p style={{ color: 'var(--ink-light)', fontSize: 12, margin: 0, fontWeight: 600 }}>
              {t('demo_banner')}
            </p>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  profile={effectiveProfile}
                  onStartGame={handleStartGame}
                  onSpendCoins={supabaseConfigured
                    ? (amount) => applyGameResult({ result: 'spend', coinsDelta: -amount, xpDelta: 0, playerClass: effectiveProfile?.class })
                    : null}
                />
              }
            />
            <Route
              path="/game/:mode"
              element={<GamePage profile={effectiveProfile} applyGameResult={supabaseConfigured ? applyGameResult : null} />}
            />
            <Route
              path="/duel/:code"
              element={<GamePage profile={effectiveProfile} applyGameResult={supabaseConfigured ? applyGameResult : null} />}
            />
            <Route
              path="/puzzles"
              element={
                <PuzzlePage
                  profile={effectiveProfile}
                  onEarnCoins={supabaseConfigured
                    ? (amount) => applyGameResult({ result: 'puzzle', coinsDelta: amount, xpDelta: 15, playerClass: effectiveProfile?.class })
                    : null}
                />
              }
            />
            <Route
              path="/tournament"
              element={<TournamentPage profile={effectiveProfile} />}
            />
            <Route
              path="/school"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SchoolPage navigate={navigate} />
                </Suspense>
              }
            />
            <Route
              path="/map"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <MapPage />
                </Suspense>
              }
            />
            <Route
              path="/friends"
              element={<FriendsPage profile={effectiveProfile} onViewProfile={(id) => navigate(`/profile/${id}`)} />}
            />
            <Route
              path="/coach"
              element={<CoachChat profile={effectiveProfile} />}
            />
            <Route
              path="/leaderboard"
              element={<Leaderboard currentProfile={effectiveProfile} />}
            />
            <Route
              path="/profile"
              element={<Profile profile={effectiveProfile} />}
            />
            <Route
              path="/profile/:userId"
              element={<Profile profile={effectiveProfile} />}
            />
            <Route
              path="/pro"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <UpgradePro profile={effectiveProfile} user={user} />
                </Suspense>
              }
            />
            <Route
              path="/lessons"
              element={<Suspense fallback={<RouteFallback />}><LessonsPage /></Suspense>}
            />
            <Route
              path="/lessons/:lessonId"
              element={<Suspense fallback={<RouteFallback />}><LessonsPage /></Suspense>}
            />
            <Route
              path="/heroes"
              element={<Suspense fallback={<RouteFallback />}><HeroesPage /></Suspense>}
            />
            <Route
              path="/about"
              element={<Suspense fallback={<RouteFallback />}><AboutPage page="about" /></Suspense>}
            />
            <Route
              path="/privacy"
              element={<Suspense fallback={<RouteFallback />}><AboutPage page="privacy" /></Suspense>}
            />
            <Route
              path="/terms"
              element={<Suspense fallback={<RouteFallback />}><AboutPage page="terms" /></Suspense>}
            />
            <Route
              path="/contact"
              element={<Suspense fallback={<RouteFallback />}><AboutPage page="contact" /></Suspense>}
            />
            <Route
              path="*"
              element={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '128px 16px', color: 'var(--muted)' }}>
                  <div style={{ color: 'var(--muted-soft)', marginBottom: 16 }}>
                    <IconChessRook size={72} color="currentColor" />
                  </div>
                  <p style={{ fontSize: 18 }}>{t('not_found')}</p>
                  <button onClick={() => navigate('/')} style={{ marginTop: 16, color: 'var(--text)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    {t('go_home')}
                  </button>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
