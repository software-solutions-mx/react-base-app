import StateScreen from './StateScreen'

function ServerErrorState({ actionLabel, onAction }) {
  return (
    <StateScreen
      title="Error interno del servidor"
      message="Estamos trabajando para resolver el problema lo antes posible."
      variant="danger"
      icon="cpu"
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

export default ServerErrorState
