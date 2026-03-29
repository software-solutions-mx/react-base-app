import { useLocation } from 'react-router-dom'
import SEOHead from '../../components/SEO/SEOHead'
import NotFoundState from '../../components/states/NotFoundState'

function NotFoundPage() {
  const location = useLocation()

  return (
    <>
      <SEOHead
        title="Pagina no encontrada | Software Solutions"
        description="La ruta solicitada no existe."
        path={location.pathname}
        noindex
      />
      <NotFoundState />
    </>
  )
}

export default NotFoundPage
