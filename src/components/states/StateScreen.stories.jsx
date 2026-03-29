import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotFoundState,
  ServerErrorState,
} from './index'
import { MemoryRouter } from 'react-router-dom'

const meta = {
  title: 'States/App Runtime States',
  decorators: [(StoryFn) => <MemoryRouter>{StoryFn()}</MemoryRouter>],
  parameters: {
    layout: 'padded',
  },
}

export default meta

export function Loading() {
  return <LoadingState />
}

export function Empty() {
  return <EmptyState />
}

export function Error() {
  return <ErrorState actionLabel="Reintentar" />
}

export function NotFound() {
  return <NotFoundState />
}

export function ServerError() {
  return <ServerErrorState actionLabel="Reintentar" />
}
