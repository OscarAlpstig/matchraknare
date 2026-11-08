import { useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { saveMatch, type Match } from './match'

export function OfflineSupport({ match }: { match: Match }) {
  const approvedReload = useRef(false)
  const [previouslyInstalled, setPreviouslyInstalled] = useState(false)
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const [updating, setUpdating] = useState(false)
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedReload() {
      // A different tab accepting an update must not reload this match.
      if (approvedReload.current) window.location.reload()
    },
    onRegisteredSW(_url, registration) {
      // The initial install callback covers a new cache. On later launches,
      // also check that cached HTML still exists (site data may have been cleared).
      if (registration?.active && 'caches' in window) {
        void caches.match(`${import.meta.env.BASE_URL}index.html`, { ignoreSearch: true })
          .then(response => setPreviouslyInstalled(Boolean(response?.ok)))
          .catch(() => setPreviouslyInstalled(false))
      }
    },
    onRegisterError() { setError('Offline-läget kunde inte förberedas. Försök igen med internet genom att öppna sidan på nytt.') },
  })
  const ready = offlineReady || previouslyInstalled
  const supported = 'serviceWorker' in navigator

  async function update() {
    if (!saveMatch(match)) {
      setError('Matchen kunde inte sparas. Uppdateringen har inte startats. Försök igen senare.')
      return
    }
    approvedReload.current = true
    setUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch {
      approvedReload.current = false
      setUpdating(false)
      setError('Uppdateringen kunde inte startas. Matchen är kvar. Försök igen senare.')
    }
  }

  return <>
    {needRefresh && !dismissed && <div className="update-notice" aria-label="Appuppdatering">
      <p role="status">Ny version finns</p>
      <div className="update-actions">
        <button onClick={() => void update()} disabled={updating}>
          {updating ? 'Uppdaterar…' : 'Uppdatera nu'}
        </button>
        <button onClick={() => setDismissed(true)} disabled={updating}>Senare</button>
      </div>
    </div>}
    {error && <p role="alert">{error}</p>}
    <details className="storage-info">
      <summary>Installera och använd offline</summary>
      <p role="status">{!supported
        ? 'Den här webbläsaren kan inte förbereda offline-läget.'
        : ready
          ? 'Redo att användas offline på den här enheten.'
          : 'Offline-läget är inte klart ännu. Behåll internetanslutningen medan appen sparas.'}</p>
      {needRefresh && dismissed && <button onClick={() => void update()} disabled={updating}>
        {updating ? 'Uppdaterar…' : 'Ny version finns – uppdatera nu'}
      </button>}
      <h2>Installera på iPhone</h2>
      <p>Öppna Målräknare i Safari medan du har internet. Tryck på Dela och välj <strong>Lägg till på hemskärmen</strong>.
        Välj <strong>Öppna som webbapp</strong> om alternativet visas och tryck på <strong>Lägg till</strong>.
        Starta sedan Målräknare från ikonen på hemskärmen.</p>
      <h2>Installera på Android</h2>
      <p>Öppna Målräknare i Chrome medan du har internet. Tryck på menyn <strong>⋮</strong> och välj <strong>Installera app</strong>
        {' '}eller motsvarande installationsval. Följ anvisningarna och starta sedan Målräknare från ikonen.</p>
      <h2>Så fungerar offline-läget</h2>
      <p>Öppna sidan en gång med internet så att den kan sparas på telefonen. Vänta tills det står att appen är redo
        att användas offline. Därefter ska du kunna öppna den och räkna mål utan uppkoppling.
        Matchen sparas bara på den här enheten och synkroniseras inte med andra telefoner.
        Om du rensar webbplatsdata kan matchen försvinna.</p>
      <p>Öppna även appen från hemskärmen med internet första gången och kontrollera offline-statusen där.
        Webbläsaren kan rensa sparade filer, till exempel vid lagringsbrist. Privat surfning kan begränsa offline-läget.</p>
    </details>
  </>
}
