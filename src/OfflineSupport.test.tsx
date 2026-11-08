import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { OfflineSupport } from './OfflineSupport'
import { createMatch, STORAGE_KEY } from './match'

const state = vi.hoisted(() => ({ ready: false, refresh: false, update: vi.fn() }))
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [state.ready], needRefresh: [state.refresh], updateServiceWorker: state.update,
  }),
}))

it('lovar inte offlineberedskap innan filerna har sparats', async () => {
  state.ready = false
  state.refresh = false
  render(<OfflineSupport match={createMatch()} />)
  await userEvent.click(screen.getByText('Installera och använd offline'))
  expect(screen.getByRole('status')).toHaveTextContent('inte klart ännu')
  expect(screen.getByText('Installera på iPhone')).toBeVisible()
  expect(screen.getByText('Installera på Android')).toBeVisible()
})

it('visar offlineberedskap efter installation', async () => {
  state.ready = true
  state.refresh = false
  render(<OfflineSupport match={createMatch()} />)
  await userEvent.click(screen.getByText('Installera och använd offline'))
  expect(screen.getByRole('status')).toHaveTextContent('Redo att användas offline')
})

it('låter användaren skjuta upp och sedan uppdatera med sparad match', async () => {
  state.ready = true
  state.refresh = true
  state.update.mockClear()
  const match = createMatch()
  match.teams[0] = { name: 'IFK', goals: 3 }
  render(<OfflineSupport match={match} />)
  expect(state.update).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Senare' }))
  expect(screen.queryByRole('button', { name: 'Senare' })).not.toBeInTheDocument()
  expect(state.update).not.toHaveBeenCalled()
  await userEvent.click(screen.getByText('Installera och använd offline'))
  await userEvent.click(screen.getByRole('button', { name: 'Ny version finns – uppdatera nu' }))
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(match)
  expect(state.update).toHaveBeenCalledWith(true)
})

it('stoppar uppdatering om matchen inte kan sparas', async () => {
  state.refresh = true
  state.update.mockClear()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
  render(<OfflineSupport match={createMatch()} />)
  await userEvent.click(screen.getByRole('button', { name: 'Uppdatera nu' }))
  expect(state.update).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toHaveTextContent('Uppdateringen har inte startats')
})
