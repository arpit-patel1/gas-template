import { useEffect, useState } from 'react'
import {
  ArrowRightIcon,
  ClockIcon,
  DatabaseIcon,
  NotebookPenIcon,
  RefreshCwIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react'
import type { Note } from '../../backend/serverFunctions'
import type { PageId } from '@/components/app-shell'
import { useHello } from '@/lib/use-hello'
import { serverFunctions } from '@/utils/serverFunctions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function Stat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: LucideIcon
  label: string
  value?: string
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-5 w-24" />
          ) : (
            <p className="truncate font-medium">{value || '—'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function HomePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const { hello, error, loading, reload } = useHello()
  const [recent, setRecent] = useState<Note[] | null>(null)

  // State is only set in the promise callback, not synchronously.
  useEffect(() => {
    serverFunctions
      .listNotes()
      .then((n) => setRecent(n.slice(0, 5)))
      .catch(() => setRecent([]))
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {hello?.message ?? 'Hello…'}
          </h1>
          <p className="text-muted-foreground">
            React + shadcn/ui + Tailwind on Apps Script, with Google Sheets as
            the database.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void reload()}
          disabled={loading}
        >
          <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
          Call server again
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Server call failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          icon={UserIcon}
          label="User"
          value={hello?.email}
          loading={loading}
        />
        <Stat
          icon={DatabaseIcon}
          label="Spreadsheet"
          value={hello?.spreadsheet}
          loading={loading}
        />
        <Stat
          icon={NotebookPenIcon}
          label="Notes"
          value={hello ? String(hello.noteCount) : undefined}
          loading={loading}
        />
        <Stat
          icon={ClockIcon}
          label="Server time"
          value={
            hello ? new Date(hello.serverTime).toLocaleTimeString() : undefined
          }
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Recent notes</CardTitle>
            <CardDescription>Latest five from your sheet.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('notes')}>
            View all <ArrowRightIcon />
          </Button>
        </CardHeader>
        <CardContent>
          {recent === null ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/5" />
            </div>
          ) : recent.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <span className="truncate">{n.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
