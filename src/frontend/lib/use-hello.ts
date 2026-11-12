import { createContext, useContext } from 'react'
import type { Hello } from '../../backend/serverFunctions'

export type HelloCtx = {
  hello: Hello | null
  error: string | null
  loading: boolean
  reload: () => Promise<void>
}

export const HelloContext = createContext<HelloCtx | null>(null)

export function useHello(): HelloCtx {
  const ctx = useContext(HelloContext)
  if (!ctx) throw new Error('useHello must be used inside HelloProvider')
  return ctx
}
