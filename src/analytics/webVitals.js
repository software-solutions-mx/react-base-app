import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { pushToDataLayer } from './gtag'
import { IS_ANALYTICS_ENABLED } from './config'

function sendVitalToDataLayer({ name, value, rating, id }) {
  if (!IS_ANALYTICS_ENABLED) return

  pushToDataLayer({
    event: 'web_vitals',
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_rating: rating,
    metric_id: id,
    non_interaction: true,
  })
}

export function reportWebVitals() {
  onCLS(sendVitalToDataLayer)
  onINP(sendVitalToDataLayer)
  onLCP(sendVitalToDataLayer)
  onFCP(sendVitalToDataLayer)
  onTTFB(sendVitalToDataLayer)
}
