import { track } from '../analytics.js'

export function withAnalytics(Component, event) {
  function WithAnalytics({ analyticsData, onClick, ...props }) {
    function handleClick(e) {
      track(event, analyticsData)
      onClick?.(e)
    }

    return <Component {...props} onClick={handleClick} />
  }

  const name = Component.displayName || Component.name || 'Component'
  WithAnalytics.displayName = `withAnalytics(${name})`

  return WithAnalytics
}
