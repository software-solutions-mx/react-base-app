import { describe, expect, it } from 'vitest'
import { sanitizePayload } from './sanitize'

describe('sanitizePayload', () => {
  it('removes blocked PII fields', () => {
    const result = sanitizePayload({
      event: 'form_submit',
      category: 'contact',
      email: 'person@example.com',
      phone: '+52 614 000 0000',
      first_name: 'Jane',
    })

    expect(result).toEqual({
      event: 'form_submit',
      category: 'contact',
    })
  })

  it('does not mutate the original object', () => {
    const payload = {
      event: 'button_click',
      label: 'cta',
      name: 'Secret',
    }

    const result = sanitizePayload(payload)

    expect(result).not.toBe(payload)
    expect(payload).toEqual({
      event: 'button_click',
      label: 'cta',
      name: 'Secret',
    })
  })
})
