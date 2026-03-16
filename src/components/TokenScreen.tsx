import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function TokenScreen() {
  const { user, submitToken, logout } = useAuth()
  const [tokenInput, setTokenInput] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const t = tokenInput.trim()
    if (!t || !t.startsWith('ghp_')) {
      setError('Bitte einen gültigen GitHub Token eingeben (beginnt mit ghp_).')
      return
    }
    setSaving(true)
    setError('')
    const ok = await submitToken(t)
    setSaving(false)
    if (!ok) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="noise-overlay" />

      <div className="w-full max-w-sm space-y-8 relative z-10 screen-enter">
        <div className="text-center space-y-3">
          <div
            className="text-5xl mb-2"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(96,165,250,0.3))' }}
          >
            &#x1F511;
          </div>
          <h1 className="text-2xl font-black tracking-tight gradient-text">
            Erstmalige Einrichtung
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
            Hallo {user?.name}! Gib einmalig deinen GitHub Token ein.
            Er wird verschlüsselt gespeichert und ist danach auf allen Geräten verfügbar.
          </p>
        </div>

        <div className="space-y-4">
          <div style={{ position: 'relative' }}>
            <input
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={e => { setTokenInput(e.target.value); setError('') }}
              placeholder="ghp_..."
              disabled={saving}
              className="glass-input"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center' }}>{error}</p>
          )}

          <button onClick={handleSave} className="accent-btn" disabled={saving}>
            {saving ? 'Verschlüssele & speichere...' : 'Token speichern'}
          </button>

          <button
            onClick={logout}
            style={{
              display: 'block', margin: '0 auto', background: 'none', border: 'none',
              color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Zurück zum Login
          </button>
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 'var(--radius-xs)',
          background: 'linear-gradient(135deg, rgba(45,212,191,0.06), rgba(45,212,191,0.02))',
          borderLeft: '3px solid var(--accent)',
          fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5,
        }}>
          Der Token wird mit deinem Login-Code verschlüsselt in Firebase gespeichert.
          Danach brauchst du auf keinem Gerät den Token nochmal einzugeben.
        </div>
      </div>
    </div>
  )
}
