const CONTENT_SECURITY_POLICY_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.ingest.sentry.io",
  'frame-src https://www.googletagmanager.com',
  'upgrade-insecure-requests',
]

export const CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY_DIRECTIVES.join('; ')

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}
