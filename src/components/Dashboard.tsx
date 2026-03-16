import { useData } from '../contexts/DataContext'
import { todayKey, getStreakForHabit, formatDate } from '../lib/helpers'

type Tab = 'dashboard' | 'todos' | 'calendar' | 'habits' | 'essen'

function ProgressRing({ progress, size = 80, stroke = 6, color = 'var(--accent)' }: {
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
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${color})` }} />
    </svg>
  )
}

function ActivityHeatmap({ habits }: { habits: typeof import('../lib/types').Habit[] }) {
  const weeks = 12
  const cells = []
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const dayIdx = (d.getDay() + 6) % 7
    let count = 0
    for (const h of habits) {
      if (h.days.includes(dayIdx) && h.doneDates.includes(key)) count++
    }
    cells.push({ key, count, dayOfWeek: dayIdx })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridTemplateRows: 'repeat(7, 1fr)', gap: '3px' }}>
      {Array.from({ length: weeks }).map((_, week) =>
        Array.from({ length: 7 }).map((_, day) => {
          const idx = week * 7 + day
          const cell = cells[idx]
          if (!cell) return <div key={`${week}-${day}`} />
          const opacity = cell.count === 0 ? 0.06 : Math.min(0.15 + cell.count * 0.2, 0.9)
          return (
            <div key={cell.key} title={`${cell.key}: ${cell.count}`} style={{
              aspectRatio: '1', borderRadius: '3px',
              background: cell.count > 0
                ? `rgba(45,212,191,${opacity})`
                : 'rgba(255,255,255,0.04)',
              transition: 'background 0.3s',
            }} />
          )
        })
      )}
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

  const shoppingUnchecked = data.shoppingList.filter(s => !s.checked).length
  const recipeCount = data.recipes.length

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'
  const greetEmoji = hour < 12 ? '\u2600\uFE0F' : hour < 18 ? '\u{1F324}\uFE0F' : '\u{1F319}'

  const bestStreak = activeHabits.reduce((max, h) => {
    const s = getStreakForHabit(h.doneDates)
    return s > max ? s : max
  }, 0)

  const dateLabel = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Upcoming todos (next 3)
  const upcoming = activeTodos
    .filter(t => !t.done && t.date && t.date >= today)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    .slice(0, 5)

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero */}
      <div>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1 }}>
          {greeting} {greetEmoji}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>{dateLabel}</p>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">

        {/* ---- Habits Progress (large) ---- */}
        <div className="g-card bento-habits" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Heutige Habits
              </div>
              <div style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, marginTop: '8px' }}>
                {habitsDoneToday.length}<span style={{ fontSize: '20px', color: 'var(--text-tertiary)' }}>/{habitsForToday.length}</span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <ProgressRing progress={habitProgress} size={90} stroke={7} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 900, color: 'var(--accent)',
              }}>
                {Math.round(habitProgress * 100)}%
              </div>
            </div>
          </div>
          {/* Habit pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {habitsForToday.map(h => {
              const done = h.doneDates.includes(today)
              return (
                <span key={h.id} style={{
                  fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px',
                  background: done ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                  color: done ? 'var(--accent)' : 'var(--text-tertiary)',
                  border: done ? '1px solid rgba(45,212,191,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  {done ? '\u2713 ' : ''}{h.title}
                </span>
              )
            })}
          </div>
        </div>

        {/* ---- Streak + Stats ---- */}
        <div className="g-card bento-streak" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1, color: 'var(--orange)' }}>{bestStreak}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
            Tage Streak
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {'\u{1F525}'} Beste Serie
          </div>
        </div>

        {/* ---- To-Dos (medium) ---- */}
        <div className="g-card bento-todos" onClick={() => onNavigate('todos')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>To-Dos Heute</div>
              <div style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1, marginTop: '4px', color: 'var(--blue)' }}>{todayTodos.length}</div>
            </div>
            {overdueTodos.length > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                background: 'rgba(248,113,113,0.12)', color: 'var(--error)',
              }}>
                {overdueTodos.length} überfällig
              </span>
            )}
          </div>
          {/* Upcoming list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {upcoming.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  background: t.priority === 'high' ? 'var(--error)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--accent)',
                }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', flexShrink: 0 }}>
                  {t.date === today ? (t.time || 'Heute') : formatDate(t.date)}
                </span>
              </div>
            ))}
            {totalOpen > 4 && (
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '4px' }}>
                +{totalOpen - 4} weitere
              </div>
            )}
          </div>
        </div>

        {/* ---- Activity Heatmap ---- */}
        <div className="g-card bento-activity">
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Aktivität &middot; 12 Wochen
          </div>
          <ActivityHeatmap habits={activeHabits} />
        </div>

        {/* ---- Küche ---- */}
        <div className="g-card bento-kitchen" onClick={() => onNavigate('essen')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Küche</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--orange)' }}>{recipeCount}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Rezepte</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: shoppingUnchecked > 0 ? 'var(--success)' : 'var(--text-tertiary)' }}>{shoppingUnchecked}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Einkauf</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--purple)' }}>{data.mealPlans.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Pläne</div>
            </div>
          </div>
        </div>

        {/* ---- Kalender Quick ---- */}
        <div className="g-card bento-cal" onClick={() => onNavigate('calendar')} style={{ cursor: 'pointer' }}>
          <div className="card-glow" />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Geplant</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--purple)' }}>
              {activeTodos.filter(t => !t.done && t.date && t.date > today).length}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>kommend</span>
          </div>
        </div>

        {/* ---- Listen ---- */}
        {data.todoLists.length > 0 && (
          <div className="g-card bento-lists" onClick={() => onNavigate('todos')} style={{ cursor: 'pointer' }}>
            <div className="card-glow" />
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Meine Listen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.todoLists.map(list => {
                const count = activeTodos.filter(t => t.listId === list.id && !t.done).length
                return (
                  <div key={list.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{list.title}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, minWidth: '20px', textAlign: 'center',
                      padding: '2px 8px', borderRadius: '8px',
                      background: count > 0 ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                      color: count > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
