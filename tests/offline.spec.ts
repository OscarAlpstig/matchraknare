import { test, expect, chromium, type BrowserContext } from '@playwright/test'
import { createServer, type Server } from 'node:http'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, extname } from 'node:path'

let server: Server
let origin: string
let version = 1
const base = '/matchraknare/'

// Serve the actual dist at the Pages subpath. Version 2 changes the HTML and
// its precache revision to simulate a later deployment without changing source.
test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    const url = new URL(req.url!, 'http://localhost')
    if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return }
    const path = url.pathname.slice(base.length) || 'index.html'
    if (path.includes('..')) { res.writeHead(403).end(); return }
    try {
      let content = await readFile(join(process.cwd(), 'dist', path))
      if (version === 2 && path === 'index.html') {
        content = Buffer.from(content.toString().replace('<title>', '<title>Version 2 · '))
      }
      if (version === 2 && path === 'sw.js') {
        const sw = content.toString()
        const updated = sw.replace(/(url:"index.html",revision:")[^"]+/, '$1test-version-2')
        if (sw === updated) throw new Error('Index revision was not changed')
        content = Buffer.from(updated)
      }
      const mime: Record<string, string> = {
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
        '.png': 'image/png', '.webmanifest': 'application/manifest+json',
      }
      res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
      res.end(content)
    } catch { res.writeHead(404).end() }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No test server')
  origin = `http://127.0.0.1:${address.port}`
})
test.afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())) })

async function ready(context: BrowserContext) {
  const page = context.pages()[0] || await context.newPage()
  await page.goto(origin + base)
  await page.getByText('Installera och använd offline').click()
  await expect(page.getByText('Redo att användas offline på den här enheten.')).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true))
  return page
}

test('kallstart offline efter stängd webbläsare, måländring och ännu en omstart', async () => {
  version = 1
  const profile = await mkdtemp(join(tmpdir(), 'matchraknare-pwa-'))
  let context = await chromium.launchPersistentContext(profile, { headless: true, viewport: { width: 390, height: 844 } })
  try {
    let page = await ready(context)
    await page.getByLabel('Hemmalagets namn').fill('IFK')
    await page.getByRole('button', { name: 'Lägg till mål för IFK' }).click()
    const manifest = await (await page.request.get(origin + base + 'manifest.webmanifest')).json()
    expect(manifest.start_url).toBe(base)
    expect(manifest.scope).toBe(base)
    expect(manifest.display).toBe('standalone')
    for (const icon of manifest.icons) {
      expect((await page.request.get(origin + base + icon.src)).ok()).toBe(true)
    }
    await page.getByLabel('Utseende').selectOption('dark')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    // Keep the mobile preview focused on the match and collapsed footer.
    await page.getByText('Installera och använd offline').click()
    await page.screenshot({ path: 'test-results/pwa-mobile.png', fullPage: true })
    await context.close()
    context = await chromium.launchPersistentContext(profile, { headless: true, offline: true })
    page = context.pages()[0]
    await page.goto(origin + base)
    await expect(page.getByLabel('IFK: 1 mål')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: 'Lägg till mål för IFK' }).click()
    await page.getByRole('button', { name: 'Lägg till mål för Bortalag' }).click()
    await expect(page.getByLabel('IFK: 2 mål')).toBeVisible()
    await context.close()
    context = await chromium.launchPersistentContext(profile, { headless: true, offline: true })
    page = context.pages()[0]
    await page.goto(origin + base)
    await expect(page.getByLabel('IFK: 2 mål')).toBeVisible()
    await expect(page.getByLabel('Bortalag: 1 mål')).toBeVisible()
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }) }
})

test('ny version väntar, Senare avbryter inte matchen och uppdatering bevarar namn och mål', async ({ page }) => {
  version = 1
  await page.goto(origin + base)
  await page.getByText('Installera och använd offline').click()
  await expect(page.getByText('Redo att användas offline på den här enheten.')).toBeVisible()
  await page.reload() // Ensure the original worker controls this client.
  await page.getByLabel('Bortalagets namn').fill('United')
  await page.getByRole('button', { name: 'Lägg till mål för United' }).click()
  const originalTitle = await page.title()
  version = 2
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration()
    await reg?.update()
  })
  await expect(page.getByRole('button', { name: 'Uppdatera nu', exact: true })).toBeVisible()
  expect(await page.title()).toBe(originalTitle)
  await page.getByRole('button', { name: 'Senare' }).click()
  await page.getByRole('button', { name: 'Lägg till mål för United' }).click()
  await expect(page.getByLabel('United: 2 mål')).toBeVisible()
  expect(await page.title()).toBe(originalTitle)
  await page.getByText('Installera och använd offline').click()
  await page.getByRole('button', { name: 'Ny version finns – uppdatera nu' }).click()
  await expect(page).toHaveTitle(/Version 2/)
  await expect(page.getByLabel('United: 2 mål')).toBeVisible()
  await page.context().setOffline(true)
  await page.reload()
  await expect(page.getByLabel('United: 2 mål')).toBeVisible()
})
