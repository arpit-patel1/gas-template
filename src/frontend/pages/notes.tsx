import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Note } from '../../backend/serverFunctions'
import { cn } from '@/lib/utils'
import { useHello } from '@/lib/use-hello'
import { serverFunctions } from '@/utils/serverFunctions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Sort = 'newest' | 'oldest' | 'az'
type Scope = 'all' | 'mine'

// `note` = null means the dialog creates a new note.
type Editor = { open: boolean; note: Note | null }

export function NotesPage() {
  const { hello } = useHello()
  const me = hello?.email ?? ''

  const [notes, setNotes] = useState<Note[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const [scope, setScope] = useState<Scope>('all')
  const [compact, setCompact] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editor, setEditor] = useState<Editor>({ open: false, note: null })
  const [draft, setDraft] = useState('')
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null)

  const refresh = useCallback(
    async () => setNotes(await serverFunctions.listNotes()),
    [],
  )

  // Runs a server call, reloads the table, toasts the outcome.
  const run = useCallback(
    async (call: () => Promise<unknown>, success: string) => {
      try {
        await call()
        await refresh()
        setError(null)
        toast.success(success)
      } catch (e) {
        setError(String(e))
        toast.error('Something went wrong')
      }
    },
    [refresh],
  )

  // Initial load: state is only set in the promise callbacks, not synchronously.
  useEffect(() => {
    serverFunctions
      .listNotes()
      .then(setNotes)
      .catch((e) => {
        setError(String(e))
        setNotes([])
      })
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = (notes ?? []).filter(
      (n) =>
        (scope === 'all' || n.author === me) &&
        (!q ||
          n.text.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q)),
    )
    return rows.sort((a, b) =>
      sort === 'az'
        ? a.text.localeCompare(b.text)
        : sort === 'oldest'
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt,
    )
  }, [notes, query, sort, scope, me])

  const allSelected =
    visible.length > 0 && visible.every((n) => selected.has(n.id))

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const openEditor = (note: Note | null) => {
    setDraft(note?.text ?? '')
    setEditor({ open: true, note })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const note = editor.note
    setEditor({ open: false, note: null })
    void run(
      () =>
        note
          ? serverFunctions.updateNote(note.id, text)
          : serverFunctions.addNote(text),
      note ? 'Note updated' : 'Note added',
    )
  }

  const onConfirmDelete = () => {
    const ids = confirmIds ?? []
    setConfirmIds(null)
    setSelected(new Set())
    void run(
      async () => {
        for (const id of ids) await serverFunctions.deleteNote(id)
      },
      ids.length === 1 ? 'Note deleted' : `${ids.length} notes deleted`,
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Stored in the “Notes” tab of your Google Sheet.
          </p>
        </div>
        <Button onClick={() => openEditor(null)}>
          <PlusIcon /> New note
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Server call failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">All notes</CardTitle>
          <CardDescription className="sr-only">
            Search, filter and manage notes
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="mine">Mine</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative min-w-40 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                className="pl-8"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-36" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="compact"
                checked={compact}
                onCheckedChange={setCompact}
              />
              <Label htmlFor="compact">Compact</Label>
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              {selected.size} selected
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmIds([...selected])}
              >
                <Trash2Icon /> Delete
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all"
                    checked={allSelected}
                    onCheckedChange={(c) =>
                      setSelected(
                        c ? new Set(visible.map((n) => n.id)) : new Set(),
                      )
                    }
                  />
                </TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="hidden sm:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes === null &&
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {notes !== null && visible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {notes.length === 0
                      ? 'No notes yet. Add your first one.'
                      : 'No notes match your filters.'}
                  </TableCell>
                </TableRow>
              )}
              {visible.map((n) => (
                <TableRow
                  key={n.id}
                  data-state={selected.has(n.id) ? 'selected' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label="Select note"
                      checked={selected.has(n.id)}
                      onCheckedChange={() => toggle(n.id)}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      'w-full whitespace-normal break-words',
                      compact ? 'py-1' : 'py-3',
                    )}
                  >
                    {n.text}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {n.author || '—'}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                    {new Date(n.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Note actions"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEditor(n)}>
                          <PencilIcon /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setConfirmIds([n.id])}
                        >
                          <Trash2Icon /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={editor.open}
        onOpenChange={(o) => !o && setEditor({ open: false, note: null })}
      >
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editor.note ? 'Edit note' : 'New note'}
              </DialogTitle>
              <DialogDescription>Saved to your Google Sheet.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="note-text">Note</Label>
              <Textarea
                id="note-text"
                autoFocus
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a note…"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditor({ open: false, note: null })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!draft.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmIds}
        onOpenChange={(o) => !o && setConfirmIds(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {confirmIds?.length === 1 ? 'note' : 'notes'}?
            </DialogTitle>
            <DialogDescription>
              This removes {confirmIds?.length ?? 0} row
              {confirmIds?.length === 1 ? '' : 's'} from the sheet. Can’t be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmIds(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
