import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { todayKey, formatDateTime, isOverdue } from '../lib/helpers'
import type { Todo } from '../lib/types'

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '')
    if (a.time && !b.time) return -1
    if (!a.time && b.time) return 1
    if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time)
    if ((a.flagged ?? false) !== (b.flagged ?? false)) return (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0)
    const po: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
    return (po[a.priority ?? 'none']) - (po[b.priority ?? 'none'])
  })
}

function getPrioColor(priority?: string): string {
  if (priority === 'high') return 'var(--error)'
  if (priority === 'medium') return 'var(--warning)'
  if (priority === 'low') return 'var(--blue)'
  return 'var(--text-tertiary)'
}

function TodoRow({ todo, listName }: { todo: Todo; listName?: string }) {
  const overdue = todo.date && !todo.done && isOverdue(todo.date)
  const subtaskCount = todo.subtasks?.length ?? 0
  const subtaskDone = todo.subtasks?.filter(s => s.done).length ?? 0

  // Color glow for priority
  const prioColor = getPrioColor(todo.priority)

  return (
    <div
      className="g-card-sm"
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '6px', cursor: 'pointer',
        ...(todo.done ? { opacity: 0.4 } : {}),
      }}
    >
      {/* Priority bar */}
      {todo.priority && todo.priority !== 'none' && (
        <div className="prio-bar" style={{ background: prioColor }} />
      )}

      {/* Checkbox */}
      <div className={`glass-check ${todo.done ? 'checked' : ''}`}>
        {todo.done ? '\u2713' : ''}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 500,
          ...(todo.done ? { textDecoration: 'line-through', color: 'var(--text-tertiary)' } : {}),
          display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
        }}>
          {todo.flagged && <span style={{ fontSize: '12px' }}>{'\u{1F6A9}'}</span>}
          <span>{todo.title || 'Neues To-Do'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
          {todo.date ? (
            <span style={{
              fontSize: '11px',
              color: overdue ? 'var(--error)' : 'var(--text-secondary)',
              fontWeight: overdue ? 700 : 400,
            }}>
              {formatDateTime(todo.date, todo.time)}
            </span>
          ) : (
            <span className="glass-tag" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)' }}>
              Kein Datum
            </span>
          )}
          {listName && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>&middot; {listName}</span>}
          {subtaskCount > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              &middot; {subtaskDone}/{subtaskCount}
            </span>
          )}
        </div>

        {/* Subtasks */}
        {todo.subtasks && todo.subtasks.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {todo.subtasks.map(sub => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '6px', flexShrink: 0,
                  border: sub.done ? 'none' : '1.5px solid var(--text-tertiary)',
                  background: sub.done ? 'linear-gradient(135deg, var(--accent), #14b8a6)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 900, color: '#000',
                }}>
                  {sub.done ? '\u2713' : ''}
                </div>
                <span style={{
                  fontSize: '12px',
                  color: sub.done ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                  textDecoration: sub.done ? 'line-through' : 'none',
                }}>
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration */}
      {todo.estimatedMinutes && (
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          ~{todo.estimatedMinutes}m
        </span>
      )}

      {/* Glow on hover */}
      <div
        className="card-glow"
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '60px',
          background: `linear-gradient(90deg, ${overdue ? 'rgba(248,113,113,0.1)' : 'rgba(45,212,191,0.1)'}, transparent)`,
          borderRadius: 'inherit',
        }}
      />
    </div>
  )
}

export default function TodosView() {
  const { data } = useData()
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [view, setView] = useState<'today' | 'all'>('today')

  if (!data) return null

  const today = todayKey()
  const activeTodos = data.todos.filter(t => !t.deletedAt)
  const listById = Object.fromEntries(data.todoLists.map(l => [l.id, l]))

  let filtered = activeTodos
  if (selectedList) {
    filtered = filtered.filter(t => t.listId === selectedList)
  }

  const overdue = filtered.filter(t => !t.done && t.date && t.date < today)
  const todayTodos = filtered.filter(t => !t.done && t.date === today)
  const upcoming = filtered.filter(t => !t.done && t.date && t.date > today)
  const noDate = filtered.filter(t => !t.done && (!t.date || t.date.trim() === ''))
  const completed = filtered.filter(t => t.done)

  const showTodos = view === 'today'
    ? sortTodos([...overdue, ...todayTodos])
    : sortTodos([...overdue, ...todayTodos, ...upcoming, ...noDate])

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.3px' }}>
          Plan
        </h1>
        <div className="glass-pills">
          <button
            className={`glass-pill ${view === 'today' ? 'active' : ''}`}
            onClick={() => setView('today')}
          >
            Heute
          </button>
          <button
            className={`glass-pill ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            Alle
          </button>
        </div>
      </div>

      {/* List filter pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 0' }}>
        <button
          className={`kitchen-tab ${!selectedList ? 'active' : ''}`}
          onClick={() => setSelectedList(null)}
        >
          Alle
        </button>
        {data.todoLists.map(list => (
          <button
            key={list.id}
            className={`kitchen-tab ${selectedList === list.id ? 'active' : ''}`}
            onClick={() => setSelectedList(list.id === selectedList ? null : list.id)}
          >
            {list.title}
          </button>
        ))}
      </div>

      {/* Overdue Banner */}
      {overdue.length > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-xs)',
          background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(248,113,113,0.02))',
          borderLeft: '3px solid var(--error)',
          fontSize: '12px', color: 'var(--error)', fontWeight: 600,
        }}>
          {overdue.length} überfällig
        </div>
      )}

      {/* Todos */}
      {showTodos.length > 0 ? (
        <div>
          {showTodos.map(t => (
            <TodoRow key={t.id} todo={t} listName={listById[t.listId]?.title} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u2705'}</div>
          <p style={{ fontSize: '14px' }}>Keine To-Dos{view === 'today' ? ' für heute' : ''}</p>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 600,
              padding: '12px 0', display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {showCompleted ? '\u25BC' : '\u25B6'} Erledigt ({completed.length})
          </button>
          {showCompleted && completed.map(t => (
            <TodoRow key={t.id} todo={t} listName={listById[t.listId]?.title} />
          ))}
        </div>
      )}
    </div>
  )
}
