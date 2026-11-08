export interface Team { name: string; goals: number }
export interface Match { version: 1; teams: [Team, Team] }
export const STORAGE_KEY = 'malraknare.match.v1'
export const createMatch = (): Match => ({
  version: 1,
  teams: [{ name: 'Hemmalag', goals: 0 }, { name: 'Bortalag', goals: 0 }],
})

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== 'object') return false
  const team = value as Record<string, unknown>
  return typeof team.name === 'string' && team.name.length <= 40 &&
    Number.isSafeInteger(team.goals) && (team.goals as number) >= 0
}

export function loadMatch(): { match: Match; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { match: createMatch(), warning: '' }
    const value = JSON.parse(raw)
    if (value?.version !== 1 || !Array.isArray(value.teams) ||
      value.teams.length !== 2 || !value.teams.every(isTeam)) throw new Error('Invalid match')
    return { match: value as Match, warning: '' }
  } catch {
    return { match: createMatch(), warning: 'Den sparade matchen kunde inte läsas. En ny ställning visas.' }
  }
}

export function saveMatch(match: Match): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
    return true
  } catch {
    return false
  }
}
