import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import LoginScreen from './components/LoginScreen'
import TokenScreen from './components/TokenScreen'
import Layout from './components/Layout'

function AppInner() {
  const { user, token, needsToken } = useAuth()

  // 1. Kein User → Login-Code eingeben
  if (!user) return <LoginScreen />

  // 2. User eingeloggt, aber kein Token in Firebase → einmalig Token eingeben
  if (needsToken || !token) return <TokenScreen />

  // 3. Alles da → App laden
  return (
    <DataProvider user={user} token={token}>
      <Layout />
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
