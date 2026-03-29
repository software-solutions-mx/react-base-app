import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { trackPageView } from './analytics'

vi.mock('./analytics', async () => {
  const actual = await vi.importActual('./analytics')
  return {
    ...actual,
    trackPageView: vi.fn(),
  }
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main landmark', () => {
    render(<App />)

    const mainLandmark = screen.getByRole('main', { name: /contenido principal/i })
    expect(mainLandmark).toBeInTheDocument()
    expect(mainLandmark).toHaveAttribute('id', 'main-content')
    expect(mainLandmark).toHaveAttribute('tabindex', '-1')
  })

  it('renders a skip link pointing to the main content region', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: /saltar al contenido principal/i }),
    ).toHaveAttribute('href', '#main-content')
  })

  it('tracks the initial page view once', () => {
    render(<App />)

    expect(trackPageView).toHaveBeenCalledTimes(1)
    const [path, title] = trackPageView.mock.calls[0]
    expect(typeof path).toBe('string')
    expect(typeof title).toBe('string')
  })
})
