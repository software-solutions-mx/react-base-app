export function pushToDataLayer(data) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

export function gtag(...args) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}
