import { useState, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { todayKey, getStreakForHabit, formatDate, parseKey, getMonthName } from '../lib/helpers'
import { Target, Flame, ChevronLeft, ChevronRight } from 'lucide-react'

type Tab = 'dashboard' | 'todos' | 'calendar' | 'habits' | 'essen'

function ProgressRing({ progress, size = 44, stroke = 4, color = 'var(--accent)' }: {
  progress: number; size?: number; stroke?: number; color?: string
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (Math.min(progress, 1) * circ)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 6px ${color})` }} />
    </svg>
  )
}

function MiniCalendar({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data } = useData()
  const today = todayKey()
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  if (!data) return null

  const activeTodos = data.todos.filter(t => !t.deletedAt)
  const countByDate: Record<string, number> = {}
  for (const t of activeTodos) {
    if (t.done || !t.date) continue
    countByDate[t.date] = (countByDate[t.date] ?? 0) + 1
  }

  const { year, month } = viewMonth
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startWeekday = firstDay.getDay()
  if (startWeekday === 0) startWeekday = 7
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const navigateMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button onClick={() => navigateMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)' }}>
          {getMonthName(month)} {year}
        </span>
        <button onClick={() => navigateMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {dayNames.map(d => (
          <div key={d} style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 700, textAlign: 'center', padding: '4px 0' }}>{d}</div>
        ))}
        {Array.from({ length: startWeekday - 1 }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: lastDay.getDate() }).map((_, i) => {
          const day = i + 1
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === today
          const count = countByDate[key] ?? 0
          return (
            <div
              key={key}
              onClick={() => onNavigate('calendar')}
              style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: isToday ? 800 : 500, borderRadius: '8px', cursor: 'pointer',
                position: 'relative',
                background: isToday
                  ? 'linear-gradient(135deg, var(--accent), #14b8a6)'
                  : count > 0 ? `rgba(45,212,191,${Math.min(0.06 + count * 0.06, 0.24)})` : 'transparent',
                color: isToday ? '#000' : count > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                transition: 'all 0.2s',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data } = useData()
  if (!data) return null

  const today = todayKey()
  const now = new Date()
  const activeTodos = data.todos.filter(t => !t.deletedAt)
  const todayTodos = activeTodos.filter(t => !t.done && t.date && t.date <= today)
  const overdueTodos = activeTodos.filter(t => !t.done && t.date && t.date < today)
  const totalOpen = activeTodos.filter(t => !t.done).length

  const activeHabits = data.habits.filter(h => !h.archivedAt)
  const todayDay = (now.getDay() + 6) % 7
  const habitsForToday = activeHabits.filter(h => h.days.includes(todayDay))
  const habitsDoneToday = habitsForToday.filter(h => h.doneDates.includes(today))
  const habitProgress = habitsForToday.length > 0 ? habitsDoneToday.length / habitsForToday.length : 0

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'
  const dateLabel = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  const bestStreak = activeHabits.reduce((max, h) => {
    const s = getStreakForHabit(h.doneDates)
    return s > max ? s : max
  }, 0)

  // Upcoming todos (next 7)
  const upcoming = activeTodos
    .filter(t => !t.done && t.date && t.date >= today)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    .slice(0, 7)

  const listById = Object.fromEntries(data.todoLists.map(l => [l.id, l]))

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero */}
      <div>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.8px', lineHeight: 1.1 }}>
          {greeting}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{dateLabel}</p>
      </div>

      {/* ===== MAIN: 2-column layout ===== */}
      <div className="dash-main-grid">

        {/* ---- LEFT: Todos (dominant) ---- */}
        <div className="g-card dash-todos" onClick={() => onNavigate('todos')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Heutige To-Dos
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {overdueTodos.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px',
                  background: 'rgba(248,113,113,0.12)', color: 'var(--error)',
                }}>
                  {overdueTodos.length} überfällig
                </span>
              )}
              <span style={{
                fontSize: '22px', fontWeight: 900, color: 'var(--blue)', lineHeight: 1,
              }}>
                {todayTodos.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {upcoming.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '10px',
                background: t.date < today ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.025)',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '4px', height: '24px', borderRadius: '2px', flexShrink: 0,
                  background: t.priority === 'high' ? 'var(--error)' : t.priority === 'medium' ? 'var(--warning)' : 'rgba(255,255,255,0.08)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 500, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '1px' }}>
                    {t.time && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.time}</span>}
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {t.date === today ? (listById[t.listId]?.title || '') : formatDate(t.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                Keine offenen To-Dos
              </div>
            )}
            {totalOpen > 7 && (
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>
                +{totalOpen - 7} weitere
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT: Calendar + Habits ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Mini Calendar */}
          <div className="g-card" onClick={() => onNavigate('calendar')} style={{ cursor: 'pointer' }}>
            <div className="card-glow" />
            <MiniCalendar onNavigate={onNavigate} />
          </div>

          {/* Habits compact */}
          <div className="g-card" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer' }}>
            <div className="card-glow" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ProgressRing progress={habitProgress} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: 'var(--accent)',
                }}>
                  {Math.round(habitProgress * 100)}%
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Habits
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1, marginTop: '2px' }}>
                  {habitsDoneToday.length}<span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>/{habitsForToday.length}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
                {habitsForToday.slice(0, 4).map(h => {
                  const done = h.doneDates.includes(today)
                  return (
                    <span key={h.id} style={{
                      fontSize: '10px', fontWeight: 600, padding: '3px 7px', borderRadius: '6px',
                      background: done ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                      color: done ? 'var(--accent)' : 'var(--text-tertiary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px',
                    }}>
                      {done ? '\u2713 ' : ''}{h.title}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: Compact stats row ===== */}
      <div className="dash-stats-row">
        {/* Streak */}
        <div className="g-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => onNavigate('habits')}>
          <Flame className="w-5 h-5" style={{ color: 'var(--orange)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1, color: 'var(--orange)' }}>{bestStreak}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '1px' }}>Tage Streak</div>
          </div>
        </div>

        {/* Open Todos */}
        <div className="g-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => onNavigate('todos')}>
          <Target className="w-5 h-5" style={{ color: 'var(--blue)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1, color: 'var(--blue)' }}>{totalOpen}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '1px' }}>Offen</div>
          </div>
        </div>

        {/* Recipes */}
        <div className="g-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => onNavigate('essen')}>
          <div style={{ fontSize: '18px', flexShrink: 0 }}>{'\u{1F468}\u200D\u{1F373}'}</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1, color: 'var(--orange)' }}>{data.recipes.length}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '1px' }}>Rezepte</div>
          </div>
        </div>

        {/* Shopping */}
        <div className="g-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => onNavigate('essen')}>
          <div style={{ fontSize: '18px', flexShrink: 0 }}>{'\u{1F6D2}'}</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1, color: 'var(--success)' }}>{data.shoppingList.filter(s => !s.checked).length}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '1px' }}>Einkauf</div>
          </div>
        </div>
      </div>
    </div>
  )
}
