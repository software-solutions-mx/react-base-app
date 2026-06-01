import { useTranslation } from 'react-i18next'

function LoadingState({ title, message, fullscreen = true }) {
  const { t } = useTranslation()
  const loadingLabel =
    title ?? message ?? t('errors.loading.label', { defaultValue: t('errors.loading.title') })

  return (
    <div
      className={`loading-overlay${fullscreen ? '' : ' loading-overlay-inline'}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-overlay-content">
        <span className="loading-overlay-spinner" aria-hidden="true">
          <span className="loading-overlay-spinner-ring loading-overlay-spinner-ring-primary" />
          <span className="loading-overlay-spinner-ring loading-overlay-spinner-ring-secondary" />
          <span className="loading-overlay-spinner-dot" />
        </span>
        <p className="loading-overlay-text">{loadingLabel}</p>
      </div>
    </div>
  )
}

export default LoadingState
