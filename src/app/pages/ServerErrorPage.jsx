import { useLocation, useNavigate } from 'react-router-dom'
import SEOHead from '../../components/SEO/SEOHead'
import ServerErrorState from '../../components/states/ServerErrorState'

function ServerErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <SEOHead
        title="Error del servidor | Software Solutions"
        description="Estamos trabajando para restablecer el servicio."
        path={location.pathname}
        noindex
      />
      <ServerErrorState
        actionLabel="Reintentar"
        onAction={() => {
          navigate(0)
        }}
      />
    </>
  )
}

export default ServerErrorPage
