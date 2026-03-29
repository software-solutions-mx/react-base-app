import { useCallback } from 'react'
import { trackEvent } from '../service'

export function useAnalytics() {
  const track = useCallback((payload) => {
    trackEvent(payload)
  }, [])

  return { track }
}
