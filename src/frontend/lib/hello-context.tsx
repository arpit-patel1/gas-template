import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Hello } from '../../backend/serverFunctions'
import { serverFunctions } from '@/utils/serverFunctions'
import { HelloContext } from '@/lib/use-hello'

// Loads the server hello once; the shell (user menu) and Home page share it.
export function HelloProvider({ children }: { children: ReactNode }) {
  const [hello, setHello] = useState<Hello | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setHello(await serverFunctions.getHello())
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load: state is only set in the promise callbacks, not synchronously.
  useEffect(() => {
    serverFunctions
      .getHello()
      .then(setHello)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({ hello, error, loading, reload }),
    [hello, error, loading, reload],
  )
  return <HelloContext.Provider value={value}>{children}</HelloContext.Provider>
}
