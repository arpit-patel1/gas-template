import { useEffect, useState } from 'react'
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react'
import type { Note } from '../../backend/serverFunctions'
import { brand } from '@/brand'
import type { PageId } from '@/components/app-shell'
import { grid } from '@/components/grid-styles'
import { useHello } from '@/lib/use-hello'
import { serverFunctions } from '@/utils/serverFunctions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// One cell of the "formula bar" strip under the title.
function BarCell({
  label,
  value,
  loading,
}: {
  label: string
  value?: string
  loading: boolean
}) {
  return (
    <div className="min-w-0 border-b px-3 py-2 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-5 w-24" />
      ) : (
        <p className="truncate text-sm font-medium">{value || '—'}</p>
      )}
    </div>
  )
}

export function HomePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const { hello, error, loading, reload } = useHello()
  const [recent, setRecent] = useState<Note[] | null>(null)

  // State is only set in the promise callback, not synchronously.
  useEffect(() => {
    serverFunctions
      .listNotes()
      .then((n) => setRecent(n.slice(0, 6)))
      .catch(() => setRecent([]))
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold">{hello?.message ?? 'Hello…'}</h1>
          <p className="mt-2 text-muted-foreground">{brand.tagline}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => void reload()}
          disabled={loading}
        >
          <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Server call failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid rounded-md border bg-card sm:grid-cols-4">
        <BarCell label="Signed in as" value={hello?.email} loading={loading} />
        <BarCell
          label="Spreadsheet"
          value={hello?.spreadsheet}
          loading={loading}
        />
        <BarCell
          label="Notes"
          value={hello ? String(hello.noteCount) : undefined}
          loading={loading}
        />
        <BarCell
          label="Server time"
          value={
            hello ? new Date(hello.serverTime).toLocaleTimeString() : undefined
          }
          loading={loading}
        />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest rows in Notes</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('notes')}>
            Open Notes <ArrowRightIcon />
          </Button>
        </div>
        <div className="overflow-hidden rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={grid.letter} />
                <TableHead className={grid.letter}>A</TableHead>
                <TableHead className={grid.letter}>B</TableHead>
                <TableHead className={`${grid.letter} hidden sm:table-cell`}>
                  C
                </TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead className={grid.gutter}>1</TableHead>
                <TableHead className={grid.head}>Note</TableHead>
                <TableHead className={grid.head}>Author</TableHead>
                <TableHead className={`${grid.head} hidden sm:table-cell`}>
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent === null &&
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell className={grid.gutter}>{i + 2}</TableCell>
                    <TableCell className={grid.cell} colSpan={3}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {recent?.length === 0 && (
                <TableRow>
                  <TableCell className={grid.gutter}>2</TableCell>
                  <TableCell
                    className={`${grid.cell} text-muted-foreground`}
                    colSpan={3}
                  >
                    Empty. Add a note and it shows up here.
                  </TableCell>
                </TableRow>
              )}
              {recent?.map((n, i) => (
                <TableRow key={n.id}>
                  <TableCell className={grid.gutter}>{i + 2}</TableCell>
                  <TableCell className={`${grid.cell} w-full`}>
                    {n.text}
                  </TableCell>
                  <TableCell
                    className={`${grid.cell} whitespace-nowrap text-muted-foreground`}
                  >
                    {n.author || '—'}
                  </TableCell>
                  <TableCell
                    className={`${grid.cell} hidden whitespace-nowrap text-muted-foreground sm:table-cell`}
                  >
                    {new Date(n.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
