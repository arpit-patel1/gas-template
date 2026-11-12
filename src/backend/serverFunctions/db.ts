/**
 * Tiny "database" on top of Google Sheets.
 * One tab = one table. Row 1 = column names. Rows are plain objects with a string `id`.
 *
 * Spreadsheet resolution: Script Property SPREADSHEET_ID (standalone script),
 * otherwise the spreadsheet the script is bound to.
 */
export type Cell = string | number | boolean
export type Record_ = { id: string } & Record<string, Cell>

const getSpreadsheet = (): GoogleAppsScript.Spreadsheet.Spreadsheet => {
  const id =
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive()
  if (!ss) {
    throw new Error(
      'No spreadsheet found. Bind the script to a Sheet or set the SPREADSHEET_ID script property.',
    )
  }
  return ss
}

export const getSpreadsheetName = (): string => getSpreadsheet().getName()

const withLock = <T>(fn: () => T): T => {
  const lock = LockService.getScriptLock()
  lock.waitLock(10_000)
  try {
    return fn()
  } finally {
    lock.releaseLock()
  }
}

export const createTable = <T extends Record_>(
  name: string,
  columns: readonly (keyof T & string)[],
) => {
  const getSheet = () => {
    const ss = getSpreadsheet()
    let sheet = ss.getSheetByName(name)
    if (!sheet) {
      sheet = ss.insertSheet(name)
      sheet.appendRow([...columns])
      sheet.setFrozenRows(1)
    }
    return sheet
  }

  const toRow = (rec: T): Cell[] => columns.map((c) => rec[c] as Cell)

  const list = (): T[] => {
    const values = getSheet().getDataRange().getValues()
    return values
      .slice(1)
      .map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]])) as T)
  }

  const findRowNumber = (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    id: string,
  ) => {
    const values = sheet.getDataRange().getValues()
    const idCol = columns.indexOf('id' as keyof T & string)
    const idx = values.findIndex((row, i) => i > 0 && row[idCol] === id)
    if (idx === -1) throw new Error(`Row not found: ${id}`)
    return idx + 1 // 1-based sheet row
  }

  const add = (data: Omit<T, 'id'>): T =>
    withLock(() => {
      const rec = { ...data, id: Utilities.getUuid() } as T
      getSheet().appendRow(toRow(rec))
      return rec
    })

  const update = (id: string, patch: Partial<Omit<T, 'id'>>): T =>
    withLock(() => {
      const sheet = getSheet()
      const rowNumber = findRowNumber(sheet, id)
      const current = list().find((r) => r.id === id) as T
      const next = { ...current, ...patch, id } as T
      sheet.getRange(rowNumber, 1, 1, columns.length).setValues([toRow(next)])
      return next
    })

  const remove = (id: string): void =>
    withLock(() => {
      const sheet = getSheet()
      sheet.deleteRow(findRowNumber(sheet, id))
    })

  return { list, add, update, remove }
}
