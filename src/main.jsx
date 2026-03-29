import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import App from './App.jsx'
import { initAnalyticsDebugger, reportWebVitals, restoreConsent } from './analytics'
import ErrorState from './components/states/ErrorState'
import LoadingState from './components/states/LoadingState'
import i18n from './i18n/config'
import { queryClient } from './lib/query/queryClient'
import {
  installGlobalErrorHandlers,
  Sentry,
  initErrorMonitoring,
} from './monitoring/sentry'
import './assets/scss/theme.scss'

restoreConsent()
initAnalyticsDebugger()
initErrorMonitoring()
installGlobalErrorHandlers()
reportWebVitals()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <I18nextProvider i18n={i18n} defaultNS="common">
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingState />}>
            <Sentry.ErrorBoundary
              fallback={
                <ErrorState message="Ocurrio un error inesperado en la aplicacion." />
              }
            >
              <App />
            </Sentry.ErrorBoundary>
          </Suspense>
        </QueryClientProvider>
      </I18nextProvider>
    </HelmetProvider>
  </StrictMode>,
)
