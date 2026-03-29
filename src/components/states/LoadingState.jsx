import StateScreen from './StateScreen'

function LoadingState({
  title = 'Cargando',
  message = 'Estamos preparando el contenido...',
}) {
  return (
    <StateScreen title={title} message={message} variant="info" icon="hourglass-split" />
  )
}

export default LoadingState
