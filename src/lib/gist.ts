import type { GistBackupData } from './types'

export async function fetchGistBackup(token: string, gistId: string): Promise<GistBackupData> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Ungültiger GitHub Token')
    if (res.status === 404) throw new Error('Gist nicht gefunden')
    throw new Error(`GitHub API Fehler: ${res.status}`)
  }

  const gist = await res.json()
  const file = gist.files['habits-calendar-backup.json']
  if (!file) throw new Error('Backup-Datei nicht im Gist gefunden')

  return JSON.parse(file.content)
}
