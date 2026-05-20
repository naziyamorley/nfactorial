import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { LESSONS, getLessonById, getDoneLessons, markLessonDone } from '../lib/lessons'
import { getActiveSkin } from '../lib/skins'
import { IconBook, IconCheck, IconArrowRight, IconScroll } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

export default function LessonsPage() {
  const { lessonId } = useParams()
  if (lessonId) return <LessonView lessonId={lessonId} />
  return <LessonsIndex />
}

function LessonsIndex() {
  const { t } = useLang()
  const done  = getDoneLessons()

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span style={{ color: 'var(--accent-blue)' }}><IconBook size={32} color="currentColor" /></span>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('lessons_title')}</div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, maxWidth: 540 }}>
        {t('lessons_subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {LESSONS.map(l => {
          const isDone = done.has(l.id)
          return (
            <Link
              key={l.id}
              to={`/lessons/${l.id}`}
              className="card-hover"
              style={{
                textDecoration: 'none',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                borderRadius: 16,
                padding: '20px 22px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}
            >
              {isDone && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--accent-green)', color: 'var(--ink-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconCheck size={14} color="currentColor" />
                </div>
              )}
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: 2, color: 'var(--accent-blue)',
                background: 'var(--tint-blue)', padding: '3px 8px', borderRadius: 6,
                alignSelf: 'flex-start', marginBottom: 12,
              }}>
                {t(l.levelKey)}
              </span>
              <div style={{ ...display, fontSize: 22, color: 'var(--text)', marginBottom: 6, lineHeight: 1.1 }}>{t(l.titleKey)}</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>{t(l.descKey)}</p>
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-blue)', fontSize: 12, fontWeight: 600 }}>
                <IconScroll size={13} color="currentColor" />
                {l.sections.length} {t('lesson_sections')}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function LessonView({ lessonId }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId)
  const [step, setStep] = useState(0)
  const skin = getActiveSkin()

  if (!lesson) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 28px', textAlign: 'center', color: 'var(--muted)' }}>
        <Link to="/lessons" style={{ color: 'var(--accent-blue)' }}>← {t('lessons_back')}</Link>
      </div>
    )
  }

  const section  = lesson.sections[step]
  const isLast   = step === lesson.sections.length - 1
  const progress = ((step + 1) / lesson.sections.length) * 100

  function next() {
    if (isLast) {
      markLessonDone(lesson.id)
      navigate('/lessons')
    } else {
      setStep(step + 1)
    }
  }

  const boardPx = Math.min(380, window.innerWidth - 68 - 80)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 28px' }}>
      {/* Top — back link + lesson title + progress */}
      <Link to="/lessons" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        ← {t('lessons_back')}
      </Link>
      <div style={{ ...display, fontSize: 32, color: 'var(--text)', marginBottom: 6, lineHeight: 1 }}>{t(lesson.titleKey)}</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 18px' }}>{t(lesson.descKey)}</p>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-blue)', borderRadius: 99, transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Board (or placeholder) */}
        {section.fen && (
          <div style={{ flexShrink: 0 }}>
            <Chessboard
              options={{
                position: section.fen,
                allowDragging: false,
                boardStyle: { borderRadius: 12, boxShadow: '0 8px 24px var(--shadow)', width: boardPx, height: boardPx },
                lightSquareStyle: { backgroundColor: skin.light },
                darkSquareStyle:  { backgroundColor: skin.dark },
              }}
            />
          </div>
        )}

        {/* Section content */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted-soft)', letterSpacing: 2 }}>
            {(step + 1).toString().padStart(2, '0')} / {lesson.sections.length.toString().padStart(2, '0')}
          </span>
          <div style={{ ...display, fontSize: 24, color: 'var(--text)', margin: '6px 0 12px', lineHeight: 1.1 }}>
            {t(section.titleKey)}
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, margin: '0 0 24px', whiteSpace: 'pre-line' }}>
            {t(section.bodyKey)}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '11px 18px', borderRadius: 11, cursor: 'pointer',
                  background: 'transparent', border: '1.5px solid var(--border)',
                  color: 'var(--muted)', fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13,
                }}
              >
                ← {t('lesson_prev')}
              </button>
            )}
            <button
              onClick={next}
              className="btn-cta"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              {isLast ? t('lesson_finish') : t('lesson_next')} <IconArrowRight size={14} color="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
