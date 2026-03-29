import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RouteErrorBoundary from './errors/RouteErrorBoundary'
import RootLayout from './layouts/RootLayout'
import LoadingState from '../components/states/LoadingState'

function withRouteSuspense(importer) {
  const LazyRouteComponent = lazy(importer)

  return (
    <Suspense fallback={<LoadingState />}>
      <LazyRouteComponent />
    </Suspense>
  )
}

const sharedChildren = [
  {
    index: true,
    element: withRouteSuspense(() => import('./pages/HomePage')),
  },
  {
    path: 'ux-states',
    element: withRouteSuspense(() => import('./pages/StateShowcasePage')),
  },
  {
    path: '500',
    element: withRouteSuspense(() => import('./pages/ServerErrorPage')),
  },
  {
    path: '*',
    element: withRouteSuspense(() => import('./pages/NotFoundPage')),
  },
]

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: sharedChildren,
  },
  {
    path: '/:locale',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: sharedChildren,
  },
])

export default router
