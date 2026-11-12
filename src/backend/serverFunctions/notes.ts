import { createTable } from './db'

export type Note = {
  id: string
  text: string
  author: string
  createdAt: number // epoch ms (numbers avoid Sheets auto-converting dates)
}

const notes = createTable<Note>('Notes', ['id', 'text', 'author', 'createdAt'])

export const listNotes = (): Note[] =>
  notes.list().sort((a, b) => b.createdAt - a.createdAt)

export const addNote = (text: string): Note => {
  const clean = text.trim()
  if (!clean) throw new Error('Note text is required')
  return notes.add({
    text: clean,
    author: Session.getActiveUser().getEmail(),
    createdAt: Date.now(),
  })
}

export const updateNote = (id: string, text: string): Note => {
  const clean = text.trim()
  if (!clean) throw new Error('Note text is required')
  return notes.update(id, { text: clean })
}

export const deleteNote = (id: string): void => notes.remove(id)
