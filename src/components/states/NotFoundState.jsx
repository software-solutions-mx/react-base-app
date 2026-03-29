import { Link } from 'react-router-dom'
import StateScreen from './StateScreen'

function NotFoundState() {
  return (
    <StateScreen
      title="Pagina no encontrada"
      message="La ruta solicitada no existe o fue movida."
      variant="warning"
      icon="signpost-split"
    >
      <Link to="/" className="btn btn-outline-dark btn-sm">
        Volver al inicio
      </Link>
    </StateScreen>
  )
}

export default NotFoundState
