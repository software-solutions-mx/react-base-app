import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import StateScreen from './StateScreen'

function NotFoundState() {
  const { t } = useTranslation()

  return (
    <StateScreen
      title={t('errors.notFound.title')}
      message={t('errors.notFound.message')}
      variant="warning"
      icon="signpost-split"
    >
      <Link to="/" className="state-screen-action">
        {t('errors.actions.backToHome')}
      </Link>
    </StateScreen>
  )
}

export default NotFoundState
