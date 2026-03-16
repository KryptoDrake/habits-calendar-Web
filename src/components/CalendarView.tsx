import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { todayKey, parseKey, getMonthName } from '../lib/helpers'

export default function CalendarView() {
  const { data } = useData()
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  if (!data) return null

  const today = todayKey()
  const activeTodos = data.todos.filter(t => !t.deletedAt)
  const activeHabits = data.habits.filter(h => !h.archivedAt)

  // Todos pro Datum
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

  // Selected day data
  const selectedDayTodos = activeTodos.filter(t => t.date === selectedDate)
  const pendingTodos = selectedDayTodos.filter(t => !t.done)
  const doneTodos = selectedDayTodos.filter(t => t.done)

  const selectedDayIdx = (parseKey(selectedDate).getDay() + 6) % 7
  const habitsForDay = activeHabits.filter(h => h.days.includes(selectedDayIdx))
  const habitsDoneOnDay = habitsForDay.filter(h => h.doneDates.includes(selectedDate))

  const listById = Object.fromEntries(data.todoLists.map(l => [l.id, l]))
  const selectedLabel = parseKey(selectedDate).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const getHeatClass = (count: number): string => {
    if (count <= 0) return ''
    if (count <= 2) return 'heat-1'
    if (count <= 5) return 'heat-2'
    return 'heat-3'
  }

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.3px' }}>
          Kalender
        </h1>
      </div>

      <div className="calendar-layout">
      {/* Left: Calendar */}
      <div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '18px', padding: '8px',
          }}
        >
          &#x25C0;
        </button>
        <span style={{ fontWeight: 800, fontSize: '16px' }}>
          {getMonthName(month)} {year}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '18px', padding: '8px',
          }}
        >
          &#x25B6;
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {/* Day headers */}
        {dayNames.map(d => (
          <div key={d} style={{
            fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700,
            textAlign: 'center', padding: '8px 0',
          }}>
            {d}
          </div>
        ))}

        {/* Empty cells */}
        {Array.from({ length: startWeekday - 1 }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: lastDay.getDate() }).map((_, i) => {
          const day = i + 1
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === today
          const isSelected = key === selectedDate && !isToday
          const count = countByDate[key] ?? 0
          const heatClass = getHeatClass(count)

          return (
            <div
              key={key}
              className={`cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isToday && !isSelected ? heatClass : ''}`}
              onClick={() => setSelectedDate(key)}
            >
              {day}
              {count > 0 && (
                <div style={{
                  position: 'absolute', bottom: '4px',
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: isToday ? '#000' : 'var(--accent)',
                }} />
              )}
            </div>
          )
        })}
      </div>

      </div>{/* end left */}

      {/* Right: Selected Day Details */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {selectedLabel}
        </div>

        {/* Habits */}
        {habitsForDay.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div className="section-label" style={{ margin: '0 0 8px' }}>
              Habits &middot; {habitsDoneOnDay.length}/{habitsForDay.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {habitsForDay.map(h => {
                const done = h.doneDates.includes(selectedDate)
                return (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: 'var(--radius-xs)',
                    background: done ? 'var(--accent-dim)' : 'rgba(255,255,255,0.025)',
                  }}>
                    <div className={`glass-check ${done ? 'checked' : ''}`} style={{ width: '18px', height: '18px', borderRadius: '6px' }}>
                      {done ? '\u2713' : ''}
                    </div>
                    <span style={{
                      fontSize: '13px', fontWeight: 500,
                      color: done ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {h.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Todos */}
        {(pendingTodos.length > 0 || doneTodos.length > 0) ? (
          <div>
            {pendingTodos.length > 0 && (
              <div className="section-label" style={{ margin: '0 0 8px' }}>
                To-Dos &middot; {pendingTodos.length}
              </div>
            )}
            {[...pendingTodos, ...doneTodos].map(t => (
              <div
                key={t.id}
                className="g-card-sm"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '6px',
                  ...(t.done ? { opacity: 0.4 } : {}),
                }}
              >
                <div className={`glass-check ${t.done ? 'checked' : ''}`} style={{ width: '18px', height: '18px', borderRadius: '6px' }}>
                  {t.done ? '\u2713' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    ...(t.done ? { textDecoration: 'line-through', color: 'var(--text-tertiary)' } : {}),
                  }}>
                    {t.title}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    {t.time && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.time}</span>}
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{listById[t.listId]?.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : habitsForDay.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '13px' }}>Keine Einträge</p>
          </div>
        ) : null}
      </div>{/* end right */}
      </div>{/* end calendar-layout */}
    </div>
  )
}
