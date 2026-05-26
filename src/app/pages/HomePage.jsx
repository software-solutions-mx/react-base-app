import { useTranslation } from 'react-i18next'

function HomePage() {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="home-page-title">
      <h1 id="home-page-title">{t('home.title')}</h1>
      <p>{t('home.message')}</p>
    </section>
  )
}

export default HomePage
