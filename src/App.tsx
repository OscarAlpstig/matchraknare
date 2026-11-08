import { useEffect, useRef, useState } from 'react'
import { OfflineSupport } from './OfflineSupport'
import { ThemeSelect } from './ThemeSelect'
import { TeamCard } from './TeamCard'
import { loadMatch, saveMatch } from './match'

export default function App() {
  const [initial] = useState(loadMatch)
  const [match, setMatch] = useState(initial.match)
  const [saved, setSaved] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => { setSaved(saveMatch(match)) }, [match])

  function changeGoal(index: number, delta: number) {
    setMatch(current => ({ ...current, teams: current.teams.map((team, i) => i === index
      ? { ...team, goals: Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, team.goals + delta)) }
      : team) as typeof current.teams }))
    const team = match.teams[index]
    setAnnouncement(`${team.name.trim() || (index === 0 ? 'Hemmalag' : 'Bortalag')}: ${Math.max(0, team.goals + delta)} mål.`)
  }

  return (
    <main>
      <header>
        <h1>Målräknare</h1>
      </header>
      {initial.warning && <p role="alert" className="warning">{initial.warning}</p>}
      {!saved && <p role="alert" className="warning">Matchen kan inte sparas i webbläsaren. Ställningen försvinner när sidan stängs eller laddas om.</p>}
      <div className="scoreboard">
        {match.teams.map((team, index) => <TeamCard key={index} team={team} index={index}
          onGoal={delta => changeGoal(index, delta)}
          onName={name => setMatch(current => ({ ...current, teams: current.teams.map((t, i) =>
            i === index ? { ...t, name } : t) as typeof current.teams }))} />)}
      </div>
      <button className="new-match" onClick={() => { dialog.current?.showModal(); cancelButton.current?.focus() }}>Ny match</button>
      <footer>
        <div className="preferences">
          <p className="save-status"><span aria-hidden="true">{saved ? '●' : '○'}</span> {saved ? 'Sparas på enheten' : 'Kan inte sparas'}</p>
          <ThemeSelect />
        </div>
        <OfflineSupport match={match} />
        <details className="storage-info">
          <summary>Kakor och lokal lagring</summary>
          <p>Målräknaren använder webbläsarens lokala lagring (localStorage) för att spara
            lagnamn och målantal. Syftet är att behålla matchen när du laddar om
            sidan eller stänger och öppnar fliken igen.</p>
          <p>Ditt val av ljust, mörkt eller enhetens tema sparas också lokalt för att behålla utseendet till nästa besök.</p>
          <p>Appen sätter inga egna kakor och använder ingen lagring för reklam,
            spårning eller besöksstatistik. Matchuppgifterna skickas inte till någon server
            och synkroniseras inte mellan telefoner.</p>
          <p>Uppgifterna har ingen automatisk utgångstid. Du kan ta bort dem genom att
            rensa webbplatsdata i webbläsarens inställningar. Ny match nollställer målen
            men behåller lagnamnen.</p>
          <p>För offline-läget sparas även appens filer på enheten med en service worker. De kan rensas
            tillsammans med webbplatsdata. Nya appversioner kan ersätta gamla filer; matchen sparas separat.</p>
        </details>
        <p className="hint">Tryck på ett lagnamn för att ändra det. Matchen sparas bara på den här enheten.</p>
      </footer>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <dialog ref={dialog} aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <h2 id="dialog-title">Starta en ny match?</h2>
        <p id="dialog-description">Båda lagens mål nollställs. Lagnamnen behålls. Det går inte att ångra.</p>
        <div className="dialog-actions">
          <button ref={cancelButton} onClick={() => dialog.current?.close()}>Avbryt</button>
          <button className="confirm" onClick={() => {
            setMatch(current => ({ ...current, teams: current.teams.map(team => ({ ...team, goals: 0 })) as typeof current.teams }))
            setAnnouncement('Ny match startad. Båda lagen har noll mål.')
            dialog.current?.close()
          }}>Nollställ och starta</button>
        </div>
      </dialog>
    </main>
  )
}
