import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

// jsdom has no modal-dialog implementation; browser focus trapping and Escape
// are supplied by the native HTML dialog, not by this test shim.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} })
