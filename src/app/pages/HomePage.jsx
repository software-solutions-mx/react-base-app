import { useTranslation } from 'react-i18next'

function HomePage() {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="home-page-title">
      <h1 id="home-page-title" className="sr-only">
        {t('brand.name')}
      </h1>
    </section>
  )
}

export default HomePage
