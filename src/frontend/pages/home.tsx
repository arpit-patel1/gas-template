import { useCallback, useEffect, useState } from 'react'
import { RefreshCwIcon } from 'lucide-react'
import type { Hello } from '../../backend/serverFunctions'
import { serverFunctions } from '@/utils/serverFunctions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomePage() {
  const [hello, setHello] = useState<Hello | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
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

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{hello?.message ?? 'Hello…'}</CardTitle>
        <CardDescription>
          React + shadcn/ui + Tailwind, served by Apps Script, with Google
          Sheets as the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {hello && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">User: {hello.email || 'unknown'}</Badge>
            <Badge variant="secondary">Spreadsheet: {hello.spreadsheet}</Badge>
            <Badge variant="outline">Notes: {hello.noteCount}</Badge>
            <Badge variant="outline">
              Server time: {new Date(hello.serverTime).toLocaleTimeString()}
            </Badge>
          </div>
        )}
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
          Call server again
        </Button>
      </CardContent>
    </Card>
  )
}
