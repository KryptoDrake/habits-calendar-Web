import { useData } from '../contexts/DataContext'
import { todayKey, getStreakForHabit } from '../lib/helpers'

type Tab = 'dashboard' | 'todos' | 'calendar' | 'habits' | 'essen'

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

  const shoppingUnchecked = data.shoppingList.filter(s => !s.checked).length
  const recipeCount = data.recipes.length

  // Greeting
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'
  const greetEmoji = hour < 12 ? '\u2600\uFE0F' : hour < 18 ? '\u{1F324}\uFE0F' : '\u{1F319}'

  // Best streak
  const bestStreak = activeHabits.reduce((max, h) => {
    const s = getStreakForHabit(h.doneDates)
    return s > max ? s : max
  }, 0)

  const dateLabel = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Heading */}
      <div>
        <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px' }}>
          {greeting} {greetEmoji}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{dateLabel}</p>
      </div>

      {/* Time-of-day gradient */}
      <div style={{
        height: '6px', borderRadius: '3px', display: 'flex', gap: '3px', overflow: 'hidden',
      }}>
        <div style={{
          flex: 2, borderRadius: '3px', background: 'linear-gradient(90deg, #fbbf24, #fb923c)',
          boxShadow: hour < 12 ? '0 0 12px rgba(251,191,36,0.3)' : 'none',
          opacity: hour < 12 ? 1 : 0.3,
        }} />
        <div style={{
          flex: 3, borderRadius: '3px', background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
          boxShadow: hour >= 12 && hour < 15 ? '0 0 12px rgba(45,212,191,0.3)' : 'none',
          opacity: hour >= 12 && hour < 15 ? 1 : 0.3,
        }} />
        <div style={{
          flex: 2, borderRadius: '3px', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
          boxShadow: hour >= 15 && hour < 18 ? '0 0 8px rgba(96,165,250,0.2)' : 'none',
          opacity: hour >= 15 && hour < 18 ? 1 : 0.3,
        }} />
        <div style={{
          flex: 1.5, borderRadius: '3px', background: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
          boxShadow: hour >= 18 ? '0 0 8px rgba(167,139,250,0.2)' : 'none',
          opacity: hour >= 18 ? 1 : 0.3,
        }} />
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div className="stat-card" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--accent)' }}>
            {habitsDoneToday.length}/{habitsForToday.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Habits
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('todos')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--blue)' }}>
            {todayTodos.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Heute
          </div>
        </div>
        <div className="stat-card" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', color: 'var(--orange)' }}>
            {bestStreak}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Streak
          </div>
        </div>
      </div>

      {/* Habits Orbs */}
      {habitsForToday.length > 0 && (
        <div>
          <div className="section-label">Heutige Habits &middot; {habitsDoneToday.length}/{habitsForToday.length}</div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '8px 0', scrollbarWidth: 'none' }}>
            {habitsForToday.map(h => {
              const done = h.doneDates.includes(today)
              return (
                <div
                  key={h.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '68px', cursor: 'pointer' }}
                  onClick={() => onNavigate('habits')}
                >
                  <div className={`habit-orb-ring ${done ? 'done' : ''}`}>
                    <span style={{ fontSize: '22px', position: 'relative', zIndex: 1 }}>
                      {getHabitEmoji(h)}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center' }}>
                    {h.title.length > 8 ? h.title.slice(0, 8) + '...' : h.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Cards */}
      <div className="dashboard-cards-grid">
        <div className="g-card" onClick={() => onNavigate('todos')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            To-Dos
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{totalOpen}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {overdueTodos.length > 0 ? (
              <span style={{ color: 'var(--error)' }}>{overdueTodos.length} überfällig</span>
            ) : 'offen'}
          </div>
        </div>
        <div className="g-card" onClick={() => onNavigate('essen')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Küche
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{recipeCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Rezepte
          </div>
        </div>
        <div className="g-card" onClick={() => onNavigate('essen')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Einkaufen
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, color: shoppingUnchecked > 0 ? 'var(--success)' : 'var(--text)' }}>
            {shoppingUnchecked}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>offen</div>
        </div>
        <div className="g-card" onClick={() => onNavigate('calendar')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Geplant
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, color: 'var(--purple)' }}>
            {activeTodos.filter(t => !t.done && t.date && t.date > today).length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>kommend</div>
        </div>
      </div>

      {/* Listen */}
      {data.todoLists.length > 0 && (
        <div>
          <div className="section-label">Meine Listen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.todoLists.map(list => {
              const count = activeTodos.filter(t => t.listId === list.id && !t.done).length
              return (
                <div
                  key={list.id}
                  className="g-card-sm"
                  onClick={() => onNavigate('todos')}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{list.title}</span>
                  {count > 0 && (
                    <span style={{
                      fontSize: '13px', fontWeight: 800, minWidth: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 7px', borderRadius: '11px',
                      background: 'var(--accent-dim)', color: 'var(--accent)',
                    }}>
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
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
  if (t.includes('obst') || t.includes('frucht') || t.includes('apfel')) return '\u{1F34E}'
  if (t.includes('arabisch') || t.includes('sprach')) return '\u{1F1E6}\u{1F1EA}'
  if (t.includes('früh') || t.includes('aufsteh') || t.includes('schlaf')) return '\u{1F6CF}'
  if (t.includes('yoga')) return '\u{1F9D8}'
  if (t.includes('schreib') || t.includes('journal')) return '\u{270D}\uFE0F'
  if (t.includes('lauf') || t.includes('joggen') || t.includes('rennen')) return '\u{1F3C3}'
  if (t.includes('kochen') || t.includes('essen')) return '\u{1F373}'
  if (t.includes('zähne') || t.includes('pflege')) return '\u{1FAA5}'
  return '\u{2705}'
}
