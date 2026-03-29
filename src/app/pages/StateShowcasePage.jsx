import { useLocation } from 'react-router-dom'
import SEOHead from '../../components/SEO/SEOHead'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotFoundState,
  ServerErrorState,
} from '../../components/states'

function StateShowcasePage() {
  const location = useLocation()

  return (
    <>
      <SEOHead
        title="UX States | Software Solutions"
        description="Vista interna de estados de interfaz."
        path={location.pathname}
        noindex
      />
      <div className="state-showcase">
        <LoadingState />
        <EmptyState />
        <ErrorState />
        <NotFoundState />
        <ServerErrorState />
      </div>
    </>
  )
}

export default StateShowcasePage
