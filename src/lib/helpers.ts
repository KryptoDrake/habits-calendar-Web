export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function tomorrowKey(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function formatDate(dateStr: string): string {
  const today = todayKey()
  const tomorrow = tomorrowKey()
  if (dateStr === today) return 'Heute'
  if (dateStr === tomorrow) return 'Morgen'
  const d = parseKey(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export function formatDateTime(dateStr: string, time?: string): string {
  const base = formatDate(dateStr)
  return time ? `${base}, ${time}` : base
}

export function isOverdue(dateStr: string): boolean {
  return dateStr < todayKey()
}

export function getDayName(dayIndex: number): string {
  return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][dayIndex] || ''
}

export function getMonthName(month: number): string {
  return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][month] || ''
}

export function getStreakForHabit(doneDates: string[]): number {
  if (!doneDates || doneDates.length === 0) return 0
  const sorted = [...doneDates].sort().reverse()
  const today = todayKey()
  let streak = 0
  const d = new Date()

  for (let i = 0; i < 365; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (i === 0 && key === today && !sorted.includes(key)) {
      d.setDate(d.getDate() - 1)
      continue
    }
    if (sorted.includes(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fruehstueck: 'Frühstück',
    mittagessen: 'Mittagessen',
    abendessen: 'Abendessen',
    snack: 'Snack',
  }
  return labels[type] || type
}

export function getDifficultyLabel(diff: string): string {
  const labels: Record<string, string> = {
    einfach: 'Einfach',
    mittel: 'Mittel',
    schwer: 'Schwer',
  }
  return labels[diff] || diff
}
