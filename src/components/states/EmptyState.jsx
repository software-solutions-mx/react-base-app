import StateScreen from './StateScreen'

function EmptyState({
  title = 'Sin contenido por ahora',
  message = 'Todavia no hay datos disponibles para mostrar en esta seccion.',
}) {
  return <StateScreen title={title} message={message} variant="light" icon="inbox" />
}

export default EmptyState
