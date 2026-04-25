import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import Dashboard from './Dashboard'
import HabitsView from './HabitsView'
import TodosView from './TodosView'
import CalendarView from './CalendarView'
import EssenView from './EssenView'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  UtensilsCrossed,
  RefreshCw,
  LogOut,
  KeyRound,
} from 'lucide-react'

type Tab = 'dashboard' | 'todos' | 'calendar' | 'habits' | 'essen'

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'habits', label: 'Tracker', icon: Target },
  { id: 'todos', label: 'Plan', icon: CheckSquare },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'essen', label: 'Küche', icon: UtensilsCrossed },
]

export default function Layout() {
  const { user, logout, changeToken, updateGistId } = useAuth()
  const { data, loading, error, reload, lastSync } = useData()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showGistPrompt, setShowGistPrompt] = useState(false)
  const [newGistId, setNewGistId] = useState('')
  const [gistSaving, setGistSaving] = useState(false)

  const isStale = useMemo(() => {
    if (!data?.exportedAt) return false
    const age = Date.now() - data.exportedAt
    return age > 48 * 60 * 60 * 1000 // > 48h
  }, [data?.exportedAt])

  const handleGistUpdate = async () => {
    const id = newGistId.trim()
    if (!id || id.length < 10) return
    setGistSaving(true)
    updateGistId(id)
    setNewGistId('')
    setShowGistPrompt(false)
    setGistSaving(false)
    // Reload mit neuer Gist-ID
    setTimeout(() => reload(), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="ambient-blob blob-1" />
        <div className="ambient-blob blob-2" />
        <div className="noise-overlay" />
        <div className="text-center space-y-4 relative z-10">
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Daten werden geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="ambient-blob blob-1" />
        <div className="noise-overlay" />
        <div className="text-center space-y-4 relative z-10">
          <p style={{ color: 'var(--error)', fontSize: '14px' }}>Fehler: {error}</p>
          <button onClick={reload} className="accent-btn" style={{ maxWidth: '200px', margin: '0 auto' }}>
            Erneut versuchen
          </button>
          <button onClick={logout} style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
            Ausloggen
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const staleBanner = isStale && (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius-xs)',
      background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.04))',
      border: '1px solid rgba(251,191,36,0.2)',
      fontSize: '13px', color: 'var(--text-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: showGistPrompt ? '10px' : '0' }}>
        <span style={{ fontSize: '16px' }}>&#x26A0;&#xFE0F;</span>
        <span style={{ flex: 1 }}>
          Backup ist älter als 48h ({new Date(data.exportedAt).toLocaleDateString('de-DE')}).
          Hat sich die Gist-ID geändert?
        </span>
        {!showGistPrompt && (
          <button
            onClick={() => setShowGistPrompt(true)}
            style={{
              fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '8px',
              background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.3)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Neue ID eingeben
          </button>
        )}
      </div>
      {showGistPrompt && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newGistId}
            onChange={e => setNewGistId(e.target.value)}
            placeholder="Neue Gist-ID einfügen..."
            className="glass-input"
            style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
          />
          <button
            onClick={handleGistUpdate}
            disabled={gistSaving || newGistId.trim().length < 10}
            className="accent-btn"
            style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            Speichern
          </button>
          <button
            onClick={() => { setShowGistPrompt(false); setNewGistId('') }}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '8px 12px', color: 'var(--text-tertiary)',
              cursor: 'pointer', fontSize: '12px',
            }}
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen relative">
      <div className="noise-overlay" />

      {/* ===== DESKTOP: Sidebar + Content ===== */}
      <div className="desktop-layout">
        {/* Sidebar */}
        <aside className="desktop-sidebar">
          <div className="sidebar-inner">
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }} className="gradient-text">
                Habits Calendar
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Backup &middot; Nur-Lesen
              </div>
            </div>

            {/* User */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent), #14b8a6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 800, color: '#000',
              }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {lastSync ? lastSync.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '12px 10px', flex: 1 }}>
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '4px' }}>
              <button onClick={reload} className="sidebar-action-btn" title="Neu laden">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={changeToken} className="sidebar-action-btn" title="Token ändern">
                <KeyRound className="w-4 h-4" />
              </button>
              <button onClick={logout} className="sidebar-action-btn" title="Ausloggen">
                <LogOut className="w-4 h-4" />
              </button>
              <div style={{ flex: 1, textAlign: 'right', fontSize: '10px', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                Backup vom {new Date(data.exportedAt).toLocaleDateString('de-DE')}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="desktop-main">
          {staleBanner}
          <div key={activeTab} className="screen-enter">
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'habits' && <HabitsView />}
            {activeTab === 'todos' && <TodosView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'essen' && <EssenView />}
          </div>
        </main>
      </div>

      {/* ===== MOBILE: Bottom Tabs ===== */}
      <div className="mobile-layout">
        {/* Mobile Header */}
        <header className="glass-header sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight gradient-text">Habits Calendar</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 700 }}>
              {user?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={reload} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={changeToken} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} title="Token ändern">
              <KeyRound className="w-4 h-4" />
            </button>
            <button onClick={logout} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="relative z-10 pb-24 px-4 py-4">
          {staleBanner}
          <div key={activeTab} className="screen-enter">
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'habits' && <HabitsView />}
            {activeTab === 'todos' && <TodosView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'essen' && <EssenView />}
          </div>
        </main>

        <nav className="glass-tabbar">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`glass-tab ${isActive ? 'active' : ''}`}>
                <Icon className="w-6 h-6 tab-icon" />
                <span className="tab-label">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
