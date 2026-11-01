// Per-reader quiz progress kept in this browser only (no personal data, nothing sent anywhere).
// Storage can be blocked (private mode, strict settings), so every access fails soft.

export type Picks = Record<string, number>

const key = (lessonId: string) => `quiz:${lessonId}`

export function readPicks(lessonId: string): Picks {
  try {
    const raw = localStorage.getItem(key(lessonId))
    const data: unknown = raw ? JSON.parse(raw) : {}
    if (!data || typeof data !== 'object') return {}
    // Accept only {questionId: integer} pairs; ignore anything malformed or tampered with.
    return Object.fromEntries(
      Object.entries(data).filter(([, v]) => Number.isInteger(v) && v >= 0 && v <= 3)
    ) as Picks
  } catch {
    return {}
  }
}

export function writePicks(lessonId: string, picks: Picks): void {
  try { localStorage.setItem(key(lessonId), JSON.stringify(picks)) } catch { /* ignore */ }
}
