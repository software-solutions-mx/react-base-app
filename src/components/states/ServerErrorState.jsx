import { useTranslation } from 'react-i18next'
import StateScreen from './StateScreen'

function ServerErrorState({ title, message, actionLabel, onAction }) {
  const { t } = useTranslation()

  return (
    <StateScreen
      title={title ?? t('errors.server.title')}
      message={message ?? t('errors.server.message')}
      variant="danger"
      icon="cpu"
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

export default ServerErrorState
