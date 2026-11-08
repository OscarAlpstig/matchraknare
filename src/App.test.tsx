import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './match'

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ offlineReady: [false], needRefresh: [false], updateServiceWorker: vi.fn() }),
}))

function team(side: string) { return within(screen.getByRole('region', { name: side })) }

describe('Målräknare', () => {
  it('lägger mål på rätt lag och rättar utan negativa mål', async () => {
    const user = userEvent.setup()
    render(<App />)
    const home = team('Hemmalag')
    const away = team('Bortalag')
    expect(home.getByRole('button', { name: /Ta bort/ })).toBeDisabled()
    await user.click(home.getByRole('button', { name: /Lägg till/ }))
    await user.click(home.getByRole('button', { name: /Lägg till/ }))
    await user.click(away.getByRole('button', { name: /Lägg till/ }))
    expect(home.getByLabelText('Hemmalag: 2 mål')).toHaveTextContent('2')
    expect(away.getByLabelText('Bortalag: 1 mål')).toHaveTextContent('1')
    await user.click(home.getByRole('button', { name: /Ta bort/ }))
    await user.click(home.getByRole('button', { name: /Ta bort/ }))
    expect(home.getByLabelText('Hemmalag: 0 mål')).toHaveTextContent('0')
    expect(home.getByRole('button', { name: /Ta bort/ })).toBeDisabled()
  })

  it('återställer båda lagens namn och mål när appen öppnas igen', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.clear(screen.getByLabelText('Hemmalagets namn'))
    await user.type(screen.getByLabelText('Hemmalagets namn'), 'Blåvitt')
    await user.clear(screen.getByLabelText('Bortalagets namn'))
    await user.type(screen.getByLabelText('Bortalagets namn'), 'IFK')
    await user.click(team('Hemmalag').getByRole('button', { name: /Lägg till/ }))
    await user.click(team('Bortalag').getByRole('button', { name: /Lägg till/ }))
    first.unmount()
    render(<App />)
    expect(screen.getByLabelText('Hemmalagets namn')).toHaveValue('Blåvitt')
    expect(screen.getByLabelText('Bortalagets namn')).toHaveValue('IFK')
    expect(team('Hemmalag').getByLabelText('Blåvitt: 1 mål')).toHaveTextContent('1')
    expect(team('Bortalag').getByLabelText('IFK: 1 mål')).toHaveTextContent('1')
  })

  it('kräver bekräftelse, behåller hemmalagets namn och återställer bortalaget även efter omladdning', async () => {
    const user = userEvent.setup()
    const initial = { version: 1, teams: [{ name: 'IFK', goals: 3 }, { name: 'United', goals: 2 }] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    const first = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ny match' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByRole('dialog')).toHaveTextContent('bortalagets namn återställs till Bortalag')
    expect(screen.getByRole('button', { name: 'Avbryt' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Avbryt' }))
    expect(screen.getByLabelText('Hemmalagets namn')).toHaveValue('IFK')
    expect(screen.getByLabelText('Bortalagets namn')).toHaveValue('United')
    expect(team('Hemmalag').getByLabelText('IFK: 3 mål')).toBeInTheDocument()
    expect(team('Bortalag').getByLabelText('United: 2 mål')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(initial)

    await user.click(screen.getByRole('button', { name: 'Ny match' }))
    await user.click(screen.getByRole('button', { name: 'Nollställ och starta' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Hemmalagets namn')).toHaveValue('IFK')
    expect(screen.getByLabelText('Bortalagets namn')).toHaveValue('Bortalag')
    expect(team('Hemmalag').getByLabelText('IFK: 0 mål')).toBeInTheDocument()
    expect(team('Bortalag').getByLabelText('Bortalag: 0 mål')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      version: 1, teams: [{ name: 'IFK', goals: 0 }, { name: 'Bortalag', goals: 0 }],
    })

    first.unmount()
    render(<App />)
    expect(screen.getByLabelText('Hemmalagets namn')).toHaveValue('IFK')
    expect(screen.getByLabelText('Bortalagets namn')).toHaveValue('Bortalag')
    expect(team('Hemmalag').getByLabelText('IFK: 0 mål')).toBeInTheDocument()
    expect(team('Bortalag').getByLabelText('Bortalag: 0 mål')).toBeInTheDocument()
  })

  it.each(['{trasig', 'null', '{"version":1,"teams":[]}', '{"version":1,"teams":[{"name":"A","goals":-1},{"name":"B","goals":0}]}'])(
  'hanterar skadade eller ogiltiga data: %s', raw => {
    localStorage.setItem(STORAGE_KEY, raw)
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('kunde inte läsas')
    expect(team('Hemmalag').getByLabelText('Hemmalag: 0 mål')).toBeInTheDocument()
  })

  it('fortsätter fungera och varnar om localStorage är blockerat', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    render(<App />)
    fireEvent.click(team('Hemmalag').getByRole('button', { name: /Lägg till/ }))
    expect(team('Hemmalag').getByLabelText('Hemmalag: 1 mål')).toHaveTextContent('1')
    expect(screen.getByRole('alert')).toHaveTextContent('kan inte sparas')
  })

  it('går att lägga till ett mål med tangentbordet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    expect(screen.getByLabelText('Hemmalagets namn')).toHaveFocus()
    await user.tab()
    expect(team('Hemmalag').getByRole('button', { name: /Lägg till/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(team('Hemmalag').getByLabelText('Hemmalag: 1 mål')).toHaveTextContent('1')
  })
})
