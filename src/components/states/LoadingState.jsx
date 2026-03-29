import { useTranslation } from 'react-i18next'
import StateScreen from './StateScreen'

function LoadingState({ title, message }) {
  const { t } = useTranslation()

  return (
    <StateScreen
      title={title ?? t('errors.loading.title')}
      message={message ?? t('errors.loading.message')}
      variant="info"
      icon="hourglass-split"
    />
  )
}

export default LoadingState
