import { useTranslation } from 'react-i18next'
import StateScreen from './StateScreen'

function ErrorState({ title, message, actionLabel, onAction }) {
  const { t } = useTranslation()

  return (
    <StateScreen
      title={title ?? t('errors.general.title')}
      message={message ?? t('errors.general.message')}
      variant="danger"
      icon="exclamation-triangle"
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

export default ErrorState
