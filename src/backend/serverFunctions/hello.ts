import { getSpreadsheetName } from './db'
import { listNotes } from './notes'

export type Hello = {
  message: string
  email: string
  spreadsheet: string
  noteCount: number
  serverTime: string
}

export const getHello = (): Hello => ({
  message: 'Hello, World!',
  email: Session.getActiveUser().getEmail(),
  spreadsheet: getSpreadsheetName(),
  noteCount: listNotes().length,
  serverTime: new Date().toISOString(),
})
