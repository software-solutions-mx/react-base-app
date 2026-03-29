const PII_FIELDS = [
  'email',
  'password',
  'phone',
  'ssn',
  'card_number',
  'cvv',
  'name',
  'full_name',
  'first_name',
  'last_name',
]

export function sanitizePayload(payload = {}) {
  const result = { ...payload }

  for (const field of PII_FIELDS) {
    if (field in result) {
      delete result[field]
    }
  }

  return result
}
