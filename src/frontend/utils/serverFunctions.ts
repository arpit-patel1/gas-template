import { GASClient } from 'gas-client'
import type * as server from '../../backend/serverFunctions'
import type { Hello, Note } from '../../backend/serverFunctions'

type Promisified<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : never
}
type ServerFunctions = Promisified<typeof server>

const gas = new GASClient<typeof server>()

// `npm run dev` has no Apps Script runtime, so serve an in-memory mock instead.
let notes: Note[] = [
  {
    id: '1',
    text: 'Welcome to your Sheets-backed portal',
    author: 'you@example.com',
    createdAt: Date.now() - 3_600_000,
  },
  {
    id: '2',
    text: 'Edit me, delete me, add more',
    author: 'you@example.com',
    createdAt: Date.now() - 60_000,
  },
]
const delay = <T>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 150))

const mock: ServerFunctions = {
  getHello: () =>
    delay<Hello>({
      message: 'Hello, World!',
      email: 'you@example.com',
      spreadsheet: 'Local mock (npm run dev)',
      noteCount: notes.length,
      serverTime: new Date().toISOString(),
    }),
  listNotes: () => delay([...notes].sort((a, b) => b.createdAt - a.createdAt)),
  addNote: (text) => {
    const n: Note = {
      id: crypto.randomUUID(),
      text,
      author: 'you@example.com',
      createdAt: Date.now(),
    }
    notes = [...notes, n]
    return delay(n)
  },
  updateNote: (id, text) => {
    notes = notes.map((n) => (n.id === id ? { ...n, text } : n))
    return delay(notes.find((n) => n.id === id)!)
  },
  deleteNote: (id) => {
    notes = notes.filter((n) => n.id !== id)
    return delay(undefined)
  },
}

export const serverFunctions: ServerFunctions = import.meta.env.DEV
  ? mock
  : (gas.serverFunctions as unknown as ServerFunctions)
