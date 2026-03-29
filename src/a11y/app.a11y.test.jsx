import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App accessibility', () => {
  it('has no detectable a11y violations in the base route shell', async () => {
    const { container } = render(<App />)

    const results = await axe(container)
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toHaveLength(
      0,
    )
  })

  it('renders baseline accessibility landmarks', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
