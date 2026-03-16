import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { todayKey, getDayName, getStreakForHabit } from '../lib/helpers'

export default function HabitsView() {
  const { data } = useData()
  const [showArchived, setShowArchived] = useState(false)

  if (!data) return null

  const today = todayKey()
  const todayDay = (new Date().getDay() + 6) % 7

  const active = data.habits.filter(h => !h.archivedAt)
  const archived = data.habits.filter(h => !!h.archivedAt)

  const habitsForToday = active.filter(h => h.days.includes(todayDay))
  const otherHabits = active.filter(h => !h.days.includes(todayDay))

  const habitsDoneToday = habitsForToday.filter(h => h.doneDates.includes(today)).length
  const totalStreak = active.reduce((max, h) => {
    const s = getStreakForHabit(h.doneDates)
    return s > max ? s : max
  }, 0)

  const totalDone = active.reduce((sum, h) => sum + h.doneDates.length, 0)

  const renderHabit = (habit: typeof active[0]) => {
    const isDoneToday = habit.doneDates.includes(today)
    const streak = getStreakForHabit(habit.doneDates)

    // Letzte 7 Tage
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayIdx = (d.getDay() + 6) % 7
      const isScheduled = habit.days.includes(dayIdx)
      const done = habit.doneDates.includes(key)
      last7.push({ key, dayIdx, isScheduled, done, isToday: key === today })
    }

    // Color based on streak
    const glowColor = streak >= 7 ? 'var(--accent-glow)' : 'transparent'

    return (
      <div
        key={habit.id}
        className="g-card-sm"
        style={{
          cursor: 'pointer',
          marginBottom: '8px',
          ...(isDoneToday ? { boxShadow: `0 0 20px ${glowColor}` } : {}),
        }}
      >
        <div className="card-glow" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              background: isDoneToday ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
            }}>
              {getHabitEmoji(habit)}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isDoneToday ? 'var(--accent)' : 'var(--text)' }}>
                {habit.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {habit.days.map(d => getDayName(d)).join(', ')}
              </div>
            </div>
          </div>
          {streak > 0 && (
            <div style={{ fontSize: '18px', fontWeight: 900, minWidth: '36px', textAlign: 'right', color: 'var(--orange)' }}>
              {streak}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="habit-progress-bar">
          <div
            className="habit-progress-fill"
            style={{
              width: `${Math.min(100, (habit.doneDates.filter(d => {
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                const dDate = new Date(d)
                return dDate >= sevenDaysAgo
              }).length / 7) * 100)}%`,
              background: isDoneToday
                ? 'linear-gradient(90deg, var(--accent), #14b8a6)'
                : 'linear-gradient(90deg, var(--text-tertiary), var(--text-secondary))',
              boxShadow: isDoneToday ? '0 0 8px var(--accent-glow)' : 'none',
            }}
          />
        </div>

        {/* 7-Tage Dots */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'space-between' }}>
          {last7.map((day, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
              <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {getDayName(day.dayIdx)}
              </span>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 900,
                background: day.done
                  ? 'linear-gradient(135deg, var(--accent), #14b8a6)'
                  : day.isToday
                    ? 'rgba(255,255,255,0.06)'
                    : day.isScheduled
                      ? 'rgba(255,255,255,0.03)'
                      : 'transparent',
                color: day.done ? '#000' : 'var(--text-tertiary)',
                border: day.isToday && !day.done ? '1px solid var(--accent-glow)' : 'none',
                boxShadow: day.done ? '0 2px 8px var(--accent-glow)' : 'none',
              }}>
                {day.done ? '\u2713' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Header */}
      <div>
        <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.3px' }}>
          Tracker
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--accent)' }}>
            {habitsDoneToday}/{habitsForToday.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Heute
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--orange)' }}>
            {totalStreak}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Streak
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--purple)' }}>
            {totalDone}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Gesamt
          </div>
        </div>
      </div>

      {/* Heute */}
      {habitsForToday.length > 0 && (
        <div>
          <div className="section-label">Heute</div>
          <div className="habits-grid">{habitsForToday.map(renderHabit)}</div>
        </div>
      )}

      {/* Andere */}
      {otherHabits.length > 0 && (
        <div>
          <div className="section-label">Andere Tage</div>
          <div className="habits-grid">{otherHabits.map(renderHabit)}</div>
        </div>
      )}

      {/* Archiviert */}
      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 600,
              padding: '12px 0', display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {showArchived ? '\u25BC' : '\u25B6'} Archiviert ({archived.length})
          </button>
          {showArchived && (
            <div style={{ opacity: 0.5 }}>
              {archived.map(renderHabit)}
            </div>
          )}
        </div>
      )}

      {active.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F3AF}'}</div>
          <p style={{ fontSize: '14px' }}>Keine Habits vorhanden</p>
        </div>
      )}
    </div>
  )
}

function getHabitEmoji(habit: { title: string }): string {
  const t = habit.title.toLowerCase()
  if (t.includes('lesen') || t.includes('buch')) return '\u{1F4D6}'
  if (t.includes('meditat')) return '\u{1F9D8}'
  if (t.includes('wasser') || t.includes('trinken')) return '\u{1F4A7}'
  if (t.includes('training') || t.includes('sport') || t.includes('gym')) return '\u{1F4AA}'
  if (t.includes('obst') || t.includes('frucht')) return '\u{1F34E}'
  if (t.includes('arabisch') || t.includes('sprach')) return '\u{1F1E6}\u{1F1EA}'
  if (t.includes('früh') || t.includes('aufsteh') || t.includes('schlaf')) return '\u{1F6CF}'
  if (t.includes('yoga')) return '\u{1F9D8}'
  if (t.includes('lauf') || t.includes('joggen')) return '\u{1F3C3}'
  if (t.includes('kochen')) return '\u{1F373}'
  return '\u{2705}'
}
