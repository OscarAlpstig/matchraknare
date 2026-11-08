import type { Team } from './match'

interface Props {
  team: Team
  index: number
  onName: (name: string) => void
  onGoal: (delta: number) => void
}

export function TeamCard({ team, index, onName, onGoal }: Props) {
  const side = index === 0 ? 'Hemmalag' : 'Bortalag'
  const name = team.name.trim() || side
  return (
    <section className={`team team-${index}`} aria-label={side}>
      <label htmlFor={`team-${index}`} className="eyebrow">{side}</label>
      <input id={`team-${index}`} value={team.name} maxLength={40}
        placeholder={side} onChange={event => onName(event.target.value)}
        aria-label={`${side}ets namn`} autoComplete="off" />
      <output className="score" aria-label={`${name}: ${team.goals} mål`}>{team.goals}</output>
      <span className="score-caption" aria-hidden="true">MÅL</span>
      <button className="add-goal" onClick={() => onGoal(1)}
        disabled={team.goals === Number.MAX_SAFE_INTEGER} aria-label={`Lägg till mål för ${name}`}>
        <span aria-hidden="true">+</span> Lägg till mål
      </button>
      <button className="remove-goal" onClick={() => onGoal(-1)} disabled={team.goals === 0}
        aria-label={`Ta bort mål för ${name}`}><span aria-hidden="true">−</span> Ta bort mål</button>
    </section>
  )
}
