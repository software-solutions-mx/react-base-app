import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { ErrorState, NotFoundState, ServerErrorState } from '../../components/states'
import { IS_DEV } from '../../config/env'
import { captureException } from '../../monitoring/sentry'

function getErrorDetails(error, t) {
  if (isRouteErrorResponse(error)) {
    return {
      message: typeof error.data === 'string' ? error.data : t('errors.route.notLoaded'),
    }
  }

  if (error instanceof Error) {
    return {
      message: IS_DEV ? error.message : t('errors.route.unexpectedTryAgain'),
    }
  }

  return {
    message: t('errors.route.renderFailed'),
  }
}

function RouteErrorBoundary() {
  const { t } = useTranslation()
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      if (error.status >= 500) {
        captureException(
          new Error(`RouteErrorResponse ${error.status}: ${error.statusText}`),
          {
            tags: { area: 'router', kind: 'response' },
            extra: {
              status: error.status,
              statusText: error.statusText,
              data: error.data,
            },
          },
        )
      }
      return
    }

    if (error instanceof Error) {
      captureException(error, {
        tags: { area: 'router', kind: 'exception' },
      })
    }
  }, [error])

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundState />
    }

    if (error.status >= 500) {
      return (
        <ServerErrorState
          actionLabel={t('errors.actions.retry')}
          onAction={() => navigate(0)}
        />
      )
    }
  }

  const { message } = getErrorDetails(error, t)

  return (
    <ErrorState
      message={message}
      actionLabel={t('errors.actions.backToHome')}
      onAction={() => navigate('/')}
    />
  )
}

export default RouteErrorBoundary
