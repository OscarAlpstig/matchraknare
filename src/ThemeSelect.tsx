import { useEffect, useState } from 'react'
import { applyTheme, loadTheme, THEME_KEY, type ThemePreference } from './theme'

export function ThemeSelect() {
  const [preference, setPreference] = useState(loadTheme)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    applyTheme(preference)
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const update = () => applyTheme(preference)
    media?.addEventListener('change', update)
    return () => media?.removeEventListener('change', update)
  }, [preference])

  function change(value: ThemePreference) {
    setPreference(value)
    try {
      localStorage.setItem(THEME_KEY, value)
      setSaveError(false)
    } catch { setSaveError(true) }
  }

  return <div className="theme-setting">
    <label htmlFor="theme">Utseende</label>
    <select id="theme" value={preference} onChange={event => change(event.target.value as ThemePreference)}>
      <option value="system">Följ enheten</option>
      <option value="light">Ljust</option>
      <option value="dark">Mörkt</option>
    </select>
    {saveError && <p role="status">Temat kunde inte sparas och gäller bara tills sidan laddas om.</p>}
  </div>
}
