import { useState } from 'react'
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
} from 'lucide-react'

type Tab = 'dashboard' | 'todos' | 'calendar' | 'habits' | 'essen'

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Heute', icon: LayoutDashboard },
  { id: 'todos', label: 'Plan', icon: CheckSquare },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'habits', label: 'Tracker', icon: Target },
  { id: 'essen', label: 'Küche', icon: UtensilsCrossed },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { data, loading, error, reload, lastSync } = useData()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="ambient-blob blob-1" />
        <div className="ambient-blob blob-2" />
        <div className="noise-overlay" />
        <div className="text-center space-y-4 relative z-10">
          <div
            className="w-12 h-12 rounded-full mx-auto"
            style={{
              border: '3px solid var(--text-tertiary)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Daten werden geladen...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          <button
            onClick={logout}
            style={{
              display: 'block', margin: '0 auto', background: 'none', border: 'none',
              color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Ausloggen
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen relative">
      {/* Ambient blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight gradient-text">
            Habits Calendar
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {user?.name}
          </span>
        </div>

        {/* Desktop: Tabs im Header */}
        <div className="hidden md:flex items-center gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '12px',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.3s',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          {lastSync && (
            <span className="text-xs hidden sm:block mr-2" style={{ color: 'var(--text-tertiary)' }}>
              {lastSync.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={reload}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Neu laden"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Ausloggen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Readonly banner */}
      <div
        className="text-center py-1.5"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          Nur-Lesen &middot; Backup vom {new Date(data.exportedAt).toLocaleString('de-DE')}
        </span>
      </div>

      {/* Content */}
      <main className="relative z-10 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div key={activeTab} className="screen-enter">
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'todos' && <TodosView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'habits' && <HabitsView />}
            {activeTab === 'essen' && <EssenView />}
          </div>
        </div>
      </main>

      {/* Mobile: Bottom Tab Bar */}
      <nav className="glass-tabbar md:hidden">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`glass-tab ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6 tab-icon" />
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
