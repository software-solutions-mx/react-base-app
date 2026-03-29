import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import App from './App.jsx'
import AppErrorBoundary from './app/errors/AppErrorBoundary'
import { initAnalyticsDebugger, reportWebVitals, restoreConsent } from './analytics'
import LoadingState from './components/states/LoadingState'
import i18n from './i18n/config'
import { queryClient } from './lib/query/queryClient'
import { installGlobalErrorHandlers, initErrorMonitoring } from './monitoring/sentry'
import './assets/scss/theme.scss'

restoreConsent()
initAnalyticsDebugger()
void initErrorMonitoring()
installGlobalErrorHandlers()
reportWebVitals()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n} defaultNS="common">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingState />}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </Suspense>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
)
