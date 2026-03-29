import StateScreen from './StateScreen'

function ErrorState({
  title = 'Ocurrio un error',
  message = 'No pudimos completar la solicitud. Intenta de nuevo en unos minutos.',
  actionLabel,
  onAction,
}) {
  return (
    <StateScreen
      title={title}
      message={message}
      variant="danger"
      icon="exclamation-triangle"
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

export default ErrorState
