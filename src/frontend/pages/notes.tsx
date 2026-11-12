import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { Note } from '../../backend/serverFunctions'
import { serverFunctions } from '@/utils/serverFunctions'
import { Button } from '@/components/ui/button'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [editText, setEditText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async () => setNotes(await serverFunctions.listNotes()),
    [],
  )

  // Runs a server call, then reloads the table. Shows errors inline.
  const run = useCallback(
    async (call: () => Promise<unknown>) => {
      try {
        await call()
        await refresh()
        setError(null)
      } catch (e) {
        setError(String(e))
      }
    },
    [refresh],
  )

  // Initial load: state is only set in the promise callbacks, not synchronously.
  useEffect(() => {
    serverFunctions
      .listNotes()
      .then(setNotes)
      .catch((e) => setError(String(e)))
  }, [])

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    void run(() => serverFunctions.addNote(text))
    setText('')
  }

  const onSave = () => {
    if (!editing) return
    void run(() => serverFunctions.updateNote(editing.id, editText))
    setEditing(null)
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>
          Stored in the “Notes” tab of your Google Sheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onAdd} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note…"
          />
          <Button type="submit">
            <PlusIcon /> Add
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Note</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No notes yet.
                </TableCell>
              </TableRow>
            )}
            {notes.map((n) => (
              <TableRow key={n.id}>
                <TableCell>{n.text}</TableCell>
                <TableCell className="text-muted-foreground">
                  {n.author || '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit note"
                    onClick={() => {
                      setEditing(n)
                      setEditText(n.text)
                    }}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete note"
                    onClick={() =>
                      void run(() => serverFunctions.deleteNote(n.id))
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit note</DialogTitle>
          </DialogHeader>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
