import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

function shouldRetryQuery(failureCount, error) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }

  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
