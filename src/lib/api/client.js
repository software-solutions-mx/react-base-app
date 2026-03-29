import { API_BASE_URL } from '../../config/env'

export class ApiError extends Error {
  constructor(message, { status, url, data }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.url = url
    this.data = data
  }
}

export class ApiContractError extends Error {
  constructor(message, { url, direction, issues, payload }) {
    super(message)
    this.name = 'ApiContractError'
    this.url = url
    this.direction = direction
    this.issues = issues
    this.payload = payload
  }
}

function validateContract(schema, payload, { url, direction }) {
  if (!schema) {
    return payload
  }

  const result = schema.safeParse(payload)

  if (result.success) {
    return result.data
  }

  throw new ApiContractError(`API ${direction} validation failed for ${url}`, {
    url,
    direction,
    issues: result.error.issues,
    payload,
  })
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.includes('text/')) {
    return response.text()
  }

  return null
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers,
    signal,
    requestSchema,
    responseSchema,
    errorSchema,
  } = options
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${API_BASE_URL}${normalizedPath}`
  const validatedBody = validateContract(requestSchema, body, {
    url,
    direction: 'request',
  })
  const isJsonBody =
    validatedBody !== undefined &&
    validatedBody !== null &&
    !(validatedBody instanceof FormData)
  const requestHeaders = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...headers,
    ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
  }
  const requestBody = isJsonBody ? JSON.stringify(validatedBody) : validatedBody
  const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (isMutatingMethod && typeof document !== 'undefined') {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content')

    if (csrfToken && !requestHeaders['X-CSRF-Token']) {
      requestHeaders['X-CSRF-Token'] = csrfToken
    }
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
    credentials: 'include',
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 419 && typeof window !== 'undefined') {
      window.location.reload()
    }

    const validatedErrorData = validateContract(errorSchema, data, {
      url,
      direction: 'error-response',
    })

    throw new ApiError(`API request failed with status ${response.status}`, {
      status: response.status,
      url,
      data: validatedErrorData,
    })
  }

  return validateContract(responseSchema, data, {
    url,
    direction: 'response',
  })
}

export const apiClient = {
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options = {}) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options = {}) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' })
  },
}
