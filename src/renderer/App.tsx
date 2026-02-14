import { useEffect, useState } from 'react'
import { OverlayRoot } from './components/overlay/OverlayRoot'
import { SettingsRoot } from './components/settings/SettingsRoot'
import { LibraryRoot } from './components/library/LibraryRoot'

type Route = 'overlay' | 'settings' | 'library'

function getRoute(): Route {
  const hash = window.location.hash.replace('#', '')
  if (hash === '/settings') return 'settings'
  if (hash === '/library') return 'library'
  return 'overlay'
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  switch (route) {
    case 'settings':
      return <SettingsRoot />
    case 'library':
      return <LibraryRoot />
    default:
      return <OverlayRoot />
  }
}
