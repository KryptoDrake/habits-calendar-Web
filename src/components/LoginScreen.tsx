import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ShaderBackground } from './ui/ShaderBackground'

export default function LoginScreen() {
  const { login, loggingIn } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!code.trim()) {
      setError('Bitte Code eingeben.')
      return
    }
    setError('')
    const result = await login(code.trim())
    if (result === 'invalid') {
      setError('Ungültiger Code.')
      setCode('')
    }
    // 'ok' und 'no-token' werden vom AuthContext gehandelt
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ShaderBackground />
      <div className="noise-overlay" />

      <div className="w-full max-w-sm space-y-8 relative z-10 screen-enter">
        <div className="text-center space-y-3">
          <div
            className="text-6xl mb-2"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(45,212,191,0.3))' }}
          >
            &#x2705;
          </div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">
            Habits Calendar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Gib deinen Login-Code ein
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="Login-Code"
            autoFocus
            disabled={loggingIn}
            className="glass-input text-center text-lg tracking-widest"
          />

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '13px', textAlign: 'center' }}>{error}</p>
          )}

          <button onClick={handleLogin} className="accent-btn" disabled={loggingIn}>
            {loggingIn ? 'Verbinde...' : 'Einloggen'}
          </button>
        </div>
      </div>
    </div>
  )
}
