import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ThemeSelect } from './ThemeSelect'
import { THEME_KEY } from './theme'

function deviceTheme(initial: boolean) {
  let dark = initial
  const events = new EventTarget()
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return dark },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  }))
  return (value: boolean) => act(() => { dark = value; events.dispatchEvent(new Event('change')) })
}
afterEach(() => vi.unstubAllGlobals())

it('följer enhetens tema och ändringar tills användaren väljer själv', async () => {
  const changeDevice = deviceTheme(true)
  render(<ThemeSelect />)
  expect(document.documentElement.dataset.theme).toBe('dark')
  changeDevice(false)
  expect(document.documentElement.dataset.theme).toBe('light')
  await userEvent.selectOptions(screen.getByLabelText('Utseende'), 'dark')
  changeDevice(false)
  expect(document.documentElement.dataset.theme).toBe('dark')
  await userEvent.selectOptions(screen.getByLabelText('Utseende'), 'system')
  expect(document.documentElement.dataset.theme).toBe('light')
})

it('behåller temavalet när appen öppnas igen utan att ändra matchen', async () => {
  deviceTheme(false)
  localStorage.setItem('malraknare.match.v1', 'befintlig match')
  const first = render(<ThemeSelect />)
  await userEvent.selectOptions(screen.getByLabelText('Utseende'), 'dark')
  expect(localStorage.getItem(THEME_KEY)).toBe('dark')
  first.unmount()
  render(<ThemeSelect />)
  expect(screen.getByLabelText('Utseende')).toHaveValue('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(localStorage.getItem('malraknare.match.v1')).toBe('befintlig match')
})

it('hanterar ogiltigt temaval och blockerad lagring', async () => {
  deviceTheme(false)
  localStorage.setItem(THEME_KEY, 'felaktigt')
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  render(<ThemeSelect />)
  expect(screen.getByLabelText('Utseende')).toHaveValue('system')
  await userEvent.selectOptions(screen.getByLabelText('Utseende'), 'dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(screen.getByRole('status')).toHaveTextContent('Temat kunde inte sparas')
})
