import type { UserProfile } from './types'
import { encrypt, decrypt } from './crypto'
import { fetchEncryptedToken, storeEncryptedToken } from './firebase'

// ============ Profile ============
const PROFILES: Record<string, UserProfile & { codeHash: string }> = {
  musa: {
    id: 'musa',
    name: 'Musa',
    gistId: '187fe31f4ab10ee08fd6372f8881fffe',
    codeHash: '',
  },
  melissa: {
    id: 'melissa',
    name: 'Melissa',
    gistId: '477ab5308849f1f9c2f2ea33d737c545',
    codeHash: '',
  },
}

// ============ Code-Hashes (SHA-256) ============
// PLATZHALTER - vor Deployment mit echten Hashes ersetzen!
PROFILES.musa.codeHash = '747966a56955e03d8ffc88853b6d9887f3f5c3bafbddfc5aa61c64ca2e19f211'
PROFILES.melissa.codeHash = '7cb6d6f50896cb01c7f940150d8c02cd4c218ec49723557c70caf3d9e2bd23fa'

// ============ Hashing ============
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============ Storage ============
const STORAGE_KEY_PROFILE = 'hc_profile'
const STORAGE_KEY_TOKEN = 'hc_github_token'

export function getStoredProfile(): UserProfile | null {
  const id = localStorage.getItem(STORAGE_KEY_PROFILE)
  if (id && PROFILES[id]) {
    const { codeHash: _, ...profile } = PROFILES[id]
    return profile
  }
  return null
}

export function getCachedToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

function cacheToken(token: string) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token)
}

// ============ Login ============
// Gibt { profile, token } zurück wenn alles klappt.
// token kann null sein wenn noch keiner in Firebase hinterlegt ist.
export async function login(code: string): Promise<{
  profile: UserProfile
  token: string | null
} | null> {
  const trimmed = code.trim()
  const hash = await hashCode(trimmed)

  for (const [, profileData] of Object.entries(PROFILES)) {
    if (profileData.codeHash !== hash) continue

    const { codeHash: _, ...profile } = profileData
    localStorage.setItem(STORAGE_KEY_PROFILE, profile.id)

    // Token aus Firebase laden und entschlüsseln
    let token: string | null = null
    try {
      const encrypted = await fetchEncryptedToken(profile.id)
      if (encrypted) {
        token = await decrypt(encrypted, trimmed)
        cacheToken(token)
      }
    } catch {
      // Entschlüsselung fehlgeschlagen oder kein Token vorhanden
    }

    // Fallback: gecachten Token aus localStorage nehmen
    if (!token) {
      token = getCachedToken()
    }

    return { profile, token }
  }

  return null
}

// ============ Token erstmalig speichern ============
// Wird aufgerufen wenn noch kein Token in Firebase hinterlegt ist.
export async function saveInitialToken(
  code: string,
  userId: string,
  token: string
): Promise<void> {
  const encrypted = await encrypt(token, code.trim())
  await storeEncryptedToken(userId, encrypted)
  cacheToken(token)
}

// ============ Logout ============
export function logout() {
  localStorage.removeItem(STORAGE_KEY_PROFILE)
}

// ============ Konsolen-Helfer (nur Development) ============
if (import.meta.env.DEV) {
  // @ts-expect-error - global helper
  window.__hashCode = async (code: string) => {
    const hash = await hashCode(code)
    console.log(`Hash für "${code}": ${hash}`)
    return hash
  }
}
