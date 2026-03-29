import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import SEOHead from '../../components/SEO/SEOHead'
import NotFoundState from '../../components/states/NotFoundState'

function NotFoundPage() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <>
      <SEOHead
        title={t('seo.notFound.title')}
        description={t('seo.notFound.description')}
        path={location.pathname}
        noindex
      />
      <NotFoundState />
    </>
  )
}

export default NotFoundPage
