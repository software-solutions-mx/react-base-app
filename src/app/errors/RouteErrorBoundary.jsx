import { useEffect } from 'react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { ErrorState, NotFoundState, ServerErrorState } from '../../components/states'
import { IS_DEV } from '../../config/env'
import { captureException } from '../../monitoring/sentry'

function getErrorDetails(error) {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      message:
        typeof error.data === 'string'
          ? error.data
          : 'La ruta solicitada no pudo cargarse.',
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Unexpected Error',
      message: IS_DEV
        ? error.message
        : 'Ocurrio un error inesperado. Intenta nuevamente en unos minutos.',
    }
  }

  return {
    title: 'Unexpected Error',
    message: 'Something went wrong while rendering this route.',
  }
}

function RouteErrorBoundary() {
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
      return <ServerErrorState actionLabel="Reintentar" onAction={() => navigate(0)} />
    }
  }

  const { message } = getErrorDetails(error)

  return (
    <ErrorState
      message={message}
      actionLabel="Volver al inicio"
      onAction={() => navigate('/')}
    />
  )
}

export default RouteErrorBoundary
